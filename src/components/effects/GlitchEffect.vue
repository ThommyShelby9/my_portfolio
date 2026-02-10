<template>
  <div
    v-if="isGlitching"
    class="glitch-effect"
  >
    <div class="glitch-layer glitch-layer-1" />
    <div class="glitch-layer glitch-layer-2" />
    <div class="glitch-layer glitch-layer-3" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'

const store = useTerminalStore()
const { reducedMotion } = storeToRefs(store)

const isGlitching = ref(false)
let glitchTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Trigger a glitch effect
 * @param duration Duration in milliseconds (default: 500ms)
 */
function triggerGlitch(duration = 500) {
  if (reducedMotion.value) return

  isGlitching.value = true

  if (glitchTimeout) {
    clearTimeout(glitchTimeout)
  }

  glitchTimeout = setTimeout(() => {
    isGlitching.value = false
    glitchTimeout = null
  }, duration)
}

/**
 * Stop the glitch effect immediately
 */
function stopGlitch() {
  isGlitching.value = false
  if (glitchTimeout) {
    clearTimeout(glitchTimeout)
    glitchTimeout = null
  }
}

// Watch reduced motion - stop glitch if enabled
watch(reducedMotion, (isReduced) => {
  if (isReduced) {
    stopGlitch()
  }
})

// Expose methods to parent
defineExpose({
  triggerGlitch,
  stopGlitch
})
</script>

<style scoped>
.glitch-effect {
  @apply fixed inset-0 pointer-events-none z-50;
}

.glitch-layer {
  @apply absolute inset-0;
  background: var(--color-bg, #0b0f14);
  opacity: 0.8;
  animation: glitch-anim 0.3s infinite;
}

.glitch-layer-1 {
  animation-delay: 0s;
  mix-blend-mode: screen;
  background: rgba(255, 0, 0, 0.1);
}

.glitch-layer-2 {
  animation-delay: 0.1s;
  mix-blend-mode: screen;
  background: rgba(0, 255, 0, 0.1);
}

.glitch-layer-3 {
  animation-delay: 0.2s;
  mix-blend-mode: screen;
  background: rgba(0, 0, 255, 0.1);
}

@keyframes glitch-anim {
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: translate(0);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: translate(-5px, 5px);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    transform: translate(5px, -5px);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
    transform: translate(-5px, 5px);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    transform: translate(5px, -5px);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
    transform: translate(0);
  }
}

/* Reduce motion: disable animation */
@media (prefers-reduced-motion: reduce) {
  .glitch-layer {
    animation: none;
  }
}
</style>
