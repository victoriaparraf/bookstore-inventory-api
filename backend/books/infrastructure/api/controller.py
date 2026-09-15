from decimal import Decimal
from typing import List
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from books.application.dtos import CreateBookDTO, UpdateBookDTO
from books.application.book_service import BookService
from books.application.pricing_service import PricingService
from books.domain.book import Book
from books.infrastructure.repository import DjangoBookRepository
from books.infrastructure.exchange_rate import ExternalExchangeRateAdapter
from books.infrastructure.mapper import (
    BookSerializer,
    CategorySearchQuerySerializer,
    LowStockQuerySerializer,
    PriceCalculationResponseSerializer,
)
from books.infrastructure.api.pagination import BookPagination


def get_book_service() -> BookService:
    return BookService(DjangoBookRepository())


def get_pricing_service() -> PricingService:
    return PricingService(
        repository=DjangoBookRepository(),
        exchange_service=ExternalExchangeRateAdapter(timeout=settings.EXCHANGE_RATE_TIMEOUT),
        margin_percentage=Decimal(str(settings.PROFIT_MARGIN_PERCENTAGE)),
        local_currency=settings.LOCAL_CURRENCY,
    )


def paginated_books_response(request, view: APIView, books: List[Book]) -> Response:
    paginator = BookPagination()
    page = paginator.paginate_queryset(books, request, view=view)
    serializer = BookSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


class BookListCreateView(APIView):

    def get(self, request):
        """GET /books - Lista todos los libros (paginado)"""
        books = get_book_service().list_all_books()
        return paginated_books_response(request, self, books)

    def post(self, request):
        """POST /books - Crea un libro"""
        serializer = BookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        dto = CreateBookDTO(**serializer.validated_data)
        created_book = get_book_service().create_book(dto)
        return Response(BookSerializer(created_book).data, status=status.HTTP_201_CREATED)


class BookSearchView(APIView):

    def get(self, request):
        """GET /books/search?category={category} - Busca libros por categoría (paginado)"""
        query = CategorySearchQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)

        books = get_book_service().search_by_category(query.validated_data["category"])
        return paginated_books_response(request, self, books)


class BookLowStockView(APIView):

    def get(self, request):
        """GET /books/low-stock?threshold=10 - Libros con stock menor o igual al umbral (paginado)"""
        query = LowStockQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)

        books = get_book_service().list_low_stock(query.validated_data["threshold"])
        return paginated_books_response(request, self, books)


class BookDetailView(APIView):

    def get(self, request, pk):
        """GET /books/{id} - Obtiene un libro por ID"""
        book = get_book_service().get_book_by_id(pk)
        return Response(BookSerializer(book).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """PUT /books/{id} - Reemplaza todos los datos editables de un libro"""
        serializer = BookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        dto = UpdateBookDTO(**serializer.validated_data)
        updated_book = get_book_service().update_book(pk, dto)
        return Response(BookSerializer(updated_book).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        """DELETE /books/{id} - Elimina un libro"""
        get_book_service().remove_book(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CalculatePriceView(APIView):

    def post(self, request, pk):
        """POST /books/{id}/calculate-price - Calcula y guarda el precio de venta sugerido en VES"""
        result = get_pricing_service().calculate_and_update_price(pk)
        serializer = PriceCalculationResponseSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)