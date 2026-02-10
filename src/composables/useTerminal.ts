/**
 * useTerminal Composable
 * Wrapper around terminal store with convenience methods
 */

import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import { parseCommand } from '@/utils/commandParser'
import type { TerminalLine } from '@/types'

export function useTerminal() {
  const store = useTerminalStore()
  const {
    history,
    currentInput,
    mode,
    activePanel,
    activePanelData,
    theme,
    fxEnabled,
    introEnabled,
    reducedMotion,
    bootComplete,
  } = storeToRefs(store)

  /**
   * Execute a command (will be implemented in Sprint 2 with useCommands)
   */
  async function executeCommand(input: string) {
    if (!input.trim()) return

    // Add input to history
    addLine({ type: 'input', content: input })

    // Parse command (actual execution will be in Sprint 2)
    const parsed = parseCommand(input)

    // Placeholder response for Sprint 1
    addOutput(
      `Command "${parsed.command}" recognized. Handler will be implemented in Sprint 2.`,
      'system'
    )
  }

  /**
   * Add a line to terminal history
   */
  function addLine(line: Omit<TerminalLine, 'id' | 'timestamp'>) {
    store.addLine(line)
  }

  /**
   * Add output to terminal
   */
  function addOutput(content: string, type: 'output' | 'system' = 'output') {
    store.addLine({ type, content })
  }

  /**
   * Add error to terminal
   */
  function addError(message: string) {
    store.addLine({
      type: 'error',
      content: `Error: ${message}`,
    })
  }

  /**
   * Handle error gracefully
   */
  function handleError(error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    addError(message)
    console.error('Terminal error:', error)
  }

  /**
   * Clear terminal history
   */
  function clearHistory() {
    store.clearHistory()
  }

  /**
   * Open a panel
   */
  function openPanel(name: string, data?: any) {
    store.openPanel(name, data)
  }

  /**
   * Close active panel
   */
  function closePanel() {
    store.closePanel()
  }

  /**
   * Set theme
   */
  function setTheme(themeName: string) {
    store.setTheme(themeName)
  }

  /**
   * Toggle effects
   */
  function toggleFx(enabled?: boolean) {
    store.toggleFx(enabled)
  }

  /**
   * Toggle intro
   */
  function toggleIntro(enabled?: boolean) {
    store.toggleIntro(enabled)
  }

  return {
    // State
    history,
    currentInput,
    mode,
    activePanel,
    activePanelData,
    theme,
    fxEnabled,
    introEnabled,
    reducedMotion,
    bootComplete,

    // Methods
    executeCommand,
    addLine,
    addOutput,
    addError,
    handleError,
    clearHistory,
    openPanel,
    closePanel,
    setTheme,
    toggleFx,
    toggleIntro,

    // Store actions
    setCurrentInput: store.setCurrentInput,
    setReducedMotion: store.setReducedMotion,
    setBootComplete: store.setBootComplete,
    loadSettings: store.loadSettings,
  }
}
