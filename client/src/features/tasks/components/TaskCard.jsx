import { useNavigate } from 'react-router-dom';
import { format, isPast, isToday } from 'date-fns';
import { Clock, Calendar, GripVertical, Pencil, Trash2, CheckCircle2, Play } from 'lucide-react';
import { clsx } from 'clsx';
import Badge from '../../../components/common/Badge';
import useTimerStore from '../../../stores/timerStore';

/**
 * Priority color mapping for left-border accent and badge.
 * Aligned with ChronoCraft Warm Lo-Fi Pastel & Amber Palette.
 */
const PRIORITY_CONFIG = {
  Urgent: { border: 'border-l-danger-400',  badge: 'danger',  dot: '#E8B4B8' },
  High:   { border: 'border-l-primary-500', badge: 'default', dot: '#C88A58' },
  Medium: { border: 'border-l-warning-400', badge: 'warning', dot: '#E9D8A6' },
  Low:    { border: 'border-l-success-400', badge: 'success', dot: '#8DA780' },
};

/**
 * TaskCard — Displays a single task in list or kanban view with tactile cozy styling.
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
  const navigate = useNavigate();
  const { setActiveTaskId, startTimer, status } = useTimerStore();

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
  const isCompleted = task.status === 'Completed';

  // Due date display
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const dueDateLabel = dueDateObj ? format(dueDateObj, 'MMM d') : null;
  const isDue = dueDateObj && !isCompleted && isPast(dueDateObj) && !isToday(dueDateObj);
  const isDueToday = dueDateObj && isToday(dueDateObj);

  // Quick Start Focus Timer on this task
  const handleStartTimer = (e) => {
    e.stopPropagation();
    setActiveTaskId(task._id);
    if (status !== 'running') {
      startTimer({
        mode: 'pomodoro',
        targetSeconds: 25 * 60,
        phase: 'work',
        taskId: task._id,
      });
    }
    navigate('/timer');
  };

  return (
    <div
      className={clsx(
        'group relative flex gap-3 bg-surface-50 dark:bg-surface-800 rounded-2xl border-l-[4px]',
        'border border-surface-300 dark:border-surface-700/80 shadow-warm-sm hover:shadow-warm-md transition-all duration-150',
        priority.border,
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
        isDragging && 'shadow-2xl scale-[1.02] rotate-1 border-primary-500/50 bg-surface-100 dark:bg-surface-700',
        isCompleted && 'opacity-60 bg-surface-100/60 dark:bg-surface-850/60'
      )}
    >
      {/* Drag handle (only when draggable) */}
      {dragHandle && (
        <div
          {...dragHandle}
          className="flex items-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-200
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
          'shrink-0 mt-0.5 transition-colors p-0.5 rounded-lg',
          isCompleted
            ? 'text-success-500 cursor-default'
            : 'text-surface-400 hover:text-success-500 hover:bg-success-500/10'
        )}
        aria-label={isCompleted ? 'Task completed' : 'Mark as complete'}
        title={isCompleted ? 'Completed' : 'Mark as complete'}
      >
        <CheckCircle2 size={18} />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title */}
        <p
          className={clsx(
            'text-sm font-medium leading-snug truncate',
            isCompleted
              ? 'line-through text-surface-400 dark:text-surface-500'
              : 'text-surface-900 dark:text-surface-100'
          )}
        >
          {task.title}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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

          {/* Estimated vs Actual Time */}
          {(task.estimatedMinutes > 0 || task.actualMinutes > 0) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-surface-500 dark:text-surface-400 bg-surface-200/60 dark:bg-surface-700/50 px-1.5 py-0.5 rounded-md border border-surface-300/60 dark:border-surface-600/50">
              <Clock size={10} className="text-primary-500" />
              <span>
                {task.actualMinutes ?? 0}m{task.estimatedMinutes > 0 ? ` / ${task.estimatedMinutes}m` : ''}
              </span>
            </span>
          )}

          {/* Due date */}
          {dueDateLabel && (
            <span
              className={clsx(
                'inline-flex items-center gap-1 text-[11px]',
                isDue      ? 'text-danger-500 font-semibold' :
                isDueToday ? 'text-warning-600 dark:text-warning-400 font-semibold' :
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
          <div className="flex flex-wrap gap-1 pt-0.5">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-md
                           bg-surface-200/80 dark:bg-surface-700 text-surface-600 dark:text-surface-400 font-mono"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-[10px] text-surface-400">+{task.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions — visible on hover or focus */}
      <div
        className={clsx(
          'flex items-start gap-1 shrink-0 transition-opacity',
          'opacity-0 group-hover:opacity-100'
        )}
      >
        {/* Quick Launch Focus Timer Button */}
        {!isCompleted && (
          <button
            onClick={handleStartTimer}
            className="p-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-500/15
                       border border-primary-500/20 shadow-sm transition-colors"
            title="Start Focus Timer on this task"
            aria-label="Start Focus Timer"
          >
            <Play size={13} fill="currentColor" />
          </button>
        )}

        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-surface-500 hover:text-primary-500 dark:hover:text-primary-400
                     hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          aria-label="Edit task"
          title="Edit task"
        >
          <Pencil size={13} />
        </button>

        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-surface-500 hover:text-danger-500
                     hover:bg-danger-500/10 transition-colors"
          aria-label="Delete task"
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
