<template>
  <div class="terminal-body" ref="bodyRef">
    <!-- Terminal Mode: Show history and input -->
    <div v-if="mode === 'terminal'" class="terminal-mode">
      <TerminalHistory />
      <TerminalInput />
    </div>

    <!-- Panel Mode: Show active panel -->
    <div v-else-if="mode === 'panel'" class="panel-mode">
      <div class="panel-placeholder">
        <h2 class="text-cyan-neon text-2xl mb-4">{{ activePanel }}</h2>
        <p class="text-text-secondary">
          Panel component will be implemented in Sprint 4
        </p>
        <button
          @click="closePanel"
          class="mt-4 px-4 py-2 bg-cyan-neon text-bg-dark rounded hover:bg-cyan-dark transition-colors"
        >
          Back to Terminal
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import TerminalHistory from './TerminalHistory.vue'
import TerminalInput from './TerminalInput.vue'

const store = useTerminalStore()
const { mode, activePanel, history } = storeToRefs(store)

const bodyRef = ref<HTMLElement>()

// Auto-scroll to bottom when history updates
watch(history, async () => {
  await nextTick()
  if (bodyRef.value) {
    bodyRef.value.scrollTop = bodyRef.value.scrollHeight
  }
}, { deep: true })

function closePanel() {
  store.closePanel()
}
</script>

<style scoped>
.terminal-body {
  @apply flex-1 overflow-y-auto overflow-x-hidden;
  @apply bg-bg-dark p-4;
  @apply relative;
}

/* Custom scrollbar */
.terminal-body::-webkit-scrollbar {
  @apply w-2;
}

.terminal-body::-webkit-scrollbar-track {
  @apply bg-bg-secondary;
}

.terminal-body::-webkit-scrollbar-thumb {
  @apply bg-cyan-dark rounded;
}

.terminal-body::-webkit-scrollbar-thumb:hover {
  @apply bg-cyan-neon;
}

.terminal-mode {
  @apply flex flex-col gap-2;
  min-height: 100%;
}

.panel-mode {
  @apply flex items-center justify-center;
  min-height: 100%;
}

.panel-placeholder {
  @apply text-center;
}
</style>
