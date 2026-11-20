import axios from "axios";

const TOKEN_KEY = "notepulse_token";

// The token is kept in this browser only. The server verifies it on every request.
export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null): void {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // storage blocked: the session lasts for this page only
    }
  },
};

export const api = axios.create({ baseURL: "/api/v1" });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns an axios or backend error into one readable line
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; errorMessages?: { message: string }[] }
      | undefined;
    const details = data?.errorMessages?.map((e) => e.message).join("; ");
    return details || data?.message || err.message;
  }
  return "Something went wrong";
}

export const PAGE_SIZE = 10;
