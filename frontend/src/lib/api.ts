import axios from "axios";

/**
 * Single source of truth for API access.
 *
 * - Prefer `VITE_API_URL` in environments where frontend/backend are on different origins.
 *   Example: VITE_API_URL="https://api.example.com/api"
 * - In local dev, default to `/api` and rely on Vite proxy (see `vite.config.ts`).
 */
const baseURL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "/api" : "/api");

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("inv-token");
  if (token) {
    const headers = (config.headers ??= {});
    // Don't overwrite explicit headers set per-request
    if (!("Authorization" in headers) && !("authorization" in headers)) {
      // @ts-expect-error axios header typing differs between versions
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // If the token is invalid/expired, drop local auth state.
    if (err?.response?.status === 401) {
      localStorage.removeItem("inv-token");
      localStorage.removeItem("inv-user");
    }
    return Promise.reject(err);
  }
);


