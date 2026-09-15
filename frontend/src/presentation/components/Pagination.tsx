import { Button } from "./Button";

interface PaginationProps {
    page: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

export function Pagination({ page, totalPages, totalCount, onPageChange, disabled = false }: PaginationProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <p>
                {totalCount} {totalCount === 1 ? "libro" : "libros"} · Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={disabled || page <= 1}
                >
                    ← Anterior
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={disabled || page >= totalPages}
                >
                    Siguiente →
                </Button>
            </div>
        </div>
    );
}