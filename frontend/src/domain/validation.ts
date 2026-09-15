import type { BookInput } from "./book";

export type BookValidationErrors = Partial<Record<keyof BookInput, string>>;

export function normalizeIsbn(isbn: string): string {
    return isbn.replace(/[\s-]/g, "");
}

export function isValidIsbn(isbn: string): boolean {
    return /^(\d{10}|\d{13})$/.test(normalizeIsbn(isbn));
}

export function isValidCost(cost: number): boolean {
    return Number.isFinite(cost) && cost > 0;
}

export function isValidStock(stock: number): boolean {
    return Number.isInteger(stock) && stock >= 0;
}

export function isValidCountryCode(code: string): boolean {
    return /^[A-Za-z]{2}$/.test(code.trim());
}

export function validateBook(input: BookInput): BookValidationErrors {
    const errors: BookValidationErrors = {};

    if (!input.title.trim()) errors.title = "El título es obligatorio";
    if (!input.author.trim()) errors.author = "El autor es obligatorio";
    if (!input.category.trim()) errors.category = "La categoría es obligatoria";

    if (!isValidIsbn(input.isbn)) {
        errors.isbn = "El ISBN debe tener 10 o 13 dígitos";
    }
    if (!isValidCost(input.cost_usd)) {
        errors.cost_usd = "El costo en USD debe ser mayor a 0";
    }
    if (!isValidStock(input.stock_quantity)) {
        errors.stock_quantity = "El stock debe ser un número entero no negativo";
    }
    if (!isValidCountryCode(input.supplier_country)) {
        errors.supplier_country = "Debe ser un código de país de 2 letras (ej. VE, ES)";
    }

    return errors;
}