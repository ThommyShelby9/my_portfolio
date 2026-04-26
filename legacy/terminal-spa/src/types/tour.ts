/**
 * Tour System Types
 * Type definitions for the guided tour system
 */

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface TourStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector for element to highlight
  position: TooltipPosition
  action?: () => void // Optional action to perform when step is shown
  tips?: string[] // Additional tips/hints
}

export interface TourState {
  isActive: boolean
  currentStepIndex: number
  steps: TourStep[]
  completed: boolean
  skipped: boolean
}
