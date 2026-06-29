import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSpaceStore } from '../../../stores/space'

describe('space store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults to ambient mode, disabled', () => {
    const store = useSpaceStore()
    expect(store.mode).toBe('ambient')
    expect(store.enabled).toBe(false)
  })

  it('updates mode', () => {
    const store = useSpaceStore()
    store.setMode('orrery')
    expect(store.mode).toBe('orrery')
  })

  it('updates enabled flag', () => {
    const store = useSpaceStore()
    store.setEnabled(true)
    expect(store.enabled).toBe(true)
  })
})
