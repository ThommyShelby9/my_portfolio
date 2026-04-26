<template>
  <div id="app" class="min-h-screen flex items-center justify-center bg-theme-primary p-4">
    <!-- Boot Sequence -->
    <BootSequence v-if="showBoot && !bootComplete" />

    <!-- Terminal Window -->
    <TerminalWindow v-show="bootComplete" />

    <!-- Visual Effects -->
    <GrainEffect v-if="bootComplete" />
    <ScanlinesEffect v-if="bootComplete" />
    <GlitchEffect ref="glitchRef" />
    <MatrixRainEffect ref="matrixRef" />

    <!-- Achievement Toast Notifications -->
    <AchievementToast />

    <!-- Command Palette (Cmd+K / Ctrl+K) -->
    <CommandPalette />

    <!-- Guided Tour -->
    <TourOverlay />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import BootSequence from '@/components/boot/BootSequence.vue'
import GrainEffect from '@/components/effects/GrainEffect.vue'
import ScanlinesEffect from '@/components/effects/ScanlinesEffect.vue'
import GlitchEffect from '@/components/effects/GlitchEffect.vue'
import MatrixRainEffect from '@/components/effects/MatrixRainEffect.vue'
import AchievementToast from '@/components/common/AchievementToast.vue'
import CommandPalette from '@/components/common/CommandPalette.vue'
import TourOverlay from '@/components/tour/TourOverlay.vue'
import { useTerminal } from '@/composables/useTerminal'
import { useTour } from '@/composables/useTour'
import { useCommandPaletteStore } from '@/stores/commandPalette'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useTheme, applyThemeToDom, getTheme } from '@/composables/useTheme'
import { useKonamiCode } from '@/composables/useKonamiCode'
import { useAchievements } from '@/composables/useAchievements'

const store = useTerminalStore()
const { bootComplete } = storeToRefs(store)
const terminal = useTerminal()
const { loadSettings, addOutput, executeCommand } = terminal

// Initialize theme system
const themeSystem = useTheme()
themeSystem.initTheme()

// Watch store.theme and apply changes to DOM directly
watch(() => store.theme, (newThemeName) => {
  const theme = getTheme(newThemeName)
  if (theme) {
    applyThemeToDom(theme)
  }
}, { immediate: true })

// Initialize reduced motion detection
useReducedMotion()

// Expose matrix trigger globally via window
;(window as any).triggerMatrix = () => {
  if (matrixRef.value) {
    matrixRef.value.start()
  }
}

// Initialize Konami code detector
useKonamiCode(() => {
  // Show secret message
  addOutput(`
╔═══════════════════════════════════════════════════════════╗
║              🎮 KONAMI CODE ACTIVATED! 🎮                 ║
╚═══════════════════════════════════════════════════════════╝

Congratulations! You've unlocked the secret developer mode! 🚀

  ↑ ↑ ↓ ↓ ← → ← → B A

Easter egg discovered! You're a true gamer at heart.
As a reward, here's a secret: I love building interactive experiences
that surprise and delight users. This portfolio is just the beginning!

Type 'matrix' to enter the Matrix (coming soon).
Type 'sudo' for a laugh.
Type 'whoami' to identify yourself.

Keep exploring! 🕹️
  `.trim(), 'system')
})

const showBoot = ref(true)
// Reference to glitch effect for programmatic triggering (e.g., errors, Easter eggs)
// @ts-ignore - Reserved for future use
const glitchRef = ref<InstanceType<typeof GlitchEffect>>()
// Reference to matrix rain effect
const matrixRef = ref<InstanceType<typeof MatrixRainEffect>>()

// Initialize achievements system
const achievements = useAchievements()

// Initialize command palette store
const commandPaletteStore = useCommandPaletteStore()

// Initialize guided tour
const tour = useTour()

// Global keyboard handler reference for cleanup
let handleGlobalKeyboard: ((e: KeyboardEvent) => void) | null = null

// Load settings on mount
onMounted(() => {
  loadSettings()

  // Load achievements from localStorage
  achievements.loadAchievements()

  // Load tour completion status
  tour.loadCompletion()

  // Expose stores and functions globally for tour actions
  if (typeof window !== 'undefined') {
    // @ts-ignore - Expose for tour actions
    ;(window as any).__commandPaletteStore = commandPaletteStore
    // @ts-ignore - Expose for tour actions
    ;(window as any).__terminalStore = store
    // @ts-ignore - Expose for tour actions
    ;(window as any).__executeCommand = executeCommand
  }

  // Global keyboard listener for Command Palette (Cmd+K / Ctrl+K)
  handleGlobalKeyboard = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      commandPaletteStore.toggle()
    }
  }
  window.addEventListener('keydown', handleGlobalKeyboard)

  // Load recent commands from localStorage
  commandPaletteStore.loadRecentCommands()

  // Check if intro is enabled
  const introEnabled = store.introEnabled
  if (!introEnabled) {
    showBoot.value = false
    store.setBootComplete()
  }

  // Welcome message (show after boot or immediately if intro disabled)
  const showWelcome = () => {
    addOutput(`
╔═══════════════════════════════════════════════════════════╗
║                    Welcome to ROSTEL_OS                   ║
╚═══════════════════════════════════════════════════════════╝

Type 'help' to see available commands.
Type 'about' to learn more about me.
Type 'projects' to view my portfolio.
  `.trim(), 'system')

    // Auto-start tour for first-time visitors
    if (!tour.completed.value && !tour.skipped.value) {
      setTimeout(() => {
        console.log('⏰ Starting tour after delay...')
        tour.startTour()
      }, 3000) // Wait 3 seconds after welcome message to ensure terminal is fully visible
    }
  }

  if (!introEnabled) {
    showWelcome()
  } else {
    // Wait for boot to complete
    const unwatch = store.$subscribe((_mutation, state) => {
      if (state.bootComplete) {
        showWelcome()
        unwatch()
      }
    })
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (handleGlobalKeyboard) {
    window.removeEventListener('keydown', handleGlobalKeyboard)
  }
})
</script>

<style>
#app {
  font-family: var(--font-mono);
}
</style>
