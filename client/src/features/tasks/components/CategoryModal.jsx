import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Loader2, Tag } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import ColorPicker from '../../../components/common/ColorPicker';
import Badge from '../../../components/common/Badge';
import useTaskStore from '../../../stores/taskStore';

/**
 * CategoryModal — Manage all categories from a single dialog.
 * Harmonized for light and dark theme.
 *
 * Props:
 *  isOpen  — Boolean controlling visibility
 *  onClose — Callback to close the modal
 */
export default function CategoryModal({ isOpen, onClose }) {
  const {
    categories,
    isLoading,
    addCategory,
    editCategory,
    removeCategory,
    error,
    clearError,
  } = useTaskStore();

  // ── Create form state ───────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    name: '', color: '#C88A58', description: '',
  });
  const [createErrors, setCreateErrors] = useState({});
  const [isCreating,   setIsCreating]   = useState(false);

  // ── Edit state: which category is being edited ──────────────────────────
  const [editingId,   setEditingId]   = useState(null);
  const [editForm,    setEditForm]    = useState({});
  const [editErrors,  setEditErrors]  = useState({});
  const [isSaving,    setIsSaving]    = useState(false);

  // ── Delete confirmation state ───────────────────────────────────────────
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset local state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCreateForm({ name: '', color: '#C88A58', description: '' });
      setCreateErrors({});
      setEditingId(null);
      setEditForm({});
      setEditErrors({});
      setDeletingId(null);
      clearError();
    }
  }, [isOpen, clearError]);

  // ── Create handlers ────────────────────────────────────────────────────
  const validateCreate = () => {
    const errs = {};
    if (!createForm.name.trim()) errs.name = 'Name is required.';
    else if (createForm.name.length > 50) errs.name = 'Max 50 characters.';
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreate()) return;
    setIsCreating(true);
    try {
      await addCategory({
        name:        createForm.name.trim(),
        color:       createForm.color,
        description: createForm.description.trim(),
      });
      setCreateForm({ name: '', color: '#C88A58', description: '' });
      setCreateErrors({});
    } catch {
      // Error shown via store.error
    } finally {
      setIsCreating(false);
    }
  };

  // ── Edit handlers ──────────────────────────────────────────────────────
  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditForm({ name: cat.name, color: cat.color, description: cat.description || '' });
    setEditErrors({});
    setDeletingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditErrors({});
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.name?.trim()) errs.name = 'Name is required.';
    else if (editForm.name.length > 50) errs.name = 'Max 50 characters.';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdit = async (id) => {
    if (!validateEdit()) return;
    setIsSaving(true);
    try {
      await editCategory(id, {
        name:        editForm.name.trim(),
        color:       editForm.color,
        description: editForm.description?.trim() || '',
      });
      cancelEdit();
    } catch {
      // Error shown via store.error
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete handlers ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await removeCategory(id);
      setDeletingId(null);
    } catch {
      // Error shown via store.error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" size="md">
      <div className="space-y-5">

        {/* ── Store error banner ───────────────────────────────────────── */}
        {error && (
          <div className="flex gap-2 p-3.5 rounded-2xl bg-danger-500/10
                          border border-danger-500/30 text-danger-600 dark:text-danger-400 text-sm shadow-warm-sm">
            <span>⚠</span> <span>{error}</span>
          </div>
        )}

        {/* ── Existing categories list ─────────────────────────────────── */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {categories.length === 0 && !isLoading && (
            <div className="flex flex-col items-center gap-2 py-6 text-surface-400">
              <Tag size={28} className="opacity-40" />
              <p className="text-sm font-medium">No categories yet. Create one below.</p>
            </div>
          )}

          {categories.map((cat) => (
            <div key={cat._id} className="rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-surface-100/70 dark:bg-surface-850 overflow-hidden shadow-warm-sm">

              {/* ── View row ────────────────────────────────────────────── */}
              {editingId !== cat._id && deletingId !== cat._id && (
                <div className="flex items-center gap-3 px-3.5 py-2.5">
                  {/* Color swatch */}
                  <span
                    className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 text-sm font-bold text-surface-800 dark:text-surface-200 truncate">
                    {cat.name}
                  </span>
                  {cat.description && (
                    <span className="text-xs text-surface-500 truncate max-w-[100px]">
                      {cat.description}
                    </span>
                  )}
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded-lg text-surface-500 hover:text-primary-600 dark:hover:text-primary-400
                                 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => { setDeletingId(cat._id); setEditingId(null); }}
                      className="p-1.5 rounded-lg text-surface-500 hover:text-danger-500
                                 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Edit inline form ─────────────────────────────────────── */}
              {editingId === cat._id && (
                <div className="p-3.5 space-y-3 bg-surface-200/60 dark:bg-surface-750">
                  <div>
                    <label className="label">Name</label>
                    <input
                      className={`input ${editErrors.name ? 'border-danger-500' : ''}`}
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Category name"
                      autoFocus
                    />
                    {editErrors.name && (
                      <p className="mt-1 text-xs text-danger-500 font-medium">{editErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Color</label>
                    <ColorPicker
                      value={editForm.color}
                      onChange={(c) => setEditForm((f) => ({ ...f, color: c }))}
                    />
                  </div>
                  <div>
                    <label className="label">Description (optional)</label>
                    <input
                      className="input"
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Short description"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button onClick={cancelEdit} className="btn-ghost text-xs px-3.5 py-1.5">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(cat._id)}
                      disabled={isSaving}
                      className="btn-primary text-xs px-3.5 py-1.5"
                    >
                      {isSaving
                        ? <Loader2 size={13} className="animate-spin" />
                        : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Delete confirmation row ──────────────────────────────── */}
              {deletingId === cat._id && (
                <div className="flex items-center gap-3 px-3.5 py-2.5 bg-danger-500/10">
                  <span className="flex-1 text-xs sm:text-sm text-danger-600 dark:text-danger-300 font-medium">
                    Delete <strong>{cat.name}</strong>? Tasks will be unlinked.
                  </span>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-200 px-2 py-1 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    disabled={isDeleting}
                    className="btn-danger text-xs px-3 py-1.5 shadow-sm"
                  >
                    {isDeleting
                      ? <Loader2 size={13} className="animate-spin" />
                      : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <hr className="border-surface-200 dark:border-surface-700" />

        {/* ── Create new category form ─────────────────────────────────── */}
        <form onSubmit={handleCreate} className="space-y-3">
          <p className="text-xs font-bold text-surface-600 dark:text-surface-400 uppercase tracking-wider">
            New Category
          </p>

          <div className="flex gap-2">
            <div className="flex-1">
              <input
                className={`input ${createErrors.name ? 'border-danger-500' : ''}`}
                value={createForm.name}
                onChange={(e) => {
                  setCreateForm((f) => ({ ...f, name: e.target.value }));
                  if (createErrors.name) setCreateErrors((e) => ({ ...e, name: '' }));
                }}
                placeholder="Category name"
              />
              {createErrors.name && (
                <p className="mt-1 text-xs text-danger-500 font-medium">{createErrors.name}</p>
              )}
            </div>
            {/* Preview badge */}
            <div className="flex items-center">
              <Badge label={createForm.name || 'Preview'} color={createForm.color} />
            </div>
          </div>

          <div>
            <label className="label">Color</label>
            <ColorPicker
              value={createForm.color}
              onChange={(c) => setCreateForm((f) => ({ ...f, color: c }))}
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <input
              className="input"
              value={createForm.description}
              onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Work-related tasks"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="btn-primary w-full justify-center shadow-warm-sm"
          >
            {isCreating
              ? <Loader2 size={15} className="animate-spin mr-2" />
              : <Plus size={15} className="mr-1" />}
            {isCreating ? 'Creating…' : 'Add Category'}
          </button>
        </form>
      </div>
    </Modal>
  );
}
