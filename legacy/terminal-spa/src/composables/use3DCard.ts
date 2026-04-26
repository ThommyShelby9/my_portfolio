/**
 * use3DCard Composable
 * 3D tilt effect for cards following mouse position
 * Uses VueUse for mouse tracking and element bounding
 */

import { computed, watch, type Ref } from 'vue'
import { useMouse, useElementBounding, useElementHover } from '@vueuse/core'
import { useTerminalStore } from '@/stores/terminal'
import { storeToRefs } from 'pinia'
import gsap from 'gsap'

interface Use3DCardOptions {
  maxRotation?: number
  intensity?: number
  glareEffect?: boolean
  resetDuration?: number
}

export function use3DCard(
  cardRef: Ref<HTMLElement | undefined>,
  options: Use3DCardOptions = {}
) {
  const {
    maxRotation = 15,
    intensity = 1.0,
    glareEffect = true,
    resetDuration = 0.5
  } = options

  // Get mouse position
  const { x: mouseX, y: mouseY } = useMouse()

  // Get card bounding rectangle
  const cardBounds = useElementBounding(cardRef)

  // Check if mouse is hovering over card
  const isHovered = useElementHover(cardRef)

  // Get reduced motion preference from store
  const store = useTerminalStore()
  const { reducedMotion } = storeToRefs(store)

  /**
   * Calculate card style with 3D transform
   */
  const cardStyle = computed(() => {
    // Disable effect if reduced motion, no card ref, or not hovering
    if (reducedMotion.value || !cardRef.value || !isHovered.value) {
      return {}
    }

    // Calculate mouse position relative to card center
    const centerX = cardBounds.left.value + cardBounds.width.value / 2
    const centerY = cardBounds.top.value + cardBounds.height.value / 2

    // Calculate offset as percentage (-1 to 1)
    const offsetX = (mouseX.value - centerX) / (cardBounds.width.value / 2)
    const offsetY = (mouseY.value - centerY) / (cardBounds.height.value / 2)

    // Apply rotation (invert Y for natural tilt)
    const rotateY = offsetX * maxRotation * intensity
    const rotateX = -offsetY * maxRotation * intensity

    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    }
  })

  /**
   * Calculate glare overlay style
   */
  const glareStyle = computed(() => {
    // Disable glare if reduced motion, no card ref, glare disabled, or not hovering
    if (reducedMotion.value || !cardRef.value || !glareEffect || !isHovered.value) {
      return {}
    }

    // Calculate glare position (0-100%)
    const glareX = ((mouseX.value - cardBounds.left.value) / cardBounds.width.value) * 100
    const glareY = ((mouseY.value - cardBounds.top.value) / cardBounds.height.value) * 100

    return {
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`,
      opacity: 1
    }
  })

  /**
   * Smooth reset animation when mouse leaves card
   */
  watch(isHovered, (hovered) => {
    if (!hovered && cardRef.value && !reducedMotion.value) {
      // Mouse left the card - reset to flat position with GSAP
      gsap.to(cardRef.value, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: resetDuration,
        ease: 'power2.out',
        clearProps: 'transform'
      })
    }
  })

  return {
    cardStyle,
    glareStyle,
    isHovered
  }
}
