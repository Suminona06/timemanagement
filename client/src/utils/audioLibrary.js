/**
 * audioLibrary.js — ChronoCraft Built-in Synthesized Preset Tone Library.
 *
 * All tones are generated entirely using the Web Audio API OscillatorNode +
 * GainNode chains — zero external mp3/wav file dependencies.
 *
 * Available Preset Keys:
 *   'zen_bell'       — Soft dual-tone meditative chime (D5 → A5)
 *   'digital_alarm'  — Classic sawtooth pulse alarm beep
 *   'marimba'        — Warm wooden marimba chord (C5 → E5 → G5)
 *   'gentle_harp'    — Cascading triangle wave harp arpeggio
 *   'arcade_chime'   — Retro 8-bit square wave ascending run
 *   'classic_bell'   — Resonant church bell decay (C5 → B4 ring)
 */

// ── Shared AudioContext (single instance to prevent resource leaks) ─────────
let _ctx = null;

function getAudioContext() {
  if (!_ctx || _ctx.state === 'closed') {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    _ctx = new AudioCtx();
  }
  return _ctx;
}

/**
 * Create a simple oscillator → gain → destination chain.
 */
function makeOscGain(ctx, type, freq, gainValue, startOffset, stopOffset) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);

  gain.gain.setValueAtTime(gainValue, ctx.currentTime + startOffset);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + stopOffset);

  osc.connect(gain);
  gain.connect(compressor);
  compressor.connect(ctx.destination);

  osc.start(ctx.currentTime + startOffset);
  osc.stop(ctx.currentTime + stopOffset);

  return { osc, gain };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET TONE DEFINITIONS
// Each preset receives:
//   ctx: AudioContext
//   volume: 0.0 – 1.0 (normalized gain multiplier)
// ─────────────────────────────────────────────────────────────────────────────

const PRESETS = {
  /**
   * Zen Bell — Soft, meditative dual sine chime (D5 → A5)
   * Best for: Work Complete, calm environment
   */
  zen_bell: (ctx, volume) => {
    const v = volume * 0.28;
    makeOscGain(ctx, 'sine', 587.33, v, 0.0, 1.5);      // D5
    makeOscGain(ctx, 'sine', 880.0,  v * 0.6, 0.12, 1.8); // A5 softer follow
  },

  /**
   * Digital Alarm — Classic square-wave pulse alarm beeps
   * Best for: Urgent break reminders
   */
  digital_alarm: (ctx, volume) => {
    const v = volume * 0.22;
    const times = [0.0, 0.22, 0.44, 0.66, 0.88];
    times.forEach((t) => {
      makeOscGain(ctx, 'square', 1046.5, v, t, t + 0.18); // C6 beep
    });
  },

  /**
   * Marimba — Warm staggered wooden-bar chord (C5 → E5 → G5)
   * Best for: Work complete, success feeling
   */
  marimba: (ctx, volume) => {
    const v = volume * 0.25;
    makeOscGain(ctx, 'triangle', 523.25, v,        0.00, 0.9); // C5
    makeOscGain(ctx, 'triangle', 659.25, v * 0.85, 0.08, 1.0); // E5
    makeOscGain(ctx, 'triangle', 783.99, v * 0.70, 0.16, 1.1); // G5
  },

  /**
   * Gentle Harp — Cascading triangle wave arpeggio (C4 → E4 → G4 → C5)
   * Best for: Break time, ultra relaxing sessions
   */
  gentle_harp: (ctx, volume) => {
    const v = volume * 0.20;
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      makeOscGain(ctx, 'triangle', freq, v, i * 0.12, i * 0.12 + 1.2);
    });
  },

  /**
   * Arcade Chime — Retro 8-bit square wave ascending run (C5 → E5 → G5 → C6)
   * Best for: Gamified pomodoro session completion
   */
  arcade_chime: (ctx, volume) => {
    const v = volume * 0.18;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      makeOscGain(ctx, 'square', freq, v, i * 0.09, i * 0.09 + 0.22);
    });
  },

  /**
   * Classic Bell — Resonant church bell with harmonic decay (C5 + B4 fade)
   * Best for: Traditional / long session milestones
   */
  classic_bell: (ctx, volume) => {
    const v = volume * 0.30;
    makeOscGain(ctx, 'sine', 523.25, v,        0.00, 2.5); // C5 fundamental
    makeOscGain(ctx, 'sine', 493.88, v * 0.30, 0.05, 2.8); // B4 undertone hum
    makeOscGain(ctx, 'sine', 1046.5, v * 0.12, 0.00, 1.0); // C6 shimmer overtone
  },
};

/**
 * List of all available preset tones for UI rendering.
 * @type {Array<{key: string, label: string, emoji: string, description: string}>}
 */
export const PRESET_TONES = [
  { key: 'zen_bell',      label: 'Zen Bell',      emoji: '🔔', description: 'Soft meditative dual sine chime' },
  { key: 'digital_alarm', label: 'Digital Alarm',  emoji: '📟', description: 'Classic square-wave pulse beeps' },
  { key: 'marimba',       label: 'Marimba',        emoji: '🎵', description: 'Warm staggered wooden-bar chord' },
  { key: 'gentle_harp',   label: 'Gentle Harp',    emoji: '🎶', description: 'Cascading triangle wave arpeggio' },
  { key: 'arcade_chime',  label: 'Arcade Chime',   emoji: '🕹️', description: 'Retro 8-bit ascending run' },
  { key: 'classic_bell',  label: 'Classic Bell',   emoji: '🛎️', description: 'Resonant church bell with decay' },
];

/**
 * Play a preset tone by key at a given volume.
 * @param {string} toneKey — One of the PRESET_TONES keys
 * @param {number} volume  — 0.0 (silent) to 1.0 (full)
 */
export function playPresetTone(toneKey, volume = 0.8) {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      console.warn('[audioLibrary] Web Audio API not supported in this browser.');
      return false;
    }

    // Resume suspended AudioContext (required after user gesture)
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playPresetTone(toneKey, volume));
      return false;
    }

    const preset = PRESETS[toneKey];
    if (!preset) {
      console.warn(`[audioLibrary] Unknown tone key: "${toneKey}"`);
      return false;
    }

    const normalizedVolume = Math.max(0, Math.min(1, volume));
    preset(ctx, normalizedVolume);
    return true;
  } catch (err) {
    console.warn('[audioLibrary] Playback error:', err);
    return false;
  }
}

/**
 * Play an audio Blob/File (custom uploaded ringtone) at a given volume.
 * @param {Blob|string} blobOrUrl — Audio blob or object URL
 * @param {number} volume         — 0.0 to 1.0
 * @returns {HTMLAudioElement}
 */
export function playCustomAudio(blobOrUrl, volume = 0.8) {
  try {
    const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch((err) =>
      console.warn('[audioLibrary] Custom audio playback error:', err)
    );
    return audio;
  } catch (err) {
    console.warn('[audioLibrary] Failed to play custom audio:', err);
    return null;
  }
}

/**
 * Stop a playing HTMLAudioElement.
 * @param {HTMLAudioElement} audioEl
 */
export function stopCustomAudio(audioEl) {
  if (audioEl && !audioEl.paused) {
    audioEl.pause();
    audioEl.currentTime = 0;
  }
}

/**
 * Check whether Web Audio API is supported in the current browser.
 * @returns {boolean}
 */
export function isAudioSupported() {
  return !!(window.AudioContext || window.webkitAudioContext);
}
