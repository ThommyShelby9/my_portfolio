/**
 * Command Parser
 * Utility for parsing user input into command, args, and flags
 */

import type { ParsedCommand } from '@/types'

/**
 * Parse a command string into structured components
 *
 * Examples:
 *   "help" → { command: "help", args: [], flags: {} }
 *   "project zenlife" → { command: "project", args: ["zenlife"], flags: {} }
 *   "project zenlife --detail" → { command: "project", args: ["zenlife"], flags: { detail: true } }
 *   "theme cyan --save" → { command: "theme", args: ["cyan"], flags: { save: true } }
 */
export function parseCommand(input: string): ParsedCommand {
  // Trim and normalize whitespace
  const normalized = input.trim().replace(/\s+/g, ' ')

  if (!normalized) {
    return { command: '', args: [], flags: {} }
  }

  // Split by spaces, but respect quoted strings
  const parts = parseWithQuotes(normalized)

  if (parts.length === 0) {
    return { command: '', args: [], flags: {} }
  }

  const command = parts[0].toLowerCase()
  const args: string[] = []
  const flags: Record<string, string | boolean> = {}

  // Process remaining parts
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]

    // Check if it's a flag (starts with -- or -)
    if (part.startsWith('--')) {
      const flagName = part.slice(2)
      // Check if next part is the value
      if (i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
        flags[flagName] = parts[i + 1]
        i++ // Skip next part
      } else {
        flags[flagName] = true
      }
    } else if (part.startsWith('-') && part.length > 1) {
      // Short flags: -a -b -c
      const flagName = part.slice(1)
      flags[flagName] = true
    } else {
      // It's an argument
      args.push(part)
    }
  }

  return { command, args, flags }
}

/**
 * Parse string with support for quoted strings
 * "hello world" → ["hello", "world"]
 * "hello 'world foo'" → ["hello", "world foo"]
 */
function parseWithQuotes(str: string): string[] {
  const parts: string[] = []
  let current = ''
  let inQuotes = false
  let quoteChar = ''

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if ((char === '"' || char === "'") && !inQuotes) {
      // Start of quoted string
      inQuotes = true
      quoteChar = char
    } else if (char === quoteChar && inQuotes) {
      // End of quoted string
      inQuotes = false
      quoteChar = ''
      if (current) {
        parts.push(current)
        current = ''
      }
    } else if (char === ' ' && !inQuotes) {
      // Space outside quotes - word boundary
      if (current) {
        parts.push(current)
        current = ''
      }
    } else {
      // Regular character
      current += char
    }
  }

  // Add last part if exists
  if (current) {
    parts.push(current)
  }

  return parts
}

/**
 * Get command suggestions for autocomplete
 */
export function getCommandSuggestions(
  partial: string,
  availableCommands: string[]
): string[] {
  const normalized = partial.toLowerCase().trim()

  if (!normalized) {
    return availableCommands
  }

  return availableCommands.filter(cmd =>
    cmd.toLowerCase().startsWith(normalized)
  ).sort()
}

/**
 * Check if a command is valid
 */
export function isValidCommand(
  command: string,
  availableCommands: string[]
): boolean {
  return availableCommands.includes(command.toLowerCase())
}
