const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

// ─── Helper: send token response ──────────────────────────────────────────────
/**
 * Standardizes the token + user payload sent back to the client.
 * @param {object} user - Mongoose User document
 * @param {number} statusCode - HTTP status to send
 * @param {object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
/**
 * Registers a new user account.
 *
 * Body: { username, email, password }
 * Response: { success, token, user }
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // ── Check for existing email ─────────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // ── Create user (pre-save hook will hash the password) ───────────────────
    const user = await User.create({
      username,
      email,
      passwordHash: password, // Raw password — bcrypt pre-save hook hashes it
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
/**
 * Authenticates an existing user and issues a JWT.
 *
 * Body: { email, password }
 * Response: { success, token, user }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // ── Find user — must explicitly select passwordHash (select: false) ──────
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    // ── Generic error: don't reveal whether email or password was wrong ──────
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Compare candidate password against stored bcrypt hash ────────────────
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
/**
 * Returns the currently authenticated user's profile.
 * Requires: Bearer token via protect middleware.
 *
 * Response: { success, user }
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by protect middleware (already excludes passwordHash)
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/auth/preferences ────────────────────────────────────────────────
/**
 * Updates the authenticated user's preference settings.
 * Requires: Bearer token via protect middleware.
 *
 * Body: { dailyGoalHours?, pomodoroWorkMinutes?, pomodoroShortBreakMinutes?,
 *         pomodoroLongBreakMinutes?, longBreakInterval?, theme?, soundEnabled?,
 *         alarmVolume?, workAlarmTone?, breakAlarmTone?, ambientSound?, ambientVolume? }
 * Response: { success, user }
 */
const updatePreferences = async (req, res, next) => {
  try {
    const allowedFields = [
      // Timer settings
      'dailyGoalHours',
      'pomodoroWorkMinutes',
      'pomodoroShortBreakMinutes',
      'pomodoroLongBreakMinutes',
      'longBreakInterval',
      // UI settings
      'theme',
      // Audio — Phase 10
      'soundEnabled',
      'alarmVolume',
      'workAlarmTone',
      'breakAlarmTone',
      'ambientSound',
      'ambientVolume',
      'ambientSourceType',
      'customAmbientUrl',
      'savedMediaLinks',
    ];

    // Build a safe update object — only allow whitelisted preference fields
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[`preferences.${field}`] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid preference fields provided.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,           // Return the updated document
        runValidators: true, // Run Mongoose validators on update
      }
    ).select('-passwordHash');

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
/**
 * Updates the authenticated user's basic profile (username only for now).
 * Requires: Bearer token via protect middleware.
 *
 * Body: { username? }
 * Response: { success, user }
 */
const updateProfile = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'No profile fields provided.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { username } },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updatePreferences, updateProfile };
