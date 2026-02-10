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
   * Execute a command with full implementation
   */
  async function executeCommand(input: string) {
    if (!input.trim()) return

    // Add input to history
    addLine({ type: 'input', content: input })

    // Parse command
    const parsed = parseCommand(input)

    if (!parsed.command) {
      return
    }

    // Import commands dynamically to avoid circular dependencies
    const { useCommands } = await import('./useCommands')
    const commands = useCommands()

    try {
      // Execute command
      const result = await commands.executeCommand(
        parsed.command,
        parsed.args,
        parsed.flags
      )

      // Handle result based on type
      if (result.type === 'panel' && result.panelName) {
        openPanel(result.panelName, result.panelData)
      } else if (result.type === 'text' || result.type === 'error' || result.type === 'success') {
        if (result.content) {
          const lineType = result.type === 'error' ? 'error' : result.type === 'success' ? 'system' : 'output'

          // Use animated line if specified (errors are never animated)
          if (result.animated && result.type !== 'error') {
            store.addAnimatedLine({ type: lineType, content: result.content }, result.animationSpeed)
          } else {
            addLine({ type: lineType, content: result.content })
          }
        }
      }
      // 'system' type doesn't output anything (used for clear, back, etc.)
    } catch (error) {
      handleError(error)
    }
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
   * Add animated output to terminal (typing effect)
   */
  function addAnimatedOutput(content: string, type: 'output' | 'system' = 'output', speed?: number) {
    store.addAnimatedLine({ type, content }, speed)
  }

  /**
   * Add error to terminal
   */
  function addError(message: string) {
    store.addLine({
      type: 'error',
      content: `Error: ${message}`,
    })

    // Trigger error animation
    if (typeof window !== 'undefined') {
      import('./useAnimations').then(({ useAnimations }) => {
        const animations = useAnimations()
        animations.animateError()
      })
    }
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
    addAnimatedOutput,
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
