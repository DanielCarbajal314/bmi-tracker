// In development Vite forwards /api to the backend, so the browser never leaves its own origin.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api';
