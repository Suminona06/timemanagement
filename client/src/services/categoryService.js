import api from './api';

/**
 * Category service — axios wrappers for /api/categories endpoints.
 */

/** Fetch all categories for the current user. */
export const fetchCategories = () =>
  api.get('/categories').then((r) => r.data);

/** Fetch a single category by ID. */
export const fetchCategoryById = (id) =>
  api.get(`/categories/${id}`).then((r) => r.data);

/**
 * Create a new category.
 * @param {{ name: string, color?: string, description?: string }} payload
 */
export const createCategory = (payload) =>
  api.post('/categories', payload).then((r) => r.data);

/**
 * Update an existing category.
 * @param {string} id
 * @param {{ name?: string, color?: string, description?: string }} payload
 */
export const updateCategory = (id, payload) =>
  api.put(`/categories/${id}`, payload).then((r) => r.data);

/**
 * Delete a category (cascade-unlinks its tasks on the server).
 * @param {string} id
 */
export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then((r) => r.data);
