const Category = require('../models/Category');
const Task = require('../models/Task');

// ─── GET /api/categories ───────────────────────────────────────────────────────
/**
 * Returns all categories belonging to the authenticated user,
 * sorted alphabetically by name.
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ userId: req.user._id })
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/categories/:id ───────────────────────────────────────────────────
/**
 * Returns a single category by ID — must belong to the authenticated user.
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/categories ──────────────────────────────────────────────────────
/**
 * Creates a new category for the authenticated user.
 * Body: { name, color?, description? }
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, color, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const category = await Category.create({
      userId: req.user._id,
      name: name.trim(),
      color: color || '#3B82F6',
      description: description?.trim() || '',
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    // Duplicate key error — compound index { userId, name } violated
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `A category named "${req.body.name}" already exists.`,
      });
    }
    next(error);
  }
};

// ─── PUT /api/categories/:id ───────────────────────────────────────────────────
/**
 * Updates an existing category (name, color, or description).
 * Body: { name?, color?, description? }
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, color, description } = req.body;

    const updates = {};
    if (name !== undefined)        updates.name        = name.trim();
    if (color !== undefined)       updates.color       = color;
    if (description !== undefined) updates.description = description.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `A category named "${req.body.name}" already exists.`,
      });
    }
    next(error);
  }
};

// ─── DELETE /api/categories/:id ────────────────────────────────────────────────
/**
 * Deletes a category. Cascade-unlinks all tasks that referenced this category
 * by setting their categoryId to null (tasks are NOT deleted).
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // ── Cascade: unlink tasks referencing this category ──────────────────────
    const { modifiedCount } = await Task.updateMany(
      { categoryId: category._id, userId: req.user._id },
      { $set: { categoryId: null } }
    );

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
      data: {
        deletedId: req.params.id,
        tasksUnlinked: modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
