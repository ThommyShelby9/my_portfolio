<template>
  <div class="terminal-input-container">
    <!-- Prompt -->
    <div class="input-prompt">
      <span class="prompt-user accent">rostel</span>
      <span class="prompt-separator">@</span>
      <span class="prompt-host">missimawu</span>
      <span class="prompt-separator">:</span>
      <span class="prompt-path accent">~</span>
      <span class="prompt-symbol">$</span>
    </div>

    <!-- Input wrapper -->
    <div class="input-wrapper">
      <input
        ref="inputRef"
        v-model="currentInput"
        type="text"
        class="input-field"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        @keydown="handleKeyDown"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import { useTerminal } from '@/composables/useTerminal'
import { useKeyboard } from '@/composables/useKeyboard'
import { useAnimations } from '@/composables/useAnimations'

const store = useTerminalStore()
const { currentInput } = storeToRefs(store)
const { executeCommand } = useTerminal()
const keyboard = useKeyboard()
const animations = useAnimations()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)

// Auto-focus on mount and after command execution
onMounted(() => {
  focusInput()
})

watch(() => store.history.length, () => {
  focusInput()
})

function focusInput() {
  setTimeout(() => {
    inputRef.value?.focus()
  }, 100)
}

async function handleKeyDown(event: KeyboardEvent) {
  const key = event.key

  // Enter: Execute command
  if (key === 'Enter') {
    event.preventDefault()
    await handleSubmit()
  }
  // Tab: Autocomplete
  else if (key === 'Tab') {
    event.preventDefault()
    handleAutocomplete()
  }
  // Arrow Up: Previous command
  else if (key === 'ArrowUp') {
    event.preventDefault()
    navigateHistory('up')
  }
  // Arrow Down: Next command
  else if (key === 'ArrowDown') {
    event.preventDefault()
    navigateHistory('down')
  }
  // Ctrl+C: Cancel input
  else if (event.ctrlKey && key === 'c') {
    event.preventDefault()
    handleCancel()
  }
  // Ctrl+L: Clear screen
  else if (event.ctrlKey && key === 'l') {
    event.preventDefault()
    handleClear()
  }
  // Escape: Close panel if open
  else if (key === 'Escape') {
    event.preventDefault()
    keyboard.handleEscape()
  }
}

async function handleSubmit() {
  const input = currentInput.value.trim()

  if (!input) return

  // Animate command execution
  animations.animateCommandExecute()

  // Add to command history
  if (input !== commandHistory.value[commandHistory.value.length - 1]) {
    commandHistory.value.push(input)
  }
  historyIndex.value = commandHistory.value.length

  // Execute command
  await executeCommand(input)

  // Clear input
  store.setCurrentInput('')
}

function handleAutocomplete() {
  const input = currentInput.value.trim()

  if (!input) return

  // Get suggestions (will be implemented with useCommands)
  // For now, just placeholder
  console.log('Autocomplete:', input)
}

function navigateHistory(direction: 'up' | 'down') {
  if (commandHistory.value.length === 0) return

  if (direction === 'up') {
    if (historyIndex.value > 0) {
      historyIndex.value--
      store.setCurrentInput(commandHistory.value[historyIndex.value])
    }
  } else {
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++
      store.setCurrentInput(commandHistory.value[historyIndex.value])
    } else {
      historyIndex.value = commandHistory.value.length
      store.setCurrentInput('')
    }
  }
}

function handleCancel() {
  store.setCurrentInput('')
  store.addLine({
    type: 'system',
    content: '^C'
  })
}

function handleClear() {
  store.clearHistory()
}

// Expose focusInput method for parent component
defineExpose({
  focusInput
})
</script>

<style scoped>
.terminal-input-container {
  @apply flex items-center gap-2 font-mono text-sm;
  @apply mt-2;
}

.input-prompt {
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

.input-wrapper {
  @apply flex items-center flex-1 relative;
}

.input-field {
  @apply w-full bg-transparent border-none outline-none;
  @apply text-theme-primary font-mono;
  @apply caret-theme-accent;
  font-size: 16px; /* Prevent iOS auto-zoom on focus */
}

.input-field::placeholder {
  @apply text-theme-secondary;
}

/* Mobile: Ensure minimum font size */
@media (max-width: 768px) {
  .input-field {
    font-size: 16px !important;
  }
}

.accent {
  @apply text-theme-accent;
}
</style>
