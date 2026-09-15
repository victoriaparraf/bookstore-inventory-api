import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";

export function NotFoundPage() {
    return (
        <EmptyState
            title="Página no encontrada"
            description="La ruta que buscas no existe."
            action={
                <Link to="/" className="text-sm font-medium text-indigo-600 hover:underline">
                    ← Volver al inventario
                </Link>
            }
        />
    );
}