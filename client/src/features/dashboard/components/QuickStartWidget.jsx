import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Clock, ArrowRight, CheckSquare } from 'lucide-react';
import useTimer from '../../../hooks/useTimer';
import useTaskStore from '../../../stores/taskStore';
import Badge from '../../../components/common/Badge';
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
    <div className="card p-5 bg-surface-800 border-surface-700 space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2 border-b border-surface-700/60">
        <h3 className="text-sm font-semibold text-surface-100 flex items-center gap-2">
          <Sparkles size={16} className="text-primary-400" />
          Quick Focus Launcher
        </h3>
        <span className="text-xs text-surface-400">1-Click Start</span>
      </div>

      {/* Primary Action Quick Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleStartGeneralPomodoro}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary-500/15 hover:bg-primary-500/25 border border-primary-500/30 text-primary-300 font-semibold text-xs transition-all active:scale-95 group shadow-sm"
        >
          <Play size={14} className="fill-current text-primary-400 group-hover:translate-x-0.5 transition-transform" />
          <span>Start Pomodoro</span>
        </button>

        <button
          onClick={handleStartGeneralStopwatch}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-all active:scale-95 group shadow-sm"
        >
          <Clock size={14} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          <span>Start Stopwatch</span>
        </button>
      </div>

      {/* High-Priority Tasks Quick List */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider block">
          Priority Tasks
        </span>

        {highPriorityTasks.length === 0 ? (
          <p className="text-xs text-surface-500 italic py-1">
            No pending high-priority tasks. Good job!
          </p>
        ) : (
          <div className="space-y-1.5">
            {highPriorityTasks.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-850 hover:bg-surface-750 border border-surface-700 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.priority === 'Urgent' ? 'bg-danger-500' : 'bg-warning-500'
                    }`}
                  />
                  <span className="text-surface-200 font-medium truncate">{t.title}</span>
                </div>

                <button
                  onClick={() => handleStartTaskTimer(t._id)}
                  className="p-1 rounded-md bg-primary-500/20 text-primary-300 hover:bg-primary-500 hover:text-white transition-colors shrink-0 flex items-center gap-1 px-2"
                  title="Start timer for this task"
                >
                  <Play size={11} className="fill-current" />
                  <span className="text-[10px] font-semibold">Focus</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inline Quick Add Input */}
      <div className="pt-2 border-t border-surface-700/60">
        <QuickAddInput />
      </div>
    </div>
  );
}
