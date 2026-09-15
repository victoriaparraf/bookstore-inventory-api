import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "./application/queryClient";
import { AppLayout } from "./presentation/layout/AppLayout";
import { DashboardPage } from "./presentation/pages/DashboardPage";

/** SPA de una sola vista: todo (detalle, formularios, confirmaciones) se gestiona con modales */
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppLayout>
                <DashboardPage />
            </AppLayout>
            <Toaster position="top-right" richColors closeButton />
        </QueryClientProvider>
    );
}

export default App;
