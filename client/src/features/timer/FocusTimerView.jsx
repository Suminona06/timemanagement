import { useState, useCallback, useEffect } from 'react';
import { PlusCircle, Bell, Sparkles, CheckCircle2, History } from 'lucide-react';
import useTimer from '../../hooks/useTimer';
import useTaskStore from '../../stores/taskStore';
import useAuthStore from '../../stores/authStore';
import { createTimeLog } from '../../services/timeLogService';
import TimerWheel from './components/TimerWheel';
import PomodoroControls from './components/PomodoroControls';
import ActiveTaskCard from './components/ActiveTaskCard';
import ManualLogModal from './components/ManualLogModal';

/**
 * Play a gentle audio chime when a focus session concludes using Web Audio API.
 */
function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant dual-frequency melodic chime
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  } catch (err) {
    console.warn('Audio playback not supported or allowed yet:', err);
  }
}

/**
 * FocusTimerView — Dedicated Focus Room view for stopwatch and Pomodoro tracking.
 */
export default function FocusTimerView() {
  const { user } = useAuthStore();
  const { tasks, loadTasks, init } = useTaskStore();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Handle Pomodoro session expiration
  const handleSessionExpire = useCallback(() => {
    if (user?.preferences?.soundEnabled !== false) {
      playChimeSound();
    }
  }, [user]);

  const timer = useTimer({ onExpire: handleSessionExpire });

  const {
    mode,
    status,
    pomodoroPhase,
    activeTaskId,
    displayTime,
    progressPercent,
    completeSession,
    setActiveTaskId,
  } = timer;

  // Initialize tasks list on mount
  useEffect(() => {
    if (tasks.length === 0) {
      init();
    }
  }, [init, tasks.length]);

  // Handle complete and save to backend
  const handleSaveSession = async () => {
    setIsSaving(true);
    try {
      const session = completeSession();
      const activeTask = tasks.find((t) => t._id === session.taskId);

      if (session.durationMinutes > 0 || session.totalSeconds >= 10) {
        await createTimeLog({
          taskId: session.taskId || null,
          startTime: session.startTime,
          endTime: session.endTime,
          durationMinutes: session.durationMinutes,
          logType: session.logType,
          notes: activeTask
            ? `Completed ${session.logType} session on "${activeTask.title}"`
            : `Completed ${session.logType} session`,
        });

        await loadTasks();
        setSaveSuccessMsg(`Session saved! (+${session.durationMinutes}m logged)`);
        setTimeout(() => setSaveSuccessMsg(''), 3500);
      }
    } catch (err) {
      console.error('Failed to save session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-full py-2 gap-8 max-w-4xl mx-auto">
      {/* Top Header Row */}
      <div className="w-full flex items-center justify-between border-b border-surface-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-2">
            <Sparkles size={22} className="text-primary-400" />
            Focus Room
          </h1>
          <p className="text-xs text-surface-400 mt-0.5">
            Stay in flow, eliminate distractions, and track your time seamlessly.
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="btn-ghost text-xs gap-1.5"
          title="Log historical time entry"
        >
          <PlusCircle size={14} />
          Log Manual Time
        </button>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="w-full max-w-md p-3 rounded-xl bg-success-500/10 border border-success-500/30 text-success-400 text-sm flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 size={16} />
          {saveSuccessMsg}
        </div>
      )}

      {/* Center Focus Area: Wheel + Controls */}
      <div className="flex flex-col items-center gap-8 w-full">
        {/* SVG Circular Timer Wheel */}
        <TimerWheel
          displayTime={displayTime}
          progressPercent={progressPercent}
          mode={mode}
          phase={pomodoroPhase}
          status={status}
          size={290}
        />

        {/* Action Controls & Phase Switcher */}
        <PomodoroControls
          timer={timer}
          onSave={handleSaveSession}
          isSaving={isSaving}
        />
      </div>

      {/* Linked Task Card */}
      <div className="w-full flex justify-center pt-2">
        <ActiveTaskCard
          activeTaskId={activeTaskId}
          onSelectTask={(id) => setActiveTaskId(id)}
          onUnlinkTask={() => setActiveTaskId(null)}
        />
      </div>

      {/* Manual Time Entry Modal */}
      <ManualLogModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
}
