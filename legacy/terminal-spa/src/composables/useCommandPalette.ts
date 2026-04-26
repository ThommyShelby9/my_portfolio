/**
 * useCommandPalette Composable
 * Manages command palette state and interactions
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useTerminal } from './useTerminal'

export function useCommandPalette() {
  const { executeCommand } = useTerminal()

  // State
  const isOpen = ref(false)
  const searchQuery = ref('')
  const selectedIndex = ref(0)
  const recentCommands = ref<string[]>([])

  /**
   * Open the command palette
   */
  function open() {
    isOpen.value = true
    searchQuery.value = ''
    selectedIndex.value = 0
  }

  /**
   * Close the command palette
   */
  function close() {
    isOpen.value = false
    searchQuery.value = ''
    selectedIndex.value = 0
  }

  /**
   * Toggle the command palette
   */
  function toggle() {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  /**
   * Execute a command and close palette
   */
  async function execute(commandName: string) {
    // Add to recent commands
    addToRecent(commandName)

    // Close palette
    close()

    // Execute command
    await executeCommand(commandName)
  }

  /**
   * Add command to recent commands list
   */
  function addToRecent(commandName: string) {
    // Remove if already exists
    recentCommands.value = recentCommands.value.filter(c => c !== commandName)

    // Add to front
    recentCommands.value.unshift(commandName)

    // Limit to 5 recent commands
    if (recentCommands.value.length > 5) {
      recentCommands.value = recentCommands.value.slice(0, 5)
    }

    // Save to localStorage
    saveRecentCommands()
  }

  /**
   * Load recent commands from localStorage
   */
  function loadRecentCommands() {
    const saved = localStorage.getItem('rostel_recent_commands')
    if (saved) {
      try {
        recentCommands.value = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load recent commands:', error)
        recentCommands.value = []
      }
    }
  }

  /**
   * Save recent commands to localStorage
   */
  function saveRecentCommands() {
    localStorage.setItem('rostel_recent_commands', JSON.stringify(recentCommands.value))
  }

  /**
   * Navigate selection up
   */
  function selectPrevious() {
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  }

  /**
   * Navigate selection down
   */
  function selectNext(maxIndex: number) {
    if (selectedIndex.value < maxIndex) {
      selectedIndex.value++
    }
  }

  /**
   * Reset selected index
   */
  function resetSelection() {
    selectedIndex.value = 0
  }

  // Load recent commands on mount
  onMounted(() => {
    loadRecentCommands()
  })

  // Close on escape key
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen.value) {
      close()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleEscape)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })

  return {
    // State
    isOpen,
    searchQuery,
    selectedIndex,
    recentCommands,

    // Methods
    open,
    close,
    toggle,
    execute,
    selectPrevious,
    selectNext,
    resetSelection
  }
}
