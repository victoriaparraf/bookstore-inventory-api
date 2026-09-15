import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { PriceCalculation } from "../../domain/pricing";
import { useBook } from "../../application/books/useBook";
import { useCalculatePrice } from "../../application/books/useBookMutations";
import { BookFormModal } from "../books/BookFormModal";
import { DeleteBookDialog } from "../books/DeleteBookDialog";
import { PriceBreakdown } from "../books/PriceBreakdown";
import { StockBadge } from "../books/StockBadge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Spinner } from "../components/Spinner";
import { formatDateTime, formatUSD, formatVES } from "../utils/format";
import { notify } from "../utils/notify";

export function BookDetailPage() {
    const { id } = useParams();
    const bookId = Number(id);
    const navigate = useNavigate();

    const { data: book, isPending, error, refetch, isFetching } = useBook(bookId);
    const calculatePrice = useCalculatePrice();

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [calculation, setCalculation] = useState<PriceCalculation | null>(null);

    const backLink = (
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:underline">
            ← Volver al inventario
        </Link>
    );

    if (!Number.isInteger(bookId) || bookId <= 0 || error?.kind === "not_found") {
        return (
            <EmptyState
                title="Libro no encontrado"
                description="El libro que buscas no existe o fue eliminado."
                action={backLink}
            />
        );
    }

    if (error) {
        return <ErrorState error={error} onRetry={() => refetch()} isRetrying={isFetching} />;
    }

    if (isPending) {
        return (
            <div className="flex justify-center py-16 text-indigo-600">
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
            {backLink}

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{book.title}</h1>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        Stock: <StockBadge book={book} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={() => setIsDeleting(true)}>
                        Eliminar
                    </Button>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-base font-semibold text-slate-900">Información del libro</h2>
                    <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                        {details.map(({ label, value }) => (
                            <div key={label}>
                                <dt className="text-xs text-slate-500">{label}</dt>
                                <dd className="text-sm font-medium text-slate-900">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-semibold text-slate-900">Cálculo de precio</h2>
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

            <BookFormModal open={isEditing} book={book} onClose={() => setIsEditing(false)} />

            <DeleteBookDialog
                book={isDeleting ? book : null}
                onClose={() => setIsDeleting(false)}
                onDeleted={() => navigate("/")}
            />
        </div>
    );
}