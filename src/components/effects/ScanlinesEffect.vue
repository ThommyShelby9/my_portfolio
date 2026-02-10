<template>
  <div
    class="scanlines-effect"
    :class="{ 'scanlines-visible': visible }"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'

const store = useTerminalStore()
const { fxEnabled, reducedMotion } = storeToRefs(store)

const visible = ref(fxEnabled.value && !reducedMotion.value)

// Watch for FX and reduced motion changes
watch([fxEnabled, reducedMotion], () => {
  visible.value = fxEnabled.value && !reducedMotion.value
})
</script>

<style scoped>
.scanlines-effect {
  @apply fixed inset-0 pointer-events-none z-40;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 247, 0.03) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 247, 0.03) 3px
  );
  animation: scanlines-move 8s linear infinite;
}

.scanlines-visible {
  opacity: 1;
}

@keyframes scanlines-move {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100px;
  }
}

/* Reduce motion: disable animation */
@media (prefers-reduced-motion: reduce) {
  .scanlines-effect {
    animation: none;
  }
}
</style>
