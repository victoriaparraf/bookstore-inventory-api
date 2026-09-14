from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional


@dataclass
class BookPriceBreakdown:
    book_id: Optional[int]
    cost_usd: Decimal
    exchange_rate: Decimal
    cost_local: Decimal
    margin_percentage: Decimal
    selling_price_local: Decimal
    currency: str
    rate_source: str
    calculation_timestamp: datetime


def _quantize_currency(amount: Decimal) -> Decimal:
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_book_price(
    book_id: Optional[int],
    cost_usd: Decimal,
    rate: Decimal,
    margin_percentage: Decimal,
    currency: str,
    rate_source: str,
) -> BookPriceBreakdown:
    """Calcula el costo local y el precio de venta aplicando el margen de ganancia"""

    rate = Decimal(str(rate))
    margin_percentage = Decimal(str(margin_percentage))

    cost_local = _quantize_currency(cost_usd * rate)
    margin_multiplier = Decimal("1") + (margin_percentage / Decimal("100"))
    selling_price_local = _quantize_currency(cost_local * margin_multiplier)

    return BookPriceBreakdown(
        book_id=book_id,
        cost_usd=cost_usd,
        exchange_rate=rate,
        cost_local=cost_local,
        margin_percentage=margin_percentage,
        selling_price_local=selling_price_local,
        currency=currency,
        rate_source=rate_source,
        calculation_timestamp=datetime.now(timezone.utc),
    )