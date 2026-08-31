import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Clock } from 'lucide-react';
import useTimer from '../../../hooks/useTimer';
import useTaskStore from '../../../stores/taskStore';
import QuickAddInput from '../../tasks/components/QuickAddInput';

/**
 * QuickStartWidget — 1-click launcher for timers and quick start for high-priority tasks.
 */
export default function QuickStartWidget() {
  const navigate = useNavigate();
  const { startTimer } = useTimer();
  const { tasks } = useTaskStore();

  const highPriorityTasks = tasks
    .filter((t) => t.status !== 'Completed' && (t.priority === 'Urgent' || t.priority === 'High'))
    .slice(0, 3);

  const handleStartGeneralPomodoro = () => {
    startTimer({ mode: 'pomodoro', targetSeconds: 25 * 60, phase: 'work' });
    navigate('/timer');
  };

  const handleStartGeneralStopwatch = () => {
    startTimer({ mode: 'stopwatch' });
    navigate('/timer');
  };

  const handleStartTaskTimer = (taskId) => {
    startTimer({ taskId, mode: 'pomodoro', targetSeconds: 25 * 60, phase: 'work' });
    navigate('/timer');
  };

  return (
    <div className="card p-5 bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700/80 shadow-warm-sm space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-700/60">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
          <Sparkles size={16} className="text-primary-500" />
          Quick Focus Launcher
        </h3>
        <span className="text-xs text-surface-500 font-medium">1-Click Start</span>
      </div>

      {/* Primary Action Quick Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleStartGeneralPomodoro}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-primary-500/15 hover:bg-primary-500/25 border border-primary-500/30 text-primary-700 dark:text-primary-300 font-bold text-xs transition-all active:scale-95 group shadow-warm-sm"
        >
          <Play size={14} className="fill-current text-primary-500 group-hover:translate-x-0.5 transition-transform" />
          <span>Start Pomodoro</span>
        </button>

        <button
          onClick={handleStartGeneralStopwatch}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-pastel-chai-light/40 dark:bg-pastel-chai/20 hover:bg-pastel-chai-light/60 border border-pastel-chai/40 text-pastel-chai-dark dark:text-pastel-chai font-bold text-xs transition-all active:scale-95 group shadow-warm-sm"
        >
          <Clock size={14} className="text-pastel-chai-dark dark:text-pastel-chai group-hover:translate-x-0.5 transition-transform" />
          <span>Start Stopwatch</span>
        </button>
      </div>

      {/* High-Priority Tasks Quick List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider block">
          High-Priority Focus Targets
        </span>

        {highPriorityTasks.length === 0 ? (
          <p className="text-xs text-surface-400 italic py-1">
            No pending high-priority tasks. You&apos;re all caught up!
          </p>
        ) : (
          <div className="space-y-1.5">
            {highPriorityTasks.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100 dark:bg-surface-850 hover:bg-surface-200 dark:hover:bg-surface-700/60 border border-surface-300 dark:border-surface-700 transition-colors text-xs shadow-warm-sm"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.priority === 'Urgent' ? 'bg-pastel-peach-dark dark:bg-pastel-peach' : 'bg-primary-500'
                    }`}
                  />
                  <span className="text-surface-800 dark:text-surface-200 font-semibold truncate">{t.title}</span>
                </div>

                <button
                  onClick={() => handleStartTaskTimer(t._id)}
                  className="p-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors shrink-0 flex items-center gap-1 px-2.5 shadow-sm"
                  title="Start timer for this task"
                >
                  <Play size={10} className="fill-current" />
                  <span className="text-[10px] font-bold">Focus</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inline Quick Add Input */}
      <div className="pt-2 border-t border-surface-200 dark:border-surface-700/60">
        <QuickAddInput />
      </div>
    </div>
  );
}
