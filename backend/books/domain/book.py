import re
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from .exceptions import (
    InvalidISBNError,
    InvalidCostError,
    InvalidStockError,
    InvalidSupplierCountryError,
)


def normalize_isbn(isbn: str) -> str:
    """Elimina guiones y espacios del ISBN para compararlo y almacenarlo de forma uniforme"""
    return re.sub(r"[\s-]", "", isbn).upper()


@dataclass
class Book:

    title: str
    author: str
    isbn: str
    cost_usd: Decimal
    stock_quantity: int
    category: str
    supplier_country: str
    id: Optional[int] = None
    selling_price_local: Optional[Decimal] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self.validate_isbn()
        self.validate_cost()
        self.validate_stock()
        self.validate_supplier_country()

    def validate_isbn(self) -> None:
        """Valida que el ISBN posea un formato estándar de 10 o 13 dígitos"""

        normalized_isbn = normalize_isbn(self.isbn)
        if not (normalized_isbn.isdigit() and len(normalized_isbn) in (10, 13)):
            raise InvalidISBNError("El ISBN debe tener un formato válido de 10 o 13 dígitos.")

        self.isbn = normalized_isbn

    def validate_cost(self) -> None:
        """Valida que el costo en USD sea un valor estrictamente positivo"""

        if self.cost_usd <= Decimal("0"):
            raise InvalidCostError("El costo en USD debe ser mayor a 0")

    def validate_stock(self) -> None:
        """Valida que la cantidad en inventario no sea un número negativo"""

        if self.stock_quantity < 0:
            raise InvalidStockError("La cantidad en stock no puede ser negativa")

    def validate_supplier_country(self) -> None:
        """Valida que el país del proveedor sea un código ISO 3166-1 alfa-2"""

        country = self.supplier_country.strip().upper()
        if not re.fullmatch(r"[A-Z]{2}", country):
            raise InvalidSupplierCountryError(
                "El país del proveedor debe ser un código de 2 letras"
            )

        self.supplier_country = country

    def copy_with(self, **changes: Any) -> "Book":
        """
        Copia modificada de la entidad ejecutando nuevamente las validaciones
        """
        data = {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "isbn": self.isbn,
            "cost_usd": self.cost_usd,
            "stock_quantity": self.stock_quantity,
            "category": self.category,
            "supplier_country": self.supplier_country,
            "selling_price_local": self.selling_price_local,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
        data.update(changes)
        return Book(**data)
