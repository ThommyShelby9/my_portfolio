<template>
  <div id="app" class="min-h-screen flex items-center justify-center bg-bg-dark p-4">
    <!-- Boot Sequence -->
    <BootSequence v-if="showBoot && !bootComplete" />

    <!-- Terminal Window -->
    <TerminalWindow v-show="bootComplete" />

    <!-- Visual Effects -->
    <GrainEffect v-if="bootComplete" />
    <ScanlinesEffect v-if="bootComplete" />
    <GlitchEffect ref="glitchRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import BootSequence from '@/components/boot/BootSequence.vue'
import GrainEffect from '@/components/effects/GrainEffect.vue'
import ScanlinesEffect from '@/components/effects/ScanlinesEffect.vue'
import GlitchEffect from '@/components/effects/GlitchEffect.vue'
import { useTerminal } from '@/composables/useTerminal'
import { useReducedMotion } from '@/composables/useReducedMotion'

const store = useTerminalStore()
const { bootComplete } = storeToRefs(store)
const { loadSettings, addOutput } = useTerminal()

// Initialize reduced motion detection
useReducedMotion()

const showBoot = ref(true)
// Reference to glitch effect for programmatic triggering (e.g., errors, Easter eggs)
// @ts-ignore - Reserved for future use
const glitchRef = ref<InstanceType<typeof GlitchEffect>>()

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
