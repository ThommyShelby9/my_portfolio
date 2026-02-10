<template>
  <div class="panel-overlay" @click="handleOverlayClick">
    <div ref="panelRef" class="panel-container" @click.stop>
      <!-- Panel Header -->
      <div class="panel-header">
        <h2 class="panel-title">{{ title }}</h2>
        <button class="panel-close" @click="close" aria-label="Close panel">
          <span class="close-icon">✕</span>
        </button>
      </div>

      <!-- Panel Body -->
      <div class="panel-body">
        <slot />
      </div>

      <!-- Panel Footer -->
      <div class="panel-footer">
        <span class="footer-hint">Press <kbd>ESC</kbd> to close</span>
        <button @click="close" class="footer-btn">
          Back to Terminal
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTerminalStore } from '@/stores/terminal'
import { useAnimations } from '@/composables/useAnimations'

defineProps<{
  title: string
}>()

const store = useTerminalStore()
const animations = useAnimations()

const panelRef = ref<HTMLElement>()

function close() {
  if (panelRef.value) {
    animations.animatePanelClose(panelRef.value).then(() => {
      store.closePanel()
    })
  } else {
    store.closePanel()
  }
}

function handleOverlayClick() {
  close()
}

// Handle Escape key
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)

  // Animate panel open
  if (panelRef.value) {
    animations.animatePanelOpen(panelRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.panel-overlay {
  @apply fixed inset-0 bg-black/80 z-50;
  @apply flex items-center justify-center;
  animation: fadeIn 0.2s ease-out;
}

.panel-container {
  @apply bg-bg-dark border border-cyan-neon rounded-lg;
  @apply w-[90vw] max-w-4xl max-h-[85vh];
  @apply flex flex-col;
  @apply shadow-2xl;
  box-shadow: 0 0 50px rgba(0, 255, 247, 0.3);
  animation: slideIn 0.3s ease-out;
}

.panel-header {
  @apply flex items-center justify-between;
  @apply px-6 py-4 border-b border-border-color;
  @apply bg-bg-secondary;
}

.panel-title {
  @apply text-xl font-bold text-cyan-neon;
}

.panel-close {
  @apply w-8 h-8 rounded-full;
  @apply flex items-center justify-center;
  @apply bg-bg-dark border border-border-color;
  @apply text-text-secondary hover:text-error hover:border-error;
  @apply transition-all duration-200;
}

.close-icon {
  @apply text-lg;
}

.panel-body {
  @apply flex-1 overflow-y-auto overflow-x-hidden;
  @apply px-6 py-4;
}

/* Custom scrollbar */
.panel-body::-webkit-scrollbar {
  @apply w-2;
}

.panel-body::-webkit-scrollbar-track {
  @apply bg-bg-secondary;
}

.panel-body::-webkit-scrollbar-thumb {
  @apply bg-cyan-dark rounded;
}

.panel-body::-webkit-scrollbar-thumb:hover {
  @apply bg-cyan-neon;
}

.panel-footer {
  @apply flex items-center justify-between;
  @apply px-6 py-3 border-t border-border-color;
  @apply bg-bg-secondary;
}

.footer-hint {
  @apply text-xs text-text-secondary flex items-center gap-2;
}

kbd {
  @apply px-2 py-1 rounded bg-bg-dark border border-border-color;
  @apply text-cyan-neon font-mono text-xs;
}

.footer-btn {
  @apply px-4 py-2 rounded;
  @apply bg-cyan-neon text-bg-dark;
  @apply hover:bg-cyan-dark;
  @apply transition-colors duration-200;
  @apply font-semibold text-sm;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
