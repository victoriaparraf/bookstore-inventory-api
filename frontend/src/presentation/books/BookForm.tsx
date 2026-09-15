import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppError } from "../../domain/errors";
import { bookFormSchema } from "../../application/books/bookFormSchema";
import type { BookFormValues } from "../../application/books/bookFormSchema";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";

interface BookFormProps {
    defaultValues: Partial<BookFormValues>;
    submitLabel: string;
    onSubmit: (values: BookFormValues) => Promise<void>;
    onCancel: () => void;
}

/** Formulario validado de creación y edición de libros */
export function BookForm({ defaultValues, submitLabel, onSubmit, onCancel }: BookFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<BookFormValues>({
        resolver: zodResolver(bookFormSchema),
        defaultValues,
    });

    async function submit(values: BookFormValues) {
        try {
            await onSubmit(values);
        } catch (error) {
            // Errores del backend por campo (ej. ISBN duplicado) se muestran bajo el input
            if (error instanceof AppError) {
                for (const [field, messages] of Object.entries(error.fieldErrors)) {
                    if (field in bookFormSchema.shape) {
                        setError(field as keyof BookFormValues, { message: messages[0] });
                    }
                }
            }
        }
    }

    return (
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
            <TextField label="Título" error={errors.title?.message} {...register("title")} />
            <TextField label="Autor" error={errors.author?.message} {...register("author")} />

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    label="ISBN"
                    hint="10 o 13 dígitos, se permiten guiones"
                    placeholder="978-84-376-0494-7"
                    error={errors.isbn?.message}
                    {...register("isbn")}
                />
                <TextField label="Categoría" error={errors.category?.message} {...register("category")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                    label="Costo (USD)"
                    type="number"
                    step="0.01"
                    min="0"
                    error={errors.cost_usd?.message}
                    {...register("cost_usd", { valueAsNumber: true })}
                />
                <TextField
                    label="Stock"
                    type="number"
                    step="1"
                    min="0"
                    error={errors.stock_quantity?.message}
                    {...register("stock_quantity", { valueAsNumber: true })}
                />
                <TextField
                    label="País proveedor"
                    maxLength={2}
                    placeholder="VE"
                    style={{ textTransform: "uppercase" }}
                    error={errors.supplier_country?.message}
                    {...register("supplier_country")}
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}