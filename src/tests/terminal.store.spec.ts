/**
 * Terminal Store Tests
 * Tests for Pinia terminal store
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'

describe('Terminal Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have empty history on init', () => {
      const store = useTerminalStore()

      expect(store.history).toEqual([])
    })

    it('should have empty current input', () => {
      const store = useTerminalStore()

      expect(store.currentInput).toBe('')
    })

    it('should be in terminal mode', () => {
      const store = useTerminalStore()

      expect(store.mode).toBe('terminal')
    })

    it('should have no active panel', () => {
      const store = useTerminalStore()

      expect(store.activePanel).toBeNull()
    })

    it('should have default theme (cyan)', () => {
      const store = useTerminalStore()

      expect(store.theme).toBe('cyan')
    })

    it('should have FX enabled by default', () => {
      const store = useTerminalStore()

      expect(store.fxEnabled).toBe(true)
    })

    it('should have intro enabled by default', () => {
      const store = useTerminalStore()

      expect(store.introEnabled).toBe(true)
    })

    it('should not have boot complete initially', () => {
      const store = useTerminalStore()

      expect(store.bootComplete).toBe(false)
    })
  })

  describe('addLine', () => {
    it('should add line to history', () => {
      const store = useTerminalStore()

      store.addLine({ type: 'output', content: 'Test output' })

      expect(store.history).toHaveLength(1)
      expect(store.history[0].content).toBe('Test output')
      expect(store.history[0].type).toBe('output')
    })

    it('should generate unique ID for each line', () => {
      const store = useTerminalStore()

      store.addLine({ type: 'output', content: 'Line 1' })
      store.addLine({ type: 'output', content: 'Line 2' })

      expect(store.history[0].id).not.toBe(store.history[1].id)
    })

    it('should add timestamp to each line', () => {
      const store = useTerminalStore()

      const before = new Date()
      store.addLine({ type: 'output', content: 'Test' })
      const after = new Date()

      const line = store.history[0]
      expect(line.timestamp).toBeInstanceOf(Date)
      expect(line.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(line.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should handle different line types', () => {
      const store = useTerminalStore()

      store.addLine({ type: 'input', content: 'help' })
      store.addLine({ type: 'output', content: 'Output' })
      store.addLine({ type: 'error', content: 'Error' })
      store.addLine({ type: 'system', content: 'System' })

      expect(store.history).toHaveLength(4)
      expect(store.history[0].type).toBe('input')
      expect(store.history[1].type).toBe('output')
      expect(store.history[2].type).toBe('error')
      expect(store.history[3].type).toBe('system')
    })
  })

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const store = useTerminalStore()

      store.addLine({ type: 'output', content: 'Line 1' })
      store.addLine({ type: 'output', content: 'Line 2' })

      expect(store.history).toHaveLength(2)

      store.clearHistory()

      expect(store.history).toHaveLength(0)
    })
  })

  describe('setCurrentInput', () => {
    it('should update current input', () => {
      const store = useTerminalStore()

      store.setCurrentInput('help')

      expect(store.currentInput).toBe('help')
    })

    it('should handle empty string', () => {
      const store = useTerminalStore()

      store.setCurrentInput('test')
      store.setCurrentInput('')

      expect(store.currentInput).toBe('')
    })
  })

  describe('openPanel', () => {
    it('should open panel and switch to panel mode', () => {
      const store = useTerminalStore()

      store.openPanel('projects')

      expect(store.mode).toBe('panel')
      expect(store.activePanel).toBe('projects')
    })

    it('should store panel data', () => {
      const store = useTerminalStore()
      const data = { test: 'data' }

      store.openPanel('projects', data)

      expect(store.activePanelData).toEqual(data)
    })

    it('should handle null data', () => {
      const store = useTerminalStore()

      store.openPanel('about')

      expect(store.activePanelData).toBeNull()
    })
  })

  describe('closePanel', () => {
    it('should close panel and return to terminal mode', () => {
      const store = useTerminalStore()

      store.openPanel('projects')
      store.closePanel()

      expect(store.mode).toBe('terminal')
      expect(store.activePanel).toBeNull()
      expect(store.activePanelData).toBeNull()
    })
  })

  describe('setTheme', () => {
    it('should change theme', () => {
      const store = useTerminalStore()

      store.setTheme('amber')

      expect(store.theme).toBe('amber')
    })

    it('should persist theme to localStorage', () => {
      const store = useTerminalStore()

      store.setTheme('green')

      expect(localStorage.getItem('terminal_theme')).toBe('green')
    })
  })

  describe('toggleFx', () => {
    it('should toggle FX on', () => {
      const store = useTerminalStore()
      store.fxEnabled = false

      store.toggleFx(true)

      expect(store.fxEnabled).toBe(true)
    })

    it('should toggle FX off', () => {
      const store = useTerminalStore()
      store.fxEnabled = true

      store.toggleFx(false)

      expect(store.fxEnabled).toBe(false)
    })

    it('should persist FX setting', () => {
      const store = useTerminalStore()

      store.toggleFx(false)

      expect(localStorage.getItem('terminal_fx_enabled')).toBe('false')
    })
  })

  describe('toggleIntro', () => {
    it('should toggle intro on', () => {
      const store = useTerminalStore()
      store.introEnabled = false

      store.toggleIntro(true)

      expect(store.introEnabled).toBe(true)
    })

    it('should toggle intro off', () => {
      const store = useTerminalStore()
      store.introEnabled = true

      store.toggleIntro(false)

      expect(store.introEnabled).toBe(false)
    })

    it('should persist intro setting', () => {
      const store = useTerminalStore()

      store.toggleIntro(false)

      expect(localStorage.getItem('terminal_intro_enabled')).toBe('false')
    })
  })

  describe('setBootComplete', () => {
    it('should set boot complete to true', () => {
      const store = useTerminalStore()

      store.setBootComplete()

      expect(store.bootComplete).toBe(true)
    })
  })

  describe('loadSettings', () => {
    it('should load theme from localStorage', () => {
      localStorage.setItem('terminal_theme', 'mono')

      const store = useTerminalStore()
      store.loadSettings()

      expect(store.theme).toBe('mono')
    })

    it('should load FX setting from localStorage', () => {
      localStorage.setItem('terminal_fx_enabled', 'false')

      const store = useTerminalStore()
      store.loadSettings()

      expect(store.fxEnabled).toBe(false)
    })

    it('should load intro setting from localStorage', () => {
      localStorage.setItem('terminal_intro_enabled', 'false')

      const store = useTerminalStore()
      store.loadSettings()

      expect(store.introEnabled).toBe(false)
    })

    it('should use defaults if no localStorage values', () => {
      const store = useTerminalStore()
      store.loadSettings()

      expect(store.theme).toBe('cyan')
      expect(store.fxEnabled).toBe(true)
      expect(store.introEnabled).toBe(true)
    })
  })
})
