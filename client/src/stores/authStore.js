import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  registerUser,
  loginUser,
  fetchMe,
  patchPreferences,
  patchProfile,
} from '../services/authService';

/**
 * authStore — Global authentication and user preference state.
 *
 * Persisted to localStorage under the key 'chronocraft-auth'.
 * The Axios interceptor in api.js reads the token directly from localStorage
 * to avoid a circular import (api.js ↔ authStore.js).
 *
 * State shape:
 *  user            — Full user object from the API (null when logged out)
 *  token           — JWT string (null when logged out)
 *  isAuthenticated — Derived bool: true when token + user are present
 *  isLoading       — True while an async auth action is in flight
 *  error           — Last auth error message (null on success)
 *  theme           — 'dark' | 'light', synced from user.preferences.theme
 *
 * Audio preferences (read from user.preferences, synced on every auth action):
 *  soundEnabled    — Boolean master audio toggle
 *  alarmVolume     — 0–100 master alarm volume
 *  workAlarmTone   — Preset key or 'custom:<blobUrl>' for work completion
 *  breakAlarmTone  — Preset key or 'custom:<blobUrl>' for break completion
 *  ambientSound    — Active ambient track key ('rain'|'cafe'|'white_noise'|'lofi'|'waves')
 *  ambientVolume   — 0–100 independent ambient player volume
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      theme: 'dark',

      // ── Internal helper ───────────────────────────────────────────────────────
      _setAuth: (user, token) => {
        const prefs = user?.preferences || {};
        const theme = prefs.theme ?? 'dark';
        // Apply theme class to <html> element immediately on auth state change
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ user, token, isAuthenticated: true, error: null, theme });
      },

      _clearAuth: () => {
        document.documentElement.classList.remove('dark');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          theme: 'dark',
        });
      },

      // ── Actions ───────────────────────────────────────────────────────────────

      /**
       * Register a new account and log in immediately on success.
       * @param {{ username: string, email: string, password: string }} payload
       */
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await registerUser(payload);
          get()._setAuth(user, token);
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed. Please try again.';
          set({ error: message });
          throw err; // Re-throw so the UI can react
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Log in with email and password.
       * @param {{ email: string, password: string }} payload
       */
      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await loginUser(payload);
          get()._setAuth(user, token);
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed. Please try again.';
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Re-hydrate the user profile from the API using the persisted token.
       * Called on app startup to verify the stored token is still valid.
       */
      checkAuth: async () => {
        const { token } = get();
        if (!token) return; // Nothing stored — stay logged out

        set({ isLoading: true });
        try {
          const { user } = await fetchMe();
          get()._setAuth(user, token);
        } catch {
          // Token expired or revoked — clear state
          get()._clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Log out — clears all auth state and removes persisted data.
       */
      logout: () => {
        get()._clearAuth();
      },

      /**
       * Update Pomodoro / theme / sound preferences.
       * Optimistically updates theme immediately; rolls back on API error.
       * @param {object} preferences - Partial preferences object
       */
      updatePreferences: async (preferences) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await patchPreferences(preferences);
          get()._setAuth(user, get().token);
        } catch (err) {
          const message = err.response?.data?.message || 'Failed to update preferences.';
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Update user profile fields (username, etc.).
       * @param {object} profile - Partial profile object
       */
      updateProfile: async (profile) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await patchProfile(profile);
          get()._setAuth(user, get().token);
        } catch (err) {
          const message = err.response?.data?.message || 'Failed to update profile.';
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      /** Clear any stored error message. */
      clearError: () => set({ error: null }),
    }),

    {
      name: 'chronocraft-auth',          // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist token and theme — re-fetch user on app load via checkAuth()
      partialize: (state) => ({
        token: state.token,
        theme: state.theme,
      }),
    }
  )
);

// ── Listen for 401 events dispatched by the Axios response interceptor ─────────
// This decouples api.js from authStore.js, avoiding a circular import.
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore;
