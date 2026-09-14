from typing import Optional


class DomainError(Exception):
    """Excepción base"""

    def __init__(self, message: str, field: Optional[str] = None) -> None:
        super().__init__(message)
        self.message = message
        self.field = field


class BookAlreadyExistsError(DomainError):
    """Se dispara cuando se intenta registrar un libro con un ISBN ya existente"""

    def __init__(self, message: str) -> None:
        super().__init__(message, field="isbn")


class BookNotFoundError(DomainError):
    """Se dispara cuando no se encuentra un libro por su ID o ISBN"""
    pass


class InvalidISBNError(DomainError):
    """Se dispara cuando el formato del ISBN no es válido"""

    def __init__(self, message: str) -> None:
        super().__init__(message, field="isbn")


class InvalidCostError(DomainError):
    """Se dispara cuando el costo USD es <= 0"""

    def __init__(self, message: str) -> None:
        super().__init__(message, field="cost_usd")


class InvalidStockError(DomainError):
    """Se dispara cuando el stock es negativo"""

    def __init__(self, message: str) -> None:
        super().__init__(message, field="stock_quantity")


class InvalidSupplierCountryError(DomainError):
    """Se dispara cuando el país del proveedor no es un código ISO de 2 letras"""

    def __init__(self, message: str) -> None:
        super().__init__(message, field="supplier_country")


class ExchangeRateUnavailableError(DomainError):
    """Se dispara cuando no hay tasa de cambio disponible (ni externa ni por defecto)"""
    pass
