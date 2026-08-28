import { useCallback } from 'react';
import useAuthStore from '../stores/authStore';

/**
 * useSoundNotification — Web Audio API synthesized audio alerts engine.
 * Generates rich, melodic chimes without relying on external mp3 assets.
 */
export function useSoundNotification() {
  const { user } = useAuthStore();
  const soundEnabled = user?.preferences?.soundEnabled ?? true;

  /**
   * Play completion melodic chime for work/focus sessions (D5 -> A5).
   */
  const playWorkCompleteChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.0, now + 0.15); // A5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (err) {
      console.warn('Audio playback not supported or interaction required:', err);
    }
  }, [soundEnabled]);

  /**
   * Play gentle chime for break conclusion (C5 -> G5).
   */
  const playBreakCompleteChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(783.99, now + 0.15); // G5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    } catch (err) {
      console.warn('Audio playback not supported or interaction required:', err);
    }
  }, [soundEnabled]);

  return {
    soundEnabled,
    playWorkCompleteChime,
    playBreakCompleteChime,
  };
}

export default useSoundNotification;
