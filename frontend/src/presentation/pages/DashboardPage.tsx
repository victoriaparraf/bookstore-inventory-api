import { useState } from "react";
import type { Book } from "../../domain/book";
import type { PriceCalculation } from "../../domain/pricing";
import { useBookCatalog } from "../../application/books/useBookCatalog";
import { useCalculatePrice } from "../../application/books/useBookMutations";
import { BookDetailModal } from "../books/BookDetailModal";
import { BookFilters } from "../books/BookFilters";
import { BookFormModal } from "../books/BookFormModal";
import { BookTable } from "../books/BookTable";
import { DeleteBookDialog } from "../books/DeleteBookDialog";
import { PriceBreakdown } from "../books/PriceBreakdown";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Modal } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { Spinner } from "../components/Spinner";
import { formatVES } from "../utils/format";
import { notify } from "../utils/notify";

export function DashboardPage() {
    const catalog = useBookCatalog();
    const calculatePrice = useCalculatePrice();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [detailBookId, setDetailBookId] = useState<number | null>(null);
    const [priceResult, setPriceResult] = useState<{ book: Book; calculation: PriceCalculation } | null>(null);

    const lowStockThreshold = catalog.filter.type === "low-stock" ? catalog.filter.threshold : undefined;

    function openCreateForm() {
        setBookToEdit(null);
        setIsFormOpen(true);
    }

    // Los modales no se apilan: al editar o eliminar desde el detalle, este se cierra
    function openEditForm(book: Book) {
        setDetailBookId(null);
        setBookToEdit(book);
        setIsFormOpen(true);
    }

    function openDeleteDialog(book: Book) {
        setDetailBookId(null);
        setBookToDelete(book);
    }

    function handleCalculatePrice(book: Book) {
        calculatePrice.mutate(book.id, {
            onSuccess: (calculation) => {
                setPriceResult({ book, calculation });
                notify.success("Precio calculado", `${book.title}: ${formatVES(calculation.selling_price_local)}`);
                if (calculation.rate_source === "fallback") {
                    notify.warning(
                        "Se usó la tasa por defecto",
                        "La API de tasas de cambio no respondió.",
                    );
                }
            },
            onError: (error) => notify.error(error),
        });
    }

    function renderContent() {
        if (catalog.isLoading) {
            return (
                <div className="flex justify-center py-16 text-indigo-600">
                    <Spinner size="lg" label="Cargando libros" />
                </div>
            );
        }

        if (catalog.error) {
            return <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} isRetrying={catalog.isFetching} />;
        }

        if (catalog.books.length === 0) {
            return catalog.filter.type === "all" ? (
                <EmptyState
                    title="Aún no hay libros en el inventario"
                    description="Registra el primer libro para empezar."
                    action={<Button onClick={openCreateForm}>Nuevo libro</Button>}
                />
            ) : (
                <EmptyState title="No hay libros que coincidan con el filtro" description="Prueba con otro criterio." />
            );
        }

        return (
            <BookTable
                books={catalog.books}
                lowStockThreshold={lowStockThreshold}
                calculatingBookId={calculatePrice.isPending ? calculatePrice.variables : undefined}
                onView={(book) => setDetailBookId(book.id)}
                onCalculatePrice={handleCalculatePrice}
                onEdit={openEditForm}
                onDelete={openDeleteDialog}
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventario de libros</h1>
                    <p className="text-sm text-slate-500">Gestiona el catálogo y calcula precios de venta.</p>
                </div>
                <Button onClick={openCreateForm}>+ Nuevo libro</Button>
            </div>

            <BookFilters filter={catalog.filter} onChange={catalog.setFilter} />

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {catalog.isFetching && !catalog.isLoading && (
                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-xs text-indigo-600">
                        <Spinner size="sm" /> Actualizando…
                    </div>
                )}
                {renderContent()}
                {!catalog.isLoading && !catalog.error && catalog.totalCount > 0 && (
                    <div className="border-t border-slate-200 px-4 py-3">
                        <Pagination
                            page={catalog.page}
                            totalPages={catalog.totalPages}
                            totalCount={catalog.totalCount}
                            onPageChange={catalog.goToPage}
                            disabled={catalog.isFetching}
                        />
                    </div>
                )}
            </section>

            <BookDetailModal
                bookId={detailBookId}
                onClose={() => setDetailBookId(null)}
                onEdit={openEditForm}
                onDelete={openDeleteDialog}
            />

            <BookFormModal open={isFormOpen} book={bookToEdit} onClose={() => setIsFormOpen(false)} />

            <DeleteBookDialog
                book={bookToDelete}
                onClose={() => setBookToDelete(null)}
                onDeleted={catalog.onBookRemoved}
            />

            <Modal
                open={priceResult !== null}
                title={priceResult ? `Precio de venta · ${priceResult.book.title}` : ""}
                onClose={() => setPriceResult(null)}
            >
                {priceResult && <PriceBreakdown calculation={priceResult.calculation} />}
            </Modal>
        </div>
    );
}