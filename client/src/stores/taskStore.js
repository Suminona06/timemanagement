import { create } from 'zustand';
import {
  fetchCategories,
  createCategory  as apiCreateCategory,
  updateCategory  as apiUpdateCategory,
  deleteCategory  as apiDeleteCategory,
} from '../services/categoryService';
import {
  fetchTasks,
  createTask      as apiCreateTask,
  updateTask      as apiUpdateTask,
  updateTaskStatus as apiUpdateTaskStatus,
  deleteTask      as apiDeleteTask,
} from '../services/taskService';

/**
 * taskStore — Centralised state for tasks and categories.
 *
 * State shape:
 *  tasks         — Array of task objects (populated with categoryId details)
 *  categories    — Array of category objects
 *  activeFilter  — Current filter params applied to task list
 *  activeView    — 'list' | 'kanban'
 *  selectedTask  — Task object currently open in detail/edit modal (or null)
 *  isLoading     — True while any async action is in flight
 *  error         — Last error message string (null on success)
 */
const useTaskStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────────────────────
  tasks:        [],
  categories:   [],
  activeFilter: {
    status:       '',
    categoryId:   '',
    priority:     '',
    search:       '',
    sortBy:       'createdAt',
    order:        'desc',
  },
  activeView:   'list',   // 'list' | 'kanban'
  selectedTask: null,
  isLoading:    false,
  error:        null,

  // ── Internal helpers ───────────────────────────────────────────────────────
  _setLoading: (isLoading) => set({ isLoading }),
  _setError:   (error)     => set({ error }),
  clearError:  ()          => set({ error: null }),

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch all categories for the current user and populate store.
   */
  loadCategories: async () => {
    get()._setLoading(true);
    try {
      const { data } = await fetchCategories();
      set({ categories: data });
    } catch (err) {
      get()._setError(err.response?.data?.message || 'Failed to load categories.');
    } finally {
      get()._setLoading(false);
    }
  },

  /**
   * Create a new category and append it to the store.
   * @param {{ name: string, color?: string, description?: string }} payload
   * @returns {object} Created category
   */
  addCategory: async (payload) => {
    get()._setLoading(true);
    try {
      const { data } = await apiCreateCategory(payload);
      set((s) => ({ categories: [...s.categories, data] }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create category.';
      get()._setError(msg);
      throw err;
    } finally {
      get()._setLoading(false);
    }
  },

  /**
   * Update an existing category and sync in store.
   * @param {string} id
   * @param {object} payload
   * @returns {object} Updated category
   */
  editCategory: async (id, payload) => {
    get()._setLoading(true);
    try {
      const { data } = await apiUpdateCategory(id, payload);
      set((s) => ({
        categories: s.categories.map((c) => (c._id === id ? data : c)),
      }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update category.';
      get()._setError(msg);
      throw err;
    } finally {
      get()._setLoading(false);
    }
  },

  /**
   * Delete a category and remove it from store.
   * Also sets categoryId to null on any tasks in the store that referenced it.
   * @param {string} id
   */
  removeCategory: async (id) => {
    get()._setLoading(true);
    try {
      await apiDeleteCategory(id);
      set((s) => ({
        categories: s.categories.filter((c) => c._id !== id),
        // Mirror the server-side cascade-unlink locally
        tasks: s.tasks.map((t) =>
          t.categoryId?._id === id || t.categoryId === id
            ? { ...t, categoryId: null }
            : t
        ),
      }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete category.';
      get()._setError(msg);
      throw err;
    } finally {
      get()._setLoading(false);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TASK ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch tasks applying the current activeFilter.
   * Pass overrides to apply temporary filters without persisting them.
   * @param {object} [filterOverride] - Temporary filter params
   */
  loadTasks: async (filterOverride = {}) => {
    get()._setLoading(true);
    try {
      const params = { ...get().activeFilter, ...filterOverride };
      // Strip empty string values so they don't appear in the query string
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v != null)
      );
      const { data } = await fetchTasks(cleanParams);
      set({ tasks: data });
    } catch (err) {
      get()._setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      get()._setLoading(false);
    }
  },

  /**
   * Create a new task and prepend it to the store.
   * @param {object} payload
   * @returns {object} Created task
   */
  addTask: async (payload) => {
    get()._setLoading(true);
    try {
      const { data } = await apiCreateTask(payload);
      set((s) => ({ tasks: [data, ...s.tasks] }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task.';
      get()._setError(msg);
      throw err;
    } finally {
      get()._setLoading(false);
    }
  },

  /**
   * Update a task and sync in store.
   * @param {string} id
   * @param {object} payload
   * @returns {object} Updated task
   */
  editTask: async (id, payload) => {
    get()._setLoading(true);
    try {
      const { data } = await apiUpdateTask(id, payload);
      set((s) => ({
        tasks: s.tasks.map((t) => (t._id === id ? data : t)),
        selectedTask: s.selectedTask?._id === id ? data : s.selectedTask,
      }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task.';
      get()._setError(msg);
      throw err;
    } finally {
      get()._setLoading(false);
    }
  },

  /**
   * Optimistically update a task's status in the store, then sync with API.
   * Rolls back to previous status on failure.
   * Used by Kanban drag-and-drop for instant visual feedback.
   *
   * @param {string} id
   * @param {string} status - New status string
   */
  changeTaskStatus: async (id, status) => {
    // ── Optimistic update ──────────────────────────────────────────────────
    const previousTasks = get().tasks;
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === id ? { ...t, status } : t)),
    }));

    try {
      const { data } = await apiUpdateTaskStatus(id, status);
      // Sync with server response (may include updatedAt etc.)
      set((s) => ({
        tasks: s.tasks.map((t) => (t._id === id ? data : t)),
      }));
    } catch (err) {
      // ── Rollback on failure ────────────────────────────────────────────
      set({ tasks: previousTasks });
      const msg = err.response?.data?.message || 'Failed to update task status.';
      get()._setError(msg);
      throw err;
    }
  },

  /**
   * Delete a task and remove it from the store.
   * @param {string} id
   */
  removeTask: async (id) => {
    get()._setLoading(true);
    try {
      await apiDeleteTask(id);
      set((s) => ({
        tasks: s.tasks.filter((t) => t._id !== id),
        selectedTask: s.selectedTask?._id === id ? null : s.selectedTask,
      }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task.';
      get()._setError(msg);
      throw err;
    } finally {
      get()._setLoading(false);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UI STATE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /** Update active filters and reload tasks with new params. */
  setFilter: (updates) => {
    set((s) => ({ activeFilter: { ...s.activeFilter, ...updates } }));
    get().loadTasks();
  },

  /** Reset all filters to defaults and reload. */
  resetFilters: () => {
    set({
      activeFilter: {
        status: '', categoryId: '', priority: '',
        search: '', sortBy: 'createdAt', order: 'desc',
      },
    });
    get().loadTasks();
  },

  /** Switch between list and kanban views. */
  setActiveView: (view) => set({ activeView: view }),

  /** Open a task in the detail/edit modal. */
  selectTask: (task) => set({ selectedTask: task }),

  /** Close the task detail/edit modal. */
  clearSelectedTask: () => set({ selectedTask: null }),

  /**
   * Initialise the store — loads both categories and tasks in parallel.
   * Call this on protected route mount.
   */
  init: async () => {
    get()._setLoading(true);
    try {
      await Promise.all([get().loadCategories(), get().loadTasks()]);
    } finally {
      get()._setLoading(false);
    }
  },
}));

export default useTaskStore;
