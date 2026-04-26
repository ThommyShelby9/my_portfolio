/**
 * useKonamiCode Composable
 * Detect Konami code sequence: ↑ ↑ ↓ ↓ ← → ← → B A
 */

import { ref, onMounted, onUnmounted } from 'vue'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA'
]

export function useKonamiCode(callback: () => void) {
  const sequence = ref<string[]>([])
  const isActivated = ref(false)

  function handleKeyDown(event: KeyboardEvent) {
    // Add key to sequence
    sequence.value.push(event.code)

    // Keep only the last 10 keys
    if (sequence.value.length > KONAMI_CODE.length) {
      sequence.value.shift()
    }

    // Check if sequence matches Konami code
    if (sequence.value.length === KONAMI_CODE.length) {
      const matches = KONAMI_CODE.every((key, index) => key === sequence.value[index])

      if (matches && !isActivated.value) {
        isActivated.value = true
        callback()

        // Reset after activation
        setTimeout(() => {
          sequence.value = []
          isActivated.value = false
        }, 5000)
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    isActivated
  }
}
