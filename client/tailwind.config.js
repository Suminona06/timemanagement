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
      // ── ChronoCraft Brand Colors ───────────────────────────────────────────
      colors: {
        // ── Brand Primary: Caramel Amber & Coffee Gold ───────────────────────
        primary: {
          50:  '#FDF8F3',
          100: '#F9EDE0',
          200: '#F3D9C1',
          300: '#E9BF9A',
          400: '#DCA476',
          500: '#C88A58',   // Brand Primary: Warm Caramel Amber
          600: '#B47240',
          700: '#93582A',   // Rich Amber Sand
          800: '#764320',
          900: '#4A2E1B',   // Deep Roast Coffee
          950: '#3D2314',   // Espresso
        },

        // ── Lo-Fi Surface Palette (Warm Latte / Espresso Studio) ──────────────
        surface: {
          50:  '#FFFFFF',   // Pure Light Card
          100: '#FAF7F2',   // Light Mode Canvas: Warm Latte / Milk Foam
          200: '#F4EBE1',   // Soft Linen / Card Secondary
          300: '#E8DFD8',   // Warm Border (Light Mode)
          400: '#9E9188',   // Muted Secondary Text
          500: '#786B61',   // Warm Muted Umber
          600: '#3D3530',   // Dark Border / Divider
          700: '#2E2724',   // Dark Mode Elevated Surface / Input
          800: '#25201D',   // Dark Mode Card / Sidebar
          850: '#1F1A17',   // Dark Mode Sub-Surface
          900: '#191614',   // Dark Mode Canvas: Deep Espresso Charcoal
          950: '#13100E',   // Deepest Midnight Tone
        },

        // ── Authentic Coffee & Roast Tones ───────────────────────────────────
        coffee: {
          latte:   '#FAF7F2',
          linen:   '#F4EBE1',
          cream:   '#F7F2EC',
          amber:   '#D4A373',
          caramel: '#C88A58',
          roast:   '#4A2E1B',
          espresso:'#3D2314',
          charcoal:'#191614',
        },

        // ── Mindful Lo-Fi Pastel Accents (PRD 2.2) ───────────────────────────
        pastel: {
          matcha: {
            light:   '#D8E2DC',
            DEFAULT: '#8DA780',
            dark:    '#6B8560',
          },
          peach: {
            light:   '#F8EDEB',
            DEFAULT: '#E8B4B8',
            dark:    '#C7888D',
          },
          chai: {
            light:   '#FAEDCD',
            DEFAULT: '#E9D8A6',
            dark:    '#C5B072',
          },
          lavender: {
            light:   '#E8E8F4',
            DEFAULT: '#B8B8D1',
            dark:    '#8E8EA8',
          },
          sky: {
            light:   '#EDF6F9',
            DEFAULT: '#A2D2FF',
            dark:    '#73A5D4',
          },
        },

        // ── Semantic status colours (Warm Lo-Fi Tuned) ──────────────────────
        success: {
          50:  '#F4F7F2',
          100: '#E6EEE2',
          200: '#D1DFC9',
          300: '#B3CAAA',
          400: '#8DA780',   // Matcha Green
          500: '#759468',
          600: '#5C7A50',
          700: '#46603C',
          800: '#32472B',
          900: '#21301D',
        },
        warning: {
          50:  '#FDFBF5',
          100: '#FAF5E8',
          200: '#F4E9CE',
          300: '#ECD9AC',
          400: '#E9D8A6',   // Warm Chai Amber
          500: '#D4BC78',
          600: '#B29853',
          700: '#8E773B',
          800: '#695729',
          900: '#483B1A',
        },
        danger: {
          50:  '#FDF6F6',
          100: '#FBEDED',
          200: '#F5D7D9',
          300: '#ECB9BD',
          400: '#E8B4B8',   // Dusty Peach
          500: '#D88A90',
          600: '#BA666D',
          700: '#9B4B52',
          800: '#7B353B',
          900: '#582126',
        },
      },

      // ── Custom Font Stack ──────────────────────────────────────────────────
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },

      // ── Extra Border Radius for Tactile Cozy Feel ──────────────────────────
      borderRadius: {
        xl:   '0.75rem',
        '2xl':'1rem',
        '3xl':'1.5rem',
        '4xl':'2rem',
      },

      // ── Tactile Box Shadows ────────────────────────────────────────────────
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(45, 30, 18, 0.05)',
        'warm-md': '0 4px 12px -2px rgba(45, 30, 18, 0.08), 0 2px 6px -1px rgba(45, 30, 18, 0.04)',
        'warm-lg': '0 10px 25px -3px rgba(45, 30, 18, 0.12), 0 4px 10px -2px rgba(45, 30, 18, 0.06)',
        'dark-warm': '0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(200, 138, 88, 0.05)',
      },

      // ── Animations ─────────────────────────────────────────────────────────
      animation: {
        'spin-slow':   'spin 3s linear infinite',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.25s ease-out',
        'slide-up':    'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
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
