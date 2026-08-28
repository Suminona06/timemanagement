import { useState, useEffect } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import useTaskStore from '../../../stores/taskStore';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES   = ['To Do', 'In Progress', 'Completed', 'Archived'];

/**
 * TaskFormModal — Create or edit a task.
 *
 * Props:
 *  isOpen   — Boolean controlling visibility
 *  onClose  — () => void
 *  task     — Task object when editing; null/undefined when creating
 */
export default function TaskFormModal({ isOpen, onClose, task }) {
  const { categories, addTask, editTask } = useTaskStore();
  const isEditing = Boolean(task);

  const EMPTY_FORM = {
    title:            '',
    description:      '',
    categoryId:       '',
    priority:         'Medium',
    status:           'To Do',
    estimatedMinutes: '',
    dueDate:          '',
    tags:             '',
  };

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [isLoading,  setIsLoading]  = useState(false);
  const [apiError,   setApiError]   = useState('');

  // ── Populate form when editing ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setApiError('');
      return;
    }
    if (task) {
      setForm({
        title:            task.title || '',
        description:      task.description || '',
        categoryId:       task.categoryId?._id || task.categoryId || '',
        priority:         task.priority || 'Medium',
        status:           task.status   || 'To Do',
        estimatedMinutes: task.estimatedMinutes > 0 ? String(task.estimatedMinutes) : '',
        dueDate:          task.dueDate
                            ? new Date(task.dueDate).toISOString().slice(0, 10)
                            : '',
        tags:             task.tags?.join(', ') || '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task]);

  // ── Field change ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    if (apiError)     setApiError('');
  };

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    else if (form.title.length > 200) errs.title = 'Max 200 characters.';

    if (form.estimatedMinutes && (isNaN(+form.estimatedMinutes) || +form.estimatedMinutes < 0)) {
      errs.estimatedMinutes = 'Must be a positive number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse tags: "work, react, api" → ['work', 'react', 'api']
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title:            form.title.trim(),
      description:      form.description.trim(),
      categoryId:       form.categoryId || null,
      priority:         form.priority,
      status:           form.status,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : 0,
      dueDate:          form.dueDate || null,
      tags,
    };

    setIsLoading(true);
    try {
      if (isEditing) {
        await editTask(task._id, payload);
      } else {
        await addTask(payload);
      }
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'New Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* API error */}
        {apiError && (
          <div className="flex gap-2 p-3 rounded-lg bg-danger-500/10
                          border border-danger-500/30 text-danger-400 text-sm">
            <span>⚠</span><span>{apiError}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="label">
            Title <span className="text-danger-400">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="What needs to be done?"
            className={`input ${errors.title ? 'border-danger-500' : ''}`}
            autoFocus
          />
          {errors.title && (
            <p className="mt-1 text-xs text-danger-400">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional details…"
            rows={3}
            className="input resize-none"
          />
        </div>

        {/* Row: Category + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="input cursor-pointer"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="input cursor-pointer"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row: Status + Estimated minutes */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Estimated time (min)</label>
            <input
              name="estimatedMinutes"
              type="number"
              min="0"
              value={form.estimatedMinutes}
              onChange={handleChange}
              placeholder="e.g. 25"
              className={`input ${errors.estimatedMinutes ? 'border-danger-500' : ''}`}
            />
            {errors.estimatedMinutes && (
              <p className="mt-1 text-xs text-danger-400">{errors.estimatedMinutes}</p>
            )}
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="label">Due date</label>
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="work, react, api  (comma-separated)"
            className="input"
          />
          <p className="mt-1 text-xs text-surface-500">Separate tags with commas</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : isEditing
                ? 'Save changes'
                : <><Plus size={14} /> Create task</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
}
