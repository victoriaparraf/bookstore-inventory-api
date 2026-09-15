import { QueryClient } from "@tanstack/react-query";
import { AppError } from "../domain/errors";

// Todos los errores de React Query son AppError (los convierte el httpClient)
declare module "@tanstack/react-query" {
    interface Register {
        defaultError: AppError;
    }
}

/** Solo se reintentan los fallos temporales: sin conexión o error del servidor */
function shouldRetry(failureCount: number, error: AppError): boolean {
    const isTemporary = error.kind === "network" || error.kind === "server";
    return isTemporary && failureCount < 2;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: shouldRetry,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
        },
        mutations: {
            retry: false,
        },
    },
});