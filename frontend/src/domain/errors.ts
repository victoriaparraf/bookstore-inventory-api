/** Tipos de error que la interfaz sabe mostrar, independientes de HTTP */
export type AppErrorKind =
    | "validation" // 400
    | "not_found" // 404
    | "server" // 500
    | "service_unavailable" // 503
    | "network"; // Backend apagado o sin conexión

/** Error de la aplicación con mensaje listo para mostrar al usuario */
export class AppError extends Error {
    readonly kind: AppErrorKind;
    readonly status: number | null;
    readonly fieldErrors: Record<string, string[]>;

    constructor(
        kind: AppErrorKind,
        message: string,
        status: number | null = null,
        fieldErrors: Record<string, string[]> = {},
    ) {
        super(message);
        this.name = "AppError";
        this.kind = kind;
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}