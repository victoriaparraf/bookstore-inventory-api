import { z } from "zod";
import type { Book, BookInput } from "../../domain/book";
import {
    isValidCost,
    isValidCountryCode,
    isValidIsbn,
    isValidStock,
} from "../../domain/validation";

/** Validación del formulario de libro con las reglas del dominio */
export const bookFormSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "El título es obligatorio")
        .max(255, "El título no puede superar 255 caracteres"),
    author: z
        .string()
        .trim()
        .min(1, "El autor es obligatorio")
        .max(255, "El autor no puede superar 255 caracteres"),
    isbn: z.string().trim().refine(isValidIsbn, "El ISBN debe tener 10 o 13 dígitos"),
    cost_usd: z
        .number({ error: "Ingresa un costo válido" })
        .refine(isValidCost, "El costo en USD debe ser mayor a 0")
        .refine((cost) => /^\d+(\.\d{1,2})?$/.test(String(cost)), "El costo admite máximo 2 decimales")
        .refine((cost) => cost <= 99_999_999.99, "El costo es demasiado alto"),
    stock_quantity: z
        .number({ error: "Ingresa una cantidad válida" })
        .refine(isValidStock, "El stock debe ser un número entero no negativo"),
    category: z
        .string()
        .trim()
        .min(1, "La categoría es obligatoria")
        .max(100, "La categoría no puede superar 100 caracteres"),
    supplier_country: z
        .string()
        .trim()
        .refine(isValidCountryCode, "Debe ser un código de país de 2 letras (ej. VE, ES)"),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;

/** Valores iniciales del formulario de creación */
export const emptyBookForm: Partial<BookFormValues> = {
    title: "",
    author: "",
    isbn: "",
    category: "",
    supplier_country: "VE",
};

/** Rellena el formulario de edición con los datos de un libro */
export function toBookFormValues(book: Book): BookFormValues {
    return {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        cost_usd: book.cost_usd,
        stock_quantity: book.stock_quantity,
        category: book.category,
        supplier_country: book.supplier_country,
    };
}

/** Convierte los valores del formulario en los datos que espera la API */
export function toBookInput(values: BookFormValues): BookInput {
    return { ...values, supplier_country: values.supplier_country.toUpperCase() };
}