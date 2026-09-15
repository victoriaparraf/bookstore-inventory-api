export interface Page<T> {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface PageParams {
    page: number;
    pageSize: number;
}

export const DEFAULT_PAGE_SIZE = 10;