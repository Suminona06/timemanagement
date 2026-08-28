const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// ── Collection routes ─────────────────────────────────────────────────────────
router.route('/')
  .get(getTasks)
  .post(createTask);

// ── Single-resource routes ────────────────────────────────────────────────────
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// ── Status-only quick update (Kanban drag-and-drop) ───────────────────────────
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
