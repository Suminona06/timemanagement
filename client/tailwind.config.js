/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode (toggled by adding `dark` to <html>)
  darkMode: 'class',

  // Scan all React source files for class names
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      // ── Primary Accent Colour ─────────────────────────────────────────────
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',   // Brand primary
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // ── Dark-mode surface palette (slate / zinc) ──────────────────────
        surface: {
          900: '#0f172a',   // page background
          800: '#1e293b',   // card / sidebar background
          700: '#334155',   // elevated surface
          600: '#475569',   // borders / dividers
          500: '#64748b',   // muted text
          400: '#94a3b8',   // secondary text
          300: '#cbd5e1',   // body text (dark mode)
          200: '#e2e8f0',   // headings (dark mode)
          100: '#f1f5f9',   // page bg (light mode)
          50:  '#f8fafc',   // card bg (light mode)
        },

        // ── Semantic status colours ───────────────────────────────────────
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },

      // ── Custom font stack ─────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ── Extra border radius ───────────────────────────────────────────────
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      // ── Animation for timer ring / progress elements ──────────────────────
      animation: {
        'spin-slow':   'spin 3s linear infinite',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.2s ease-in-out',
        'slide-up':    'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },

  plugins: [],
};
