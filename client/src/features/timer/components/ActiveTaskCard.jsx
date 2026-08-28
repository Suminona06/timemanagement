import { useState } from 'react';
import { CheckSquare, X, ArrowRightLeft, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import useTaskStore from '../../../stores/taskStore';
import Badge from '../../../components/common/Badge';
import { formatMinutes } from '../../../utils/timeFormatters';

/**
 * ActiveTaskCard — Displays current active task linked to the timer session,
 * with actual vs estimated progress bar and fast task switching.
 *
 * Props:
 *  activeTaskId    — MongoDB ObjectId of active task
 *  onSelectTask    — (taskId) => void
 *  onUnlinkTask    — () => void
 */
export default function ActiveTaskCard({ activeTaskId, onSelectTask, onUnlinkTask }) {
  const { tasks } = useTaskStore();
  const [isSwitching, setIsSwitching] = useState(false);

  const activeTask = tasks.find((t) => t._id === activeTaskId);
  const uncompletedTasks = tasks.filter((t) => t.status !== 'Completed');

  const estimated = activeTask?.estimatedMinutes || 0;
  const actual = activeTask?.actualMinutes || 0;
  const progress = estimated > 0 ? Math.min(100, Math.round((actual / estimated) * 100)) : 0;

  return (
    <div className="card p-5 w-full max-w-md bg-surface-800 border-surface-700 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary-400" />
          Active Focus Target
        </span>
        <button
          onClick={() => setIsSwitching(!isSwitching)}
          className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
        >
          <ArrowRightLeft size={12} />
          {isSwitching ? 'Cancel' : activeTask ? 'Switch Task' : 'Link a Task'}
        </button>
      </div>

      {/* Task Switcher Dropdown */}
      {isSwitching && (
        <div className="space-y-2 p-3 rounded-lg bg-surface-850 border border-surface-700 animate-fade-in">
          <label className="label text-xs">Choose a task to work on:</label>
          <select
            value={activeTaskId || ''}
            onChange={(e) => {
              onSelectTask(e.target.value || null);
              setIsSwitching(false);
            }}
            className="input text-xs py-2 cursor-pointer"
          >
            <option value="">No task linked</option>
            {uncompletedTasks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title} ({t.priority})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current Task Details */}
      {activeTask ? (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <h3 className="text-base font-semibold text-surface-100 truncate">
                {activeTask.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {activeTask.categoryId && (
                  <Badge
                    label={activeTask.categoryId.name || 'Category'}
                    color={activeTask.categoryId.color}
                    size="sm"
                  />
                )}
                <Badge
                  label={activeTask.priority}
                  variant={
                    activeTask.priority === 'Urgent'
                      ? 'danger'
                      : activeTask.priority === 'High'
                      ? 'warning'
                      : activeTask.priority === 'Low'
                      ? 'muted'
                      : 'default'
                  }
                  size="sm"
                />
              </div>
            </div>

            <button
              onClick={onUnlinkTask}
              className="p-1 rounded-md text-surface-500 hover:text-surface-300 hover:bg-surface-700 transition-colors"
              title="Unlink task"
              aria-label="Unlink task"
            >
              <X size={15} />
            </button>
          </div>

          {/* Progress Bar: Actual vs Estimated */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-surface-400 font-medium">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Spent: <strong className="text-surface-200">{formatMinutes(actual)}</strong>
              </span>
              <span>
                Target:{' '}
                <strong className="text-surface-200">
                  {estimated > 0 ? formatMinutes(estimated) : 'No estimate'}
                </strong>
              </span>
            </div>

            {estimated > 0 && (
              <div className="w-full bg-surface-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress >= 100
                      ? 'bg-success-500'
                      : progress >= 75
                      ? 'bg-warning-500'
                      : 'bg-primary-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-surface-500 space-y-2">
          <p className="text-sm">No task linked to this session.</p>
          <p className="text-xs text-surface-600">
            Linking a task will automatically log time to that task.
          </p>
        </div>
      )}
    </div>
  );
}
