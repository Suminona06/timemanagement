import { useState } from 'react';
import { Check } from 'lucide-react';

/**
 * ColorPicker — Preset palette chips + custom hex color input.
 * Curated with ChronoCraft Warm Lo-Fi Pastels & Earthy Coffee tones.
 *
 * Props:
 *  value     — Currently selected hex color string (e.g. '#C88A58')
 *  onChange  — Callback called with the new hex color string
 *  className — Additional wrapper classes
 */

// Curated preset palette aligned with ChronoCraft Warm Lo-Fi & Pastel System
export const PRESET_COLORS = [
  // ── Matcha & Greens ──
  '#8DA780', '#739066', '#4D6742',
  // ── Dusty Peach & Terracotta ──
  '#E8B4B8', '#D4836A', '#BA5D4F',
  // ── Warm Chai & Caramel Ambers ──
  '#E9D8A6', '#C88A58', '#D4A373',
  // ── Coffee & Espresso Roasts ──
  '#93582A', '#4A2E1B', '#3D2314',
  // ── Muted Lavender & Lilac ──
  '#B8B8D1', '#9F9FC0', '#6D5D6E',
  // ── Soft Sky & Slate Blues ──
  '#A2D2FF', '#73A5D4', '#4A7C9D',
  // ── Linen & Warm Neutral Grays ──
  '#D8CFC4', '#9E9188', '#5E5249',
];

// Validate hex color format (#RGB or #RRGGBB)
export const isValidHex = (hex) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

export default function ColorPicker({ value = '#C88A58', onChange, className = '' }) {
  const [customHex, setCustomHex] = useState(
    !PRESET_COLORS.includes(value) ? value : ''
  );
  const [hexError, setHexError] = useState('');

  // ── Preset chip click ────────────────────────────────────────────────────
  const handlePresetClick = (color) => {
    setCustomHex('');
    setHexError('');
    onChange(color);
  };

  // ── Custom hex input ─────────────────────────────────────────────────────
  const handleCustomChange = (e) => {
    let raw = e.target.value.trim();
    if (raw && !raw.startsWith('#')) raw = '#' + raw;
    setCustomHex(raw);

    if (raw === '' || raw === '#') {
      setHexError('');
      return;
    }
    if (isValidHex(raw)) {
      setHexError('');
      onChange(raw);
    } else {
      setHexError('Enter a valid hex color');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ── Preset chips grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-2">
        {PRESET_COLORS.map((color) => {
          const isSelected = value?.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => handlePresetClick(color)}
              className="relative w-8 h-8 rounded-xl transition-all duration-150
                         hover:scale-110 active:scale-95 shadow-sm
                         focus-visible:ring-2 focus-visible:ring-primary-500
                         focus-visible:ring-offset-2 focus-visible:ring-offset-surface-800"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <Check
                  size={14}
                  className="absolute inset-0 m-auto"
                  style={{ color: '#ffffff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Custom hex input ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {/* Live preview swatch */}
        <div
          className="w-9 h-9 rounded-xl border border-surface-300 dark:border-surface-600 shrink-0 transition-colors shadow-warm-sm"
          style={{ backgroundColor: isValidHex(value) ? value : '#C88A58' }}
          aria-hidden="true"
        />
        <div className="flex-1">
          <input
            type="text"
            value={customHex}
            onChange={handleCustomChange}
            placeholder="#C88A58"
            maxLength={7}
            className={`input font-mono text-xs ${
              hexError ? 'border-danger-500 focus:border-danger-500' : ''
            }`}
            aria-label="Custom hex color"
          />
          {hexError && (
            <p className="mt-0.5 text-[10px] text-danger-400">{hexError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
