import axios from "axios";
import { storage } from "../util/storage";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  // eslint-disable-next-line no-console
  console.warn("[Borrão] VITE_API_URL não definida — usando fallback localhost.");
}

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = storage.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && storage.get("token")) {
      storage.clearUser();
      const here = window.location.pathname + window.location.search;
      const next = here && here !== "/login" ? `?next=${encodeURIComponent(here)}` : "";
      window.location.href = `/login${next}`;
    }
    return Promise.reject(err);
  }
);

/** Normalise an axios error into a friendly PT-BR message. */
export function errMsg(err, fallback = "Algo deu errado. Tente novamente.") {
  return err?.response?.data?.detail || err?.message || fallback;
}

export default api;
