<template>
  <div id="app" class="min-h-screen flex items-center justify-center bg-bg-dark p-4">
    <TerminalWindow />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TerminalWindow from '@/components/terminal/TerminalWindow.vue'
import { useTerminal } from '@/composables/useTerminal'

const { loadSettings, addOutput } = useTerminal()

// Load settings on mount
onMounted(() => {
  loadSettings()

  // Welcome message
  addOutput(`
╔═══════════════════════════════════════════════════════════╗
║                    Welcome to ROSTEL_OS                   ║
╚═══════════════════════════════════════════════════════════╝

Type 'help' to see available commands.
Type 'about' to learn more about me.
Type 'projects' to view my portfolio.
  `.trim(), 'system')
})
</script>

<style>
#app {
  font-family: var(--font-mono);
}
</style>
