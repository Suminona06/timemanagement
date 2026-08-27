import axios from 'axios';

/**
 * Axios instance pre-configured for the ChronoCraft API.
 *
 * Base URL is read from the Vite env variable VITE_API_URL at build time,
 * falling back to the local dev server address.
 *
 * Interceptors are added in Phase 2 (authStore) to:
 *  - Attach the Bearer token to every outgoing request
 *  - Automatically log the user out on 401 Unauthorized responses
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookies / cross-origin credentials
  timeout: 15000,        // 15 second timeout to surface hanging requests early
});

// ─── Request Interceptor placeholder ─────────────────────────────────────────
// Will be configured in Phase 2 alongside authStore to attach JWT token:
//
// api.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().token;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// ─── Response Interceptor placeholder ────────────────────────────────────────
// Will be configured in Phase 2 to handle 401 token expiry:
//
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       useAuthStore.getState().logout();
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
