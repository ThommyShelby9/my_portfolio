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
      <button
        class="help-button"
        @click="startTour"
        title="Start guided tour"
        aria-label="Start guided tour"
      >
        ?
      </button>
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
import { useTour } from '@/composables/useTour'

const store = useTerminalStore()
const { mode, activePanel, theme, fxEnabled } = storeToRefs(store)

const tour = useTour()

function startTour() {
  tour.startTour()
}

const username = 'rostel'
const hostname = 'missimawu'

const title = computed(() => {
  if (mode.value === 'panel' && activePanel.value) {
    return `~/${activePanel.value}`
  }
  return 'ROSTEL_OS'
})
</script>

<style scoped>
.terminal-header {
  @apply flex items-center justify-between px-4 py-2 bg-theme-secondary;
  @apply border-b border-theme text-sm;
}

.header-left {
  @apply flex items-center gap-1 font-mono;
}

.header-user {
  @apply text-theme-accent font-semibold;
}

.header-separator {
  @apply text-theme-secondary;
}

.header-host {
  @apply text-theme-primary;
}

.header-path {
  @apply text-theme-accent;
}

.header-center {
  @apply flex-1 text-center;
}

.header-title {
  @apply text-theme-primary font-semibold;
}

.header-right {
  @apply flex items-center gap-3;
}

.help-button {
  @apply w-6 h-6 flex items-center justify-center;
  @apply rounded-full;
  @apply bg-transparent;
  @apply border border-theme-accent;
  @apply text-theme-accent;
  @apply cursor-pointer;
  @apply transition-all duration-200;
  @apply text-sm font-bold;
}

.help-button:hover {
  @apply bg-theme-accent text-theme-primary;
  @apply scale-110;
}

.help-button:active {
  @apply scale-95;
}

.header-indicator {
  @apply text-xs px-2 py-1 rounded bg-theme-primary text-theme-secondary;
  @apply border border-theme;
  transition: all 0.2s ease;
}

.header-indicator.active {
  @apply text-theme-accent border-theme-accent;
}
</style>
