import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    /** Evita cerrar el modal mientras hay una petición en curso */
    preventClose?: boolean;
    size?: "md" | "lg";
}

export function Modal({ open, title, onClose, children, preventClose = false, size = "md" }: ModalProps) {
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !preventClose) onClose();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, preventClose, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={() => !preventClose && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-xl ${
                    size === "lg" ? "max-w-2xl" : "max-w-md"
                }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={preventClose}
                        aria-label="Cerrar"
                        className="rounded-md px-2 text-2xl leading-none text-slate-400 hover:text-slate-600 disabled:opacity-40"
                    >
                        ×
                    </button>
                </div>
                <div className="px-5 py-4">{children}</div>
            </div>
        </div>
    );
}