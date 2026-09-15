import type { Book } from "../../domain/book";
import { AppError } from "../../domain/errors";
import { useCreateBook, useUpdateBook } from "../../application/books/useBookMutations";
import { emptyBookForm, toBookFormValues, toBookInput } from "../../application/books/bookFormSchema";
import type { BookFormValues } from "../../application/books/bookFormSchema";
import { Modal } from "../components/Modal";
import { notify } from "../utils/notify";
import { BookForm } from "./BookForm";

interface BookFormModalProps {
    open: boolean;
    /** Si se pasa un libro, el modal edita; si no, crea uno nuevo */
    book?: Book | null;
    onClose: () => void;
}

export function BookFormModal({ open, book, onClose }: BookFormModalProps) {
    const createBook = useCreateBook();
    const updateBook = useUpdateBook();
    const isEditing = Boolean(book);
    const isSaving = createBook.isPending || updateBook.isPending;

    async function handleSubmit(values: BookFormValues) {
        const input = toBookInput(values);
        try {
            if (book) {
                await updateBook.mutateAsync({ id: book.id, input });
                notify.success("Libro actualizado", input.title);
            } else {
                await createBook.mutateAsync(input);
                notify.success("Libro creado", input.title);
            }
            onClose();
        } catch (error) {
            if (error instanceof AppError) {
                notify.error(error);
                // El libro se eliminó mientras se editaba: se cierra el formulario
                if (error.kind === "not_found") onClose();
            }
            throw error; // El formulario marca los campos con error
        }
    }

    return (
        <Modal
            open={open}
            title={isEditing ? "Editar libro" : "Nuevo libro"}
            onClose={onClose}
            preventClose={isSaving}
            size="lg"
        >
            <BookForm
                key={book?.id ?? "new"}
                defaultValues={book ? toBookFormValues(book) : emptyBookForm}
                submitLabel={isEditing ? "Guardar cambios" : "Crear libro"}
                onSubmit={handleSubmit}
                onCancel={onClose}
            />
        </Modal>
    );
}