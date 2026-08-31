import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Upload,
  Trash2,
  Music,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  Link,
  ExternalLink,
} from 'lucide-react';
import useAudioStore from '../../../stores/audioStore';
import { PRESET_TONES, playPresetTone } from '../../../utils/audioLibrary';
import { playCustomAudio, stopCustomAudio } from '../../../utils/audioLibrary';
import { parseMediaUrl, MEDIA_PRESETS } from '../../../utils/mediaEmbedUtils';

// ── Helper: format bytes to human-readable size ──────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ── Tone Selector Dropdown ────────────────────────────────────────────────────
function ToneSelector({ label, value, onChange, customSounds }) {
  return (
    <div className="space-y-1.5">
      <label className="label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input text-sm"
      >
        <optgroup label="Built-in Presets">
          {PRESET_TONES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.emoji} {t.label} — {t.description}
            </option>
          ))}
        </optgroup>
        {customSounds.length > 0 && (
          <optgroup label="My Custom Sounds">
            {customSounds.map((s) => (
              <option key={s.id} value={`custom:${s.blobUrl}`}>
                🎵 {s.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}

/**
 * SoundSettingsSection — Full-featured ringtone customizer panel with warm Lo-Fi light and dark mode.
 *
 * Props:
 *   soundEnabled    — master toggle value
 *   alarmVolume     — 0 to 100
 *   workAlarmTone   — preset key or 'custom:<blobUrl>'
 *   breakAlarmTone  — preset key or 'custom:<blobUrl>'
 *   savedMediaLinks — array of saved media link objects
 *   onChange(patch) — callback when any value changes (partial object)
 */
export default function SoundSettingsSection({
  soundEnabled,
  alarmVolume,
  workAlarmTone,
  breakAlarmTone,
  savedMediaLinks = [],
  onChange,
}) {
  const {
    customSounds,
    isLoading,
    isUploading,
    uploadError,
    previewingId,
    loadSounds,
    uploadSound,
    removeSound,
    previewSound,
    stopPreview,
    clearError,
    isSupported,
  } = useAudioStore();

  // Track which selector (work/break) is being previewed for button state
  const [previewingWork, setPreviewingWork] = useState(false);
  const [previewingBreak, setPreviewingBreak] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Refs for active preset preview audio
  const workPreviewRef = useRef(null);
  const breakPreviewRef = useRef(null);

  // File input ref for the upload button
  const fileInputRef = useRef(null);

  // Drag-over state for drop zone
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    loadSounds();
  }, [loadSounds]);

  // Stop previews on unmount
  useEffect(() => {
    return () => {
      stopPreview();
      stopCustomAudio(workPreviewRef.current);
      stopCustomAudio(breakPreviewRef.current);
    };
  }, [stopPreview]);

  // ── Preview helpers ────────────────────────────────────────────────────────
  const stopWorkPreview = () => {
    stopCustomAudio(workPreviewRef.current);
    workPreviewRef.current = null;
    setPreviewingWork(false);
  };

  const stopBreakPreview = () => {
    stopCustomAudio(breakPreviewRef.current);
    breakPreviewRef.current = null;
    setPreviewingBreak(false);
  };

  const handlePreviewWork = () => {
    if (previewingWork) { stopWorkPreview(); return; }
    stopBreakPreview();
    stopPreview();

    const vol = (alarmVolume ?? 80) / 100;
    if (workAlarmTone?.startsWith('custom:')) {
      const url = workAlarmTone.replace('custom:', '');
      const el = playCustomAudio(url, vol);
      workPreviewRef.current = el;
      if (el) {
        el.addEventListener('ended', () => setPreviewingWork(false));
        el.addEventListener('error', () => setPreviewingWork(false));
      }
    } else {
      playPresetTone(workAlarmTone || 'zen_bell', vol);
    }
    setPreviewingWork(true);
    if (!workAlarmTone?.startsWith('custom:')) {
      setTimeout(() => setPreviewingWork(false), 2200);
    }
  };

  const handlePreviewBreak = () => {
    if (previewingBreak) { stopBreakPreview(); return; }
    stopWorkPreview();
    stopPreview();

    const vol = (alarmVolume ?? 80) / 100;
    if (breakAlarmTone?.startsWith('custom:')) {
      const url = breakAlarmTone.replace('custom:', '');
      const el = playCustomAudio(url, vol);
      breakPreviewRef.current = el;
      if (el) {
        el.addEventListener('ended', () => setPreviewingBreak(false));
        el.addEventListener('error', () => setPreviewingBreak(false));
      }
    } else {
      playPresetTone(breakAlarmTone || 'gentle_harp', vol);
    }
    setPreviewingBreak(true);
    if (!breakAlarmTone?.startsWith('custom:')) {
      setTimeout(() => setPreviewingBreak(false), 2200);
    }
  };

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    clearError();
    const result = await uploadSound(file);
    if (result) {
      setUploadSuccess(`"${result.name}" uploaded successfully!`);
      setTimeout(() => setUploadSuccess(''), 3500);
    }
  }, [uploadSound, clearError]);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="space-y-5">
      {/* ── Master Sound Toggle ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-850 shadow-warm-sm">
        <div className="flex items-center gap-3">
          {soundEnabled
            ? <Volume2 size={20} className="text-pastel-matcha-dark dark:text-pastel-matcha" />
            : <VolumeX size={20} className="text-surface-400" />
          }
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">Sound Alerts</p>
            <p className="text-xs text-surface-500">
              {soundEnabled ? 'Alarm chimes & audio effects are active' : 'All audio alerts are muted'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange({ soundEnabled: !soundEnabled })}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
            soundEnabled ? 'bg-pastel-matcha-dark dark:bg-pastel-matcha' : 'bg-surface-300 dark:bg-surface-600'
          }`}
          role="switch"
          aria-checked={soundEnabled}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            soundEnabled ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {/* ── Volume Slider ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="label mb-0">Alarm Volume</label>
          <span className="text-xs font-mono font-bold text-primary-700 dark:text-primary-300 bg-primary-500/15 px-2.5 py-0.5 rounded-lg border border-primary-500/30">
            {alarmVolume ?? 80}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={alarmVolume ?? 80}
          onChange={(e) => onChange({ alarmVolume: Number(e.target.value) })}
          disabled={!soundEnabled}
          className="w-full accent-primary-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-[11px] text-surface-500 font-medium">
          <span>0% (Mute)</span>
          <span>50%</span>
          <span>100% (Max)</span>
        </div>
      </div>

      {/* ── Work Complete Tone ──────────────────────────────────────────── */}
      <div className={`space-y-2 transition-opacity ${!soundEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <ToneSelector
              label="Work Session Complete Tone"
              value={workAlarmTone || 'zen_bell'}
              onChange={(v) => onChange({ workAlarmTone: v })}
              customSounds={customSounds}
            />
          </div>
          <div className="pt-6">
            <button
              type="button"
              onClick={handlePreviewWork}
              title={previewingWork ? 'Stop preview' : 'Preview tone'}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all shadow-warm-sm ${
                previewingWork
                  ? 'bg-danger-500/10 border-danger-500/40 text-danger-500'
                  : 'bg-primary-500/15 border-primary-500/30 text-primary-700 dark:text-primary-300 hover:bg-primary-500/25'
              }`}
            >
              {previewingWork
                ? <><Square size={13} /> Stop</>
                : <><Play  size={13} fill="currentColor" /> Play</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Break Complete Tone ─────────────────────────────────────────── */}
      <div className={`space-y-2 transition-opacity ${!soundEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <ToneSelector
              label="Break Complete Tone"
              value={breakAlarmTone || 'gentle_harp'}
              onChange={(v) => onChange({ breakAlarmTone: v })}
              customSounds={customSounds}
            />
          </div>
          <div className="pt-6">
            <button
              type="button"
              onClick={handlePreviewBreak}
              title={previewingBreak ? 'Stop preview' : 'Preview tone'}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all shadow-warm-sm ${
                previewingBreak
                  ? 'bg-danger-500/10 border-danger-500/40 text-danger-500'
                  : 'bg-pastel-matcha-light/40 dark:bg-pastel-matcha/20 border-pastel-matcha/40 text-pastel-matcha-dark dark:text-pastel-matcha hover:bg-pastel-matcha-light/60'
              }`}
            >
              {previewingBreak
                ? <><Square size={13} /> Stop</>
                : <><Play  size={13} fill="currentColor" /> Play</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Custom Sound Upload Drop-Zone ────────────────────────────────── */}
      <div className="space-y-3 pt-3 border-t border-surface-200 dark:border-surface-700/60">
        <div className="flex items-center gap-2">
          <Music size={15} className="text-primary-500" />
          <h3 className="text-xs font-bold text-surface-900 dark:text-surface-200 uppercase tracking-wider">
            My Custom Ringtones
          </h3>
          {isLoading && <Loader2 size={13} className="animate-spin text-surface-500" />}
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-500 text-xs font-medium">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Upload success */}
        {uploadSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-success-500/10 border border-success-500/30 text-success-600 dark:text-success-400 text-xs font-medium animate-fade-in shadow-warm-sm">
            <CheckCircle2 size={14} />
            {uploadSuccess}
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            isDragOver
              ? 'border-primary-500 bg-primary-500/15 scale-[1.01]'
              : 'border-surface-300 dark:border-surface-600 hover:border-primary-500/60 hover:bg-surface-100 dark:hover:bg-surface-750 bg-surface-50 dark:bg-surface-850 shadow-warm-sm'
          }`}
        >
          {isUploading ? (
            <Loader2 size={24} className="animate-spin text-primary-500" />
          ) : (
            <Upload size={22} className={isDragOver ? 'text-primary-500' : 'text-surface-400 dark:text-surface-500'} />
          )}
          <div className="text-center">
            <p className="text-xs font-semibold text-surface-800 dark:text-surface-200">
              {isUploading ? 'Storing audio file in local browser…' : 'Drop audio file here or click to browse'}
            </p>
            <p className="text-[10px] text-surface-500 mt-0.5 font-mono">
              mp3, wav, ogg, m4a, aac, flac · Max 10 MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Custom Sound List */}
        {customSounds.length > 0 ? (
          <div className="space-y-1.5">
            {customSounds.map((sound) => (
              <div
                key={sound.id}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-850 border border-surface-300 dark:border-surface-700 shadow-warm-sm group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Music size={14} className="text-primary-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-surface-800 dark:text-surface-200 truncate">{sound.name}</p>
                    <p className="text-[10px] text-surface-500 font-mono">
                      {formatBytes(sound.size)} · {new Date(sound.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Preview button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (previewingId === sound.id) {
                        stopPreview();
                      } else {
                        previewSound(sound.id, (alarmVolume ?? 80) / 100);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      previewingId === sound.id
                        ? 'text-danger-500 bg-danger-500/10'
                        : 'text-surface-500 hover:text-primary-500 hover:bg-primary-500/10'
                    }`}
                    title={previewingId === sound.id ? 'Stop preview' : 'Preview sound'}
                  >
                    {previewingId === sound.id
                      ? <Square size={13} />
                      : <Play  size={13} fill="currentColor" />
                    }
                  </button>
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => removeSound(sound.id)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete custom sound"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-4 text-[11px] text-surface-500">
              No custom sounds yet. Upload an audio file above to personalize your timers.
            </div>
          )
        )}

        {/* IndexedDB not supported warning */}
        {!isSupported && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
            <HardDrive size={14} />
            <span>IndexedDB not available in this browser — custom sounds cannot be stored.</span>
          </div>
        )}
      </div>

      {/* ── Saved Media Links (YouTube / Spotify) ────────────────────────── */}
      <SavedMediaLinksSection
        savedMediaLinks={savedMediaLinks}
        onChangeLinks={(links) => onChange({ savedMediaLinks: links })}
      />
    </div>
  );
}

