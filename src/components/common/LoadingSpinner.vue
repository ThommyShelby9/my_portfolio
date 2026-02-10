<template>
  <div class="loading-spinner" :class="{ 'small': size === 'sm', 'large': size === 'lg' }">
    <div class="spinner-ring"></div>
    <span v-if="text" class="spinner-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  text?: string
}>()
</script>

<style scoped>
.loading-spinner {
  @apply flex flex-col items-center justify-center gap-3;
}

.spinner-ring {
  @apply rounded-full border-4 border-border-color;
  border-top-color: var(--color-accent);
  animation: spin 1s linear infinite;
  width: 40px;
  height: 40px;
}

.loading-spinner.small .spinner-ring {
  width: 24px;
  height: 24px;
  @apply border-2;
}

.loading-spinner.large .spinner-ring {
  width: 60px;
  height: 60px;
}

.spinner-text {
  @apply text-sm text-text-secondary font-mono;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Reduce motion: slow down spin */
@media (prefers-reduced-motion: reduce) {
  .spinner-ring {
    animation-duration: 2s;
  }
}
</style>
