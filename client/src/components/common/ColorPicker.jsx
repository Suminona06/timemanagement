import { useState } from 'react';
import { Check } from 'lucide-react';

/**
 * ColorPicker — Preset palette chips + custom hex color input.
 *
 * Props:
 *  value     — Currently selected hex color string (e.g. '#3B82F6')
 *  onChange  — Callback called with the new hex color string
 *  className — Additional wrapper classes
 */

// Curated preset palette covering the full spectrum
const PRESET_COLORS = [
  // Blues
  '#3B82F6', '#2563EB', '#1D4ED8',
  // Purples / Indigo
  '#8B5CF6', '#7C3AED', '#6366F1',
  // Pinks / Rose
  '#EC4899', '#F43F5E', '#E11D48',
  // Reds / Orange
  '#EF4444', '#F97316', '#F59E0B',
  // Yellows / Lime
  '#EAB308', '#84CC16', '#22C55E',
  // Greens / Teal
  '#10B981', '#14B8A6', '#06B6D4',
  // Grays
  '#64748B', '#94A3B8', '#475569',
];

// Validate hex color format (#RGB or #RRGGBB)
const isValidHex = (hex) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

export default function ColorPicker({ value = '#3B82F6', onChange, className = '' }) {
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
      <div className="grid grid-cols-9 gap-1.5">
        {PRESET_COLORS.map((color) => {
          const isSelected = value?.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => handlePresetClick(color)}
              className="relative w-7 h-7 rounded-md transition-transform
                         hover:scale-110 active:scale-95 focus-visible:ring-2
                         focus-visible:ring-white focus-visible:ring-offset-2
                         focus-visible:ring-offset-surface-800"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <Check
                  size={12}
                  className="absolute inset-0 m-auto"
                  style={{ color: '#ffffff', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Custom hex input ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Live preview swatch */}
        <div
          className="w-8 h-8 rounded-md border border-surface-600 shrink-0 transition-colors"
          style={{ backgroundColor: isValidHex(value) ? value : '#475569' }}
          aria-hidden="true"
        />
        <div className="flex-1">
          <input
            type="text"
            value={customHex}
            onChange={handleCustomChange}
            placeholder="#RRGGBB"
            maxLength={7}
            className={`input font-mono text-sm ${
              hexError ? 'border-danger-500 focus:border-danger-500' : ''
            }`}
            aria-label="Custom hex color"
          />
          {hexError && (
            <p className="mt-0.5 text-xs text-danger-400">{hexError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
