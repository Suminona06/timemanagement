import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * timerStore — Global high-precision drift-resilient timer state.
 *
 * Persisted in localStorage (`chronocraft-timer`) so active sessions survive
 * tab background throttling, browser close/reopen, and page refreshes.
 *
 * Uses Epoch timestamps (`Date.now()`) to guarantee zero clock drift.
 */
const useTimerStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────────
      mode: 'pomodoro',                 // 'stopwatch' | 'pomodoro'
      status: 'idle',                   // 'idle' | 'running' | 'paused'
      activeTaskId: null,               // Linked Task ObjectId (or null)
      sessionStartTime: null,           // Epoch ms timestamp when currently running segment started
      sessionInitialTimestamp: null,    // Epoch ms timestamp when entire tracking session began
      accumulatedSeconds: 0,            // Seconds accumulated prior to current segment
      pomodoroPhase: 'work',            // 'work' | 'shortBreak' | 'longBreak'
      pomodoroCyclesCompleted: 0,       // Number of completed work sessions
      targetDurationSeconds: 25 * 60,   // Target duration for current Pomodoro phase (default: 25 min)

      // ── Actions ───────────────────────────────────────────────────────────────

      /**
       * Start or restart the timer with optional parameters.
       */
      startTimer: ({ taskId, mode, targetSeconds, phase } = {}) => {
        const now = Date.now();
        const current = get();

        set({
          status: 'running',
          sessionStartTime: now,
          sessionInitialTimestamp: current.sessionInitialTimestamp || now,
          activeTaskId: taskId !== undefined ? taskId : current.activeTaskId,
          mode: mode || current.mode,
          pomodoroPhase: phase || current.pomodoroPhase,
          targetDurationSeconds:
            targetSeconds !== undefined ? targetSeconds : current.targetDurationSeconds,
        });
      },

      /**
       * Pause running timer and snapshot accumulated seconds.
       */
      pauseTimer: () => {
        const { status, sessionStartTime, accumulatedSeconds } = get();
        if (status !== 'running' || !sessionStartTime) return;

        const currentSegmentSeconds = Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000));
        set({
          status: 'paused',
          sessionStartTime: null,
          accumulatedSeconds: accumulatedSeconds + currentSegmentSeconds,
        });
      },

      /**
       * Resume paused timer.
       */
      resumeTimer: () => {
        const { status } = get();
        if (status !== 'paused') return;

        set({
          status: 'running',
          sessionStartTime: Date.now(),
        });
      },

      /**
       * Reset timer to idle state without saving.
       */
      resetTimer: () => {
        set({
          status: 'idle',
          sessionStartTime: null,
          sessionInitialTimestamp: null,
          accumulatedSeconds: 0,
        });
      },

      /**
       * Switch mode between 'stopwatch' and 'pomodoro'.
       */
      switchMode: (newMode) => {
        if (newMode !== 'stopwatch' && newMode !== 'pomodoro') return;
        const current = get();
        if (current.mode === newMode) return;

        set({
          mode: newMode,
          status: 'idle',
          sessionStartTime: null,
          sessionInitialTimestamp: null,
          accumulatedSeconds: 0,
          targetDurationSeconds: newMode === 'pomodoro' ? 25 * 60 : 0,
          pomodoroPhase: 'work',
        });
      },

      /**
       * Select a Pomodoro phase ('work' | 'shortBreak' | 'longBreak') and configure its target duration.
       */
      setPomodoroPhase: (phase, durationMinutes = 25) => {
        set({
          pomodoroPhase: phase,
          targetDurationSeconds: Math.max(1, durationMinutes) * 60,
          status: 'idle',
          sessionStartTime: null,
          sessionInitialTimestamp: null,
          accumulatedSeconds: 0,
        });
      },

      /**
       * Set or switch the active linked task.
       */
      setActiveTaskId: (taskId) => {
        set({ activeTaskId: taskId || null });
      },

      /**
       * Increment completed Pomodoro cycle count.
       */
      incrementPomodoroCycle: () => {
        set((state) => ({
          pomodoroCyclesCompleted: state.pomodoroCyclesCompleted + 1,
        }));
      },

      /**
       * Conclude active session and return session snapshot for saving to API.
       */
      completeSession: () => {
        const { sessionStartTime, sessionInitialTimestamp, accumulatedSeconds, activeTaskId, mode, pomodoroPhase } = get();
        const now = Date.now();

        let totalSeconds = accumulatedSeconds;
        if (sessionStartTime) {
          totalSeconds += Math.max(0, Math.floor((now - sessionStartTime) / 1000));
        }

        const startTimestamp = sessionInitialTimestamp || (now - totalSeconds * 1000);
        const endTimestamp = now;
        const durationMinutes = Math.max(1, Math.round(totalSeconds / 60));

        // Reset timer state to idle
        set({
          status: 'idle',
          sessionStartTime: null,
          sessionInitialTimestamp: null,
          accumulatedSeconds: 0,
        });

        return {
          taskId: activeTaskId,
          startTime: new Date(startTimestamp).toISOString(),
          endTime: new Date(endTimestamp).toISOString(),
          durationMinutes,
          totalSeconds,
          logType: mode === 'pomodoro' ? 'pomodoro' : 'stopwatch',
          pomodoroPhase,
        };
      },
    }),
    {
      name: 'chronocraft-timer',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTimerStore;
