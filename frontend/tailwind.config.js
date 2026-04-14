/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif:  ['"Playfair Display"', 'Georgia', 'serif'],
        sans:   ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:   ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0f0f0f',
          50: '#f7f7f7',
          100: '#e8e8e8',
          200: '#c8c8c8',
          300: '#a8a8a8',
          400: '#8c8c8c',
          500: '#6b6b6b',
          600: '#525252',
          700: '#404040',
          800: '#1a1a1a',
          900: '#0f0f0f',
        },
        amber: { DEFAULT: '#d97706', 50: '#fffbeb', 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
        sage:  { DEFAULT: '#4a7c59', 50: '#f2f7f4', 100: '#d8eade', 500: '#4a7c59', 700: '#2d5c3e' },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            fontFamily: theme('fontFamily.sans').join(', '),
            color: theme('colors.ink.800'),
            a: { color: theme('colors.amber.600'), '&:hover': { color: theme('colors.amber.700') } },
            h1: { fontFamily: theme('fontFamily.serif').join(', ') },
            h2: { fontFamily: theme('fontFamily.serif').join(', ') },
            h3: { fontFamily: theme('fontFamily.serif').join(', ') },
          },
        },
      }),
    },
  },
  plugins: [],
};
