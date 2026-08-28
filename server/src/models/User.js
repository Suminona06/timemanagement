const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Preferences Sub-schema ────────────────────────────────────────────────────
// Embedded in User to avoid an extra collection lookup on every auth
const preferencesSchema = new mongoose.Schema(
  {
    dailyGoalHours: {
      type: Number,
      default: 8,
      min: [1, 'Daily goal must be at least 1 hour'],
      max: [16, 'Daily goal cannot exceed 16 hours'],
    },
    pomodoroWorkMinutes: {
      type: Number,
      default: 25,
      min: [1, 'Work duration must be at least 1 minute'],
      max: [120, 'Work duration cannot exceed 120 minutes'],
    },
    pomodoroShortBreakMinutes: {
      type: Number,
      default: 5,
      min: [1, 'Short break must be at least 1 minute'],
      max: [30, 'Short break cannot exceed 30 minutes'],
    },
    pomodoroLongBreakMinutes: {
      type: Number,
      default: 15,
      min: [1, 'Long break must be at least 1 minute'],
      max: [60, 'Long break cannot exceed 60 minutes'],
    },
    longBreakInterval: {
      type: Number,
      default: 4,
      min: [2, 'Long break interval must be at least 2 cycles'],
      max: [10, 'Long break interval cannot exceed 10 cycles'],
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false } // No separate _id for embedded sub-document
);

// ─── User Schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },

    // Stored as a bcrypt hash — never store plain text passwords
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never returned in queries unless explicitly requested
    },

    preferences: {
      type: preferencesSchema,
      default: () => ({}), // Populate all defaults from preferencesSchema
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);


// ─── Pre-save Hook: Hash password before saving ────────────────────────────────
/**
 * Only re-hashes when `passwordHash` field is modified.
 * This prevents double-hashing on unrelated document updates (e.g. preference changes).
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Instance Method: Compare candidate password against stored hash ───────────
/**
 * @param {string} candidatePassword - Plain-text password from login request
 * @returns {Promise<boolean>} true if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ─── Instance Method: Return safe user object (no passwordHash) ────────────────
/**
 * Strips sensitive fields before sending user data to the client.
 */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
