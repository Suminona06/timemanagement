/**
 * timeFormatters.js — Precision time and duration formatting utilities.
 */

/**
 * Format raw seconds to MM:SS or HH:MM:SS string.
 * @param {number} totalSeconds
 * @param {boolean} forceHours - If true, always include HH: (e.g. 00:05:20)
 * @returns {string}
 */
export function formatSeconds(totalSeconds = 0, forceHours = false) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (hours > 0 || forceHours) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format minutes into a human-readable string (e.g. "1h 45m" or "25m").
 * @param {number} minutes
 * @returns {string}
 */
export function formatMinutes(minutes = 0) {
  const m = Math.max(0, Math.round(minutes));
  if (m === 0) return '0m';

  const hours = Math.floor(m / 60);
  const remMinutes = m % 60;

  if (hours > 0 && remMinutes > 0) {
    return `${hours}h ${remMinutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remMinutes}m`;
}

/**
 * Format total hours to fixed decimal string (e.g. 2.5h).
 * @param {number} minutes
 * @returns {string}
 */
export function formatHours(minutes = 0) {
  const hrs = (minutes / 60).toFixed(1);
  return `${hrs.endsWith('.0') ? hrs.slice(0, -2) : hrs} hrs`;
}

/**
 * Format an ISO date or Date object to a readable time format (e.g. "09:30 AM").
 * @param {string | Date} date
 * @returns {string}
 */
export function formatTimeOfDay(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format an ISO date or Date object to readable date & time (e.g. "Aug 28, 09:30 AM").
 * @param {string | Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
