from decimal import Decimal
from books.domain.pricing import compute_book_price, BookPriceBreakdown
from books.domain.repository import BookRepositoryPort
from books.domain.services import ExchangeRateService
from books.domain.exceptions import BookNotFoundError


class PricingService:
    """Calcula el precio de venta sugerido en moneda local y lo guarda en el libro"""

    def __init__(
        self,
        repository: BookRepositoryPort,
        exchange_service: ExchangeRateService,
        margin_percentage: Decimal,
        local_currency: str,
    ) -> None:

        self._repository = repository
        self._exchange_service = exchange_service
        self._margin_percentage = margin_percentage
        self._local_currency = local_currency.upper()

    def calculate_and_update_price(self, book_id: int) -> BookPriceBreakdown:
        book = self._repository.get_by_id(book_id)
        if not book:
            raise BookNotFoundError(f"No se encontró el libro con ID {book_id}.")

        exchange_rate = self._exchange_service.get_exchange_rate(self._local_currency)

        calculation_result = compute_book_price(
            book_id=book.id,
            cost_usd=book.cost_usd,
            rate=exchange_rate.rate,
            margin_percentage=self._margin_percentage,
            currency=exchange_rate.currency,
            rate_source=exchange_rate.source,
        )

        updated_book = book.copy_with(
            selling_price_local=calculation_result.selling_price_local
        )
        self._repository.save(updated_book)

        return calculation_result