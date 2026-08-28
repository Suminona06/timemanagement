const Task = require('../models/Task');

// ─── GET /api/tasks ────────────────────────────────────────────────────────────
/**
 * Returns all tasks for the authenticated user with optional filtering & sorting.
 *
 * Query params:
 *  status       — 'To Do' | 'In Progress' | 'Completed' | 'Archived'
 *  categoryId   — MongoDB ObjectId string
 *  priority     — 'Low' | 'Medium' | 'High' | 'Urgent'
 *  search       — Full-text search on title (case-insensitive regex)
 *  dueDateStart — ISO date string — filter tasks with dueDate >= this date
 *  dueDateEnd   — ISO date string — filter tasks with dueDate <= this date
 *  sortBy       — 'dueDate' | 'priority' | 'createdAt' (default: 'createdAt')
 *  order        — 'asc' | 'desc' (default: 'desc')
 */
const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      categoryId,
      priority,
      search,
      dueDateStart,
      dueDateEnd,
      sortBy = 'createdAt',
      order  = 'desc',
    } = req.query;

    // ── Build filter object ──────────────────────────────────────────────────
    const filter = { userId: req.user._id };

    if (status)     filter.status     = status;
    if (categoryId) filter.categoryId = categoryId;
    if (priority)   filter.priority   = priority;

    // Full-text search on title
    if (search && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    // Due date range filter
    if (dueDateStart || dueDateEnd) {
      filter.dueDate = {};
      if (dueDateStart) filter.dueDate.$gte = new Date(dueDateStart);
      if (dueDateEnd) {
        const end = new Date(dueDateEnd);
        if (dueDateEnd.length === 10) {
          end.setHours(23, 59, 59, 999);
        }
        filter.dueDate.$lte = end;
      }
    }

    // ── Build sort object ────────────────────────────────────────────────────
    const PRIORITY_ORDER = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
    const sortDirection  = order === 'asc' ? 1 : -1;

    const allowedSortFields = ['dueDate', 'priority', 'createdAt', 'title', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const sort = { [sortField]: sortDirection };

    // ── Execute query ────────────────────────────────────────────────────────
    const tasks = await Task.find(filter)
      .sort(sort)
      .populate('categoryId', 'name color')   // Include category name & color
      .lean();

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/tasks/:id ────────────────────────────────────────────────────────
/**
 * Returns a single task by ID — must belong to the authenticated user.
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('categoryId', 'name color');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/tasks ───────────────────────────────────────────────────────────
/**
 * Creates a new task for the authenticated user.
 *
 * Body: { title, description?, categoryId?, priority?, status?,
 *         estimatedMinutes?, dueDate?, tags? }
 */
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      priority,
      status,
      estimatedMinutes,
      dueDate,
      tags,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    const task = await Task.create({
      userId:           req.user._id,
      title:            title.trim(),
      description:      description?.trim() || '',
      categoryId:       categoryId || null,
      priority:         priority   || 'Medium',
      status:           status     || 'To Do',
      estimatedMinutes: estimatedMinutes || 0,
      dueDate:          dueDate    || null,
      tags:             Array.isArray(tags) ? tags : [],
    });

    // Populate category for the response
    await task.populate('categoryId', 'name color');

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/tasks/:id ────────────────────────────────────────────────────────
/**
 * Updates an existing task.
 * Accepts any subset of task fields — only provided fields are changed.
 *
 * Body: { title?, description?, categoryId?, priority?, status?,
 *         estimatedMinutes?, dueDate?, tags? }
 */
const updateTask = async (req, res, next) => {
  try {
    const ALLOWED_FIELDS = [
      'title', 'description', 'categoryId', 'priority',
      'status', 'estimatedMinutes', 'dueDate', 'tags',
    ];

    const updates = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Trim string fields if present
    if (updates.title)       updates.title       = updates.title.trim();
    if (updates.description) updates.description = updates.description.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
/**
 * Permanently deletes a task.
 * Associated TimeLogs are NOT deleted — they remain as historical records.
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: { deletedId: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/tasks/:id/status ──────────────────────────────────────────────
/**
 * Quick-update endpoint for status-only changes (e.g. Kanban drag-and-drop).
 * Body: { status }
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const VALID_STATUSES = ['To Do', 'In Progress', 'Completed', 'Archived'];
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}.`,
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
