import { Play, Pause, RotateCcw, Square, Sparkles, Coffee, BatteryCharging, Clock, Loader2 } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';

/**
 * PomodoroControls — Mode switcher, phase buttons, and timer action controls.
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
      <div className="flex bg-surface-800 p-1 rounded-xl border border-surface-700 w-full">
        <button
          onClick={() => switchMode('pomodoro')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            mode === 'pomodoro'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-surface-400 hover:text-surface-200'
          }`}
        >
          <Sparkles size={14} />
          Pomodoro
        </button>
        <button
          onClick={() => switchMode('stopwatch')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            mode === 'stopwatch'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-surface-400 hover:text-surface-200'
          }`}
        >
          <Clock size={14} />
          Stopwatch
        </button>
      </div>

      {/* Pomodoro Phase Selector (Only visible in pomodoro mode) */}
      {mode === 'pomodoro' && (
        <div className="flex items-center gap-2 w-full justify-center">
          <button
            onClick={() => setPomodoroPhase('work', workMinutes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              pomodoroPhase === 'work'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-surface-800 text-surface-400 border border-surface-700 hover:text-surface-200'
            }`}
          >
            <Sparkles size={13} />
            Work ({workMinutes}m)
          </button>
          <button
            onClick={() => setPomodoroPhase('shortBreak', shortBreakMinutes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              pomodoroPhase === 'shortBreak'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-surface-800 text-surface-400 border border-surface-700 hover:text-surface-200'
            }`}
          >
            <Coffee size={13} />
            Short Break ({shortBreakMinutes}m)
          </button>
          <button
            onClick={() => setPomodoroPhase('longBreak', longBreakMinutes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              pomodoroPhase === 'longBreak'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'bg-surface-800 text-surface-400 border border-surface-700 hover:text-surface-200'
            }`}
          >
            <BatteryCharging size={13} />
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
          className="p-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-400 hover:text-surface-200 hover:bg-surface-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw size={18} />
        </button>

        {/* Main Play / Pause Button */}
        <button
          onClick={handleStartPause}
          disabled={isSaving}
          className={`flex items-center justify-center w-16 h-16 rounded-2xl text-white shadow-lg transition-transform active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
              : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20'
          }`}
          title={isRunning ? 'Pause' : 'Start'}
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>

        {/* Stop & Save Button */}
        <button
          onClick={onSave}
          disabled={isIdle || isSaving}
          className="p-3 rounded-xl bg-surface-800 border border-surface-700 text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Stop & Save Session"
          aria-label="Stop & Save Session"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Square size={18} className="fill-current" />}
        </button>
      </div>

      {/* Pomodoro Cycles Completed Indicator */}
      {mode === 'pomodoro' && (
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <span>Cycle:</span>
          <div className="flex gap-1.5">
            {Array.from({ length: longBreakInterval }).map((_, idx) => (
              <span
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx < (pomodoroCyclesCompleted % longBreakInterval)
                    ? 'bg-primary-400'
                    : 'bg-surface-700'
                }`}
                title={`Cycle ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-surface-500 ml-1">
            ({pomodoroCyclesCompleted} total)
          </span>
        </div>
      )}
    </div>
  );
}
