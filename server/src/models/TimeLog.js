const mongoose = require('mongoose');

/**
 * TimeLog Schema — Immutable record of time spent on a task or category.
 *
 * Supports stopwatch, Pomodoro sessions, and manual back-filled time entries.
 * Auto-updates Task.actualMinutes when created/deleted/updated.
 */
const timeLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'TimeLog must belong to a user'],
      index: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },

    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },

    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (value) {
          return !this.startTime || value >= this.startTime;
        },
        message: 'End time must be greater than or equal to start time',
      },
    },

    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [0, 'Duration cannot be negative'],
    },

    logType: {
      type: String,
      enum: {
        values: ['stopwatch', 'pomodoro', 'manual'],
        message: 'logType must be stopwatch, pomodoro, or manual',
      },
      default: 'stopwatch',
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// Optimize date range lookups (Calendar & Analytics views)
timeLogSchema.index({ userId: 1, startTime: 1, endTime: 1 });
timeLogSchema.index({ userId: 1, taskId: 1 });
timeLogSchema.index({ userId: 1, categoryId: 1 });

const TimeLog = mongoose.model('TimeLog', timeLogSchema);

module.exports = TimeLog;
