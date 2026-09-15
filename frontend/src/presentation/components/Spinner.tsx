interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    label?: string;
}

const SIZES = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-4",
};

export function Spinner({ size = "md", label = "Cargando" }: SpinnerProps) {
    return (
        <span role="status" aria-label={label} className="inline-flex">
            <span
                className={`${SIZES[size]} animate-spin rounded-full border-current border-t-transparent`}
            />
        </span>
    );
}