from typing import Iterable, List, Optional
from django.db import IntegrityError
from books.domain.book import Book
from books.domain.exceptions import BookAlreadyExistsError, BookNotFoundError
from books.domain.repository import BookRepositoryPort
from .models import BookORM

EDITABLE_FIELDS = (
    "title",
    "author",
    "isbn",
    "cost_usd",
    "stock_quantity",
    "category",
    "supplier_country",
    "selling_price_local",
)

class DjangoBookRepository(BookRepositoryPort):

    def _to_domain(self, instance: BookORM) -> Book:
        return Book(
            id=instance.id,
            title=instance.title,
            author=instance.author,
            isbn=instance.isbn,
            cost_usd=instance.cost_usd,
            stock_quantity=instance.stock_quantity,
            category=instance.category,
            supplier_country=instance.supplier_country,
            selling_price_local=instance.selling_price_local,
            created_at=instance.created_at,
            updated_at=instance.updated_at,
        )

    def _to_domain_list(self, queryset: Iterable[BookORM]) -> List[Book]:
        return [self._to_domain(item) for item in queryset]

    def save(self, book: Book) -> Book:
        
        data = {field: getattr(book, field) for field in EDITABLE_FIELDS}
        
        try:
            if book.id is not None:
                instance = BookORM.objects.get(id=book.id)
                for field, value in data.items():
                    setattr(instance, field, value)
                instance.save()
            else:
                instance = BookORM.objects.create(**data)
        except BookORM.DoesNotExist:
            raise BookNotFoundError(f"No existe un libro con id {book.id}")
        except IntegrityError:
            raise BookAlreadyExistsError(f"Ya existe un libro con el ISBN {book.isbn}")
        return self._to_domain(instance)

    def get_by_id(self, book_id: int) -> Optional[Book]:
        
        instance = BookORM.objects.filter(id=book_id).first()
        
        return self._to_domain(instance) if instance else None

    def get_by_isbn(self, isbn: str) -> Optional[Book]:
        
        instance = BookORM.objects.filter(isbn=isbn).first()
        
        return self._to_domain(instance) if instance else None

    def list_all(self) -> List[Book]:
        return self._to_domain_list(BookORM.objects.order_by("-id"))

    def find_by_category(self, category: str) -> List[Book]:
        
        return self._to_domain_list(
            BookORM.objects.filter(category__iexact=category).order_by("-id")
        )

    def find_low_stock(self, threshold: int) -> List[Book]:
        
        return self._to_domain_list(
            BookORM.objects.filter(stock_quantity__lte=threshold).order_by("stock_quantity", "-id")
        )

    def delete(self, book_id: int) -> bool:
        
        count, _ = BookORM.objects.filter(id=book_id).delete()
        
        return count > 0