import { isLowStock } from "../../domain/book";
import type { Book } from "../../domain/book";

interface StockBadgeProps {
    book: Book;
    threshold?: number;
}

export function StockBadge({ book, threshold }: StockBadgeProps) {
    const low = isLowStock(book, threshold);

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                low ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
            }`}
        >
            {book.stock_quantity} {low && "· bajo"}
        </span>
    );
}