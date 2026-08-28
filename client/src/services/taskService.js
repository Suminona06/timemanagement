import api from './api';

/**
 * Task service — axios wrappers for /api/tasks endpoints.
 */

/**
 * Fetch tasks with optional filters.
 * @param {object} params - Query parameters
 * @param {string} [params.status]       - 'To Do' | 'In Progress' | 'Completed' | 'Archived'
 * @param {string} [params.categoryId]   - MongoDB ObjectId
 * @param {string} [params.priority]     - 'Low' | 'Medium' | 'High' | 'Urgent'
 * @param {string} [params.search]       - Full-text search on title
 * @param {string} [params.dueDateStart] - ISO date string
 * @param {string} [params.dueDateEnd]   - ISO date string
 * @param {string} [params.sortBy]       - 'dueDate' | 'priority' | 'createdAt'
 * @param {string} [params.order]        - 'asc' | 'desc'
 */
export const fetchTasks = (params = {}) =>
  api.get('/tasks', { params }).then((r) => r.data);

/** Fetch a single task by ID. */
export const fetchTaskById = (id) =>
  api.get(`/tasks/${id}`).then((r) => r.data);

/**
 * Create a new task.
 * @param {{ title, description?, categoryId?, priority?, status?,
 *           estimatedMinutes?, dueDate?, tags? }} payload
 */
export const createTask = (payload) =>
  api.post('/tasks', payload).then((r) => r.data);

/**
 * Update an existing task (partial update).
 * @param {string} id
 * @param {object} payload - Any subset of task fields
 */
export const updateTask = (id, payload) =>
  api.put(`/tasks/${id}`, payload).then((r) => r.data);

/**
 * Quick-update just the status field (used by Kanban drag-and-drop).
 * @param {string} id
 * @param {string} status - 'To Do' | 'In Progress' | 'Completed' | 'Archived'
 */
export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data);

/** Permanently delete a task by ID. */
export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then((r) => r.data);
