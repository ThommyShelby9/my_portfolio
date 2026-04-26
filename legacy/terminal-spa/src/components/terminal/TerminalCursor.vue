<template>
  <span class="terminal-cursor" :class="{ blink: blink }"></span>
</template>

<script setup lang="ts">
defineProps<{
  blink?: boolean
}>()
</script>

<style scoped>
.terminal-cursor {
  @apply inline-block w-2 h-4 bg-theme-accent ml-0.5;
  animation: none;
}

.terminal-cursor.blink {
  animation: cursor-blink 1s step-end infinite;
}

@keyframes cursor-blink {
  0%, 50% {
    opacity: 1;
  }
  50.01%, 100% {
    opacity: 0;
  }
}
</style>
