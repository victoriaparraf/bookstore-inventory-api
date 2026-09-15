import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookApi } from "../../infrastructure/books/bookApi";
import type { Book, BookInput } from "../../domain/book";
import { bookQueryKeys } from "./bookQueryKeys";

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
    });
}