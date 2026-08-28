import api from './api';

/**
 * analyticsService — Axios API client wrappers for /api/analytics endpoints.
 */

/**
 * Fetch comprehensive productivity analytics summary.
 * @param {string} period - 'today' | 'week' | 'month' | 'all' (default: 'week')
 * @returns {Promise<object>} Analytics data payload
 */
export const fetchAnalyticsSummary = (period = 'week') =>
  api.get('/analytics/summary', { params: { period } }).then((res) => res.data);
