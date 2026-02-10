/**
 * Achievement Types
 * Type definitions for the achievement/gamification system
 */

export type AchievementCategory = 'explorer' | 'commander' | 'speedrunner' | 'secret'

export type AchievementConditionType =
  | 'command_count'
  | 'specific_command'
  | 'view_all_panels'
  | 'speed_run'
  | 'konami_code'
  | 'easter_egg'
  | 'theme_collector'

export interface AchievementCondition {
  type: AchievementConditionType
  count?: number
  command?: string
  panels?: string[]
  timeMs?: number
  actions?: number
  name?: string
}

export interface Achievement {
  id: string
  category: AchievementCategory
  title: string
  description: string
  icon: string
  condition: AchievementCondition
  unlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  hidden?: boolean
}

export interface AchievementStats {
  commandsExecuted: number
  panelsViewed: Set<string>
  themesUsed: Set<string>
  sessionStartTime: number
  sessionCommandTimes: number[]
}
