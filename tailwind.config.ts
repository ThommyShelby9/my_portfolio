import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './content/**/*.md',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-raised': 'var(--bg-raised)',
        'bg-overlay': 'var(--bg-overlay)',
        text: 'var(--text)',
        'text-mute': 'var(--text-mute)',
        'text-soft': 'var(--text-soft)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        available: 'var(--available)',
        error: 'var(--error)',
        success: 'var(--success)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing }]
        'display-1': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-2': ['3.5rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'h1': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h2': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h3': ['1.375rem', { lineHeight: '1.3' }],
        'body-l': ['1.125rem', { lineHeight: '1.65' }],
        'body': ['1rem', { lineHeight: '1.65' }],
        'body-s': ['0.875rem', { lineHeight: '1.55' }],
        'mono-s': ['0.75rem', { lineHeight: '1.5' }],
      },
      maxWidth: {
        container: '1200px',
        reading: '720px',
      },
      spacing: {
        section: '6rem',
        'section-lg': '8rem',
        'section-xl': '10rem',
      },
      transitionTimingFunction: {
        'soft-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
