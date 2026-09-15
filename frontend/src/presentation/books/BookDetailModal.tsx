import { useState } from "react";
import type { Book } from "../../domain/book";
import type { PriceCalculation } from "../../domain/pricing";
import { useBook } from "../../application/books/useBook";
import { useCalculatePrice } from "../../application/books/useBookMutations";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Modal } from "../components/Modal";
import { Spinner } from "../components/Spinner";
import { formatDateTime, formatUSD, formatVES } from "../utils/format";
import { notify } from "../utils/notify";
import { PriceBreakdown } from "./PriceBreakdown";
import { StockBadge } from "./StockBadge";

interface BookDetailModalProps {
    /** ID del libro a mostrar; null cierra el modal */
    bookId: number | null;
    onClose: () => void;
    onEdit: (book: Book) => void;
    onDelete: (book: Book) => void;
}

/** Vista de detalle del libro dentro de la SPA (sin cambiar de página) */
export function BookDetailModal({ bookId, onClose, onEdit, onDelete }: BookDetailModalProps) {
    return (
        <Modal open={bookId !== null} title="Detalle del libro" onClose={onClose} size="lg">
            {bookId !== null && (
                <BookDetailContent key={bookId} bookId={bookId} onEdit={onEdit} onDelete={onDelete} />
            )}
        </Modal>
    );
}

interface BookDetailContentProps {
    bookId: number;
    onEdit: (book: Book) => void;
    onDelete: (book: Book) => void;
}

function BookDetailContent({ bookId, onEdit, onDelete }: BookDetailContentProps) {
    const { data: book, isPending, error, refetch, isFetching } = useBook(bookId);
    const calculatePrice = useCalculatePrice();
    const [calculation, setCalculation] = useState<PriceCalculation | null>(null);

    if (error?.kind === "not_found") {
        return <EmptyState title="Libro no encontrado" description="El libro no existe o fue eliminado." />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={() => refetch()} isRetrying={isFetching} />;
    }

    if (isPending) {
        return (
            <div className="flex justify-center py-12 text-indigo-600">
                <Spinner size="lg" label="Cargando libro" />
            </div>
        );
    }

    function handleCalculatePrice() {
        calculatePrice.mutate(bookId, {
            onSuccess: (result) => {
                setCalculation(result);
                notify.success("Precio calculado", formatVES(result.selling_price_local));
                if (result.rate_source === "fallback") {
                    notify.warning("Se usó la tasa por defecto", "La API de tasas de cambio no respondió.");
                }
            },
            onError: (err) => notify.error(err),
        });
    }

    // Si el libro se editó y su precio cambió, el desglose anterior ya no corresponde
    const currentCalculation =
        calculation?.selling_price_local === book.selling_price_local ? calculation : null;

    const details = [
        { label: "Autor", value: book.author },
        { label: "ISBN", value: book.isbn },
        { label: "Categoría", value: book.category },
        { label: "País proveedor", value: book.supplier_country },
        { label: "Costo", value: formatUSD(book.cost_usd) },
        {
            label: "Precio de venta",
            value: book.selling_price_local !== null ? formatVES(book.selling_price_local) : "Sin calcular",
        },
        { label: "Registrado", value: formatDateTime(book.created_at) },
        { label: "Última actualización", value: formatDateTime(book.updated_at) },
    ];

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{book.title}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        Stock: <StockBadge book={book} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => onEdit(book)}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(book)}>
                        Eliminar
                    </Button>
                </div>
            </div>

            <dl className="grid gap-x-4 gap-y-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-2">
                {details.map(({ label, value }) => (
                    <div key={label}>
                        <dt className="text-xs text-slate-500">{label}</dt>
                        <dd className="text-sm font-medium text-slate-900">{value}</dd>
                    </div>
                ))}
            </dl>

            <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-semibold text-slate-900">Cálculo de precio</h4>
                    <Button onClick={handleCalculatePrice} isLoading={calculatePrice.isPending}>
                        Calcular precio de venta
                    </Button>
                </div>
                {currentCalculation ? (
                    <PriceBreakdown calculation={currentCalculation} />
                ) : (
                    <p className="text-sm text-slate-500">
                        Calcula el precio sugerido en bolívares con la tasa de cambio actual y un margen del 40%.
                    </p>
                )}
            </section>
        </div>
    );
}
