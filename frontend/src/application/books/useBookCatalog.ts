import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { bookApi } from "../../infrastructure/books/bookApi";
import { DEFAULT_PAGE_SIZE } from "../../domain/pagination";
import type { BookFilter } from "../../domain/book";
import { bookQueryKeys } from "./bookQueryKeys";

/** Catálogo del dashboard: listado paginado + filtro activo (todos, categoría o stock bajo) */
export function useBookCatalog(pageSize: number = DEFAULT_PAGE_SIZE) {
    const [filter, setFilterState] = useState<BookFilter>({ type: "all" });
    const [page, setPage] = useState(1);

    const query = useQuery({
        queryKey: bookQueryKeys.list(filter, page, pageSize),
        queryFn: () => bookApi.list(filter, { page, pageSize }),
        // Mantiene la página anterior visible mientras carga la siguiente
        placeholderData: keepPreviousData,
    });

    const totalPages = query.data?.total_pages ?? 1;

    /** Cambia el filtro y vuelve a la primera página */
    function setFilter(newFilter: BookFilter) {
        if (newFilter.type === "category" && !newFilter.category.trim()) {
            newFilter = { type: "all" };
        }
        setFilterState(newFilter);
        setPage(1);
    }

    function goToPage(newPage: number) {
        setPage(Math.min(Math.max(1, newPage), totalPages));
    }

    /** Si se borra el último libro de la página, retrocede para no pedir una página vacía (404) */
    function onBookRemoved() {
        if (query.data?.results.length === 1 && page > 1) {
            setPage(page - 1);
        }
    }

    return {
        books: query.data?.results ?? [],
        totalCount: query.data?.count ?? 0,
        page,
        totalPages,
        filter,
        isLoading: query.isPending,
        isFetching: query.isFetching,
        error: query.error,
        setFilter,
        goToPage,
        onBookRemoved,
        refetch: query.refetch,
    };
}