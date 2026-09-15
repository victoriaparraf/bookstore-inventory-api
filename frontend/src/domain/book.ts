export interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    cost_usd: number;
    selling_price_local: number | null;
    stock_quantity: number;
    category: string;
    supplier_country: string;
    created_at: string;
    updated_at: string;
}


export type BookInput = Pick<
    Book,
    "title" | "author" | "isbn" | "cost_usd" | "stock_quantity" | "category" | "supplier_country"
>;

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export type BookFilter =
    | { type: "all" }
    | { type: "category"; category: string }
    | { type: "low-stock"; threshold: number };

export function isLowStock(book: Book, threshold: number = DEFAULT_LOW_STOCK_THRESHOLD): boolean {
    return book.stock_quantity <= threshold;
}