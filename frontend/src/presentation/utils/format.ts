const LOCALE = "es-VE";

function formatNumber(value: number, maxDecimals = 2): string {
    return value.toLocaleString(LOCALE, {
        minimumFractionDigits: 2,
        maximumFractionDigits: maxDecimals,
    });
}


export function formatUSD(value: number): string {
    return `$ ${formatNumber(value)}`;
}


export function formatVES(value: number): string {
    return `Bs. ${formatNumber(value)}`;
}


export function formatExchangeRate(rate: number): string {
    return `1 USD = Bs. ${formatNumber(rate, 6)}`;
}


export function formatDateTime(isoDate: string): string {
    return new Date(isoDate).toLocaleString(LOCALE, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}