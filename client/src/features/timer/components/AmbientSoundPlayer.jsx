import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Music2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Wifi,
} from 'lucide-react';
import { createAmbientEngine, AMBIENT_TRACKS, isAmbientSupported } from '../../../utils/ambientSynthesizer';

/**
 * AmbientSoundPlayer — Collapsible ambient soundscape widget for the Focus Room.
 *
 * Props:
 *   timerStatus   — 'idle' | 'running' | 'paused' (from timerStore)
 *   autoPauseOnIdle — boolean; if true, pauses ambient when timer is paused/idle
 */
export default function AmbientSoundPlayer({ timerStatus = 'idle', autoPauseOnIdle = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState('rain');
  const [volume, setVolume] = useState(40); // 0 – 100
  const [isMuted, setIsMuted] = useState(false);

  // Ref for the active ambient engine instance
  const engineRef = useRef(null);

  // Whether Web Audio API is supported
  const supported = isAmbientSupported();

  // ── Start/Stop engine ─────────────────────────────────────────────────────
  const startAmbient = useCallback(() => {
    if (!supported) return;

    // Stop any existing engine first
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }

    const effectiveVolume = isMuted ? 0 : volume / 100;
    const engine = createAmbientEngine(activeTrack, effectiveVolume);
    engineRef.current = engine;
    setIsPlaying(true);
  }, [activeTrack, volume, isMuted, supported]);

  const stopAmbient = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // ── Auto-pause when timer becomes idle/paused ─────────────────────────────
  useEffect(() => {
    if (!autoPauseOnIdle) return;
    if (timerStatus === 'running') {
      if (isPlaying && engineRef.current === null) {
        startAmbient();
      }
    } else {
      if (isPlaying && engineRef.current) {
        engineRef.current.setVolume(0);
      }
    }
  }, [timerStatus, autoPauseOnIdle, isPlaying, startAmbient]);

  // ── Toggle play/pause ─────────────────────────────────────────────────────
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAmbient();
    } else {
      startAmbient();
    }
  };

  // ── Switch track (restarts engine with new track) ─────────────────────────
  const handleTrackChange = (key) => {
    setActiveTrack(key);
    if (isPlaying) {
      // Stop current, start new immediately
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
      const effectiveVolume = isMuted ? 0 : volume / 100;
      const engine = createAmbientEngine(key, effectiveVolume);
      engineRef.current = engine;
    }
  };

  // ── Volume change (smooth ramp via engine) ────────────────────────────────
  const handleVolumeChange = (val) => {
    setVolume(val);
    if (engineRef.current && !isMuted) {
      engineRef.current.setVolume(val / 100);
    }
  };

  // ── Mute toggle ───────────────────────────────────────────────────────────
  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (engineRef.current) {
      engineRef.current.setVolume(nextMuted ? 0 : volume / 100);
    }
  };

  // ── Stop engine on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  const currentTrack = AMBIENT_TRACKS.find((t) => t.key === activeTrack);

  if (!supported) return null;

  return (
    <div className={`w-full max-w-lg mx-auto rounded-2xl border transition-all duration-200 ${
      isExpanded
        ? 'bg-surface-800 border-surface-700 shadow-lg'
        : 'bg-surface-800/50 border-surface-700/50'
    }`}>
      {/* ── Header bar (always visible) ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          {/* Animated waveform icon when playing */}
          <div className={`flex items-end gap-0.5 w-5 h-4 ${isPlaying ? '' : 'opacity-40'}`}>
            {[1, 3, 2, 4, 1.5].map((h, i) => (
              <span
                key={i}
                className={`w-0.5 bg-primary-400 rounded-full transition-all ${isPlaying ? 'animate-pulse' : ''}`}
                style={{
                  height: `${h * 4}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${0.7 + i * 0.1}s`,
                }}
              />
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-surface-200">
              Ambient Sounds
              {isPlaying && (
                <span className="ml-2 text-primary-400 font-normal">
                  {currentTrack?.emoji} {currentTrack?.label}
                </span>
              )}
            </p>
            {!isExpanded && !isPlaying && (
              <p className="text-[10px] text-surface-500">Click to set focus music</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick play/pause inline (visible even when collapsed) */}
          <button
            onClick={(e) => { e.stopPropagation(); handleTogglePlay(); }}
            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
              isPlaying
                ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                : 'bg-surface-700 text-surface-400 hover:text-surface-200'
            }`}
            title={isPlaying ? 'Pause ambient' : 'Play ambient'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button className="text-surface-500 hover:text-surface-300 transition-colors">
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ── Expanded panel ──────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-surface-700/50 pt-3">

          {/* Track Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {AMBIENT_TRACKS.map((track) => (
              <button
                key={track.key}
                type="button"
                onClick={() => handleTrackChange(track.key)}
                title={track.description}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                  activeTrack === track.key
                    ? 'bg-primary-500/15 border-primary-500/50 text-primary-300 shadow-sm shadow-primary-500/10'
                    : 'bg-surface-850 border-surface-700/50 text-surface-400 hover:text-surface-200 hover:bg-surface-700'
                }`}
              >
                <span className="text-lg leading-none">{track.emoji}</span>
                <span className="text-[10px] font-medium leading-tight">{track.label}</span>
              </button>
            ))}
          </div>

          {/* Volume Row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMuteToggle}
              className="text-surface-400 hover:text-surface-200 shrink-0 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="flex-1 accent-primary-500 cursor-pointer"
            />

            <span className="text-[11px] font-mono text-surface-400 w-8 text-right shrink-0">
              {isMuted ? '—' : `${volume}%`}
            </span>
          </div>

          {/* Auto-pause info row */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-surface-500">
              {autoPauseOnIdle
                ? '⏸ Auto-pauses when timer stops'
                : 'Plays independently of timer state'}
            </p>
            {isPlaying && (
              <div className="flex items-center gap-1 text-[10px] text-success-400">
                <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
                Playing
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
