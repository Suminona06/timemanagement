const jwt = require('jsonwebtoken');

/**
 * JWT utility functions for generating and verifying authentication tokens.
 *
 * All tokens are signed with JWT_SECRET and expire after JWT_EXPIRES_IN
 * (both read from environment variables, set in server/.env).
 *
 * Token payload only contains `id` (userId) to keep tokens compact.
 * Additional user data is fetched from the DB via authMiddleware on each request.
 */

// ─── Generate Token ────────────────────────────────────────────────────────────
/**
 * Signs a new JWT containing the user's MongoDB ObjectId.
 *
 * @param {string | ObjectId} userId - The user's MongoDB _id
 * @returns {string} Signed JWT string
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    { id: userId.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'chronocraft-api',
      audience: 'chronocraft-client',
    }
  );
};

// ─── Verify Token ──────────────────────────────────────────────────────────────
/**
 * Verifies a JWT and returns the decoded payload.
 * Throws a JsonWebTokenError or TokenExpiredError if invalid/expired —
 * these are caught and formatted by the centralized errorHandler middleware.
 *
 * @param {string} token - JWT string from the Authorization header
 * @returns {{ id: string, iat: number, exp: number }} Decoded token payload
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'chronocraft-api',
    audience: 'chronocraft-client',
  });
};

// ─── Decode Token (without verification) ──────────────────────────────────────
/**
 * Decodes a token payload without verifying the signature.
 * ONLY use for non-security-critical inspection (e.g. logging, debugging).
 * Never use this to authenticate a user.
 *
 * @param {string} token - JWT string
 * @returns {object | null} Decoded payload or null if malformed
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = { generateToken, verifyToken, decodeToken };
