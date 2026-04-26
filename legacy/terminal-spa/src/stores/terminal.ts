/**
 * Terminal Store
 * Pinia store for managing terminal state
 */

import { defineStore } from 'pinia'
import type { TerminalLine, TerminalState } from '@/types'

export const useTerminalStore = defineStore('terminal', {
  state: (): TerminalState => ({
    history: [],
    currentInput: '',
    mode: 'terminal',
    activePanel: null,
    activePanelData: null,
    theme: 'cyan',
    fxEnabled: true,
    introEnabled: true,
    reducedMotion: false,
    bootComplete: false,
  }),

  getters: {
    visibleHistory: (state) => state.history,

    currentTheme: (state) => state.theme,

    isInPanel: (state) => state.mode === 'panel',

    isBootComplete: (state) => state.bootComplete,
  },

  actions: {
    /**
     * Add a line to the terminal history
     */
    addLine(line: Omit<TerminalLine, 'id' | 'timestamp'>) {
      const newLine: TerminalLine = {
        ...line,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      }
      this.history.push(newLine)
    },

    /**
     * Add an animated line to terminal history
     */
    addAnimatedLine(line: Omit<TerminalLine, 'id' | 'timestamp'>, speed?: number) {
      const newLine: TerminalLine = {
        ...line,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        animated: true,
        animationSpeed: speed || 0.03,
      }
      this.history.push(newLine)
    },

    /**
     * Clear terminal history
     */
    clearHistory() {
      this.history = []
    },

    /**
     * Set terminal mode
     */
    setMode(mode: 'terminal' | 'panel') {
      this.mode = mode
    },

    /**
     * Open a panel
     */
    openPanel(name: string, data?: any) {
      this.activePanel = name
      this.activePanelData = data
      this.mode = 'panel'
    },

    /**
     * Close active panel
     */
    closePanel() {
      this.activePanel = null
      this.activePanelData = null
      this.mode = 'terminal'
    },

    /**
     * Set theme
     */
    setTheme(theme: string) {
      this.theme = theme
      localStorage.setItem('rostel_theme', theme)
    },

    /**
     * Toggle visual effects
     */
    toggleFx(enabled?: boolean) {
      if (enabled !== undefined) {
        this.fxEnabled = enabled
      } else {
        this.fxEnabled = !this.fxEnabled
      }
      localStorage.setItem('rostel_fx', this.fxEnabled ? 'true' : 'false')
    },

    /**
     * Toggle intro/boot sequence
     */
    toggleIntro(enabled?: boolean) {
      if (enabled !== undefined) {
        this.introEnabled = enabled
      } else {
        this.introEnabled = !this.introEnabled
      }
      localStorage.setItem('rostel_intro', this.introEnabled ? 'true' : 'false')
    },

    /**
     * Set reduced motion (accessibility)
     */
    setReducedMotion(enabled: boolean) {
      this.reducedMotion = enabled
    },

    /**
     * Mark boot sequence as complete
     */
    setBootComplete() {
      this.bootComplete = true
    },

    /**
     * Set current input value
     */
    setCurrentInput(value: string) {
      this.currentInput = value
    },

    /**
     * Load settings from localStorage
     */
    loadSettings() {
      const theme = localStorage.getItem('rostel_theme')
      if (theme) {
        this.theme = theme
      }

      const fx = localStorage.getItem('rostel_fx')
      if (fx !== null) {
        this.fxEnabled = fx === 'true'
      }

      const intro = localStorage.getItem('rostel_intro')
      if (intro !== null) {
        this.introEnabled = intro === 'true'
      }
    },
  },
})
