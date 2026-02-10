/**
 * useKeyboard Composable
 * Keyboard shortcuts and navigation
 */

import { useTerminalStore } from '@/stores/terminal'

export function useKeyboard() {
  const store = useTerminalStore()

  /**
   * Handle Escape key - Close active panel
   */
  function handleEscape() {
    if (store.mode === 'panel') {
      store.closePanel()
    }
  }

  /**
   * Handle Ctrl+L - Clear screen
   */
  function handleClearScreen() {
    store.clearHistory()
  }

  /**
   * Handle Ctrl+C - Cancel current input
   */
  function handleCancel() {
    store.setCurrentInput('')
  }

  return {
    handleEscape,
    handleClearScreen,
    handleCancel
  }
}
