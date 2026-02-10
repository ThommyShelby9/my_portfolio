/**
 * useTour Composable
 * Convenience wrapper for tour store
 */

import { useTourStore } from '@/stores/tour'
import { storeToRefs } from 'pinia'

export function useTour() {
  const tourStore = useTourStore()
  const { isActive, currentStep, completed, skipped } = storeToRefs(tourStore)

  return {
    // State
    isActive,
    currentStep,
    completed,
    skipped,

    // Actions
    startTour: () => tourStore.startTour(),
    nextStep: () => tourStore.nextStep(),
    prevStep: () => tourStore.prevStep(),
    skipTour: () => tourStore.skipTour(),
    completeTour: () => tourStore.completeTour(),
    resetTour: () => tourStore.resetTour(),
    loadCompletion: () => tourStore.loadCompletion(),
    clearCompletion: () => tourStore.clearCompletion()
  }
}
