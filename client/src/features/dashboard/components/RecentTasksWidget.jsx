import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, Play, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import useTaskStore from '../../../stores/taskStore';
import useTimer from '../../../hooks/useTimer';
import Badge from '../../../components/common/Badge';
import { formatMinutes } from '../../../utils/timeFormatters';

/**
 * RecentTasksWidget — Recent pending and in-progress tasks widget with 1-click timer launcher.
 */
export default function RecentTasksWidget() {
  const navigate = useNavigate();
  const { tasks, changeTaskStatus } = useTaskStore();
  const { startTimer } = useTimer();

  const pendingTasks = tasks
    .filter((t) => t.status !== 'Completed' && t.status !== 'Archived')
    .slice(0, 5);

  const handleStartTask = (taskId) => {
    startTimer({ taskId, mode: 'pomodoro', targetSeconds: 25 * 60, phase: 'work' });
    navigate('/timer');
  };

  const handleToggleComplete = async (task) => {
    await changeTaskStatus(task._id, 'Completed');
  };

  return (
    <div className="card p-5 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 shadow-warm-sm space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-700/60">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
          <CheckSquare size={16} className="text-primary-500" />
          Active & Pending Tasks
        </h3>
        <Link
          to="/tasks"
          className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold flex items-center gap-0.5 transition-colors"
        >
          <span>All Tasks ({tasks.length})</span>
          <ChevronRight size={13} />
        </Link>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-surface-400 gap-2">
          <CheckSquare size={28} className="opacity-40 text-surface-300 dark:text-surface-600" />
          <p className="text-xs">No pending tasks remaining. Great work!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {pendingTasks.map((t) => (
            <div
              key={t._id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100 dark:bg-surface-850 hover:bg-surface-200 dark:hover:bg-surface-700/60 border border-surface-300 dark:border-surface-700 transition-colors text-xs shadow-warm-sm group"
            >
              <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                <button
                  onClick={() => handleToggleComplete(t)}
                  className="text-surface-400 hover:text-success-500 transition-colors shrink-0 p-0.5 rounded"
                  title="Mark as complete"
                  aria-label="Mark as complete"
                >
                  <CheckCircle2 size={16} />
                </button>
                <div className="space-y-0.5 truncate">
                  <p className="font-semibold text-surface-800 dark:text-surface-200 truncate">{t.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-surface-500 font-mono">
                    {t.categoryId && (
                      <Badge
                        label={t.categoryId.name || 'Category'}
                        color={t.categoryId.color}
                        size="sm"
                        className="text-[9px] py-0 px-1 font-sans"
                      />
                    )}
                    {t.estimatedMinutes > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} className="text-primary-500" />
                        {formatMinutes(t.actualMinutes)} / {formatMinutes(t.estimatedMinutes)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartTask(t._id)}
                className="p-1.5 rounded-lg bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-primary-500 hover:text-white transition-colors shrink-0 shadow-sm"
                title="Start focus timer"
                aria-label="Start focus timer"
              >
                <Play size={12} className="fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
