import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Square,
  Timer,
  Clock,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import useTimer from '../../hooks/useTimer';
import useTaskStore from '../../stores/taskStore';
import { createTimeLog } from '../../services/timeLogService';

/**
 * ActiveTimerBar — Top navigation bar ticker component.
 * Displays real-time timer status, active task title, category pill, and 1-click controls.
 */
export default function ActiveTimerBar() {
  const navigate = useNavigate();
  const {
    mode,
    status,
    activeTaskId,
    displayTime,
    isRunning,
    isPaused,
    isIdle,
    startTimer,
    pauseTimer,
    resumeTimer,
    completeSession,
    resetTimer,
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700/60 hover:bg-surface-700 text-surface-300 hover:text-surface-100 text-xs font-medium transition-colors border border-surface-600/50"
          title="Open Focus Room"
        >
          <Timer size={14} className="text-primary-400" />
          <span className="hidden sm:inline">Focus Timer</span>
        </Link>

        {tasks.length > 0 && (
          <select
            onChange={(e) => e.target.value && handleQuickStart(e.target.value)}
            defaultValue=""
            className="input py-1 text-xs w-auto max-w-[160px] hidden md:block bg-surface-800 border-surface-700 text-surface-400 cursor-pointer"
            aria-label="Quick start task timer"
          >
            <option value="" disabled>
              ⚡ Quick Start Task...
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
    <div className="flex items-center gap-2 sm:gap-3 bg-surface-850 px-3 py-1.5 rounded-xl border border-primary-500/30 shadow-md animate-fade-in">
      {/* Ticking Digital Display & Link to /timer */}
      <Link
        to="/timer"
        className="flex items-center gap-1.5 group cursor-pointer"
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
        <span className="font-mono font-bold text-sm tracking-wider text-surface-100 group-hover:text-primary-400 transition-colors">
          {displayTime}
        </span>
        <span className="text-[10px] uppercase font-semibold px-1 py-0.2 rounded bg-surface-700 text-surface-400 hidden sm:inline">
          {mode}
        </span>
      </Link>

      {/* Task label */}
      <div className="hidden lg:flex items-center gap-1.5 max-w-[180px] truncate border-l border-surface-700 pl-2">
        {activeTask ? (
          <>
            {activeTask.categoryId?.color && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: activeTask.categoryId.color }}
              />
            )}
            <span className="text-xs font-medium text-surface-200 truncate">
              {activeTask.title}
            </span>
          </>
        ) : (
          <span className="text-xs text-surface-500 italic">No task linked</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="p-1 rounded-md text-surface-300 hover:text-white hover:bg-surface-700 transition-colors"
            title="Pause Timer"
            aria-label="Pause Timer"
          >
            <Pause size={14} />
          </button>
        ) : (
          <button
            onClick={resumeTimer}
            className="p-1 rounded-md text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 transition-colors"
            title="Resume Timer"
            aria-label="Resume Timer"
          >
            <Play size={14} />
          </button>
        )}

        <button
          onClick={handleStopAndSave}
          disabled={isSaving}
          className="p-1 rounded-md text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 transition-colors"
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
          <span className="text-xs text-success-400 flex items-center gap-0.5 animate-fade-in pl-1">
            <CheckCircle2 size={12} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
