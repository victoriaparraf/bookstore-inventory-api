export type RateSource = "live" | "fallback";

export interface PriceCalculation {
    book_id: number;
    cost_usd: number;
    exchange_rate: number;
    cost_local: number;
    margin_percentage: number;
    selling_price_local: number;
    currency: string;
    rate_source: RateSource;
    calculation_timestamp: string;
}

export const BASE_CURRENCY = "USD";
export const LOCAL_CURRENCY = "VES";