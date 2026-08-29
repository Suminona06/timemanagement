/**
 * mediaEmbedUtils.js — URL parser and formatter for YouTube and Spotify embeds.
 *
 * Supported YouTube URL formats:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/live/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://youtube.com/shorts/VIDEO_ID
 *
 * Supported Spotify URL formats:
 *   - https://open.spotify.com/track/ID
 *   - https://open.spotify.com/album/ID
 *   - https://open.spotify.com/playlist/ID
 *   - https://open.spotify.com/artist/ID
 */

// ── YouTube ──────────────────────────────────────────────────────────────────

const YT_REGEX = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
];

/**
 * Extract YouTube video ID from any supported URL.
 * @param {string} url
 * @returns {string|null} 11-char video ID or null
 */
export function extractYouTubeId(url) {
  if (!url) return null;
  for (const re of YT_REGEX) {
    const match = url.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Build a YouTube embed URL from a video ID.
 * Params: autoplay=1, no cookie domain, rel=0 (no unrelated suggestions).
 * @param {string} videoId
 * @returns {string}
 */
export function buildYouTubeEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

/**
 * Check if a URL is a YouTube URL.
 * @param {string} url
 * @returns {boolean}
 */
export function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

// ── Spotify ───────────────────────────────────────────────────────────────────

const SPOTIFY_REGEX = /open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/;

/**
 * Parse a Spotify URL into its type and ID.
 * @param {string} url
 * @returns {{ type: string, id: string } | null}
 */
export function parseSpotifyUrl(url) {
  if (!url) return null;
  const match = url.match(SPOTIFY_REGEX);
  if (!match) return null;
  return { type: match[1], id: match[2] };
}

/**
 * Build a Spotify embed URL from a parsed Spotify object.
 * @param {{ type: string, id: string }} spotify
 * @returns {string}
 */
export function buildSpotifyEmbedUrl({ type, id }) {
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
}

/**
 * Check if a URL is a Spotify URL.
 * @param {string} url
 * @returns {boolean}
 */
export function isSpotifyUrl(url) {
  return /open\.spotify\.com/.test(url);
}

// ── Unified Parser ───────────────────────────────────────────────────────────

/**
 * Parse any media URL into a normalized embed descriptor.
 * @param {string} url
 * @returns {{ platform: 'youtube'|'spotify'|null, embedUrl: string|null, label: string }}
 */
export function parseMediaUrl(url) {
  if (!url) return { platform: null, embedUrl: null, label: '' };

  if (isYouTubeUrl(url)) {
    const id = extractYouTubeId(url);
    if (id) {
      return {
        platform: 'youtube',
        embedUrl: buildYouTubeEmbedUrl(id),
        label: `YouTube — ${id}`,
      };
    }
  }

  if (isSpotifyUrl(url)) {
    const parsed = parseSpotifyUrl(url);
    if (parsed) {
      return {
        platform: 'spotify',
        embedUrl: buildSpotifyEmbedUrl(parsed),
        label: `Spotify ${parsed.type} — ${parsed.id}`,
      };
    }
  }

  return { platform: null, embedUrl: null, label: '' };
}

// ── Popular Presets ───────────────────────────────────────────────────────────

/**
 * Curated list of popular ambient/study music presets.
 * Each entry has: key, label, emoji, url, platform, description.
 */
export const MEDIA_PRESETS = [
  {
    key: 'lofi_girl',
    label: 'Lofi Girl',
    emoji: '👧',
    description: '24/7 lofi hip hop radio — beats to relax/study to',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    platform: 'youtube',
  },
  {
    key: 'chillhop',
    label: 'Chillhop Radio',
    emoji: '🐾',
    description: '24/7 chillhop & lofi hip hop music',
    url: 'https://www.youtube.com/watch?v=5yx6BWlEVcY',
    platform: 'youtube',
  },
  {
    key: 'dark_screen',
    label: 'Study Dark Screen',
    emoji: '🖤',
    description: 'Dark screen lofi study music for deep focus',
    url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    platform: 'youtube',
  },
  {
    key: 'jazz_cafe',
    label: 'Jazz Café',
    emoji: '🎷',
    description: 'Relaxing jazz for work and study',
    url: 'https://www.youtube.com/watch?v=NEqS_eflwGE',
    platform: 'youtube',
  },
  {
    key: 'spotify_focus',
    label: 'Deep Focus',
    emoji: '🧠',
    description: 'Spotify Deep Focus playlist — music for concentration',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
    platform: 'spotify',
  },
  {
    key: 'spotify_piano',
    label: 'Peaceful Piano',
    emoji: '🎹',
    description: 'Spotify Peaceful Piano — relax and indulge',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    platform: 'spotify',
  },
];

/**
 * Resolve a preset key to its embed descriptor.
 * @param {string} key — One of MEDIA_PRESETS[].key
 * @returns {{ platform, embedUrl, label } | null}
 */
export function resolvePreset(key) {
  const preset = MEDIA_PRESETS.find((p) => p.key === key);
  if (!preset) return null;
  return parseMediaUrl(preset.url);
}
