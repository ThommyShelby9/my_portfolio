/**
 * useTheme Composable
 * Manages theme switching and persistence
 */

import { ref, watch } from 'vue'
import { useTerminalStore } from '@/stores/terminal'

export interface ThemeColors {
  bg: string
  bgSecondary: string
  text: string
  textSecondary: string
  accent: string
  accentDark: string
  border: string
  error: string
  success: string
  warning: string
}

export interface Theme {
  name: string
  displayName: string
  colors: ThemeColors
  font: string
}

export const themes: Record<string, Theme> = {
  cyan: {
    name: 'cyan',
    displayName: 'Cyan Neon',
    colors: {
      bg: '#0b0f14',
      bgSecondary: '#151b23',
      text: '#e4e4e7',
      textSecondary: '#a1a1aa',
      accent: '#00fff7',
      accentDark: '#0891b2',
      border: '#27272a',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b'
    },
    font: 'JetBrains Mono, monospace'
  },

  amber: {
    name: 'amber',
    displayName: 'Amber CRT',
    colors: {
      bg: '#1a1108',
      bgSecondary: '#2d1f0f',
      text: '#ffb86c',
      textSecondary: '#9d7a4a',
      accent: '#ff9500',
      accentDark: '#cc7700',
      border: '#3d2f1f',
      error: '#ff5555',
      success: '#50fa7b',
      warning: '#f1fa8c'
    },
    font: 'JetBrains Mono, monospace'
  },

  green: {
    name: 'green',
    displayName: 'Matrix Green',
    colors: {
      bg: '#0d1117',
      bgSecondary: '#161b22',
      text: '#00ff00',
      textSecondary: '#00aa00',
      accent: '#00ff00',
      accentDark: '#00cc00',
      border: '#1f2937',
      error: '#ff0000',
      success: '#00ff00',
      warning: '#ffff00'
    },
    font: 'JetBrains Mono, monospace'
  },

  mono: {
    name: 'mono',
    displayName: 'Monochrome',
    colors: {
      bg: '#000000',
      bgSecondary: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#a3a3a3',
      accent: '#ffffff',
      accentDark: '#d4d4d4',
      border: '#333333',
      error: '#ffffff',
      success: '#ffffff',
      warning: '#ffffff'
    },
    font: 'JetBrains Mono, monospace'
  }
}

/**
 * Apply theme to DOM by setting CSS variables
 */
export function applyThemeToDom(theme: Theme) {
  const root = document.documentElement

  // Apply color variables
  root.style.setProperty('--color-bg', theme.colors.bg)
  root.style.setProperty('--color-bg-secondary', theme.colors.bgSecondary)
  root.style.setProperty('--color-text', theme.colors.text)
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
  root.style.setProperty('--color-accent', theme.colors.accent)
  root.style.setProperty('--color-accent-dark', theme.colors.accentDark)
  root.style.setProperty('--color-border', theme.colors.border)
  root.style.setProperty('--color-error', theme.colors.error)
  root.style.setProperty('--color-success', theme.colors.success)
  root.style.setProperty('--color-warning', theme.colors.warning)

  // Apply font
  root.style.setProperty('--font-mono', theme.font)
}

/**
 * Get theme by name
 */
export function getTheme(name: string): Theme | null {
  return themes[name] || null
}

/**
 * Get all available theme names
 */
export function getThemeNames(): string[] {
  return Object.keys(themes)
}

/**
 * Theme composable
 */
export function useTheme() {
  const store = useTerminalStore()
  const currentTheme = ref<Theme>(themes[store.theme])

  /**
   * Set theme by name
   */
  function setTheme(name: string): boolean {
    const theme = getTheme(name)

    if (!theme) {
      return false
    }

    currentTheme.value = theme
    applyThemeToDom(theme)
    store.setTheme(name)

    return true
  }

  /**
   * Initialize theme from store
   */
  function initTheme() {
    const theme = getTheme(store.theme)
    if (theme) {
      currentTheme.value = theme
      applyThemeToDom(theme)
    }
  }

  // Watch for theme changes from store
  watch(() => store.theme, (newTheme) => {
    const theme = getTheme(newTheme)
    if (theme) {
      currentTheme.value = theme
      applyThemeToDom(theme)
    }
  })

  return {
    currentTheme,
    setTheme,
    initTheme,
    themes,
    getTheme,
    getThemeNames
  }
}
