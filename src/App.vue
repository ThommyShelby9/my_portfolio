<template>
  <div id="app" class="min-h-screen flex items-center justify-center bg-bg-dark p-4">
    <!-- Boot Sequence -->
    <BootSequence v-if="showBoot && !bootComplete" />

    <!-- Terminal Window -->
    <TerminalWindow v-show="bootComplete" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import BootSequence from '@/components/boot/BootSequence.vue'
import { useTerminal } from '@/composables/useTerminal'
import { useReducedMotion } from '@/composables/useReducedMotion'

const store = useTerminalStore()
const { bootComplete } = storeToRefs(store)
const { loadSettings, addOutput } = useTerminal()

// Initialize reduced motion detection
useReducedMotion()

const showBoot = ref(true)

// Load settings on mount
onMounted(() => {
  loadSettings()

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
</script>

<style>
#app {
  font-family: var(--font-mono);
}
</style>
