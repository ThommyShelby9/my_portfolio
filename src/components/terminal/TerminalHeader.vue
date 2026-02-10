<template>
  <div class="terminal-header">
    <div class="header-left">
      <span class="header-user accent">{{ username }}</span>
      <span class="header-separator">@</span>
      <span class="header-host">{{ hostname }}</span>
      <span class="header-separator">:</span>
      <span class="header-path accent">~</span>
    </div>

    <div class="header-center">
      <span class="header-title">{{ title }}</span>
    </div>

    <div class="header-right">
      <span class="header-indicator" :class="{ active: fxEnabled }" title="Visual Effects">
        FX
      </span>
      <span class="header-indicator" :title="`Theme: ${theme}`">
        {{ theme.toUpperCase() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'

const store = useTerminalStore()
const { mode, activePanel, theme, fxEnabled } = storeToRefs(store)

const username = 'rostel'
const hostname = 'kps'

const title = computed(() => {
  if (mode.value === 'panel' && activePanel.value) {
    return `~/${activePanel.value}`
  }
  return 'ROSTEL_OS'
})
</script>

<style scoped>
.terminal-header {
  @apply flex items-center justify-between px-4 py-2 bg-bg-secondary;
  @apply border-b border-border-color text-sm;
}

.header-left {
  @apply flex items-center gap-1 font-mono;
}

.header-user {
  @apply text-cyan-neon font-semibold;
}

.header-separator {
  @apply text-text-secondary;
}

.header-host {
  @apply text-text-primary;
}

.header-path {
  @apply text-cyan-neon;
}

.header-center {
  @apply flex-1 text-center;
}

.header-title {
  @apply text-text-primary font-semibold;
}

.header-right {
  @apply flex items-center gap-3;
}

.header-indicator {
  @apply text-xs px-2 py-1 rounded bg-bg-dark text-text-secondary;
  @apply border border-border-color;
  transition: all 0.2s ease;
}

.header-indicator.active {
  @apply text-cyan-neon border-cyan-neon;
}
</style>
