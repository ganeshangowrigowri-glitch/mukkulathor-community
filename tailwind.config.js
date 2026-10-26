/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Heritage maroon (matches society flag). Key stays `navy`.
        navy: {
          50: '#fbeeee',
          100: '#f5d9d9',
          200: '#eab3b3',
          300: '#d97a7a',
          400: '#c14444',
          500: '#a52a2a',
          600: '#8a2323',
          700: '#6e1c1c',
          800: '#551515',
          900: '#3d0f0f',
          950: '#2b0a0a',
        },
        // Antique gold
        gold: {
          50: '#fbf6e9',
          100: '#f4e9c6',
          200: '#e8d28e',
          300: '#dbba5c',
          400: '#cda339',
          500: '#b8862a',
          600: '#9a6c20',
          700: '#7a541b',
          800: '#5e411a',
          900: '#473119',
        },
        // Warm linen surfaces
         linen: {
          50: '#fcf9f3',
          100: '#f4efe6',
          200: '#ebe4d6',
        },
        // Warm neutral greys
        slate: {
          25: '#faf8f4',
          50: '#f6f3ed',
          100: '#ebe7df',
          200: '#ddd7cc',
          300: '#bfb8ab',
          400: '#958d80',
          500: '#6f685d',
          600: '#564f46',
          700: '#433d36',
          800: '#2f2b26',
          900: '#1f1c18',
        },
        // Stitch palette (public pages only)
        royal: {
          maroon: '#8B1E3F',
          'maroon-deep': '#6c0029',
          dark: '#220608',
          gold: '#C89B3C',
          'gold-light': '#E5C378',
          'gold-dark': '#7b5900',
          cream: '#F9F6F0',
          linen: '#F4EFE6',
          surface: '#fcf9f3',
          low: '#f6f3ed',
          mid: '#f0eee8',
          high: '#ebe8e2',
          highest: '#e5e2dc',
          ink: '#1c1c18',
          'ink-soft': '#564145',
          muted: '#64748B',
          emerald: '#15803D',
          rose: '#f1b8b9',
          tertiary: '#4d282a',
        },
      },
      // ---- Stitch "Royal Lineage & Heritage" tokens — used ONLY by public pages ----
      // (new names; the existing navy/gold/linen/slate scales above are untouched)
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Noto Serif Tamil"', 'serif'],
        sans: ['Inter', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        // Stitch typography (public pages only). Noto Tamil kept as the Tamil fallback.
        headline: ['Syne', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'lineage-lines': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%236e1c1c' stroke-opacity='0.06' stroke-width='1.5'%3E%3Cpath d='M80 0v40M80 40 L40 80 M80 40 L120 80 M40 80 V120 M120 80 V120 M40 120 L20 160 M40 120 L60 160 M120 120 L100 160 M120 120 L140 160'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(61,15,15,0.06), 0 1px 3px 0 rgba(61,15,15,0.08)',
        lifted: '0 8px 24px -4px rgba(61,15,15,0.22)',
        'royal-1': '0 4px 20px -2px rgba(34,6,8,0.04), 0 1px 3px 0 rgba(200,155,60,0.08)',
        'royal-2': '0 12px 32px -4px rgba(34,6,8,0.08), 0 2px 6px -1px rgba(200,155,60,0.14)',
        'royal-3': '0 24px 48px -8px rgba(34,6,8,0.16), 0 0 0 1px rgba(200,155,60,0.25)',
      },
      borderRadius: {
        sm2: '6px',
      },
    },
  },
  plugins: [],
}