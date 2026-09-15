import { Link, Outlet } from "react-router-dom";

export function AppLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden="true">
                            📚
                        </span>
                        <span className="text-lg font-bold text-slate-900">Bookstore Inventory</span>
                    </Link>
                    <span className="hidden text-sm text-slate-500 sm:block">Precios en bolívares (VES)</span>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <Outlet />
            </main>
        </div>
    );
}