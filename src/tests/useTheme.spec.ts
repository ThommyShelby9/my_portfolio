/**
 * useTheme Composable Tests
 * Tests for theme management system
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { themes, getTheme, getThemeNames, applyThemeToDom } from '@/composables/useTheme'

describe('themes', () => {
  it('should have 4 themes defined', () => {
    expect(Object.keys(themes)).toHaveLength(4)
  })

  it('should include cyan theme', () => {
    expect(themes).toHaveProperty('cyan')
    expect(themes.cyan.name).toBe('cyan')
    expect(themes.cyan.displayName).toBe('Cyan Neon')
  })

  it('should include amber theme', () => {
    expect(themes).toHaveProperty('amber')
    expect(themes.amber.name).toBe('amber')
    expect(themes.amber.displayName).toBe('Amber CRT')
  })

  it('should include green theme', () => {
    expect(themes).toHaveProperty('green')
    expect(themes.green.name).toBe('green')
    expect(themes.green.displayName).toBe('Matrix Green')
  })

  it('should include mono theme', () => {
    expect(themes).toHaveProperty('mono')
    expect(themes.mono.name).toBe('mono')
    expect(themes.mono.displayName).toBe('Monochrome')
  })

  it('each theme should have required colors', () => {
    const requiredColors = [
      'bg', 'bgSecondary', 'text', 'textSecondary',
      'accent', 'accentDark', 'border', 'error', 'success', 'warning'
    ]

    Object.values(themes).forEach(theme => {
      requiredColors.forEach(color => {
        expect(theme.colors).toHaveProperty(color)
        expect(typeof theme.colors[color as keyof typeof theme.colors]).toBe('string')
      })
    })
  })

  it('each theme should have font property', () => {
    Object.values(themes).forEach(theme => {
      expect(theme).toHaveProperty('font')
      expect(typeof theme.font).toBe('string')
    })
  })
})

describe('getTheme', () => {
  it('should return cyan theme', () => {
    const theme = getTheme('cyan')

    expect(theme).not.toBeNull()
    expect(theme?.name).toBe('cyan')
  })

  it('should return amber theme', () => {
    const theme = getTheme('amber')

    expect(theme).not.toBeNull()
    expect(theme?.name).toBe('amber')
  })

  it('should return null for invalid theme', () => {
    const theme = getTheme('invalid')

    expect(theme).toBeNull()
  })

  it('should return null for empty string', () => {
    const theme = getTheme('')

    expect(theme).toBeNull()
  })

  it('should be case sensitive', () => {
    const theme = getTheme('CYAN')

    expect(theme).toBeNull()
  })
})

describe('getThemeNames', () => {
  it('should return array of 4 theme names', () => {
    const names = getThemeNames()

    expect(names).toHaveLength(4)
    expect(Array.isArray(names)).toBe(true)
  })

  it('should include all theme names', () => {
    const names = getThemeNames()

    expect(names).toContain('cyan')
    expect(names).toContain('amber')
    expect(names).toContain('green')
    expect(names).toContain('mono')
  })
})

describe('applyThemeToDom', () => {
  beforeEach(() => {
    // Reset document root styles before each test
    document.documentElement.style.cssText = ''
  })

  it('should set CSS variables on document root', () => {
    const theme = themes.cyan

    applyThemeToDom(theme)

    const rootStyle = document.documentElement.style

    expect(rootStyle.getPropertyValue('--color-bg')).toBe(theme.colors.bg)
    expect(rootStyle.getPropertyValue('--color-accent')).toBe(theme.colors.accent)
  })

  it('should set all color variables', () => {
    const theme = themes.amber

    applyThemeToDom(theme)

    const rootStyle = document.documentElement.style

    expect(rootStyle.getPropertyValue('--color-bg')).toBe(theme.colors.bg)
    expect(rootStyle.getPropertyValue('--color-bg-secondary')).toBe(theme.colors.bgSecondary)
    expect(rootStyle.getPropertyValue('--color-text')).toBe(theme.colors.text)
    expect(rootStyle.getPropertyValue('--color-text-secondary')).toBe(theme.colors.textSecondary)
    expect(rootStyle.getPropertyValue('--color-accent')).toBe(theme.colors.accent)
    expect(rootStyle.getPropertyValue('--color-accent-dark')).toBe(theme.colors.accentDark)
    expect(rootStyle.getPropertyValue('--color-border')).toBe(theme.colors.border)
    expect(rootStyle.getPropertyValue('--color-error')).toBe(theme.colors.error)
    expect(rootStyle.getPropertyValue('--color-success')).toBe(theme.colors.success)
    expect(rootStyle.getPropertyValue('--color-warning')).toBe(theme.colors.warning)
  })

  it('should set font variable', () => {
    const theme = themes.mono

    applyThemeToDom(theme)

    const rootStyle = document.documentElement.style

    expect(rootStyle.getPropertyValue('--font-mono')).toBe(theme.font)
  })

  it('should update theme when called multiple times', () => {
    applyThemeToDom(themes.cyan)
    let rootStyle = document.documentElement.style
    expect(rootStyle.getPropertyValue('--color-accent')).toBe(themes.cyan.colors.accent)

    applyThemeToDom(themes.green)
    rootStyle = document.documentElement.style
    expect(rootStyle.getPropertyValue('--color-accent')).toBe(themes.green.colors.accent)
  })
})
