import type { AppError } from "../../domain/errors";
import { Button } from "./Button";

interface ErrorStateProps {
    error: AppError;
    onRetry?: () => void;
    isRetrying?: boolean;
}

export function ErrorState({ error, onRetry, isRetrying = false }: ErrorStateProps) {
    return (
        <div role="alert" className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <p className="text-base font-medium text-red-700">No se pudo cargar la información</p>
            <p className="text-sm text-slate-500">{error.message}</p>
            {onRetry && (
                <Button variant="secondary" className="mt-3" onClick={onRetry} isLoading={isRetrying}>
                    Reintentar
                </Button>
            )}
        </div>
    );
}