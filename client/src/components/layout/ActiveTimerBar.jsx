import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Square,
  Timer,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import useTimer from '../../hooks/useTimer';
import useTaskStore from '../../stores/taskStore';
import { createTimeLog } from '../../services/timeLogService';

/**
 * ActiveTimerBar — Top navigation bar ticker component with warm Lo-Fi styling.
 * Displays real-time timer status, active task title, category pill, and 1-click controls.
 */
export default function ActiveTimerBar() {
  const {
    mode,
    activeTaskId,
    displayTime,
    isRunning,
    isIdle,
    startTimer,
    pauseTimer,
    resumeTimer,
    completeSession,
  } = useTimer();

  const { tasks, loadTasks } = useTaskStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find linked task if any
  const activeTask = tasks.find((t) => t._id === activeTaskId);

  // Handle Stop and Save session to TimeLog API
  const handleStopAndSave = async () => {
    if (isIdle) return;
    setIsSaving(true);
    try {
      const session = completeSession();
      if (session.durationMinutes > 0 || session.totalSeconds >= 10) {
        await createTimeLog({
          taskId: session.taskId || null,
          startTime: session.startTime,
          endTime: session.endTime,
          durationMinutes: session.durationMinutes,
          logType: session.logType,
          notes: activeTask ? `Focus session on ${activeTask.title}` : 'Focus session',
        });
        // Reload tasks so actualMinutes updates immediately
        loadTasks();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save time log:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStart = (taskId) => {
    startTimer({ taskId: taskId || null });
  };

  if (isIdle) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/timer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-200/60 dark:bg-surface-700/60 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 text-xs font-semibold transition-all border border-surface-300 dark:border-surface-600/50 shadow-warm-sm"
          title="Open Focus Room"
        >
          <Timer size={14} className="text-primary-500" />
          <span className="hidden sm:inline">Focus Room</span>
        </Link>

        {tasks.length > 0 && (
          <select
            onChange={(e) => e.target.value && handleQuickStart(e.target.value)}
            defaultValue=""
            className="input py-1 px-2.5 text-xs w-auto max-w-[170px] hidden md:block bg-surface-100 dark:bg-surface-800 border-surface-300 dark:border-surface-700 text-surface-600 dark:text-surface-300 cursor-pointer rounded-xl shadow-warm-sm"
            aria-label="Quick start task timer"
          >
            <option value="" disabled>
              ⚡ Quick Focus...
            </option>
            {tasks
              .filter((t) => t.status !== 'Completed')
              .slice(0, 8)
              .map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-surface-50 dark:bg-surface-850 px-3.5 py-1.5 rounded-2xl border border-primary-500/40 shadow-warm-sm animate-fade-in">
      {/* Ticking Digital Display & Link to /timer */}
      <Link
        to="/timer"
        className="flex items-center gap-2 group cursor-pointer"
        title="Open Full Focus Room"
      >
        <span className="relative flex h-2.5 w-2.5">
          {isRunning && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isRunning ? 'bg-primary-500' : 'bg-warning-500'
            }`}
          ></span>
        </span>
        <span className="font-mono font-bold text-sm tracking-wider text-surface-900 dark:text-surface-100 group-hover:text-primary-500 transition-colors">
          {displayTime}
        </span>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hidden sm:inline">
          {mode}
        </span>
      </Link>

      {/* Task label */}
      <div className="hidden lg:flex items-center gap-1.5 max-w-[180px] truncate border-l border-surface-300 dark:border-surface-700 pl-2.5">
        {activeTask ? (
          <>
            {activeTask.categoryId?.color && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: activeTask.categoryId.color }}
              />
            )}
            <span className="text-xs font-semibold text-surface-800 dark:text-surface-200 truncate">
              {activeTask.title}
            </span>
          </>
        ) : (
          <span className="text-xs text-surface-400 italic">Free Session</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="p-1 rounded-lg text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            title="Pause Timer"
            aria-label="Pause Timer"
          >
            <Pause size={14} />
          </button>
        ) : (
          <button
            onClick={resumeTimer}
            className="p-1 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 transition-colors"
            title="Resume Timer"
            aria-label="Resume Timer"
          >
            <Play size={14} fill="currentColor" />
          </button>
        )}

        <button
          onClick={handleStopAndSave}
          disabled={isSaving}
          className="p-1 rounded-lg text-danger-500 hover:bg-danger-500/10 transition-colors"
          title="Stop & Save Session"
          aria-label="Stop and save session"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Square size={13} className="fill-current" />
          )}
        </button>

        {saveSuccess && (
          <span className="text-xs text-success-500 font-semibold flex items-center gap-0.5 animate-fade-in pl-1">
            <CheckCircle2 size={12} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
