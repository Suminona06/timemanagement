const express = require('express');
const {
  register,
  login,
  getMe,
  updatePreferences,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Public Routes (no token required) ────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// ─── Protected Routes (valid Bearer token required) ───────────────────────────
router.get('/me',              protect, getMe);
router.put('/preferences',     protect, updatePreferences);
router.put('/profile',         protect, updateProfile);

module.exports = router;
