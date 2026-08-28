const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');

// ─── GET /api/timelogs ─────────────────────────────────────────────────────────
/**
 * Returns time logs for the authenticated user with optional filtering by date range,
 * task, category, or logType.
 *
 * Query params:
 *  startDate   — ISO date string (logs with startTime >= startDate)
 *  endDate     — ISO date string (logs with startTime <= endDate or endTime <= endDate)
 *  taskId      — MongoDB ObjectId
 *  categoryId  — MongoDB ObjectId
 *  logType     — 'stopwatch' | 'pomodoro' | 'manual'
 *  limit       — Number of records (default: 100)
 *  page        — Page number (default: 1)
 */
const getTimeLogs = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      taskId,
      categoryId,
      logType,
      limit = 100,
      page = 1,
    } = req.query;

    const filter = { userId: req.user._id };

    if (taskId)     filter.taskId     = taskId;
    if (categoryId) filter.categoryId = categoryId;
    if (logType)    filter.logType    = logType;

    // Date range filter
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) {
        // If date-only string provided (e.g. YYYY-MM-DD), set to end of day
        const end = new Date(endDate);
        if (endDate.length === 10) {
          end.setHours(23, 59, 59, 999);
        }
        filter.startTime.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (pageNum - 1) * limitNum;

    const [logs, totalCount] = await Promise.all([
      TimeLog.find(filter)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('taskId', 'title priority status estimatedMinutes actualMinutes')
        .populate('categoryId', 'name color')
        .lean(),
      TimeLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/timelogs/:id ─────────────────────────────────────────────────────
/**
 * Returns a single time log by ID.
 */
const getTimeLogById = async (req, res, next) => {
  try {
    const log = await TimeLog.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate('taskId', 'title priority status estimatedMinutes actualMinutes')
      .populate('categoryId', 'name color');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Time log not found.',
      });
    }

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/timelogs ────────────────────────────────────────────────────────
/**
 * Creates a new time log and automatically increments the associated task's actualMinutes.
 *
 * Body: { taskId?, categoryId?, startTime, endTime, durationMinutes?, logType?, notes? }
 */
const createTimeLog = async (req, res, next) => {
  try {
    const {
      taskId,
      categoryId: reqCategoryId,
      startTime,
      endTime,
      durationMinutes: reqDuration,
      logType = 'stopwatch',
      notes = '',
    } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Both startTime and endTime are required.',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for startTime or endTime.',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'endTime must be greater than or equal to startTime.',
      });
    }

    // Calculate duration in minutes (fallback if not explicitly sent)
    let durationMinutes = reqDuration !== undefined && reqDuration !== null
      ? Math.max(0, Number(reqDuration))
      : Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

    let categoryId = reqCategoryId || null;
    let linkedTask = null;

    // If task is provided, verify it belongs to the user and inherit category if missing
    if (taskId) {
      linkedTask = await Task.findOne({ _id: taskId, userId: req.user._id });
      if (linkedTask && !categoryId && linkedTask.categoryId) {
        categoryId = linkedTask.categoryId;
      }
    }

    // Create the time log
    const timeLog = await TimeLog.create({
      userId: req.user._id,
      taskId: taskId || null,
      categoryId: categoryId || null,
      startTime: start,
      endTime: end,
      durationMinutes,
      logType,
      notes: notes.trim(),
    });

    // Auto-increment actualMinutes on linked task
    if (taskId && linkedTask && durationMinutes > 0) {
      await Task.findByIdAndUpdate(taskId, {
        $inc: { actualMinutes: durationMinutes },
      });
    }

    await timeLog.populate('taskId', 'title priority status estimatedMinutes actualMinutes');
    await timeLog.populate('categoryId', 'name color');

    res.status(201).json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/timelogs/:id ─────────────────────────────────────────────────────
/**
 * Updates an existing time log and synchronizes duration difference with linked task.
 */
const updateTimeLog = async (req, res, next) => {
  try {
    const {
      taskId: newTaskId,
      categoryId,
      startTime,
      endTime,
      durationMinutes: newDurationInput,
      logType,
      notes,
    } = req.body;

    const existingLog = await TimeLog.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!existingLog) {
      return res.status(404).json({
        success: false,
        message: 'Time log not found.',
      });
    }

    const updates = {};
    if (categoryId !== undefined) updates.categoryId = categoryId || null;
    if (logType !== undefined)    updates.logType    = logType;
    if (notes !== undefined)      updates.notes      = notes.trim();

    let start = existingLog.startTime;
    let end   = existingLog.endTime;

    if (startTime) {
      start = new Date(startTime);
      updates.startTime = start;
    }
    if (endTime) {
      end = new Date(endTime);
      updates.endTime = end;
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'endTime must be greater than or equal to startTime.',
      });
    }

    let finalDuration = existingLog.durationMinutes;
    if (newDurationInput !== undefined) {
      finalDuration = Math.max(0, Number(newDurationInput));
      updates.durationMinutes = finalDuration;
    } else if (startTime || endTime) {
      finalDuration = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
      updates.durationMinutes = finalDuration;
    }

    const oldTaskId = existingLog.taskId?.toString() || null;
    const targetTaskId = newTaskId !== undefined ? (newTaskId ? newTaskId.toString() : null) : oldTaskId;

    if (newTaskId !== undefined) {
      updates.taskId = newTaskId || null;
    }

    const updatedLog = await TimeLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('taskId', 'title priority status estimatedMinutes actualMinutes')
      .populate('categoryId', 'name color');

    // Synchronize Task.actualMinutes
    const oldDuration = existingLog.durationMinutes || 0;

    if (oldTaskId && targetTaskId && oldTaskId === targetTaskId) {
      // Same task: adjust delta
      const delta = finalDuration - oldDuration;
      if (delta !== 0) {
        await Task.findByIdAndUpdate(oldTaskId, { $inc: { actualMinutes: delta } });
      }
    } else {
      // Task changed or unlinked/linked
      if (oldTaskId && oldDuration > 0) {
        await Task.findByIdAndUpdate(oldTaskId, { $inc: { actualMinutes: -oldDuration } });
      }
      if (targetTaskId && finalDuration > 0) {
        await Task.findByIdAndUpdate(targetTaskId, { $inc: { actualMinutes: finalDuration } });
      }
    }

    res.status(200).json({
      success: true,
      data: updatedLog,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/timelogs/:id ──────────────────────────────────────────────────
/**
 * Deletes a time log and deducts its duration from the associated task's actualMinutes.
 */
const deleteTimeLog = async (req, res, next) => {
  try {
    const log = await TimeLog.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Time log not found.',
      });
    }

    // Deduct duration from task if linked
    if (log.taskId && log.durationMinutes > 0) {
      await Task.findByIdAndUpdate(log.taskId, {
        $inc: { actualMinutes: -log.durationMinutes },
      });
    }

    await log.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Time log deleted successfully.',
      data: { deletedId: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimeLogs,
  getTimeLogById,
  createTimeLog,
  updateTimeLog,
  deleteTimeLog,
};
