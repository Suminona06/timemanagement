/**
 * ambientSynthesizer.js — Web Audio API ambient soundscape engine.
 *
 * Generates 5 looping ambient environments entirely in the browser:
 *   'rain'       — Rainfall: pink-noise filtered through LFO tremolo
 *   'cafe'       — Café: brown noise band-passed with murmur modulation
 *   'white_noise' — Pure white noise for focus/masking
 *   'lofi'       — Lo-Fi Beats: kick + hi-hat + bass rhythm loop
 *   'waves'      — Ocean waves: brown noise with slow LFO swell
 *
 * All sources loop indefinitely. The engine exposes:
 *   createAmbientEngine(trackKey, volume)  → { gainNode, stop() }
 */

// ── Shared AudioContext singleton ────────────────────────────────────────────
let _ctx = null;

function getCtx() {
  if (!_ctx || _ctx.state === 'closed') {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    _ctx = new Ctx();
  }
  return _ctx;
}

// ── Buffer helpers ────────────────────────────────────────────────────────────

/**
 * Generate a buffer of white noise (uniform random values).
 */
function makeWhiteNoiseBuffer(ctx, seconds = 3) {
  const frames = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Generate a buffer of pink noise (weighted low-frequency content).
 * Uses Voss-McCartney algorithm (8-stage).
 */
function makePinkNoiseBuffer(ctx, seconds = 3) {
  const frames = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const b = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < frames; i++) {
    const w = Math.random() * 2 - 1;
    b[0] = 0.99886 * b[0] + w * 0.0555179;
    b[1] = 0.99332 * b[1] + w * 0.0750759;
    b[2] = 0.96900 * b[2] + w * 0.1538520;
    b[3] = 0.86650 * b[3] + w * 0.3104856;
    b[4] = 0.55000 * b[4] + w * 0.5329522;
    b[5] = -0.7616 * b[5] - w * 0.0168980;
    data[i] = (b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + w * 0.5362) / 8;
    b[6] = w * 0.115926;
  }
  return buffer;
}

/**
 * Generate a buffer of brown noise (integrated white noise, deeper rumble).
 */
function makeBrownNoiseBuffer(ctx, seconds = 3) {
  const frames = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < frames; i++) {
    const w = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * w) / 1.02;
    data[i] = lastOut * 3.5; // Scale to audible range
  }
  return buffer;
}

// ── Ambient Track Factories ───────────────────────────────────────────────────

function createRain(ctx, masterGain) {
  const nodes = [];

  // Pink noise source (rainfall texture)
  const buffer = makePinkNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Low-pass filter — removes harsh highs, leaves gentle rain sound
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 3200;
  lpf.Q.value = 0.7;

  // Tremolo LFO — simulates intensity variation in rain
  const tremoloGain = ctx.createGain();
  tremoloGain.gain.value = 0.8;

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08; // Very slow swell

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.2;

  lfo.connect(lfoGain);
  lfoGain.connect(tremoloGain.gain);

  source.connect(lpf);
  lpf.connect(tremoloGain);
  tremoloGain.connect(masterGain);
  lfo.start();
  source.start();

  nodes.push(source, lfo);
  return nodes;
}

function createCafe(ctx, masterGain) {
  const nodes = [];

  // Brown noise base — low murmur of voices
  const buffer = makeBrownNoiseBuffer(ctx, 5);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 900;
  bpf.Q.value = 0.5;

  // Gentle high-shelf — adds warmth/presence of distant conversations
  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highshelf';
  hpf.frequency.value = 2000;
  hpf.gain.value = -6;

  // Slow modulation LFO — simulate crowd ebb and flow
  const modGain = ctx.createGain();
  modGain.gain.value = 0.85;
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.05;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.15;
  lfo.connect(lfoGain);
  lfoGain.connect(modGain.gain);

  source.connect(bpf);
  bpf.connect(hpf);
  hpf.connect(modGain);
  modGain.connect(masterGain);
  lfo.start();
  source.start();

  nodes.push(source, lfo);
  return nodes;
}

function createWhiteNoise(ctx, masterGain) {
  const buffer = makeWhiteNoiseBuffer(ctx, 3);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Subtle band-pass shaping for comfort
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 0.3;

  source.connect(filter);
  filter.connect(masterGain);
  source.start();

  return [source];
}

