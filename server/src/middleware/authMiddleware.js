const User = require('../models/User');
const { verifyToken } = require('../utils/tokenUtils');

/**
 * Authentication middleware — protects private routes.
 *
 * Expects an Authorization header in the format:
 *   Authorization: Bearer <jwt_token>
 *
 * On success: attaches the authenticated `User` document to `req.user` (without passwordHash).
 * On failure: returns 401 Unauthorized — caught by the centralized errorHandler.
 */
const protect = async (req, res, next) => {
  try {
    // ── 1. Extract token from Authorization header ───────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // ── 2. Verify token signature and expiry ─────────────────────────────────
    // verifyToken throws JsonWebTokenError / TokenExpiredError on failure,
    // which bubble up to errorHandler middleware.
    const decoded = verifyToken(token);

    // ── 3. Fetch user from DB (excludes passwordHash via select) ─────────────
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but the associated user no longer exists.',
      });
    }

    // ── 4. Attach user to request object ─────────────────────────────────────
    req.user = user;
    next();
  } catch (error) {
    // Pass JWT errors (JsonWebTokenError, TokenExpiredError) to errorHandler
    next(error);
  }
};

module.exports = { protect };
