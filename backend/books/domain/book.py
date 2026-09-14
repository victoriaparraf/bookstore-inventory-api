import re
from dataclasses import dataclass, replace
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Optional
from .exceptions import (
    InvalidISBNError,
    InvalidCostError,
    InvalidStockError,
    InvalidSupplierCountryError,
    InvalidTextFieldError,
)


def normalize_isbn(isbn: str) -> str:
    """Elimina guiones y espacios del ISBN para compararlo y almacenarlo de forma uniforme"""
    return re.sub(r"[\s-]", "", isbn)


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
        self.validate_text_fields()
        self.validate_isbn()
        self.validate_cost()
        self.validate_stock()
        self.validate_supplier_country()

    def validate_text_fields(self) -> None:
        """Valida que título, autor y categoría no estén vacíos"""

        for field in ("title", "author", "category"):
            value = (getattr(self, field) or "").strip()
            if not value:
                raise InvalidTextFieldError(f"El campo {field} no puede estar vacío", field)
            setattr(self, field, value)

    def validate_isbn(self) -> None:
        """Valida que el ISBN posea un formato estándar de 10 o 13 dígitos"""

        normalized_isbn = normalize_isbn(self.isbn)
        if not (normalized_isbn.isdigit() and len(normalized_isbn) in (10, 13)):
            raise InvalidISBNError("El ISBN debe tener un formato válido de 10 o 13 dígitos.")

        self.isbn = normalized_isbn

    def validate_cost(self) -> None:
        """Valida que el costo en USD sea un valor estrictamente positivo"""

        try:
            self.cost_usd = Decimal(str(self.cost_usd))
        except (InvalidOperation, ValueError):
            raise InvalidCostError("El costo en USD debe ser un número válido")

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
        """Copia modificada de la entidad ejecutando nuevamente las validaciones"""
        return replace(self, **changes)