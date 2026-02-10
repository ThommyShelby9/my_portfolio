<template>
  <div class="terminal-window" :class="{ 'minimized': isMinimized, 'fullscreen': isFullscreen, 'mobile': isMobile }">
    <!-- macOS Chrome Header -->
    <div class="terminal-chrome">
      <div class="chrome-buttons">
        <button
          class="chrome-btn chrome-btn-close"
          @click="handleClose"
          aria-label="Close"
          title="Reset"
        >
          <span class="chrome-btn-icon"></span>
        </button>
        <button
          class="chrome-btn chrome-btn-minimize"
          @click="toggleMinimize"
          aria-label="Minimize"
          title="Minimize"
        >
          <span class="chrome-btn-icon"></span>
        </button>
        <button
          class="chrome-btn chrome-btn-maximize"
          @click="toggleFullscreen"
          aria-label="Maximize"
          title="Fullscreen"
        >
          <span class="chrome-btn-icon"></span>
        </button>
      </div>
    </div>

    <!-- Terminal Content -->
    <div class="terminal-content">
      <TerminalHeader />
      <TerminalBody />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import TerminalHeader from './TerminalHeader.vue'
import TerminalBody from './TerminalBody.vue'
import { useTerminal } from '@/composables/useTerminal'

const { clearHistory, closePanel } = useTerminal()

// Responsive breakpoints
const breakpoints = useBreakpoints({
  mobile: 0,
  tablet: 768,
  desktop: 1024
})

const isMobile = breakpoints.smaller('tablet')

const isMinimized = ref(false)
const isFullscreen = ref(false)

function handleClose() {
  // Reset terminal
  closePanel()
  clearHistory()
}

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}
</script>

<style scoped>
.terminal-window {
  @apply relative w-[90vw] max-w-6xl h-[85vh] bg-theme-primary rounded-lg shadow-2xl;
  @apply border border-theme overflow-hidden;
  transition: all 0.3s ease;
}

.terminal-window.minimized {
  @apply h-12;
}

.terminal-window.fullscreen {
  @apply w-screen h-screen max-w-none rounded-none;
}

.terminal-window.mobile {
  @apply fixed inset-0 w-screen h-screen max-w-none rounded-none;
}

/* macOS Chrome */
.terminal-chrome {
  @apply relative flex items-center h-8 bg-theme-secondary border-b border-theme;
  @apply px-3;
}

.chrome-buttons {
  @apply flex gap-2;
}

.chrome-btn {
  @apply w-3 h-3 rounded-full transition-all duration-200;
  @apply flex items-center justify-center;
  @apply cursor-pointer border-none outline-none;
}

.chrome-btn:hover .chrome-btn-icon {
  @apply opacity-100;
}

.chrome-btn-close {
  @apply bg-red-500;
}

.chrome-btn-minimize {
  @apply bg-yellow-500;
}

.chrome-btn-maximize {
  @apply bg-green-500;
}

.chrome-btn-icon {
  @apply opacity-0 transition-opacity duration-200;
  @apply w-2 h-2 flex items-center justify-center;
  font-size: 8px;
  color: rgba(0, 0, 0, 0.6);
}

.chrome-btn-close:hover {
  @apply bg-red-600;
}

.chrome-btn-minimize:hover {
  @apply bg-yellow-600;
}

.chrome-btn-maximize:hover {
  @apply bg-green-600;
}

/* Terminal Content */
.terminal-content {
  @apply h-[calc(100%-2rem)] flex flex-col;
}

/* Subtle reflection effect */
.terminal-window::before {
  content: '';
  @apply absolute top-0 left-0 w-full h-32;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 10;
}
</style>
