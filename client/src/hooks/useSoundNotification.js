import { useCallback, useRef } from 'react';
import useAuthStore from '../stores/authStore';
import {
  playPresetTone,
  playCustomAudio,
  stopCustomAudio,
  isAudioSupported,
  PRESET_TONES,
} from '../utils/audioLibrary';

/**
 * useSoundNotification — Enhanced Audio Alert hook.
 *
 * Features:
 *  - playWorkCompleteChime()  : Plays user-configured work-end alarm tone
 *  - playBreakCompleteChime() : Plays user-configured break-end alarm tone
 *  - playAlarmTone(key, vol)  : Play any preset by key at a given volume
 *  - previewTone(key, vol)    : Preview a tone (stops previous preview first)
 *  - stopAlarm()              : Stop any currently playing custom alarm audio
 *  - PRESET_TONES             : Exported preset list for UI rendering
 *  - soundEnabled             : Whether sound is enabled in user preferences
 *  - isSupported              : Whether Web Audio API is available
 */
export function useSoundNotification() {
  const { user } = useAuthStore();

  const prefs = user?.preferences || {};
  const soundEnabled = prefs.soundEnabled ?? true;
  const alarmVolume = (prefs.alarmVolume ?? 80) / 100; // Convert 0–100 to 0.0–1.0
  const workAlarmTone = prefs.workAlarmTone || 'zen_bell';
  const breakAlarmTone = prefs.breakAlarmTone || 'gentle_harp';

  // Ref to track a currently playing custom audio element for stop() support
  const activeCustomAudioRef = useRef(null);

  /**
   * Play the configured work-complete alarm tone.
   * Respects soundEnabled and volume from user preferences.
   */
  const playWorkCompleteChime = useCallback(() => {
    if (!soundEnabled) return;
    playAlarmTone(workAlarmTone, alarmVolume);
  }, [soundEnabled, workAlarmTone, alarmVolume]);

  /**
   * Play the configured break-complete alarm tone.
   */
  const playBreakCompleteChime = useCallback(() => {
    if (!soundEnabled) return;
    playAlarmTone(breakAlarmTone, alarmVolume);
  }, [soundEnabled, breakAlarmTone, alarmVolume]);

  /**
   * Play any preset or custom audio tone by key.
   * @param {string} toneKey   — Key from PRESET_TONES, or 'custom:<blobUrl>'
   * @param {number} volume    — 0.0 to 1.0
   */
  const playAlarmTone = useCallback((toneKey, volume = 0.8) => {
    if (!isAudioSupported()) {
      console.warn('[useSoundNotification] Web Audio API not supported.');
      return;
    }

    if (toneKey && toneKey.startsWith('custom:')) {
      // Custom audio blob URL playback
      const blobUrl = toneKey.replace('custom:', '');
      const audioEl = playCustomAudio(blobUrl, volume);
      activeCustomAudioRef.current = audioEl;
    } else {
      // Built-in preset synthesized playback
      playPresetTone(toneKey || 'zen_bell', volume);
    }
  }, []);

  /**
   * Preview a tone for settings UI.
   * Stops any previously playing preview before starting new.
   * @param {string} toneKey
   * @param {number} volume
   */
  const previewTone = useCallback(
    (toneKey, volume = 0.75) => {
      stopAlarm(); // Stop previous preview
      playAlarmTone(toneKey, volume);
    },
    [playAlarmTone]
  );

  /**
   * Stop any currently playing custom audio alarm.
   */
  const stopAlarm = useCallback(() => {
    if (activeCustomAudioRef.current) {
      stopCustomAudio(activeCustomAudioRef.current);
      activeCustomAudioRef.current = null;
    }
  }, []);

  return {
    soundEnabled,
    alarmVolume,
    workAlarmTone,
    breakAlarmTone,
    isSupported: isAudioSupported(),
    PRESET_TONES,
    playWorkCompleteChime,
    playBreakCompleteChime,
    playAlarmTone,
    previewTone,
    stopAlarm,
  };
}

export default useSoundNotification;
