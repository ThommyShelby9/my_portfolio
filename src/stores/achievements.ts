/**
 * Achievements Store
 * Pinia store for managing achievement system and gamification
 */

import { defineStore } from 'pinia'
import type { Achievement, AchievementStats } from '@/types/achievement'

// Predefined achievements
const ACHIEVEMENTS: Achievement[] = [
  // Explorer Category
  {
    id: 'first_steps',
    category: 'explorer',
    title: 'First Steps',
    description: 'Execute your first command',
    icon: '👣',
    condition: { type: 'command_count', count: 1 },
    unlocked: false
  },
  {
    id: 'help_seeker',
    category: 'explorer',
    title: 'RTFM',
    description: 'Read the manual by typing "help"',
    icon: '📖',
    condition: { type: 'specific_command', command: 'help' },
    unlocked: false
  },
  {
    id: 'project_explorer',
    category: 'explorer',
    title: 'Project Explorer',
    description: 'View the projects panel',
    icon: '🔍',
    condition: { type: 'view_all_panels', panels: ['projects'] },
    unlocked: false
  },
  {
    id: 'skill_seeker',
    category: 'explorer',
    title: 'Skill Seeker',
    description: 'Check out the skills panel',
    icon: '⚡',
    condition: { type: 'view_all_panels', panels: ['skills'] },
    unlocked: false
  },
  {
    id: 'full_tour',
    category: 'explorer',
    title: 'Full Tour',
    description: 'View all main panels (about, projects, skills, experience, contact)',
    icon: '🗺️',
    condition: { type: 'view_all_panels', panels: ['about', 'projects', 'skills', 'experience', 'contact'] },
    unlocked: false
  },

  // Commander Category
  {
    id: 'apprentice',
    category: 'commander',
    title: 'Apprentice',
    description: 'Execute 10 commands',
    icon: '🎓',
    condition: { type: 'command_count', count: 10 },
    unlocked: false,
    maxProgress: 10
  },
  {
    id: 'journeyman',
    category: 'commander',
    title: 'Journeyman',
    description: 'Execute 50 commands',
    icon: '💼',
    condition: { type: 'command_count', count: 50 },
    unlocked: false,
    maxProgress: 50
  },
  {
    id: 'master',
    category: 'commander',
    title: 'Master',
    description: 'Execute 100 commands',
    icon: '👑',
    condition: { type: 'command_count', count: 100 },
    unlocked: false,
    hidden: true,
    maxProgress: 100
  },

  // Secret Category
  {
    id: 'sudo_denied',
    category: 'secret',
    title: 'Sudo Denied',
    description: 'Try to use sudo command',
    icon: '🚫',
    condition: { type: 'specific_command', command: 'sudo' },
    unlocked: false,
    hidden: true
  },
  {
    id: 'matrix_neo',
    category: 'secret',
    title: 'Matrix Neo',
    description: 'Enter the Matrix',
    icon: '🕶️',
    condition: { type: 'specific_command', command: 'matrix' },
    unlocked: false,
    hidden: true
  },
  {
    id: 'theme_collector',
    category: 'secret',
    title: 'Theme Collector',
    description: 'Try all 4 themes',
    icon: '🎨',
    condition: { type: 'theme_collector' },
    unlocked: false,
    hidden: true
  },
  {
    id: 'whoami',
    category: 'secret',
    title: 'Identity Crisis',
    description: 'Question your existence with "whoami"',
    icon: '🤔',
    condition: { type: 'specific_command', command: 'whoami' },
    unlocked: false,
    hidden: true
  },

  // Speedrunner Category
  {
    id: 'speed_demon',
    category: 'speedrunner',
    title: 'Speed Demon',
    description: 'Execute 10 commands in under 30 seconds',
    icon: '⚡',
    condition: { type: 'speed_run', timeMs: 30000, actions: 10 },
    unlocked: false,
    hidden: true
  }
]

interface AchievementsState {
  achievements: Achievement[]
  activeToasts: Achievement[]
  stats: AchievementStats
}

