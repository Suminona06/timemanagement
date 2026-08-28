const mongoose = require('mongoose');

/**
 * Task schema — full implementation in Phase 3 Task 3.2.
 *
 * This stub exists so that categoryController.js can safely import Task
 * for cascade-unlink on category deletion (Task 3.1 requirement),
 * without crashing before the full Task model is built.
 *
 * The complete schema with priority, status, estimatedMinutes, dueDate,
 * tags, and compound indexes will be added in Task 3.2.
 */
const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Completed', 'Archived'],
      default: 'To Do',
    },
    estimatedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, categoryId: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
