import type { Book } from "../../domain/book";
import { useDeleteBook } from "../../application/books/useBookMutations";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { notify } from "../utils/notify";

interface DeleteBookDialogProps {
    book: Book | null;
    onClose: () => void;
    onDeleted?: () => void;
}

/** Confirmación para eliminar un libro y evitar borrados accidentales */
export function DeleteBookDialog({ book, onClose, onDeleted }: DeleteBookDialogProps) {
    const deleteBook = useDeleteBook();

    function handleConfirm() {
        if (!book) return;

        deleteBook.mutate(book.id, {
            onSuccess: () => {
                notify.success("Libro eliminado", book.title);
                onClose();
                onDeleted?.();
            },
            onError: (error) => {
                notify.error(error);
                // Si ya no existe, no tiene sentido mantener abierta la confirmación
                if (error.kind === "not_found") onClose();
            },
        });
    }

    return (
        <ConfirmDialog
            open={book !== null}
            title="Eliminar libro"
            confirmLabel="Eliminar"
            isLoading={deleteBook.isPending}
            onConfirm={handleConfirm}
            onCancel={onClose}
            message={
                <>
                    ¿Seguro que deseas eliminar <strong className="text-slate-900">{book?.title}</strong>? Esta
                    acción no se puede deshacer.
                </>
            }
        />
    );
}