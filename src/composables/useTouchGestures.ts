/**
 * useTouchGestures Composable
 * Handle touch gestures for mobile devices
 */

import { useSwipe, type UseSwipeDirection } from '@vueuse/core'
import { useTerminalStore } from '@/stores/terminal'

export function useTouchGestures(target: HTMLElement | null | undefined) {
  const store = useTerminalStore()

  // Swipe detection
  const { direction, isSwiping } = useSwipe(target, {
    threshold: 50, // Minimum distance to trigger swipe (in pixels)
    onSwipeEnd(_e: TouchEvent, direction: UseSwipeDirection) {
      handleSwipe(direction)
    }
  })

  /**
   * Handle swipe gesture
   */
  function handleSwipe(swipeDirection: UseSwipeDirection) {
    // Swipe right: Close panel (if open)
    if (swipeDirection === 'right' && store.activePanel) {
      store.closePanel()
    }

    // Swipe left: Can be used for navigation in the future
    // if (swipeDirection === 'left') {
    //   // Navigate forward
    // }

    // Swipe down: Can be used to refresh or go back
    // if (swipeDirection === 'down') {
    //   // Go back or refresh
    // }
  }

  return {
    direction,
    isSwiping,
    handleSwipe
  }
}
