import type { BookFilter } from "../../domain/book";

/** Claves de caché de React Query para los libros */
export const bookQueryKeys = {
    all: ["books"] as const,
    lists: () => [...bookQueryKeys.all, "list"] as const,
    list: (filter: BookFilter, page: number, pageSize: number) =>
        [...bookQueryKeys.lists(), filter, page, pageSize] as const,
    details: () => [...bookQueryKeys.all, "detail"] as const,
    detail: (id: number) => [...bookQueryKeys.details(), id] as const,
};