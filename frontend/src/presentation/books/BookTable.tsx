import type { Book } from "../../domain/book";
import { Button } from "../components/Button";
import { formatUSD, formatVES } from "../utils/format";
import { StockBadge } from "./StockBadge";

interface BookTableProps {
    books: Book[];
    lowStockThreshold?: number;
    calculatingBookId?: number;
    onView: (book: Book) => void;
    onCalculatePrice: (book: Book) => void;
    onEdit: (book: Book) => void;
    onDelete: (book: Book) => void;
}

export function BookTable({
    books,
    lowStockThreshold,
    calculatingBookId,
    onView,
    onCalculatePrice,
    onEdit,
    onDelete,
}: BookTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Libro</th>
                        <th className="px-4 py-3">ISBN</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3 text-right">Costo</th>
                        <th className="px-4 py-3 text-right">Precio de venta</th>
                        <th className="px-4 py-3 text-center">Stock</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {books.map((book) => (
                        <tr key={book.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                                <button
                                    type="button"
                                    onClick={() => onView(book)}
                                    className="text-left font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                                >
                                    {book.title}
                                </button>
                                <p className="text-xs text-slate-500">{book.author}</p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                                {book.isbn}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{book.category}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                                {formatUSD(book.cost_usd)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                                {book.selling_price_local !== null ? (
                                    <span className="font-medium text-slate-900">
                                        {formatVES(book.selling_price_local)}
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-400">Sin calcular</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <StockBadge book={book} threshold={lowStockThreshold} />
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1.5">
                                    <Button size="sm" variant="ghost" onClick={() => onView(book)}>
                                        Ver
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => onCalculatePrice(book)}
                                        isLoading={calculatingBookId === book.id}
                                        disabled={calculatingBookId !== undefined}
                                    >
                                        Calcular precio
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => onEdit(book)}>
                                        Editar
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => onDelete(book)}>
                                        <span className="text-red-600">Eliminar</span>
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}