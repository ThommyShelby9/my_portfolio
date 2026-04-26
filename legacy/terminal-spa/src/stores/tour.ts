/**
 * Tour Store
 * Manages guided tour state and progression
 */

import { defineStore } from 'pinia'
import type { TourStep, TourState } from '@/types/tour'

export const useTourStore = defineStore('tour', {
  state: (): TourState => ({
    isActive: false,
    currentStepIndex: 0,
    completed: false,
    skipped: false,
    steps: [
      // Step 1: Welcome
      {
        id: 'welcome',
        title: 'Welcome to ROSTEL_OS! 🚀',
        description: 'This is an interactive terminal-based portfolio. Let me show you around!',
        target: '.terminal-content',
        position: 'center',
        tips: [
          'Use your keyboard to type commands',
          'Everything is interactive and responsive',
          'Try exploring on your own after this tour'
        ]
      },

      // Step 2: Terminal Input
      {
        id: 'terminal-input',
        title: 'Command Line Interface',
        description: 'This is where you type commands. Click here and start typing!',
        target: '.terminal-input-container',
        position: 'top',
        tips: [
          'Press TAB for autocomplete',
          'Use UP/DOWN arrows for command history',
          'Type and press ENTER to execute'
        ]
      },

      // Step 3: Help Command
      {
        id: 'help-command',
        title: 'The Help Command',
        description: 'Watch! I\'ll execute the "help" command to show you all available commands.',
        target: '.terminal-input-container',
        position: 'top',
        action: () => {
          // Execute help command to demonstrate
          const executeCommand = (window as any).__executeCommand
          if (executeCommand) {
            executeCommand('help')
          }
        },
        tips: [
          'help - Shows all commands',
          'Every command has a description',
          'Some commands have aliases (shortcuts)'
        ]
      },

      // Step 4: Projects Command
      {
        id: 'projects-command',
        title: 'View Projects',
        description: 'I\'ll execute "projects" to show you my portfolio with interactive cards.',
        target: '.terminal-input-container',
        position: 'top',
        action: () => {
          // Execute projects command to demonstrate
          const executeCommand = (window as any).__executeCommand
          if (executeCommand) {
            executeCommand('projects')
          }
        },
        tips: [
          'Each project is interactive',
          'Click on projects to see details',
          'Technologies and links included'
        ]
      },

      // Step 5: Command Palette
      {
        id: 'command-palette',
        title: 'Command Palette ⌨️',
        description: 'Here\'s the command palette! Type to quickly search for commands.',
        position: 'center',
        action: () => {
          // Close any open panel first
          const terminalStore = (window as any).__terminalStore
          if (terminalStore?.mode === 'panel') {
            terminalStore.closePanel()
          }

          // Open the command palette to demonstrate
          const paletteStore = (window as any).__commandPaletteStore
          if (paletteStore) {
            setTimeout(() => {
              paletteStore.open()
            }, 300) // Small delay after closing panel
          }
        },
        tips: [
          'Fuzzy search to find commands',
          'Use arrow keys to navigate',
          'Press ESC to close it and continue the tour'
        ]
      },

      // Step 6: Keyboard Shortcuts
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'Power user? Here are some handy shortcuts to speed up your workflow.',
        position: 'center',
        action: () => {
          // Close the command palette if it's still open
          const paletteStore = (window as any).__commandPaletteStore
          if (paletteStore?.isOpen) {
            paletteStore.close()
          }
        },
        tips: [
          'TAB - Autocomplete commands',
          'UP/DOWN - Command history',
          'Cmd/Ctrl+K - Command palette',
          'ESC - Close panels/modals'
        ]
      },

      // Step 7: Theme Customization
      {
        id: 'theme-command',
        title: 'Customize Your Experience',
        description: 'Type "theme" to change the color scheme. Try cyan, amber, green, or mono!',
        target: '.terminal-input-container',
        position: 'top',
        tips: [
          'theme <name> - Change colors',
          'fx <on|off> - Toggle visual effects',
          'intro <on|off> - Toggle boot sequence'
        ]
      },

      // Step 8: Easter Eggs
      {
        id: 'easter-eggs',
        title: 'Hidden Surprises 🥚',
        description: 'Check out this easter egg! I\'ll execute "whoami" to show you.',
        target: '.terminal-input-container',
        position: 'top',
        action: () => {
          // Execute whoami as an easter egg example
          const executeCommand = (window as any).__executeCommand
          if (executeCommand) {
            executeCommand('whoami')
          }
        },
        tips: [
          'Try "sudo" for a laugh',
          'Try "matrix" for a visual effect',
          'Try the Konami code: ↑↑↓↓←→←→BA'
        ]
      },

      // Step 9: Tour Complete
      {
        id: 'complete',
        title: 'You\'re All Set! ✨',
        description: 'You now know the basics! Feel free to explore and interact with everything.',
        position: 'center',
        tips: [
          'Start with "help" to see all commands',
          'Use "projects" to see my work',
          'Have fun exploring!'
        ]
      }
    ]
  }),

  getters: {
    currentStep(): TourStep | null {
      return this.steps[this.currentStepIndex] || null
    },

    totalSteps(): number {
      return this.steps.length
    },

    isFirstStep(): boolean {
      return this.currentStepIndex === 0
    },

    isLastStep(): boolean {
      return this.currentStepIndex === this.steps.length - 1
    },

    progress(): number {
      return ((this.currentStepIndex + 1) / this.totalSteps) * 100
    }
  },

  actions: {
    /**
     * Start the tour
     */
    startTour() {
      console.log('🎯 Tour starting...')
      this.isActive = true
      this.currentStepIndex = 0
      this.completed = false
      this.skipped = false
      console.log('✅ Tour started! Current step:', this.steps[0].title)
    },

    /**
     * Go to next step
     */
    nextStep() {
      if (this.isLastStep) {
        this.completeTour()
      } else {
        this.currentStepIndex++
      }
    },

    /**
     * Go to previous step
     */
    prevStep() {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--
      }
    },

    /**
     * Skip the tour
     */
    skipTour() {
      this.isActive = false
      this.skipped = true
      this.saveCompletion()
    },

    /**
     * Complete the tour
     */
    completeTour() {
      this.isActive = false
      this.completed = true
      this.saveCompletion()
    },

    /**
     * Reset tour to beginning
     */
    resetTour() {
      this.currentStepIndex = 0
      this.completed = false
      this.skipped = false
      this.startTour()
    },

    /**
     * Save completion status to localStorage
     */
    saveCompletion() {
      const data = {
        completed: this.completed,
        skipped: this.skipped,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('rostel_tour_completed', JSON.stringify(data))
    },

    /**
     * Load completion status from localStorage
     */
    loadCompletion() {
      const saved = localStorage.getItem('rostel_tour_completed')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          this.completed = data.completed || false
          this.skipped = data.skipped || false
        } catch (error) {
          console.error('Failed to load tour completion:', error)
        }
      }
    },

    /**
     * Clear completion status (for testing)
     */
    clearCompletion() {
      this.completed = false
      this.skipped = false
      localStorage.removeItem('rostel_tour_completed')
    }
  }
})
