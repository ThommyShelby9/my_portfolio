import { describe, it, expect } from 'vitest'

import { resolveTheme } from '../../composables/useTheme'

describe('resolveTheme', () => {
  it('returns dark when mode is dark', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('dark', true)).toBe('dark')
  })

  it('returns light when mode is light', () => {
    expect(resolveTheme('light', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
  })

  it('returns the system preference when mode is auto', () => {
    expect(resolveTheme('auto', true)).toBe('dark')
    expect(resolveTheme('auto', false)).toBe('light')
  })

  it('defaults to dark for any unknown mode', () => {
    // @ts-expect-error testing runtime fallback
    expect(resolveTheme('something', true)).toBe('dark')
    // @ts-expect-error
    expect(resolveTheme('something', false)).toBe('dark')
  })
})
