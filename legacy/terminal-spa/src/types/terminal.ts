/**
 * Terminal Types
 * Core type definitions for the terminal system
 */

export interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error' | 'system'
  content: string
  timestamp: Date
  animated?: boolean
  animationSpeed?: number
}

export interface TerminalState {
  history: TerminalLine[]
  currentInput: string
  mode: 'terminal' | 'panel'
  activePanel: string | null
  activePanelData: any | null
  theme: string
  fxEnabled: boolean
  introEnabled: boolean
  reducedMotion: boolean
  bootComplete: boolean
}

export interface TerminalSettings {
  theme: string
  fxEnabled: boolean
  introEnabled: boolean
  performanceMode: boolean
}
