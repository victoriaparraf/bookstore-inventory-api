from abc import ABC, abstractmethod
from typing import List, Optional
from .book import Book


class BookRepositoryPort(ABC):

    @abstractmethod
    def save(self, book: Book) -> Book:
        """Guarda o actualiza un libro en la persistencia"""
        pass

    @abstractmethod
    def get_by_id(self, book_id: int) -> Optional[Book]:
        """Obtiene un libro por su ID único"""
        pass

    @abstractmethod
    def get_by_isbn(self, isbn: str) -> Optional[Book]:
        """Obtiene un libro por su ISBN (ya normalizado)"""
        pass

    @abstractmethod
    def list_all(self) -> List[Book]:
        """Lista todos los libros"""
        pass

    @abstractmethod
    def find_by_category(self, category: str) -> List[Book]:
        """Lista los libros de una categoría (sin distinguir mayúsculas)"""
        pass

    @abstractmethod
    def find_low_stock(self, threshold: int) -> List[Book]:
        """Lista los libros cuyo stock es menor o igual al umbral"""
        pass

    @abstractmethod
    def delete(self, book_id: int) -> bool:
        """Elimina un libro por su ID"""
        pass
