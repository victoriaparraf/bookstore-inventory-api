import axios from "axios";
import { toAppError } from "./apiError";

/** Cliente HTTP único para toda la aplicación */
export const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

httpClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toAppError(error)),
);