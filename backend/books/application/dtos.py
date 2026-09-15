from dataclasses import dataclass
from decimal import Decimal


@dataclass
class CreateBookDTO:
    title: str
    author: str
    isbn: str
    cost_usd: Decimal
    stock_quantity: int
    category: str
    supplier_country: str


@dataclass
class UpdateBookDTO:
    """PUT reemplaza el recurso completo, por lo que todos los campos son obligatorios"""
    title: str
    author: str
    isbn: str
    cost_usd: Decimal
    stock_quantity: int
    category: str
    supplier_country: str