export const useAchievementsStore = defineStore('achievements', {
  state: (): AchievementsState => ({
    achievements: JSON.parse(JSON.stringify(ACHIEVEMENTS)), // Deep clone
    activeToasts: [],
    stats: {
      commandsExecuted: 0,
      panelsViewed: new Set<string>(),
      themesUsed: new Set<string>(),
      sessionStartTime: Date.now(),
      sessionCommandTimes: []
    }
  }),

  getters: {
    unlockedAchievements: (state) => state.achievements.filter(a => a.unlocked),

    unlockedCount: (state) => state.achievements.filter(a => a.unlocked).length,

    totalCount: (state) => state.achievements.length,

    visibleAchievements: (state) => state.achievements.filter(a => !a.hidden || a.unlocked),

    progressPercent: (state) => {
      const unlocked = state.achievements.filter(a => a.unlocked).length
      const total = state.achievements.length
      return Math.round((unlocked / total) * 100)
    }
  },

  actions: {
    /**
     * Track user action and check for achievement unlocks
     */
    trackAction(actionType: string, metadata?: any) {
      // Update stats based on action type
      if (actionType === 'command_executed') {
        this.stats.commandsExecuted++
        this.stats.sessionCommandTimes.push(Date.now())

        // Check speed run achievement
        this.checkSpeedRun()

        // Check command count achievements
        this.checkCommandCount()

        // Check specific command achievements
        if (metadata?.command) {
          this.checkSpecificCommand(metadata.command)
        }
      } else if (actionType === 'panel_viewed') {
        if (metadata?.panel) {
          this.stats.panelsViewed.add(metadata.panel)
          this.checkPanelViewAchievements()
        }
      } else if (actionType === 'theme_changed') {
        if (metadata?.theme) {
          this.stats.themesUsed.add(metadata.theme)
          this.checkThemeCollector()
        }
      }

      // Save progress to localStorage
      this.saveToStorage()
    },

    /**
     * Check command count achievements
     */
    checkCommandCount() {
      const count = this.stats.commandsExecuted

      this.achievements.forEach(achievement => {
        if (
          !achievement.unlocked &&
          achievement.condition.type === 'command_count' &&
          achievement.condition.count &&
          count >= achievement.condition.count
        ) {
          this.unlockAchievement(achievement.id)
        } else if (
          achievement.condition.type === 'command_count' &&
          achievement.maxProgress
        ) {
          achievement.progress = Math.min(count, achievement.maxProgress)
        }
      })
    },

    /**
     * Check specific command achievements
     */
    checkSpecificCommand(commandName: string) {
      this.achievements.forEach(achievement => {
        if (
          !achievement.unlocked &&
          achievement.condition.type === 'specific_command' &&
          achievement.condition.command === commandName
        ) {
          this.unlockAchievement(achievement.id)
        }
      })
    },

    /**
     * Check panel view achievements
     */
    checkPanelViewAchievements() {
      this.achievements.forEach(achievement => {
        if (
          !achievement.unlocked &&
          achievement.condition.type === 'view_all_panels' &&
          achievement.condition.panels
        ) {
          const requiredPanels = achievement.condition.panels
          const viewedAll = requiredPanels.every(panel =>
            this.stats.panelsViewed.has(panel)
          )

          if (viewedAll) {
            this.unlockAchievement(achievement.id)
          }
        }
      })
    },

    /**
     * Check theme collector achievement
     */
    checkThemeCollector() {
      const themeAchievement = this.achievements.find(
        a => a.condition.type === 'theme_collector'
      )

      if (themeAchievement && !themeAchievement.unlocked) {
        // Check if all 4 themes have been used (cyan, amber, green, mono)
        const requiredThemes = ['cyan', 'amber', 'green', 'mono']
        const usedAll = requiredThemes.every(theme =>
          this.stats.themesUsed.has(theme)
        )

        if (usedAll) {
          this.unlockAchievement(themeAchievement.id)
        }
      }
    },

    /**
     * Check speed run achievement
     */
    checkSpeedRun() {
      const speedAchievement = this.achievements.find(
        a => a.condition.type === 'speed_run'
      )

      if (speedAchievement && !speedAchievement.unlocked) {
        const { timeMs = 30000, actions = 10 } = speedAchievement.condition

        // Get recent command times
        const recentCommands = this.stats.sessionCommandTimes.slice(-actions)

        if (recentCommands.length >= actions) {
          const firstCommand = recentCommands[0]
          const lastCommand = recentCommands[recentCommands.length - 1]
          const timeDiff = lastCommand - firstCommand

          if (timeDiff <= timeMs) {
            this.unlockAchievement(speedAchievement.id)
          }
        }
      }
    },

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievementId: string) {
      const achievement = this.achievements.find(a => a.id === achievementId)

      if (!achievement || achievement.unlocked) {
        return
      }

      // Mark as unlocked
      achievement.unlocked = true
      achievement.unlockedAt = new Date()

      // Show toast notification
      this.showToast(achievement)

      // Save to localStorage
      this.saveToStorage()
    },

    /**
     * Show achievement toast notification
     */
    showToast(achievement: Achievement) {
      // Add to active toasts (max 3 visible)
      if (this.activeToasts.length >= 3) {
        this.activeToasts.shift() // Remove oldest
      }

      this.activeToasts.push(achievement)

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        this.dismissToast(achievement.id)
      }, 5000)
    },

    /**
     * Dismiss a toast notification
     */
    dismissToast(achievementId: string) {
      const index = this.activeToasts.findIndex(a => a.id === achievementId)
      if (index !== -1) {
        this.activeToasts.splice(index, 1)
      }
    },

    /**
     * Load achievements from localStorage
     */
    loadFromStorage() {
      const saved = localStorage.getItem('rostel_achievements')

      if (saved) {
        try {
          const data = JSON.parse(saved)

          // Restore unlocked status
          if (data.achievements && Array.isArray(data.achievements)) {
            data.achievements.forEach((savedAch: any) => {
              const achievement = this.achievements.find(a => a.id === savedAch.id)
              if (achievement) {
                achievement.unlocked = savedAch.unlocked
                achievement.unlockedAt = savedAch.unlockedAt
                  ? new Date(savedAch.unlockedAt)
                  : undefined
                achievement.progress = savedAch.progress
              }
            })
          }
        } catch (error) {
          console.error('Failed to load achievements:', error)
        }
      }
    },

    /**
     * Save achievements to localStorage
     */
    saveToStorage() {
      const data = {
        achievements: this.achievements.map(a => ({
          id: a.id,
          unlocked: a.unlocked,
          unlockedAt: a.unlockedAt,
          progress: a.progress
        }))
      }

      localStorage.setItem('rostel_achievements', JSON.stringify(data))
    },

    /**
     * Reset all achievements (for testing)
     */
    resetAchievements() {
      this.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS))
      this.activeToasts = []
      this.stats = {
        commandsExecuted: 0,
        panelsViewed: new Set<string>(),
        themesUsed: new Set<string>(),
        sessionStartTime: Date.now(),
        sessionCommandTimes: []
      }
      localStorage.removeItem('rostel_achievements')
    }
  }
})
