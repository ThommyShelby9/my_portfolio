/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyan-neon': '#00fff7',
        'cyan-dark': '#0891b2',
        'bg-dark': '#0b0f14',
        'bg-secondary': '#1a1f26',
        'text-primary': '#e4e4e7',
        'text-secondary': '#a1a1aa',
        'border-color': '#27272a',
        'error': '#ef4444',
        'success': '#10b981',
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
  plugins: [],
}
