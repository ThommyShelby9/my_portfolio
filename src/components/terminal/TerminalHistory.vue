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
          <span class="prompt-host">missimawu</span>
          <span class="prompt-separator">:</span>
          <span class="prompt-path accent">~</span>
          <span class="prompt-symbol">$</span>
        </span>
        <span class="input-text">{{ line.content }}</span>
      </div>

      <!-- Output line -->
      <div v-else-if="line.type === 'output'" class="history-output">
        <pre class="output-text" :data-line-id="line.id">{{ line.content }}</pre>
      </div>

      <!-- Error line -->
      <div v-else-if="line.type === 'error'" class="history-error">
        <span class="error-icon">✗</span>
        <pre class="error-text">{{ line.content }}</pre>
      </div>

      <!-- System line -->
      <div v-else-if="line.type === 'system'" class="history-system">
        <span class="system-icon">●</span>
        <pre class="system-text" :data-line-id="line.id">{{ line.content }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import { useAnimations } from '@/composables/useAnimations'

const store = useTerminalStore()
const { history, reducedMotion } = storeToRefs(store)
const animations = useAnimations()

const visibleHistory = computed(() => history.value)
const animatedIds = ref(new Set<string>())

// Watch for new history entries and apply typing animation
watch(() => history.value.length, async () => {
  const lastLine = history.value[history.value.length - 1]

  // Only animate if:
  // 1. Line has animated flag set
  // 2. Haven't animated this line before
  // 3. Reduced motion is disabled
  // 4. Line type is output or system
  if (
    lastLine?.animated &&
    !animatedIds.value.has(lastLine.id) &&
    !reducedMotion.value &&
    (lastLine.type === 'output' || lastLine.type === 'system')
  ) {
    await nextTick()

    const element = document.querySelector(`[data-line-id="${lastLine.id}"]`)
    if (element) {
      // Mark as animated
      animatedIds.value.add(lastLine.id)

      // Clear initial content and apply typing animation
      const originalContent = lastLine.content
      element.textContent = ''

      // Use GSAP typeText animation
      animations.typeText(
        element as HTMLElement,
        originalContent,
        lastLine.animationSpeed || 0.03
      )
    }
  }
})
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
  @apply text-theme-accent font-semibold;
}

.prompt-separator {
  @apply text-theme-secondary;
}

.prompt-host {
  @apply text-theme-primary;
}

.prompt-symbol {
  @apply text-theme-accent ml-1;
}

.input-text {
  @apply text-theme-primary;
}

/* Output line */
.history-output {
  @apply pl-2;
}

.output-text {
  @apply text-theme-primary font-mono;
  white-space: pre-wrap;
  word-wrap: normal;
  overflow-wrap: normal;
}

/* Error line */
.history-error {
  @apply flex items-start gap-2 pl-2;
}

.error-icon {
  @apply text-error flex-shrink-0 mt-0.5;
}

.error-text {
  @apply text-error font-mono;
  white-space: pre-wrap;
  word-wrap: normal;
  overflow-wrap: normal;
}

/* System line */
.history-system {
  @apply flex items-start gap-2 pl-2;
}

.system-icon {
  @apply text-theme-accent flex-shrink-0 mt-0.5 text-xs;
}

.system-text {
  @apply text-theme-accent font-mono;
  white-space: pre-wrap;
  word-wrap: normal;
  overflow-wrap: normal;
}

/* Accent color */
.accent {
  @apply text-theme-accent;
}
</style>
