/**
 * Centralized Express error handling middleware.
 *
 * Intercepts all errors passed via next(err) and returns a consistent
 * JSON error response. Handles the following specific Mongoose / app errors:
 *  - CastError         → 400 Bad Request  (invalid ObjectId format)
 *  - ValidationError   → 400 Bad Request  (Mongoose schema validation failure)
 *  - Duplicate Key     → 400 Bad Request  (MongoDB code 11000, e.g. duplicate email)
 *  - JsonWebTokenError → 401 Unauthorized (invalid JWT signature)
 *  - TokenExpiredError → 401 Unauthorized (expired JWT)
 *  - Everything else   → 500 Internal Server Error
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose CastError (invalid ObjectId) ──────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── Mongoose ValidationError ───────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // ── MongoDB Duplicate Key Error (code 11000) ───────────────────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}. Please use a different value.`;
  }

  // ── JWT Errors ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // ── Development: include stack trace for debugging ─────────────────────────
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
