from dataclasses import asdict
from typing import List
from books.domain.exceptions import BookAlreadyExistsError, BookNotFoundError
from books.domain.book import Book
from books.domain.repository import BookRepositoryPort
from .dtos import CreateBookDTO, UpdateBookDTO

class BookService:

    def __init__(self, repository: BookRepositoryPort) -> None:
        self._repository = repository

    def create_book(self, dto: CreateBookDTO) -> Book:
        """Registra un nuevo libro"""

        new_book = Book(**asdict(dto))

        if self._repository.get_by_isbn(new_book.isbn):
            raise BookAlreadyExistsError(f"El ISBN {new_book.isbn} ya se encuentra registrado.")

        return self._repository.save(new_book)

    def get_book_by_id(self, book_id: int) -> Book:
        """Obtiene un libro por su ID o lanza BookNotFoundError"""
        
        book = self._repository.get_by_id(book_id)
        if not book:
            raise BookNotFoundError(f"No se encontró el libro con ID {book_id}.")
        return book

    def list_all_books(self) -> List[Book]:
        """Consulta el catálogo completo"""
        
        return self._repository.list_all()

    def search_by_category(self, category: str) -> List[Book]:
        """Busca libros por categoría"""
        
        return self._repository.find_by_category(category.strip())

    def list_low_stock(self, threshold: int) -> List[Book]:
        """Lista los libros con stock menor o igual al umbral"""
        
        return self._repository.find_low_stock(threshold)

    def update_book(self, book_id: int, dto: UpdateBookDTO) -> Book:
        """
        Reemplaza los datos de un libro existente
        Revalida reglas de negocio al crear la copia modificada de la entidad
        """
        current_book = self.get_book_by_id(book_id)

        updated_entity = current_book.copy_with(**asdict(dto))

        if updated_entity.isbn != current_book.isbn:
            existing = self._repository.get_by_isbn(updated_entity.isbn)
            if existing:
                raise BookAlreadyExistsError(f"El ISBN {updated_entity.isbn} ya pertenece a otro libro.")

        if updated_entity.cost_usd != current_book.cost_usd:
            updated_entity = updated_entity.copy_with(selling_price_local=None)

        return self._repository.save(updated_entity)

    def remove_book(self, book_id: int) -> None:
        """Elimina un libro tras verificar su existencia"""
        
        self.get_book_by_id(book_id)
        self._repository.delete(book_id)