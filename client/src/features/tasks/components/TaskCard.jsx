import { format, isPast, isToday } from 'date-fns';
import { Clock, Calendar, GripVertical, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import Badge from '../../../components/common/Badge';

/**
 * Priority color mapping for left-border accent and badge.
 */
const PRIORITY_CONFIG = {
  Urgent: { border: 'border-l-danger-500',  badge: 'danger',  dot: '#EF4444' },
  High:   { border: 'border-l-warning-500', badge: 'warning', dot: '#F97316' },
  Medium: { border: 'border-l-primary-500', badge: 'default', dot: '#3B82F6' },
  Low:    { border: 'border-l-surface-500', badge: 'muted',   dot: '#64748B' },
};

/**
 * TaskCard — Displays a single task in list or kanban view.
 *
 * Props:
 *  task          — Task object from taskStore
 *  onEdit        — () => void  — opens TaskFormModal pre-filled with this task
 *  onDelete      — () => void  — triggers delete confirmation
 *  onComplete    — () => void  — quick-toggle to 'Completed' status
 *  dragHandle    — Spread onto drag handle element (from @hello-pangea/dnd)
 *  isDragging    — Bool from dnd — applies lifted shadow
 *  compact       — Bool — smaller padding for kanban cards
 */
export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  dragHandle,
  isDragging = false,
  compact    = false,
}) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
  const isCompleted = task.status === 'Completed';

  // Due date display
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const dueDateLabel = dueDateObj ? format(dueDateObj, 'MMM d') : null;
  const isDue = dueDateObj && !isCompleted && isPast(dueDateObj) && !isToday(dueDateObj);
  const isDueToday = dueDateObj && isToday(dueDateObj);

  return (
    <div
      className={clsx(
        'group relative flex gap-3 bg-surface-800 rounded-xl border-l-[3px]',
        'border border-surface-700 transition-all duration-150',
        priority.border,
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
        isDragging && 'shadow-2xl scale-[1.02] rotate-1 border-primary-500/40',
        isCompleted && 'opacity-60'
      )}
    >
      {/* Drag handle (only when draggable) */}
      {dragHandle && (
        <div
          {...dragHandle}
          className="flex items-center text-surface-600 hover:text-surface-400
                     cursor-grab active:cursor-grabbing transition-colors shrink-0 mt-0.5"
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>
      )}

      {/* Quick complete button */}
      <button
        onClick={onComplete}
        disabled={isCompleted}
        className={clsx(
          'shrink-0 mt-0.5 transition-colors',
          isCompleted
            ? 'text-success-500 cursor-default'
            : 'text-surface-600 hover:text-success-400'
        )}
        aria-label={isCompleted ? 'Task completed' : 'Mark as complete'}
      >
        <CheckCircle2 size={16} />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title */}
        <p
          className={clsx(
            'text-sm font-medium leading-snug truncate',
            isCompleted ? 'line-through text-surface-500' : 'text-surface-100'
          )}
        >
          {task.title}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category badge */}
          {task.categoryId && (
            <Badge
              label={task.categoryId.name || task.categoryId}
              color={task.categoryId.color}
              size="sm"
            />
          )}

          {/* Priority badge */}
          <Badge label={task.priority} variant={priority.badge} size="sm" />

          {/* Estimated time */}
          {task.estimatedMinutes > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-surface-500">
              <Clock size={11} />
              {task.estimatedMinutes}m
            </span>
          )}

          {/* Due date */}
          {dueDateLabel && (
            <span
              className={clsx(
                'inline-flex items-center gap-1 text-xs',
                isDue      ? 'text-danger-400 font-medium' :
                isDueToday ? 'text-warning-400 font-medium' :
                             'text-surface-500'
              )}
            >
              <Calendar size={11} />
              {isDue ? 'Overdue · ' : isDueToday ? 'Today · ' : ''}{dueDateLabel}
            </span>
          )}
        </div>

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded-md
                           bg-surface-700 text-surface-400"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-xs text-surface-500">+{task.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions — visible on hover */}
      <div
        className={clsx(
          'flex items-start gap-0.5 shrink-0 transition-opacity',
          'opacity-0 group-hover:opacity-100'
        )}
      >
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md text-surface-500 hover:text-primary-400
                     hover:bg-primary-500/10 transition-colors"
          aria-label="Edit task"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md text-surface-500 hover:text-danger-400
                     hover:bg-danger-500/10 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
