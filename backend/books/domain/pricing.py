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
    calculation_timestamp: str

def _quantize_currency(amount: Decimal) -> Decimal:
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_book_price( #Costo local y precio de venta

    book_id: Optional[int],
    cost_usd: Decimal,
    rate: Decimal,
    margin_percentage: Decimal,
    currency_label: str = "EUR",
    rate_source: str = "live"

) -> BookPriceBreakdown:

    local_cost = _quantize_currency(cost_usd * rate)

    margin_multiplier = Decimal("1") + (margin_percentage / Decimal("100"))
    final_selling_price = _quantize_currency(local_cost * margin_multiplier)

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    return BookPriceBreakdown(
        book_id=book_id,
        cost_usd=cost_usd,
        exchange_rate=rate,
        cost_local=local_cost,
        margin_percentage=margin_percentage,
        selling_price_local=final_selling_price,
        currency=currency_label,
        rate_source=rate_source,
        calculation_timestamp=timestamp
    )
