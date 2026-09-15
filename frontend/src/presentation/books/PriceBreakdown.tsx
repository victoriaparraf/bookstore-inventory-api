import type { PriceCalculation } from "../../domain/pricing";
import { formatDateTime, formatExchangeRate, formatUSD, formatVES } from "../utils/format";

interface PriceBreakdownProps {
    calculation: PriceCalculation;
}

/** Desglose del cálculo: costo original, tasa, margen y precio final en bolívares */
export function PriceBreakdown({ calculation }: PriceBreakdownProps) {
    const isLive = calculation.rate_source === "live";

    const rows = [
        { label: "Costo original", value: formatUSD(calculation.cost_usd) },
        { label: "Tasa de cambio aplicada", value: formatExchangeRate(calculation.exchange_rate) },
        { label: "Costo en bolívares", value: formatVES(calculation.cost_local) },
        { label: "Margen de ganancia", value: `${calculation.margin_percentage}%` },
    ];

    return (
        <div className="space-y-4">
            <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {rows.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="font-medium text-slate-900">{value}</dd>
                    </div>
                ))}
            </dl>

            <div className="rounded-lg bg-indigo-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    Precio de venta sugerido
                </p>
                <p className="text-2xl font-bold text-indigo-900">{formatVES(calculation.selling_price_local)}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span
                    className={`rounded-full px-2.5 py-0.5 font-medium ${
                        isLive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                >
                    {isLive ? "Tasa en tiempo real" : "Tasa por defecto"}
                </span>
                <span>Calculado el {formatDateTime(calculation.calculation_timestamp)}</span>
            </div>
        </div>
    );
}