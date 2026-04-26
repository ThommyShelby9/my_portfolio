/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic theme colors using CSS variables
        'cyan-neon': 'var(--color-accent)',
        'cyan-dark': 'var(--color-accent-dark)',
        'bg-dark': 'var(--color-bg)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'text-primary': 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'border-color': 'var(--color-border)',
        'error': 'var(--color-error)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      animation: {
        'scanlines': 'scanlines 8s linear infinite',
      },
      keyframes: {
        scanlines: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.bg-theme-primary': {
          'background-color': 'var(--color-bg)',
        },
        '.bg-theme-secondary': {
          'background-color': 'var(--color-bg-secondary)',
        },
        '.bg-theme-accent': {
          'background-color': 'var(--color-accent)',
        },
        '.bg-theme-accent-dark': {
          'background-color': 'var(--color-accent-dark)',
        },
        '.text-theme-primary': {
          'color': 'var(--color-text)',
        },
        '.text-theme-secondary': {
          'color': 'var(--color-text-secondary)',
        },
        '.text-theme-accent': {
          'color': 'var(--color-accent)',
        },
        '.text-theme-accent-dark': {
          'color': 'var(--color-accent-dark)',
        },
        '.border-theme': {
          'border-color': 'var(--color-border)',
        },
        '.border-theme-accent': {
          'border-color': 'var(--color-accent)',
        },
        '.caret-theme-accent': {
          'caret-color': 'var(--color-accent)',
        },
      })
    }
  ],
}
