import { useEffect } from 'react';

/**
 * useKeyboardShortcuts — Global keyboard shortcuts listener for power-user productivity.
 *
 * Shortcuts:
 *  - Ctrl+K / Cmd+K : Open Command Palette / Quick Search
 *  - Space          : Toggle Timer play/pause (when not focused on form input)
 *  - Esc            : Close open modals / palette
 *
 * @param {object} handlers
 * @param {Function} [handlers.onToggleCommandPalette]
 * @param {Function} [handlers.onToggleTimer]
 * @param {Function} [handlers.onEscape]
 */
export function useKeyboardShortcuts({
  onToggleCommandPalette,
  onToggleTimer,
  onEscape,
} = {}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInputActive =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) ||
        document.activeElement?.isContentEditable;

      // ── 1. Ctrl+K or Cmd+K: Command Palette ──────────────────────────────
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onToggleCommandPalette) {
          onToggleCommandPalette();
        }
        return;
      }

      // ── 2. Esc: Close active modals ───────────────────────────────────────
      if (e.key === 'Escape') {
        if (onEscape) {
          onEscape();
        }
        return;
      }

      // ── 3. Space: Toggle Play/Pause Timer (only when NOT typing in an input) ─
      if (e.code === 'Space' && !isInputActive) {
        // Prevent page scroll on spacebar press
        e.preventDefault();
        if (onToggleTimer) {
          onToggleTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCommandPalette, onToggleTimer, onEscape]);
}

export default useKeyboardShortcuts;
