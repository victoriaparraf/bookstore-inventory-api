import { httpClient } from "../http/httpClient";
import type { Book, BookFilter, BookInput } from "../../domain/book";
import type { Page, PageParams } from "../../domain/pagination";
import type { PriceCalculation } from "../../domain/pricing";

/** Elige el endpoint y los parámetros según el filtro activo */
function resolveListRequest(filter: BookFilter, { page, pageSize }: PageParams) {
    const pagination = { page, page_size: pageSize };

    switch (filter.type) {
        case "category":
            return { url: "/books/search", params: { ...pagination, category: filter.category } };
        case "low-stock":
            return { url: "/books/low-stock", params: { ...pagination, threshold: filter.threshold } };
        default:
            return { url: "/books", params: pagination };
    }
}


export const bookApi = {
    /** GET /books, /books/search o /books/low-stock según el filtro */
    async list(filter: BookFilter, pageParams: PageParams): Promise<Page<Book>> {
        const { url, params } = resolveListRequest(filter, pageParams);
        const { data } = await httpClient.get<Page<Book>>(url, { params });
        return data;
    },

    /** GET /books/{id} */
    async getById(id: number): Promise<Book> {
        const { data } = await httpClient.get<Book>(`/books/${id}`);
        return data;
    },

    /** POST /books */
    async create(input: BookInput): Promise<Book> {
        const { data } = await httpClient.post<Book>("/books", input);
        return data;
    },

    /** PUT /books/{id} */
    async update(id: number, input: BookInput): Promise<Book> {
        const { data } = await httpClient.put<Book>(`/books/${id}`, input);
        return data;
    },

    /** DELETE /books/{id} */
    async remove(id: number): Promise<void> {
        await httpClient.delete(`/books/${id}`);
    },

    /** POST /books/{id}/calculate-price */
    async calculatePrice(id: number): Promise<PriceCalculation> {
        const { data } = await httpClient.post<PriceCalculation>(`/books/${id}/calculate-price`);
        return data;
    },
};