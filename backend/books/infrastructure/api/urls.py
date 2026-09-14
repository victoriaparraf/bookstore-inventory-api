from django.urls import path
from books.infrastructure.api.controller import (
    BookListCreateView,
    BookSearchView,
    BookLowStockView,
    BookDetailView,
    CalculatePriceView,
)

urlpatterns = [
    path("books", BookListCreateView.as_view(), name="book-list-create"),
    path("books/search", BookSearchView.as_view(), name="book-search"),
    path("books/low-stock", BookLowStockView.as_view(), name="book-low-stock"),
    path("books/<int:pk>", BookDetailView.as_view(), name="book-detail"),
    path("books/<int:pk>/calculate-price", CalculatePriceView.as_view(), name="book-calculate-price"),
]
