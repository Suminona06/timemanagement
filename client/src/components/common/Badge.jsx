/**
 * Badge — Colored pill component for categories, priority levels, and status tags.
 *
 * Props:
 *  label      — Text to display inside the badge
 *  color      — Hex color string used as background (e.g. '#3B82F6')
 *             — If provided, overrides the `variant` prop
 *  variant    — Preset semantic variant: 'default' | 'success' | 'warning' | 'danger' | 'muted'
 *  size       — 'sm' | 'md' (default: 'sm')
 *  dot        — Show a small color dot instead of colored background (good for sidebar)
 *  className  — Additional Tailwind classes
 */

// Compute a readable text color (black or white) based on hex background luminance
function getContrastColor(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  // Relative luminance formula (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1e293b' : '#ffffff';
}

const VARIANT_CLASSES = {
  default: 'bg-primary-500/15 text-primary-400 border border-primary-500/20',
  success: 'bg-success-500/15 text-success-400 border border-success-500/20',
  warning: 'bg-warning-500/15 text-warning-400 border border-warning-500/20',
  danger:  'bg-danger-500/15  text-danger-400  border border-danger-500/20',
  muted:   'bg-surface-700    text-surface-400  border border-surface-600',
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function Badge({
  label,
  color,
  variant = 'default',
  size    = 'sm',
  dot     = false,
  className = '',
}) {
  // ── Dot mode: show colored circle + plain text ────────────────────────────
  if (dot && color) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${SIZE_CLASSES[size]} ${className}`}>
        <span
          className="inline-block rounded-full shrink-0"
          style={{
            width: size === 'sm' ? 8 : 10,
            height: size === 'sm' ? 8 : 10,
            backgroundColor: color,
          }}
        />
        <span className="text-surface-300 truncate">{label}</span>
      </span>
    );
  }

  // ── Custom hex color mode ─────────────────────────────────────────────────
  if (color) {
    const textColor = getContrastColor(color);
    return (
      <span
        className={`badge font-medium ${SIZE_CLASSES[size]} ${className}`}
        style={{ backgroundColor: color + '25', color, borderColor: color + '40', border: '1px solid' }}
      >
        {label}
      </span>
    );
  }

  // ── Variant mode ──────────────────────────────────────────────────────────
  return (
    <span
      className={`badge font-medium ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
