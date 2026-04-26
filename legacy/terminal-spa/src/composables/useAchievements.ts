/**
 * useAchievements Composable
 * Convenience wrapper for the achievements store
 */

import { storeToRefs } from 'pinia'
import { useAchievementsStore } from '@/stores/achievements'

export function useAchievements() {
  const store = useAchievementsStore()

  const {
    achievements,
    activeToasts,
    stats,
    unlockedAchievements,
    unlockedCount,
    totalCount,
    visibleAchievements,
    progressPercent
  } = storeToRefs(store)

  /**
   * Track a user action
   */
  function trackAction(actionType: string, metadata?: any) {
    store.trackAction(actionType, metadata)
  }

  /**
   * Show achievement notification
   */
  function showAchievement(achievementId: string) {
    const achievement = store.achievements.find(a => a.id === achievementId)
    if (achievement) {
      store.showToast(achievement)
    }
  }

  /**
   * Dismiss a toast notification
   */
  function dismissToast(achievementId: string) {
    store.dismissToast(achievementId)
  }

  /**
   * Load achievements from storage
   */
  function loadAchievements() {
    store.loadFromStorage()
  }

  /**
   * Reset achievements (for testing)
   */
  function resetAchievements() {
    store.resetAchievements()
  }

  return {
    // State
    achievements,
    activeToasts,
    stats,
    unlockedAchievements,
    unlockedCount,
    totalCount,
    visibleAchievements,
    progressPercent,

    // Methods
    trackAction,
    showAchievement,
    dismissToast,
    loadAchievements,
    resetAchievements
  }
}
