import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import useTaskStore from '../../../stores/taskStore';

/**
 * QuickAddInput — 1-click inline task creation component.
 * Allows quick creation of tasks by simply typing a title and pressing Enter.
 *
 * Props:
 *  defaultStatus     — Status to assign (default: 'To Do')
 *  defaultCategoryId — Category ID to assign (optional)
 *  className         — Additional classes
 *  onSuccess         — Optional callback after task is created
 */
export default function QuickAddInput({
  defaultStatus = 'To Do',
  defaultCategoryId = '',
  className = '',
  onSuccess,
}) {
  const { addTask, categories } = useTaskStore();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newTask = await addTask({
        title: cleanTitle,
        status: defaultStatus,
        categoryId: categoryId || null,
        priority: 'Medium',
      });
      setTitle('');
      if (onSuccess) onSuccess(newTask);
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Quick add a task... (Press Enter)"
          className="input pl-3 pr-8 py-2 text-sm bg-surface-800 border-surface-700"
          disabled={isSubmitting}
        />
        {isSubmitting && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary-400"
          />
        )}
      </div>

      {categories.length > 0 && (
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isSubmitting}
          className="input py-2 text-xs w-auto max-w-[130px] pr-6 bg-surface-800 border-surface-700 text-surface-300 cursor-pointer"
        >
          <option value="">No Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      <button
        type="submit"
        disabled={!title.trim() || isSubmitting}
        className="btn-primary py-2 px-3 text-sm shrink-0"
        title="Add task"
        aria-label="Add task"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Add</span>
      </button>
    </form>
  );
}
