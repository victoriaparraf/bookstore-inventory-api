import { useQuery } from "@tanstack/react-query";
import { bookApi } from "../../infrastructure/books/bookApi";
import { bookQueryKeys } from "./bookQueryKeys";

/** Detalle de un libro por ID */
export function useBook(id: number) {
    return useQuery({
        queryKey: bookQueryKeys.detail(id),
        queryFn: () => bookApi.getById(id),
        enabled: Number.isInteger(id) && id > 0,
    });
}