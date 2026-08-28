import axios from 'axios';

/**
 * Axios instance pre-configured for the ChronoCraft API.
 *
 * Base URL is read from the Vite env variable VITE_API_URL at build time,
 * falling back to the local dev server address.
 *
 * Interceptors:
 *  REQUEST  — Reads the JWT from localStorage (where Zustand persist stores it)
 *             and attaches it as a Bearer Authorization header.
 *             Reading from localStorage directly avoids a circular import
 *             between api.js and authStore.js.
 *
 *  RESPONSE — On 401 Unauthorized, dispatches a custom DOM event 'auth:logout'
 *             that authStore.js listens to in order to clear auth state.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// ─── Request Interceptor — Attach Bearer token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    try {
      // Zustand persist stores state as: { state: { token, theme }, version: 0 }
      const raw = localStorage.getItem('chronocraft-auth');
      if (raw) {
        const { state } = JSON.parse(raw);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch {
      // localStorage unavailable (SSR / private browsing edge cases) — ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Handle 401 Unauthorized ──────────────────────────
api.interceptors.response.use(
  // Pass successful responses through unchanged
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Dispatch a custom event — authStore.js listens and calls logout()
      // This breaks the circular dependency: api.js does NOT import authStore.js
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:logout'));
      }
    }

    // Always reject so the calling code can handle specific error messages
    return Promise.reject(error);
  }
);

export default api;
