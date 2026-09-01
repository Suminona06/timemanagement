import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ExternalLink,
  X,
  Loader2,
  Link,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import {
  parseMediaUrl,
  MEDIA_PRESETS,
} from '../../../utils/mediaEmbedUtils';
import useAuthStore from '../../../stores/authStore';

// ── Platform icons ────────────────────────────────────────────────────────────
function YouTubeIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function SpotifyIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

/**
 * ExternalMediaEmbed — Compact embedded media player for YouTube and Spotify.
 * Harmonized for light and dark mode.
 *
 * Props:
 *   initialUrl    — Pre-fill the URL input (optional)
 *   onUrlSaved    — Callback(url) when user saves a custom URL
 *   compact       — Render in compact mode (for sidebar/widget use)
 */
export default function ExternalMediaEmbed({ initialUrl = '', onUrlSaved, compact = false }) {
  const { user, updatePreferences } = useAuthStore();
  const savedLinks = user?.preferences?.savedMediaLinks || [];

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [activeEmbed, setActiveEmbed] = useState(null); // { platform, embedUrl, label, sourceUrl }
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const inputRef = useRef(null);

  // Load initialUrl or user's customAmbientUrl on mount
  useEffect(() => {
    const urlToLoad = initialUrl || user?.preferences?.customAmbientUrl;
    if (urlToLoad) {
      loadUrl(urlToLoad);
    }
  }, []);

  // Sync bookmark state when activeEmbed changes
  useEffect(() => {
    if (activeEmbed) {
      const exists = savedLinks.some((l) => l.url === activeEmbed.sourceUrl);
      setIsBookmarked(exists);
    }
  }, [activeEmbed, savedLinks]);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (showInput) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showInput]);

  const loadUrl = useCallback((url) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const result = parseMediaUrl(trimmed);

    if (!result.embedUrl) {
      setInputError('Could not detect YouTube or Spotify URL. Please check the link.');
      return;
    }

    setInputError('');
    setIsLoading(true);
    setIframeReady(false);
    setActiveEmbed({ ...result, sourceUrl: trimmed });
    setShowInput(false);
    setIsExpanded(true);

    if (onUrlSaved) onUrlSaved(trimmed);
  }, [onUrlSaved]);

  const handleToggleBookmark = async () => {
    if (!activeEmbed) return;
    try {
      let updated;
      if (isBookmarked) {
        updated = savedLinks.filter((l) => l.url !== activeEmbed.sourceUrl);
      } else {
        updated = [
          ...savedLinks,
          {
            url: activeEmbed.sourceUrl,
            label: activeEmbed.label,
            platform: activeEmbed.platform,
          },
        ];
      }
      await updatePreferences({ savedMediaLinks: updated });
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    loadUrl(inputUrl);
  };

  const handlePresetClick = (preset) => {
    setInputUrl(preset.url);
    loadUrl(preset.url);
  };

  const handleClose = () => {
    setActiveEmbed(null);
    setIsLoading(false);
    setIframeReady(false);
    setInputUrl('');
  };

  const PlatformIcon = activeEmbed?.platform === 'spotify' ? SpotifyIcon : YouTubeIcon;
  const platformColor = activeEmbed?.platform === 'spotify' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const platformBg = activeEmbed?.platform === 'spotify' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30';

  return (
    <div className={`w-full rounded-3xl border transition-all duration-200 shadow-warm-sm ${
      isExpanded
        ? 'bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-700 shadow-warm-md'
        : 'bg-surface-50/80 dark:bg-surface-800/50 border-surface-300 dark:border-surface-700/50'
    }`}>
      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => !activeEmbed && setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-red-500"><YouTubeIcon size={14} /></span>
            <span className="text-green-500"><SpotifyIcon size={14} /></span>
          </div>
          <div>
            <p className="text-xs font-bold text-surface-800 dark:text-surface-200">
              External Music
              {activeEmbed && (
                <span className={`ml-2 font-semibold ${platformColor}`}>
                  {activeEmbed.platform === 'youtube' ? '▶ YouTube' : '♫ Spotify'}
                </span>
              )}
            </p>
            {!activeEmbed && !isExpanded && (
              <p className="text-[10px] text-surface-500">YouTube & Spotify embeds</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeEmbed ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] text-danger-600 dark:text-danger-400 bg-danger-500/10 hover:bg-danger-500/20 border border-danger-500/30 font-bold transition-colors"
            >
              <X size={11} /> Close
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded((v) => !v); }}
              className="text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Active embed iframe ──────────────────────────────────────────── */}
      {activeEmbed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Source label */}
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-[11px] font-semibold ${platformBg} ${platformColor}`}>
            <PlatformIcon size={12} />
            <span className="truncate flex-1 font-mono">{activeEmbed.label}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleToggleBookmark(); }}
              className={`p-1 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-pastel-chai-dark dark:text-pastel-chai hover:opacity-80'
                  : 'text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
              }`}
              title={isBookmarked ? 'Remove from Saved Stations' : 'Bookmark to My Saved Stations'}
            >
              {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
            <a
              href={activeEmbed.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 opacity-70 hover:opacity-100 p-1"
              title="Open in new tab"
            >
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Responsive iframe container */}
          <div className="relative rounded-2xl overflow-hidden bg-black shadow-warm-sm">
            {/* Loading skeleton */}
            {!iframeReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-100 dark:bg-surface-900 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={22} className="animate-spin text-primary-500" />
                  <p className="text-[10px] text-surface-500 font-medium">Loading player…</p>
                </div>
              </div>
            )}

            {activeEmbed.platform === 'youtube' ? (
              <iframe
                src={activeEmbed.embedUrl}
                title="YouTube Music Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full"
                style={{ height: compact ? '140px' : '200px' }}
                onLoad={() => setIframeReady(true)}
              />
            ) : (
              <iframe
                src={activeEmbed.embedUrl}
                title="Spotify Music Player"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full rounded-2xl"
                style={{ height: compact ? '152px' : '200px' }}
                onLoad={() => setIframeReady(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Expanded panel (no active embed) ────────────────────────────── */}
      {isExpanded && !activeEmbed && (
        <div className="px-4 pb-4 space-y-4 border-t border-surface-200 dark:border-surface-700/50 pt-3">

          {/* Custom URL Input */}
          {showInput ? (
            <form onSubmit={handleInputSubmit} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    ref={inputRef}
                    type="url"
                    value={inputUrl}
                    onChange={(e) => { setInputUrl(e.target.value); setInputError(''); }}
                    placeholder="Paste YouTube or Spotify URL…"
                    className="input pl-8 text-xs shadow-warm-sm"
                  />
                </div>
                <button type="submit" className="btn-primary px-3.5 py-2 text-xs gap-1.5 shadow-warm-sm">
                  <Check size={13} /> Load
                </button>
                <button
                  type="button"
                  onClick={() => { setShowInput(false); setInputError(''); setInputUrl(''); }}
                  className="btn-ghost px-3 py-2 text-xs"
                >
                  <X size={13} />
                </button>
              </div>

              {inputError && (
                <div className="flex items-center gap-1.5 text-[11px] text-danger-500 font-medium">
                  <AlertCircle size={12} />
                  {inputError}
                </div>
              )}

              <p className="text-[10px] text-surface-500">
                Supports youtube.com, youtu.be, open.spotify.com — any playlist, track, album, or live stream.
              </p>
            </form>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-dashed border-surface-300 dark:border-surface-600 text-surface-500 text-xs hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/5 transition-all"
            >
              <Link size={13} />
              Paste custom YouTube or Spotify URL…
            </button>
          )}

          {/* My Saved Stations (if any) */}
          {savedLinks.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark size={11} />
                My Saved Stations
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {savedLinks.map((saved, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputUrl(saved.url);
                      loadUrl(saved.url);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-surface-100 dark:bg-surface-850 border border-primary-500/30 hover:bg-surface-200 dark:hover:bg-surface-700 text-left transition-all group shadow-warm-sm"
                  >
                    <span className="text-base shrink-0">
                      {saved.platform === 'spotify' ? '🎧' : '📺'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-surface-800 dark:text-surface-200 truncate">{saved.label || saved.url}</span>
                        <span className={`shrink-0 ${saved.platform === 'spotify' ? 'text-green-500' : 'text-red-500'}`}>
                          {saved.platform === 'spotify' ? <SpotifyIcon size={10} /> : <YouTubeIcon size={10} />}
                        </span>
                      </div>
                      <p className="text-[10px] text-surface-500 truncate leading-tight">{saved.url}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preset Grid */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={11} />
              Popular Stations
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              {MEDIA_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-surface-100 dark:bg-surface-850 border border-surface-200 dark:border-surface-700/50 hover:bg-surface-200 dark:hover:bg-surface-700 text-left transition-all group shadow-warm-sm"
                >
                  <span className="text-base shrink-0">{preset.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-surface-800 dark:text-surface-200 truncate">{preset.label}</span>
                      <span className={`shrink-0 ${preset.platform === 'spotify' ? 'text-green-500' : 'text-red-500'}`}>
                        {preset.platform === 'spotify' ? <SpotifyIcon size={10} /> : <YouTubeIcon size={10} />}
                      </span>
                    </div>
                    <p className="text-[10px] text-surface-500 truncate leading-tight">{preset.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
