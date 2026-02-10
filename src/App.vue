<template>
  <div id="app" class="min-h-screen flex items-center justify-center bg-bg-dark">
    <div class="text-center max-w-2xl px-4">
      <h1 class="text-4xl font-bold text-cyan-neon glow mb-4">
        ROSTEL_OS
      </h1>
      <p class="text-text-secondary mb-6">
        Terminal OS Portfolio
      </p>

      <!-- Progress -->
      <div class="space-y-2 text-left bg-bg-secondary p-6 rounded-lg border border-border-color">
        <div class="flex items-center gap-2">
          <span class="text-success">✓</span>
          <span class="text-text-primary">Sprint 0: Setup Complete</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-success">✓</span>
          <span class="text-text-primary">Sprint 1: Terminal Engine Core</span>
        </div>
        <div class="flex items-center gap-2 text-text-secondary">
          <span>○</span>
          <span>Sprint 2: Commands & Data Migration (Next)</span>
        </div>
      </div>

      <div class="mt-6 text-xs text-text-secondary space-y-1">
        <p>Stack: Vue 3 + TypeScript + Vite + TailwindCSS + Pinia</p>
        <p>Engine: {{ historyCount }} lines in history, Mode: {{ mode }}</p>
        <p class="text-cyan-neon">Ready for terminal components...</p>
      </div>

      <!-- Test buttons -->
      <div class="mt-6 flex gap-4 justify-center">
        <button
          @click="testAddLine"
          class="px-4 py-2 bg-cyan-neon text-bg-dark rounded hover:bg-cyan-dark transition-colors"
        >
          Test Add Line
        </button>
        <button
          @click="testClear"
          class="px-4 py-2 bg-border-color text-text-primary rounded hover:bg-text-secondary transition-colors"
        >
          Clear History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTerminal } from '@/composables/useTerminal'

// Test the terminal engine
const { history, mode, addLine, clearHistory, loadSettings } = useTerminal()

// Load settings on mount
loadSettings()

const historyCount = computed(() => history.value.length)

function testAddLine() {
  addLine({
    type: 'output',
    content: `Test message at ${new Date().toLocaleTimeString()}`
  })
}

function testClear() {
  clearHistory()
}
</script>

<style scoped>
.glow {
  text-shadow: 0 0 20px var(--color-accent),
               0 0 40px var(--color-accent);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

button {
  font-family: var(--font-mono);
  font-size: 0.875rem;
}
</style>
