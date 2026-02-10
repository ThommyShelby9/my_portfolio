/**
 * useAnimations Composable
 * GSAP animations for terminal interactions
 */

import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { useTerminalStore } from '@/stores/terminal'

// Register GSAP plugins
gsap.registerPlugin(TextPlugin)

export function useAnimations() {
  const store = useTerminalStore()

  /**
   * Animate panel opening
   * Sequence: terminal shake → cyan flash → panel slide in
   */
  function animatePanelOpen(panelEl: HTMLElement): gsap.core.Timeline {
    const tl = gsap.timeline()

    // Check if reduced motion is enabled
    if (store.reducedMotion) {
      // Simple fade in only
      tl.from(panelEl, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out'
      })
      return tl
    }

    // 1. Terminal shake
    const terminalWindow = document.querySelector('.terminal-window')
    if (terminalWindow) {
      tl.to(terminalWindow, {
        x: -5,
        duration: 0.05,
        repeat: 3,
        yoyo: true,
        ease: 'none'
      })
      tl.to(terminalWindow, { x: 0, duration: 0.05 })
    }

    // 2. Cyan flash on terminal body
    const terminalBody = document.querySelector('.terminal-body')
    if (terminalBody) {
      tl.to(terminalBody, {
        backgroundColor: 'rgba(0, 255, 247, 0.1)',
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'none'
      }, '<')
    }

    // 3. Panel slide in from right
    tl.fromTo(panelEl, {
      x: '100%',
      opacity: 0
    }, {
      x: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    })

    return tl
  }

  /**
   * Animate panel closing
   * Slide out to the right
   */
  function animatePanelClose(panelEl: HTMLElement): gsap.core.Timeline {
    const tl = gsap.timeline()

    if (store.reducedMotion) {
      tl.to(panelEl, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      })
      return tl
    }

    tl.to(panelEl, {
      x: '100%',
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    })

    return tl
  }

  /**
   * Animate command execution
   * Brief flash on input
   */
  function animateCommandExecute(): gsap.core.Timeline {
    const tl = gsap.timeline()

    if (store.reducedMotion) {
      return tl
    }

    const inputEl = document.querySelector('.terminal-input-container')
    if (inputEl) {
      tl.to(inputEl, {
        opacity: 0.5,
        duration: 0.1,
        ease: 'none'
      })
      tl.to(inputEl, {
        opacity: 1,
        duration: 0.1,
        ease: 'none'
      })
    }

    return tl
  }

  /**
   * Animate error
   * Glitch effect with red flash
   */
  function animateError(): gsap.core.Timeline {
    const tl = gsap.timeline()

    if (store.reducedMotion) {
      return tl
    }

    const terminalWindow = document.querySelector('.terminal-window')
    const terminalBody = document.querySelector('.terminal-body')

    // 1. Glitch movement
    if (terminalWindow) {
      tl.to(terminalWindow, {
        x: () => Math.random() * 10 - 5,
        y: () => Math.random() * 10 - 5,
        duration: 0.05,
        repeat: 5,
        yoyo: true,
        ease: 'none'
      })
      tl.to(terminalWindow, { x: 0, y: 0, duration: 0.05 })
    }

    // 2. Red flash
    if (terminalBody) {
      tl.to(terminalBody, {
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'none'
      }, '<')
    }

    return tl
  }

  /**
   * Create cursor blink animation
   * Infinite loop with steps easing
   */
  function createCursorBlink(cursorEl: HTMLElement): gsap.core.Tween {
    if (store.reducedMotion) {
      return gsap.to(cursorEl, { opacity: 1 })
    }

    return gsap.to(cursorEl, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'steps(1)'
    })
  }

  /**
   * Type text animation (for easter eggs)
   * Character by character reveal - preserves newlines and formatting
   */
  function typeText(element: HTMLElement, text: string, speed = 0.03): gsap.core.Tween {
    if (store.reducedMotion) {
      element.textContent = text
      return gsap.to({}, { duration: 0 })
    }

    // Custom typing animation that preserves all formatting
    const obj = { progress: 0 }

    return gsap.to(obj, {
      progress: text.length,
      duration: text.length * speed,
      ease: 'none',
      onUpdate: () => {
        const currentLength = Math.floor(obj.progress)
        element.textContent = text.substring(0, currentLength)
      },
      onComplete: () => {
        // Ensure full text is displayed at the end
        element.textContent = text
      }
    })
  }

  /**
   * Shake element (for emphasis)
   */
  function shakeElement(element: HTMLElement | string): gsap.core.Timeline {
    const tl = gsap.timeline()

    if (store.reducedMotion) {
      return tl
    }

    tl.to(element, {
      x: -5,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: 'none'
    })
    tl.to(element, { x: 0, duration: 0.05 })

    return tl
  }

  /**
   * Glitch text effect
   */
  function glitchText(element: HTMLElement): gsap.core.Timeline {
    const tl = gsap.timeline()

    if (store.reducedMotion) {
      return tl
    }

    tl.to(element, {
      x: () => Math.random() * 5 - 2.5,
      duration: 0.05,
      repeat: 10,
      yoyo: true,
      ease: 'none',
      opacity: () => 0.5 + Math.random() * 0.5
    })
    tl.to(element, { x: 0, opacity: 1, duration: 0.05 })

    return tl
  }

  /**
   * Set performance mode
   * Speed up all animations
   */
  function setPerformanceMode(enabled: boolean) {
    if (enabled) {
      gsap.globalTimeline.timeScale(2) // 2x speed
    } else {
      gsap.globalTimeline.timeScale(1) // Normal speed
    }
  }

  /**
   * Kill all running animations
   * Used for reduced motion
   */
  function killAllAnimations() {
    gsap.globalTimeline.getChildren(true, true, true).forEach((tween) => {
      tween.kill()
    })
  }

  return {
    animatePanelOpen,
    animatePanelClose,
    animateCommandExecute,
    animateError,
    createCursorBlink,
    typeText,
    shakeElement,
    glitchText,
    setPerformanceMode,
    killAllAnimations
  }
}
