/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Heritage maroon — primary brand color (matches society flag)
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
        // Muted antique gold — accent for lineage / status / honors
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
        // Neutral greys used for surfaces & text
        slate: {
          25: '#f8f9fa',
          50: '#f4f5f7',
          100: '#e9ebee',
          200: '#d6dadf',
          300: '#b6bcc4',
          400: '#8b939e',
          500: '#697180',
          600: '#525a68',
          700: '#3f4552',
          800: '#2c313b',
          900: '#1b1f26',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'lineage-lines': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cg fill='none' stroke='%231f4d73' stroke-opacity='0.06' stroke-width='1.5'%3E%3Cpath d='M80 0v40M80 40 L40 80 M80 40 L120 80 M40 80 V120 M120 80 V120 M40 120 L20 160 M40 120 L60 160 M120 120 L100 160 M120 120 L140 160'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(13,34,54,0.06), 0 1px 3px 0 rgba(13,34,54,0.08)',
        lifted: '0 4px 14px -2px rgba(13,34,54,0.12)',
      },
      borderRadius: {
        sm2: '6px',
      },
    },
  },
  plugins: [],
}
