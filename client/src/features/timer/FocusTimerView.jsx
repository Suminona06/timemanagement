import { useState, useCallback, useEffect } from 'react';
import { PlusCircle, Bell, BellOff, Sparkles, CheckCircle2 } from 'lucide-react';
import useTimer from '../../hooks/useTimer';
import useTaskStore from '../../stores/taskStore';
import useAuthStore from '../../stores/authStore';
import useSoundNotification from '../../hooks/useSoundNotification';
import useBrowserNotification from '../../hooks/useBrowserNotification';
import { createTimeLog } from '../../services/timeLogService';
import TimerWheel from './components/TimerWheel';
import PomodoroControls from './components/PomodoroControls';
import ActiveTaskCard from './components/ActiveTaskCard';
import ManualLogModal from './components/ManualLogModal';

/**
 * FocusTimerView — Dedicated Focus Room view for stopwatch and Pomodoro tracking.
 */
export default function FocusTimerView() {
  const { user } = useAuthStore();
  const { tasks, loadTasks, init } = useTaskStore();

  const { playWorkCompleteChime, playBreakCompleteChime } = useSoundNotification();
  const { isSupported, isGranted, requestPermission, sendNotification } = useBrowserNotification();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Handle Pomodoro session expiration (triggers both audio and desktop notification)
  const handleSessionExpire = useCallback(() => {
    // 1. Play synthesized audio chime
    playWorkCompleteChime();

    // 2. Fire system desktop notification
    sendNotification('Focus Session Complete! 🎉', {
      body: 'Great job staying in flow! Take a break or continue your momentum.',
    });
  }, [playWorkCompleteChime, sendNotification]);

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
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-2">
            <Sparkles size={22} className="text-primary-400" />
            Focus Room
          </h1>
          <p className="text-xs text-surface-400 mt-0.5">
            Stay in flow, eliminate distractions, and track your time seamlessly.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Desktop Notification Permission Toggle */}
          {isSupported && !isGranted && (
            <button
              onClick={requestPermission}
              className="btn-ghost text-xs py-1.5 px-2.5 gap-1.5 text-amber-400 hover:text-amber-300 border-amber-500/30"
              title="Enable desktop notifications for timer completion"
            >
              <Bell size={13} />
              Enable Alerts
            </button>
          )}

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="btn-ghost text-xs gap-1.5"
            title="Log historical time entry"
          >
            <PlusCircle size={14} />
            Log Manual Time
          </button>
        </div>
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
