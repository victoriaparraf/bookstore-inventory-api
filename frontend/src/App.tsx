import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "./application/queryClient";
import { AppLayout } from "./presentation/layout/AppLayout";
import { BookDetailPage } from "./presentation/pages/BookDetailPage";
import { DashboardPage } from "./presentation/pages/DashboardPage";
import { NotFoundPage } from "./presentation/pages/NotFoundPage";

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="books/:id" element={<BookDetailPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
            <Toaster position="top-right" richColors closeButton />
        </QueryClientProvider>
    );
}

export default App;