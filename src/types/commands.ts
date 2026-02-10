/**
 * Command Types
 * Type definitions for the command system
 */

export interface CommandResult {
  type: 'text' | 'panel' | 'error' | 'success' | 'system'
  content?: string
  panelName?: string
  panelData?: any
}

export interface Command {
  name: string
  description: string
  usage: string
  aliases?: string[]
  handler: (args: string[], flags: Record<string, string | boolean>) => Promise<CommandResult> | CommandResult
}

export interface ParsedCommand {
  command: string
  args: string[]
  flags: Record<string, string | boolean>
}