function createLofi(ctx, masterGain) {
  const nodes = [];
  const bpm = 80;
  const beat = 60 / bpm;
  const now = ctx.currentTime;
  const totalBars = 8;

  // Schedule a 8-bar drum+bass loop
  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = now + bar * beat * 4;

    // Kick on beat 1 and 3
    [0, 2].forEach((b) => {
      const t = barStart + b * beat;
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(150, t);
      kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      kickGain.gain.setValueAtTime(0.6, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      kickOsc.connect(kickGain);
      kickGain.connect(masterGain);
      kickOsc.start(t);
      kickOsc.stop(t + 0.35);
      nodes.push(kickOsc);
    });

    // Hi-hat on every 8th note
    for (let h = 0; h < 8; h++) {
      const t = barStart + h * beat * 0.5;
      const hiBuf = makeWhiteNoiseBuffer(ctx, 0.05);
      const hiSrc = ctx.createBufferSource();
      hiSrc.buffer = hiBuf;
      const hiFilter = ctx.createBiquadFilter();
      hiFilter.type = 'highpass';
      hiFilter.frequency.value = 7000;
      const hiGain = ctx.createGain();
      const vol = h % 2 === 0 ? 0.25 : 0.12;
      hiGain.gain.setValueAtTime(vol, t);
      hiGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      hiSrc.connect(hiFilter);
      hiFilter.connect(hiGain);
      hiGain.connect(masterGain);
      hiSrc.start(t);
      hiSrc.stop(t + 0.08);
      nodes.push(hiSrc);
    }

    // Bass line (C2 → G2 → A2 → F2)
    const bassNotes = [65.41, 98.0, 110.0, 87.31];
    bassNotes.forEach((freq, idx) => {
      const t = barStart + idx * beat;
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.value = freq;
      bassGain.gain.setValueAtTime(0.35, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.8);
      bassOsc.connect(bassGain);
      bassGain.connect(masterGain);
      bassOsc.start(t);
      bassOsc.stop(t + beat);
      nodes.push(bassOsc);
    });
  }

  return nodes;
}

function createWaves(ctx, masterGain) {
  const nodes = [];

  // Brown noise base — deep ocean rumble
  const buffer = makeBrownNoiseBuffer(ctx, 6);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 800;
  lpf.Q.value = 0.5;

  // Slow wave swell via LFO (approx 0.12 Hz = ~8 second wave cycle)
  const swellGain = ctx.createGain();
  swellGain.gain.value = 0.7;

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.12;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.6;

  lfo.connect(lfoGain);
  lfoGain.connect(swellGain.gain);

  source.connect(lpf);
  lpf.connect(swellGain);
  swellGain.connect(masterGain);
  lfo.start();
  source.start();

  nodes.push(source, lfo);
  return nodes;
}

// ── Public track map ─────────────────────────────────────────────────────────

const TRACK_FACTORIES = {
  rain:        createRain,
  cafe:        createCafe,
  white_noise: createWhiteNoise,
  lofi:        createLofi,
  waves:       createWaves,
};

/**
 * Create and start an ambient soundscape engine.
 * @param {string} trackKey  — One of: 'rain' | 'cafe' | 'white_noise' | 'lofi' | 'waves'
 * @param {number} volume    — 0.0 to 1.0 master gain
 * @returns {{ gainNode: GainNode, setVolume(v): void, stop(): void } | null}
 */
export function createAmbientEngine(trackKey, volume = 0.5) {
  const ctx = getCtx();
  if (!ctx) return null;

  const factory = TRACK_FACTORIES[trackKey];
  if (!factory) {
    console.warn(`[ambientSynthesizer] Unknown track: "${trackKey}"`);
    return null;
  }

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  // Master gain node for this engine instance
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
  masterGain.connect(ctx.destination);

  // Build the audio graph
  const nodes = factory(ctx, masterGain);

  // For lo-fi: auto-restart loop every 8 bars
  let lofiLoopTimer = null;
  if (trackKey === 'lofi') {
    const bpm = 80;
    const loopDuration = (60 / bpm) * 4 * 8 * 1000; // 8 bars in ms
    lofiLoopTimer = setInterval(() => {
      const newNodes = createLofi(ctx, masterGain);
      // old nodes auto-expire via their scheduled stop times
    }, loopDuration - 200);
  }

  return {
    gainNode: masterGain,
    setVolume: (v) => {
      masterGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, v)),
        ctx.currentTime,
        0.1 // 100ms smooth ramp
      );
    },
    stop: () => {
      if (lofiLoopTimer) clearInterval(lofiLoopTimer);
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      setTimeout(() => {
        try {
          nodes.forEach((n) => {
            try { n.stop?.(); } catch (_) {}
            try { n.disconnect?.(); } catch (_) {}
          });
          masterGain.disconnect();
        } catch (_) {}
      }, 300);
    },
  };
}

/**
 * Available ambient tracks for UI rendering.
 */
export const AMBIENT_TRACKS = [
  { key: 'rain',        label: 'Rain',        emoji: '🌧️',  description: 'Gentle rainfall with natural tremolo swell' },
  { key: 'cafe',        label: 'Café',         emoji: '☕',  description: 'Coffee shop ambient murmur' },
  { key: 'white_noise', label: 'White Noise',  emoji: '🌫️',  description: 'Pure steady white noise for focus masking' },
  { key: 'lofi',        label: 'Lo-Fi Beats',  emoji: '🎧',  description: 'Chill 80BPM kick, hi-hat & bass loop' },
  { key: 'waves',       label: 'Ocean Waves',  emoji: '🌊',  description: 'Deep ocean waves with slow swell cycle' },
];

/**
 * Check if Web Audio API is available.
 */
export function isAmbientSupported() {
  return !!(window.AudioContext || window.webkitAudioContext);
}
