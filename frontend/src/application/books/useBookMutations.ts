import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { bookApi } from "../../infrastructure/books/bookApi";
import type { Book, BookInput } from "../../domain/book";
import type { AppError } from "../../domain/errors";
import { bookQueryKeys } from "./bookQueryKeys";

/** Si el libro ya no existe (404, ej. borrado desde otra pestaña), se quita de la caché y se refresca el listado */
function syncIfBookNotFound(queryClient: QueryClient, error: AppError, id: number) {
    if (error.kind !== "not_found") return;
    queryClient.removeQueries({ queryKey: bookQueryKeys.detail(id) });
    return queryClient.invalidateQueries({ queryKey: bookQueryKeys.lists() });
}

/** POST /books */
export function useCreateBook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: BookInput) => bookApi.create(input),
        onSuccess: (book) => {
            queryClient.setQueryData(bookQueryKeys.detail(book.id), book);
            return queryClient.invalidateQueries({ queryKey: bookQueryKeys.lists() });
        },
    });
}

/** PUT /books/{id} */
export function useUpdateBook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: BookInput }) => bookApi.update(id, input),
        onSuccess: (book) => {
            queryClient.setQueryData(bookQueryKeys.detail(book.id), book);
            return queryClient.invalidateQueries({ queryKey: bookQueryKeys.lists() });
        },
        onError: (error, { id }) => syncIfBookNotFound(queryClient, error, id),
    });
}

/** DELETE /books/{id} */
export function useDeleteBook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => bookApi.remove(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: bookQueryKeys.detail(id) });
            return queryClient.invalidateQueries({ queryKey: bookQueryKeys.lists() });
        },
        onError: (error, id) => syncIfBookNotFound(queryClient, error, id),
    });
}

/** POST /books/{id}/calculate-price */
export function useCalculatePrice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => bookApi.calculatePrice(id),
        onSuccess: (calculation) => {
            // El backend guardó el nuevo precio: se refleja al instante en el detalle y en el listado
            queryClient.setQueryData<Book>(bookQueryKeys.detail(calculation.book_id), (book) =>
                book ? { ...book, selling_price_local: calculation.selling_price_local } : book,
            );
            return queryClient.invalidateQueries({ queryKey: bookQueryKeys.lists() });
        },
        onError: (error, id) => syncIfBookNotFound(queryClient, error, id),
    });
}
