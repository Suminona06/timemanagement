import { Play, Pause, RotateCcw, Square, Sparkles, Coffee, BatteryCharging, Clock, Loader2 } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';

/**
 * PomodoroControls — Mode switcher, phase buttons, and timer action controls with warm Lo-Fi design.
 *
 * Props:
 *  timer       — Object returned by useTimer()
 *  onSave      — () => Promise<void> — Complete and save time log
 *  isSaving    — boolean
 */
export default function PomodoroControls({ timer, onSave, isSaving = false }) {
  const { user } = useAuthStore();
  const preferences = user?.preferences || {};

  const workMinutes = preferences.pomodoroWorkMinutes || 25;
  const shortBreakMinutes = preferences.pomodoroShortBreakMinutes || 5;
  const longBreakMinutes = preferences.pomodoroLongBreakMinutes || 15;
  const longBreakInterval = preferences.longBreakInterval || 4;

  const {
    mode,
    status,
    pomodoroPhase,
    pomodoroCyclesCompleted,
    isRunning,
    isPaused,
    isIdle,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    switchMode,
    setPomodoroPhase,
  } = timer;

  const handleStartPause = () => {
    if (isIdle) {
      startTimer();
    } else if (isRunning) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Mode Switcher: Pomodoro vs Stopwatch */}
      <div className="flex bg-surface-200/80 dark:bg-surface-800 p-1.5 rounded-2xl border border-surface-300 dark:border-surface-700 shadow-warm-sm w-full">
        <button
          onClick={() => switchMode('pomodoro')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            mode === 'pomodoro'
              ? 'bg-primary-500 text-white shadow-sm font-bold'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
          }`}
        >
          <Sparkles size={14} />
          Pomodoro
        </button>
        <button
          onClick={() => switchMode('stopwatch')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            mode === 'stopwatch'
              ? 'bg-primary-700 dark:bg-primary-600 text-white shadow-sm font-bold'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
          }`}
        >
          <Clock size={14} />
          Stopwatch
        </button>
      </div>

      {/* Pomodoro Phase Selector (Only visible in pomodoro mode) */}
      {mode === 'pomodoro' && (
        <div className="flex items-center gap-2 w-full justify-center flex-wrap">
          <button
            onClick={() => setPomodoroPhase('work', workMinutes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              pomodoroPhase === 'work'
                ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-500/40 shadow-sm'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-300 dark:border-surface-700 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <Sparkles size={13} className="text-primary-500" />
            Work ({workMinutes}m)
          </button>
          <button
            onClick={() => setPomodoroPhase('shortBreak', shortBreakMinutes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              pomodoroPhase === 'shortBreak'
                ? 'bg-pastel-matcha-light/40 dark:bg-pastel-matcha/20 text-pastel-matcha-dark dark:text-pastel-matcha border border-pastel-matcha/40 shadow-sm'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-300 dark:border-surface-700 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <Coffee size={13} className="text-pastel-matcha-dark dark:text-pastel-matcha" />
            Short Break ({shortBreakMinutes}m)
          </button>
          <button
            onClick={() => setPomodoroPhase('longBreak', longBreakMinutes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              pomodoroPhase === 'longBreak'
                ? 'bg-pastel-lavender-light/40 dark:bg-pastel-lavender/20 text-pastel-lavender-dark dark:text-pastel-lavender border border-pastel-lavender/40 shadow-sm'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-300 dark:border-surface-700 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <BatteryCharging size={13} className="text-pastel-lavender-dark dark:text-pastel-lavender" />
            Long Break ({longBreakMinutes}m)
          </button>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Reset Button */}
        <button
          onClick={resetTimer}
          disabled={isIdle || isSaving}
          className="p-3.5 rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 shadow-warm-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw size={18} />
        </button>

        {/* Main Play / Pause Button */}
        <button
          onClick={handleStartPause}
          disabled={isSaving}
          className={`flex items-center justify-center w-16 h-16 rounded-3xl text-white shadow-warm-lg transition-transform active:scale-95 ${
            isRunning
              ? 'bg-warning-600 dark:bg-warning-500 hover:bg-warning-700 shadow-warning-500/20'
              : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-primary-500/30'
          }`}
          title={isRunning ? 'Pause' : 'Start'}
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" fill="currentColor" />}
        </button>

        {/* Stop & Save Button */}
        <button
          onClick={onSave}
          disabled={isIdle || isSaving}
          className="p-3.5 rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 text-danger-500 hover:text-danger-600 hover:bg-danger-500/10 shadow-warm-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Stop & Save Session"
          aria-label="Stop & Save Session"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Square size={18} className="fill-current" />}
        </button>
      </div>

      {/* Pomodoro Cycles Completed Indicator */}
      {mode === 'pomodoro' && (
        <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 font-medium">
          <span>Cycle Progress:</span>
          <div className="flex gap-1.5">
            {Array.from({ length: longBreakInterval }).map((_, idx) => (
              <span
                key={idx}
                className={`w-3 h-3 rounded-full transition-colors border ${
                  idx < (pomodoroCyclesCompleted % longBreakInterval)
                    ? 'bg-primary-500 border-primary-500 shadow-sm'
                    : 'bg-surface-200 dark:bg-surface-700 border-surface-300 dark:border-surface-600'
                }`}
                title={`Cycle ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-surface-500 ml-1">
            ({pomodoroCyclesCompleted} completed)
          </span>
        </div>
      )}
    </div>
  );
}