// ── Saved Media Links sub-section ─────────────────────────────────────────────
function SavedMediaLinksSection({ savedMediaLinks = [], onChangeLinks }) {
  const [inputUrl, setInputUrl] = useState('');
  const [inputError, setInputError] = useState('');
  const links = Array.isArray(savedMediaLinks) ? savedMediaLinks : [];

  const handleAdd = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    const parsed = parseMediaUrl(trimmed);
    if (!parsed.platform) {
      setInputError('Not a valid YouTube or Spotify URL.');
      return;
    }
    if (links.find((l) => l.url === trimmed)) {
      setInputError('This URL is already saved.');
      return;
    }
    setInputError('');
    setInputUrl('');
    onChangeLinks([...links, { url: trimmed, label: parsed.label, platform: parsed.platform }]);
  };

  const handleRemove = (url) => {
    onChangeLinks(links.filter((l) => l.url !== url));
  };

  return (
    <div className="space-y-3 pt-3 border-t border-surface-200 dark:border-surface-700/60">
      <div className="flex items-center gap-2">
        <Link size={15} className="text-primary-500" />
        <h3 className="text-xs font-bold text-surface-900 dark:text-surface-200 uppercase tracking-wider">
          Saved Ambient Media Streams
        </h3>
      </div>

      <p className="text-[11px] text-surface-500">
        Bookmark your favorite YouTube and Spotify music streams for quick one-click playback in the Focus Room.
      </p>

      {/* Add URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={inputUrl}
          onChange={(e) => { setInputUrl(e.target.value); setInputError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Paste YouTube or Spotify URL…"
          className="input text-xs flex-1"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="btn-primary px-4 py-2 text-xs shrink-0"
        >
          Save Stream
        </button>
      </div>

      {inputError && (
        <p className="text-[11px] text-danger-500 flex items-center gap-1 font-medium">
          <AlertCircle size={12} /> {inputError}
        </p>
      )}

      {/* Saved link list */}
      {links.length > 0 ? (
        <div className="space-y-1.5">
          {links.map((link) => (
            <div
              key={link.url}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-850 border border-surface-300 dark:border-surface-700 shadow-warm-sm group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                  link.platform === 'spotify'
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                }`}>
                  {link.platform === 'spotify' ? 'SPT' : 'YT'}
                </span>
                <span className="text-xs font-medium text-surface-800 dark:text-surface-200 truncate">{link.label || link.url}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-surface-500 hover:text-primary-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  type="button"
                  onClick={() => handleRemove(link.url)}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove link"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-[11px] text-surface-500 py-2">
          No saved streams yet. Add a YouTube or Spotify URL above.
        </p>
      )}

      {/* Quick add from presets */}
      <div className="pt-1">
        <p className="text-[10px] text-surface-500 font-medium mb-1.5">Quick add popular stations:</p>
        <div className="flex flex-wrap gap-1.5">
          {MEDIA_PRESETS.filter((p) => !links.find((l) => l.url === p.url)).map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                const parsed = parseMediaUrl(preset.url);
                if (!links.find((l) => l.url === preset.url)) {
                  onChangeLinks([...links, { url: preset.url, label: parsed.label, platform: parsed.platform }]);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-surface-100 dark:bg-surface-850 border border-surface-300 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-200 dark:hover:bg-surface-700 shadow-warm-sm transition-colors"
            >
              {preset.emoji} {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
