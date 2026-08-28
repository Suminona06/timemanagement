import api from './api';

/**
 * timeLogService — Axios API wrappers for /api/timelogs endpoints.
 */

/**
 * Fetch time logs with optional query filters.
 * @param {object} params - { startDate, endDate, taskId, categoryId, logType, limit, page }
 */
export const fetchTimeLogs = (params = {}) =>
  api.get('/timelogs', { params }).then((res) => res.data);

/**
 * Fetch a single time log by ID.
 * @param {string} id
 */
export const fetchTimeLogById = (id) =>
  api.get(`/timelogs/${id}`).then((res) => res.data);

/**
 * Create a new time log.
 * @param {{ taskId?: string, categoryId?: string, startTime: string|Date, endTime: string|Date, durationMinutes?: number, logType?: string, notes?: string }} payload
 */
export const createTimeLog = (payload) =>
  api.post('/timelogs', payload).then((res) => res.data);

/**
 * Update an existing time log.
 * @param {string} id
 * @param {object} payload
 */
export const updateTimeLog = (id, payload) =>
  api.put(`/timelogs/${id}`, payload).then((res) => res.data);

/**
 * Delete a time log by ID.
 * @param {string} id
 */
export const deleteTimeLog = (id) =>
  api.delete(`/timelogs/${id}`).then((res) => res.data);
