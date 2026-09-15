import type { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <p className="text-base font-medium text-slate-800">{title}</p>
            {description && <p className="text-sm text-slate-500">{description}</p>}
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}