<template>
  <div class="terminal-history">
    <div
      v-for="line in visibleHistory"
      :key="line.id"
      class="history-line"
      :class="`history-line-${line.type}`"
    >
      <!-- Input line with prompt -->
      <div v-if="line.type === 'input'" class="history-input">
        <span class="prompt">
          <span class="prompt-user accent">rostel</span>
          <span class="prompt-separator">@</span>
          <span class="prompt-host">kps</span>
          <span class="prompt-separator">:</span>
          <span class="prompt-path accent">~</span>
          <span class="prompt-symbol">$</span>
        </span>
        <span class="input-text">{{ line.content }}</span>
      </div>

      <!-- Output line -->
      <div v-else-if="line.type === 'output'" class="history-output">
        <pre class="output-text">{{ line.content }}</pre>
      </div>

      <!-- Error line -->
      <div v-else-if="line.type === 'error'" class="history-error">
        <span class="error-icon">✗</span>
        <pre class="error-text">{{ line.content }}</pre>
      </div>

      <!-- System line -->
      <div v-else-if="line.type === 'system'" class="history-system">
        <span class="system-icon">●</span>
        <pre class="system-text">{{ line.content }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'

const store = useTerminalStore()
const { history } = storeToRefs(store)

const visibleHistory = computed(() => history.value)
</script>

<style scoped>
.terminal-history {
  @apply flex flex-col gap-1 font-mono text-sm;
}

.history-line {
  @apply leading-relaxed;
}

/* Input line */
.history-input {
  @apply flex items-start gap-2;
}

.prompt {
  @apply flex items-center gap-1 flex-shrink-0;
}

.prompt-user,
.prompt-path {
  @apply text-cyan-neon font-semibold;
}

.prompt-separator {
  @apply text-text-secondary;
}

.prompt-host {
  @apply text-text-primary;
}

.prompt-symbol {
  @apply text-cyan-neon ml-1;
}

.input-text {
  @apply text-text-primary;
}

/* Output line */
.history-output {
  @apply pl-2;
}

.output-text {
  @apply text-text-primary whitespace-pre-wrap font-mono;
  word-break: break-word;
}

/* Error line */
.history-error {
  @apply flex items-start gap-2 pl-2;
}

.error-icon {
  @apply text-error flex-shrink-0 mt-0.5;
}

.error-text {
  @apply text-error whitespace-pre-wrap font-mono;
  word-break: break-word;
}

/* System line */
.history-system {
  @apply flex items-start gap-2 pl-2;
}

.system-icon {
  @apply text-cyan-neon flex-shrink-0 mt-0.5 text-xs;
}

.system-text {
  @apply text-cyan-neon whitespace-pre-wrap font-mono;
  word-break: break-word;
}

/* Accent color */
.accent {
  @apply text-cyan-neon;
}
</style>
