import { describe, expect, it, beforeEach, vi } from 'vitest'

beforeEach(() => {
  // reset module-level memoization between tests
  vi.resetModules()
})

describe('useWebGLCapability', () => {
  it('returns supported=true when webgl2 context is available', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn((kind: string) => {
      if (kind === 'webgl2') return {} as any
      return null
    }) as any
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true })
    Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true })

    const { useWebGLCapability } = await import('~/composables/useWebGLCapability')
    const cap = useWebGLCapability()
    expect(cap.supported.value).toBe(true)
    expect(cap.lowPerf.value).toBe(false)
  })

  it('falls back to webgl when webgl2 missing', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn((kind: string) => {
      if (kind === 'webgl') return {} as any
      return null
    }) as any
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true })

    const { useWebGLCapability } = await import('~/composables/useWebGLCapability')
    expect(useWebGLCapability().supported.value).toBe(true)
  })

  it('returns supported=false when no webgl context', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any

    const { useWebGLCapability } = await import('~/composables/useWebGLCapability')
    expect(useWebGLCapability().supported.value).toBe(false)
  })

  it('flags lowPerf=true when hardwareConcurrency < 4', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({}) as any) as any
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2, configurable: true })

    const { useWebGLCapability } = await import('~/composables/useWebGLCapability')
    expect(useWebGLCapability().lowPerf.value).toBe(true)
  })
})
