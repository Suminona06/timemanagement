const mongoose = require('mongoose');

/**
 * Category schema — user-isolated task categories with customizable color.
 *
 * Each user has their own isolated set of categories.
 * The compound unique index { userId, name } ensures names are unique per-user
 * but allows different users to have categories with the same name.
 */
const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Category must belong to a user'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [1, 'Category name cannot be empty'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },

    // Hex color string for UI rendering — validated via regex
    color: {
      type: String,
      default: '#3B82F6',
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Color must be a valid hex color (e.g. #3B82F6)',
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// Compound unique: one user cannot have two categories with the same name
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
