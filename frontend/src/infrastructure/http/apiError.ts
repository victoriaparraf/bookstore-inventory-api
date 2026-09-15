import { isAxiosError } from "axios";
import { AppError } from "../../domain/errors";
import type { AppErrorKind } from "../../domain/errors";

/** Formato de error que devuelve el backend */
interface ApiErrorBody {
    status: number;
    error: string;
    message: string;
    details: Record<string, unknown> | null;
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
    return typeof data === "object" && data !== null && "message" in data;
}

function kindFromStatus(status: number): AppErrorKind {
    if (status === 404) return "not_found";
    if (status === 503) return "service_unavailable";
    if (status >= 500) return "server";
    return "validation";
}


function toFieldErrors(details: ApiErrorBody["details"]): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};
    if (!details) return fieldErrors;

    for (const [field, value] of Object.entries(details)) {
        const messages = Array.isArray(value) ? value : [value];
        fieldErrors[field] = messages.map(String);
    }
    return fieldErrors;
}


export function toAppError(error: unknown): AppError {
    if (error instanceof AppError) return error;

    if (!isAxiosError(error)) {
        return new AppError("server", "Ocurrió un error inesperado.");
    }

    if (!error.response) {
        const message =
            error.code === "ECONNABORTED"
                ? "El servidor tardó demasiado en responder."
                : "No se pudo conectar con el servidor. Verifica que el backend esté en marcha.";
        return new AppError("network", message);
    }

    const { status, data } = error.response;
    const kind = kindFromStatus(status);

    if (!isApiErrorBody(data)) {
        return new AppError(kind, `Error ${status} al comunicarse con el servidor.`, status);
    }

    const fieldErrors = toFieldErrors(data.details);
    // En errores de validación, el primer mensaje por campo es más útil que el mensaje genérico
    const firstFieldMessage = Object.values(fieldErrors)[0]?.[0];
    const message = kind === "validation" && firstFieldMessage ? firstFieldMessage : data.message;

    return new AppError(kind, message, status, fieldErrors);
}