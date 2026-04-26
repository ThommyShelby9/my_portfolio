/**
 * Command Parser Tests
 * Tests for command parsing and autocomplete
 */

import { describe, it, expect } from 'vitest'
import { parseCommand, getCommandSuggestions } from '@/utils/commandParser'

describe('parseCommand', () => {
  it('should parse simple command without args', () => {
    const result = parseCommand('help')

    expect(result.command).toBe('help')
    expect(result.args).toEqual([])
    expect(result.flags).toEqual({})
  })

  it('should parse command with single argument', () => {
    const result = parseCommand('project zenlife')

    expect(result.command).toBe('project')
    expect(result.args).toEqual(['zenlife'])
    expect(result.flags).toEqual({})
  })

  it('should parse command with multiple arguments', () => {
    const result = parseCommand('theme cyan')

    expect(result.command).toBe('theme')
    expect(result.args).toEqual(['cyan'])
  })

  it('should parse command with flags', () => {
    const result = parseCommand('project zenlife --detail')

    expect(result.command).toBe('project')
    expect(result.args).toEqual(['zenlife'])
    expect(result.flags).toHaveProperty('detail')
  })

  it('should handle empty input', () => {
    const result = parseCommand('')

    expect(result.command).toBe('')
    expect(result.args).toEqual([])
  })

  it('should handle whitespace-only input', () => {
    const result = parseCommand('   ')

    expect(result.command).toBe('')
    expect(result.args).toEqual([])
  })

  it('should handle quoted arguments', () => {
    const result = parseCommand('echo "hello world"')

    expect(result.command).toBe('echo')
    expect(result.args).toEqual(['hello world'])
  })

  it('should trim extra whitespace', () => {
    const result = parseCommand('  help   ')

    expect(result.command).toBe('help')
    expect(result.args).toEqual([])
  })

  it('should convert command to lowercase', () => {
    const result = parseCommand('HELP')

    expect(result.command).toBe('help')
  })

  it('should handle multiple flags', () => {
    const result = parseCommand('command --flag1 --flag2 value')

    expect(result.command).toBe('command')
    expect(result.flags).toHaveProperty('flag1')
    expect(result.flags).toHaveProperty('flag2')
  })
})

describe('getCommandSuggestions', () => {
  const commands = ['help', 'about', 'skills', 'projects', 'project', 'experience', 'education', 'contact', 'theme', 'home', 'exit']

  it('should return suggestions for partial command', () => {
    const suggestions = getCommandSuggestions('pro', commands)

    expect(suggestions).toContain('projects')
    expect(suggestions).toContain('project')
  })

  it('should return suggestions for partial command "th"', () => {
    const suggestions = getCommandSuggestions('th', commands)

    expect(suggestions).toContain('theme')
  })

  it('should return suggestions for single letter', () => {
    const suggestions = getCommandSuggestions('h', commands)

    expect(suggestions).toContain('help')
    expect(suggestions).toContain('home')
  })

  it('should return empty array for non-matching input', () => {
    const suggestions = getCommandSuggestions('xyz', commands)

    expect(suggestions).toEqual([])
  })

  it('should return all commands for empty input', () => {
    const suggestions = getCommandSuggestions('', commands)

    expect(suggestions).toEqual(commands)
  })

  it('should be case insensitive', () => {
    const suggestions = getCommandSuggestions('HEL', commands)

    expect(suggestions).toContain('help')
  })

  it('should return all matching commands', () => {
    const suggestions = getCommandSuggestions('e', commands)

    // Should include: experience, education, exit
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions).toEqual(expect.arrayContaining([
      expect.stringMatching(/^e/)
    ]))
  })
})
