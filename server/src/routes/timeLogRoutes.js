const express = require('express');
const {
  getTimeLogs,
  getTimeLogById,
  createTimeLog,
  updateTimeLog,
  deleteTimeLog,
} = require('../controllers/timeLogController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All time log routes require authentication
router.use(protect);

router.route('/')
  .get(getTimeLogs)
  .post(createTimeLog);

router.route('/:id')
  .get(getTimeLogById)
  .put(updateTimeLog)
  .delete(deleteTimeLog);

module.exports = router;
