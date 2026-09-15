import { useState } from "react";
import type { FormEvent } from "react";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "../../domain/book";
import type { BookFilter } from "../../domain/book";
import { Button } from "../components/Button";

interface BookFiltersProps {
    filter: BookFilter;
    onChange: (filter: BookFilter) => void;
}

type Mode = BookFilter["type"];

const MODES: { value: Mode; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "category", label: "Por categoría" },
    { value: "low-stock", label: "Stock bajo" },
];

/** Panel de filtros: todos los libros, búsqueda por categoría o stock bajo */
export function BookFilters({ filter, onChange }: BookFiltersProps) {
    const [mode, setMode] = useState<Mode>(filter.type);
    const [category, setCategory] = useState(filter.type === "category" ? filter.category : "");
    const [threshold, setThreshold] = useState(
        filter.type === "low-stock" ? filter.threshold : DEFAULT_LOW_STOCK_THRESHOLD,
    );

    function selectMode(newMode: Mode) {
        setMode(newMode);
        if (newMode === "all") onChange({ type: "all" });
        // Con la búsqueda vacía, el catálogo muestra todos los libros hasta que se busque
        if (newMode === "category") onChange({ type: "category", category: category.trim() });
        if (newMode === "low-stock") onChange({ type: "low-stock", threshold });
    }

    function handleCategorySubmit(event: FormEvent) {
        event.preventDefault();
        onChange({ type: "category", category: category.trim() });
    }

    function handleThresholdSubmit(event: FormEvent) {
        event.preventDefault();
        onChange({ type: "low-stock", threshold });
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtros">
                {MODES.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={mode === value}
                        onClick={() => selectMode(value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                            mode === value
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {mode === "category" && (
                <form onSubmit={handleCategorySubmit} className="mt-4 flex flex-wrap gap-2">
                    <input
                        type="search"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        placeholder="Ej. Literatura Clásica"
                        aria-label="Categoría"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <Button type="submit">Buscar</Button>
                </form>
            )}

            {mode === "low-stock" && (
                <form onSubmit={handleThresholdSubmit} className="mt-4 flex flex-wrap items-center gap-2">
                    <label htmlFor="threshold" className="text-sm text-slate-600">
                        Stock menor o igual a
                    </label>
                    <input
                        id="threshold"
                        type="number"
                        min={0}
                        value={threshold}
                        onChange={(event) => setThreshold(Math.max(0, Number(event.target.value) || 0))}
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <Button type="submit">Aplicar</Button>
                </form>
            )}
        </section>
    );
}