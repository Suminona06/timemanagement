const express = require('express');
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

router.get('/summary', getAnalyticsSummary);

module.exports = router;
