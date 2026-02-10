<template>
  <div v-if="suggestions.length > 0 && showSuggestions" class="autocomplete-dropdown">
    <div
      v-for="(suggestion, index) in suggestions"
      :key="suggestion"
      class="autocomplete-item"
      :class="{ 'active': index === selectedIndex }"
      @click="selectSuggestion(suggestion)"
      @mouseenter="selectedIndex = index"
    >
      <span class="suggestion-text">{{ suggestion }}</span>
      <span v-if="index === 0" class="suggestion-hint">Tab</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  suggestions: string[]
  showSuggestions: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [suggestion: string]
  close: []
}>()

const selectedIndex = ref(0)

// Watch suggestions to reset selected index
watch(() => props.suggestions, () => {
  selectedIndex.value = 0
})

function selectSuggestion(suggestion: string) {
  emit('select', suggestion)
}

function navigateUp() {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

function navigateDown() {
  if (selectedIndex.value < props.suggestions.length - 1) {
    selectedIndex.value++
  }
}

function selectCurrent() {
  if (props.suggestions[selectedIndex.value]) {
    selectSuggestion(props.suggestions[selectedIndex.value])
  }
}

// Expose navigation methods
defineExpose({
  navigateUp,
  navigateDown,
  selectCurrent,
  selectedIndex
})
</script>

<style scoped>
.autocomplete-dropdown {
  @apply absolute left-0 bottom-full mb-2;
  @apply bg-theme-secondary border border-theme rounded-lg;
  @apply shadow-2xl;
  @apply min-w-[200px] max-w-[400px];
  @apply overflow-hidden;
  box-shadow: 0 0 20px rgba(0, 255, 247, 0.2);
  animation: slideUp 0.2s ease-out;
}

.autocomplete-item {
  @apply flex items-center justify-between;
  @apply px-4 py-2;
  @apply text-theme-primary font-mono text-sm;
  @apply cursor-pointer;
  @apply transition-all duration-150;
  @apply border-b border-theme/50;
}

.autocomplete-item:last-child {
  @apply border-b-0;
}

.autocomplete-item:hover,
.autocomplete-item.active {
  @apply bg-theme-accent/10;
}

.autocomplete-item.active .suggestion-text {
  @apply text-theme-accent;
}

.suggestion-text {
  @apply flex-1;
}

.suggestion-hint {
  @apply text-xs text-theme-secondary;
  @apply px-2 py-0.5 rounded;
  @apply bg-theme-primary border border-theme;
}

.autocomplete-item.active .suggestion-hint {
  @apply text-theme-accent border-theme-accent;
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Reduce motion: disable animation */
@media (prefers-reduced-motion: reduce) {
  .autocomplete-dropdown {
    animation: none;
  }
}
</style>
