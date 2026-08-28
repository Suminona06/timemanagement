import { useState, useEffect, useRef, useCallback } from 'react';
import useTimerStore from '../stores/timerStore';
import { formatSeconds } from '../utils/timeFormatters';

/**
 * useTimer — Precision clock hook that calculates exact elapsed time via wall-clock timestamps.
 * Immune to browser tab background throttling and JS thread lag.
 *
 * @param {object} options
 * @param {Function} [options.onExpire] - Triggered when countdown hits 0 in Pomodoro mode
 * @returns {object} Timer state and formatted readouts
 */
export function useTimer(options = {}) {
  const { onExpire } = options;

  const {
    mode,
    status,
    activeTaskId,
    sessionStartTime,
    accumulatedSeconds,
    pomodoroPhase,
    pomodoroCyclesCompleted,
    targetDurationSeconds,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    switchMode,
    setPomodoroPhase,
    setActiveTaskId,
    completeSession,
  } = useTimerStore();

  // Helper to compute instantaneous elapsed seconds from wall clock
  const computeElapsed = useCallback(() => {
    if (status === 'running' && sessionStartTime) {
      const liveSegment = Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000));
      return accumulatedSeconds + liveSegment;
    }
    return accumulatedSeconds;
  }, [status, sessionStartTime, accumulatedSeconds]);

  const [elapsedSeconds, setElapsedSeconds] = useState(computeElapsed);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const expiredHandledRef = useRef(false);

  // Synchronize tick every 500ms when running, or instantly on status changes
  useEffect(() => {
    setElapsedSeconds(computeElapsed());

    if (status !== 'running') {
      expiredHandledRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      const current = computeElapsed();
      setElapsedSeconds(current);

      // Check for Pomodoro expiration
      if (mode === 'pomodoro' && targetDurationSeconds > 0) {
        if (current >= targetDurationSeconds && !expiredHandledRef.current) {
          expiredHandledRef.current = true;
          if (onExpireRef.current) {
            onExpireRef.current();
          }
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [status, mode, targetDurationSeconds, computeElapsed]);

  // Derived countdown values
  const remainingSeconds =
    mode === 'pomodoro'
      ? Math.max(0, targetDurationSeconds - elapsedSeconds)
      : elapsedSeconds;

  const progressPercent =
    mode === 'pomodoro' && targetDurationSeconds > 0
      ? Math.min(100, Math.max(0, (elapsedSeconds / targetDurationSeconds) * 100))
      : 0;

  const displayTime =
    mode === 'pomodoro'
      ? formatSeconds(remainingSeconds)
      : formatSeconds(elapsedSeconds);

  return {
    mode,
    status,
    activeTaskId,
    pomodoroPhase,
    pomodoroCyclesCompleted,
    targetDurationSeconds,
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
    displayTime,
    isRunning: status === 'running',
    isPaused: status === 'paused',
    isIdle: status === 'idle',
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    switchMode,
    setPomodoroPhase,
    setActiveTaskId,
    completeSession,
  };
}

export default useTimer;
