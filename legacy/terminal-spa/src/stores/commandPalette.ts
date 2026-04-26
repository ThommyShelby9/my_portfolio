/**
 * Command Palette Store
 * Manages command palette state (must be singleton for proper reactivity)
 */

import { defineStore } from 'pinia'
import { useTerminal } from '@/composables/useTerminal'

export const useCommandPaletteStore = defineStore('commandPalette', {
  state: () => ({
    isOpen: false,
    searchQuery: '',
    selectedIndex: 0,
    recentCommands: [] as string[]
  }),

  actions: {
    /**
     * Open the command palette
     */
    open() {
      this.isOpen = true
      this.searchQuery = ''
      this.selectedIndex = 0
    },

    /**
     * Close the command palette
     */
    close() {
      this.isOpen = false
      this.searchQuery = ''
      this.selectedIndex = 0
    },

    /**
     * Toggle the command palette
     */
    toggle() {
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    },

    /**
     * Execute a command and close palette
     */
    async execute(commandName: string) {
      const { executeCommand } = useTerminal()

      // Add to recent commands
      this.addToRecent(commandName)

      // Close palette
      this.close()

      // Execute command
      await executeCommand(commandName)
    },

    /**
     * Add command to recent commands list
     */
    addToRecent(commandName: string) {
      // Remove if already exists
      this.recentCommands = this.recentCommands.filter(c => c !== commandName)

      // Add to front
      this.recentCommands.unshift(commandName)

      // Limit to 5 recent commands
      if (this.recentCommands.length > 5) {
        this.recentCommands = this.recentCommands.slice(0, 5)
      }

      // Save to localStorage
      this.saveRecentCommands()
    },

    /**
     * Load recent commands from localStorage
     */
    loadRecentCommands() {
      const saved = localStorage.getItem('rostel_recent_commands')
      if (saved) {
        try {
          this.recentCommands = JSON.parse(saved)
        } catch (error) {
          console.error('Failed to load recent commands:', error)
          this.recentCommands = []
        }
      }
    },

    /**
     * Save recent commands to localStorage
     */
    saveRecentCommands() {
      localStorage.setItem('rostel_recent_commands', JSON.stringify(this.recentCommands))
    },

    /**
     * Navigate selection up
     */
    selectPrevious() {
      if (this.selectedIndex > 0) {
        this.selectedIndex--
      }
    },

    /**
     * Navigate selection down
     */
    selectNext(maxIndex: number) {
      if (this.selectedIndex < maxIndex) {
        this.selectedIndex++
      }
    },

    /**
     * Reset selected index
     */
    resetSelection() {
      this.selectedIndex = 0
    }
  }
})
