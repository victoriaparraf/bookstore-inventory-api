import { toast } from "sonner";
import type { AppError, AppErrorKind } from "../../domain/errors";

const ERROR_TITLES: Record<AppErrorKind, string> = {
    validation: "Datos no válidos",
    not_found: "No encontrado",
    server: "Error del servidor",
    service_unavailable: "Servicio no disponible",
    network: "Sin conexión",
};

export const notify = {
    success(message: string, description?: string) {
        toast.success(message, { description });
    },
    warning(message: string, description?: string) {
        toast.warning(message, { description });
    },
    error(error: AppError) {
        toast.error(ERROR_TITLES[error.kind], { description: error.message });
    },
};