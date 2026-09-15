import { useId } from "react";
import type { ComponentProps } from "react";

interface TextFieldProps extends ComponentProps<"input"> {
    label: string;
    error?: string;
    hint?: string;
}

/** Input con etiqueta y mensaje de error, compatible con register() de react-hook-form */
export function TextField({ label, error, hint, className = "", ...props }: TextFieldProps) {
    const id = useId();
    const messageId = `${id}-message`;

    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <input
                id={id}
                aria-invalid={Boolean(error)}
                aria-describedby={error || hint ? messageId : undefined}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                    error
                        ? "border-red-400 focus:ring-red-200"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
                {...props}
            />
            {(error || hint) && (
                <p id={messageId} className={`mt-1 text-xs ${error ? "text-red-600" : "text-slate-500"}`}>
                    {error ?? hint}
                </p>
            )}
        </div>
    );
}