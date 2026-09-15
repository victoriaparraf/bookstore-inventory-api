import type { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: ReactNode;
    confirmLabel?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/** Confirmación antes de acciones destructivas (ej. eliminar) */
export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Confirmar",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Modal open={open} title={title} onClose={onCancel} preventClose={isLoading}>
            <div className="text-sm text-slate-600">{message}</div>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}