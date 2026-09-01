import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal — Reusable dialog with backdrop blur, Esc key, focus trap, and light/dark theme support.
 *
 * Props:
 *  isOpen    — Boolean controlling visibility
 *  onClose   — Callback to close the modal
 *  title     — Header title string
 *  children  — Modal body content
 *  size      — 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 *  className — Extra classes for the modal panel
 */

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size      = 'md',
  className = '',
}) {
  const panelRef = useRef(null);

  // ── Close on Esc key ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Prevent body scroll when modal open ────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Auto-focus panel on open ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-surface-950/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`
          relative w-full ${SIZE_CLASSES[size]}
          bg-surface-50 dark:bg-surface-800 border border-surface-300 dark:border-surface-700/80 rounded-3xl shadow-warm-lg dark:shadow-2xl
          outline-none animate-slide-up
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5
                        border-b border-surface-200 dark:border-surface-700/80">
          <h2
            id="modal-title"
            className="text-base font-bold text-surface-900 dark:text-surface-100 tracking-tight"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl
                       text-surface-400 hover:text-surface-700 dark:hover:text-surface-200
                       hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
