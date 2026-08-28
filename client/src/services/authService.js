import api from './api';

/**
 * Auth service — thin wrappers around the ChronoCraft auth API endpoints.
 * All functions return the full Axios response so the caller can access
 * both `data` and status codes if needed.
 *
 * Error handling is left to the caller (authStore actions).
 */

/**
 * Register a new user account.
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
export const registerUser = (payload) =>
  api.post('/auth/register', payload).then((res) => res.data);

/**
 * Log in with email and password.
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
export const loginUser = (payload) =>
  api.post('/auth/login', payload).then((res) => res.data);

/**
 * Fetch the currently authenticated user's profile.
 * Requires a valid Bearer token (attached by Axios request interceptor).
 * @returns {Promise<{ user: object }>}
 */
export const fetchMe = () =>
  api.get('/auth/me').then((res) => res.data);

/**
 * Update the authenticated user's Pomodoro / theme preferences.
 * @param {object} preferences - Partial preferences object
 * @returns {Promise<{ user: object }>}
 */
export const patchPreferences = (preferences) =>
  api.put('/auth/preferences', preferences).then((res) => res.data);

/**
 * Update the authenticated user's basic profile (e.g. username).
 * @param {object} profile - Partial profile object
 * @returns {Promise<{ user: object }>}
 */
export const patchProfile = (profile) =>
  api.put('/auth/profile', profile).then((res) => res.data);
