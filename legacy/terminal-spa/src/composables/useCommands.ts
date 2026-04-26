/**
 * useCommands Composable
 * Command system implementation with all portfolio commands
 */

import { useTerminalStore } from '@/stores/terminal'
import { useAchievementsStore } from '@/stores/achievements'
import type { CommandResult, Command } from '@/types'
import { getCommandSuggestions } from '@/utils/commandParser'
import { useTheme, getThemeNames } from './useTheme'
import { useTour } from './useTour'
import {
  aboutData,
  projectsData,
  experienceData,
  educationData,
  skillsData
} from '@/assets/data'

export function useCommands() {
  const store = useTerminalStore()
  const achievementsStore = useAchievementsStore()
  const { setTheme } = useTheme()
  const tour = useTour()

  /**
   * Command registry
   */
  const commands: Record<string, Command> = {
    help: {
      name: 'help',
      description: 'Show all available commands',
      usage: 'help',
      category: 'navigation',
      handler: () => commandHelp()
    },

    about: {
      name: 'about',
      description: 'Display information about me',
      usage: 'about',
      category: 'navigation',
      aliases: ['info'],
      handler: () => commandAbout()
    },

    skills: {
      name: 'skills',
      description: 'View technical skills and proficiency',
      usage: 'skills',
      category: 'navigation',
      handler: () => commandSkills()
    },

    projects: {
      name: 'projects',
      description: 'List all projects',
      usage: 'projects',
      category: 'navigation',
      aliases: ['ls', 'list'],
      handler: () => commandProjects()
    },

    project: {
      name: 'project',
      description: 'View project details',
      usage: 'project <slug>',
      category: 'navigation',
      aliases: ['cd', 'open'],
      handler: (args) => commandProject(args)
    },

    experience: {
      name: 'experience',
      description: 'View work experience timeline',
      usage: 'experience',
      category: 'navigation',
      aliases: ['exp', 'work'],
      handler: () => commandExperience()
    },

    education: {
      name: 'education',
      description: 'View education and certifications',
      usage: 'education',
      category: 'navigation',
      aliases: ['edu', 'cert'],
      handler: () => commandEducation()
    },

    contact: {
      name: 'contact',
      description: 'Get contact information',
      usage: 'contact',
      category: 'navigation',
      handler: () => commandContact()
    },

    cv: {
      name: 'cv',
      description: 'Download CV/Resume',
      usage: 'cv',
      category: 'navigation',
      aliases: ['resume', 'download'],
      handler: () => commandCV()
    },

    clear: {
      name: 'clear',
      description: 'Clear terminal screen',
      usage: 'clear',
      category: 'configuration',
      aliases: ['cls'],
      handler: () => commandClear()
    },

    theme: {
      name: 'theme',
      description: 'Change color theme',
      usage: 'theme <cyan|amber|green|mono>',
      category: 'configuration',
      handler: (args) => commandTheme(args)
    },

    fx: {
      name: 'fx',
      description: 'Toggle visual effects',
      usage: 'fx <on|off>',
      category: 'configuration',
      handler: (args) => commandFx(args)
    },

    intro: {
      name: 'intro',
      description: 'Toggle boot sequence',
      usage: 'intro <on|off>',
      category: 'configuration',
      handler: (args) => commandIntro(args)
    },

    back: {
      name: 'back',
      description: 'Go back to terminal',
      usage: 'back',
      category: 'navigation',
      aliases: ['exit', 'close'],
      handler: () => commandBack()
    },

    home: {
      name: 'home',
      description: 'Return to home screen',
      usage: 'home',
      category: 'navigation',
      handler: () => commandHome()
    },

    tour: {
      name: 'tour',
      description: 'Start guided tour',
      usage: 'tour',
      category: 'system',
      aliases: ['guide', 'help-tour'],
      handler: () => commandTour()
    },

    // Easter egg commands
    sudo: {
      name: 'sudo',
      description: 'Execute command as superuser',
      usage: 'sudo <command>',
      category: 'easter-eggs',
      handler: () => commandSudo()
    },

    whoami: {
      name: 'whoami',
      description: 'Display current user information',
      usage: 'whoami',
      category: 'easter-eggs',
      handler: () => commandWhoami()
    },

    matrix: {
      name: 'matrix',
      description: 'Enter the Matrix',
      category: 'easter-eggs',
      usage: 'matrix',
      handler: () => commandMatrix()
    }
  }

  /**
   * Execute a command
   */
  async function executeCommand(
    commandName: string,
    args: string[] = [],
    flags: Record<string, string | boolean> = {}
  ): Promise<CommandResult> {
    // Normalize command name
    const normalizedCommand = commandName.toLowerCase()

    // Find command (including aliases)
    let command = commands[normalizedCommand]

    if (!command) {
      // Check aliases
      for (const cmd of Object.values(commands)) {
        if (cmd.aliases?.includes(normalizedCommand)) {
          command = cmd
          break
        }
      }
    }

    if (!command) {
      return {
        type: 'error',
        content: `Command not found: ${commandName}\nType 'help' to see available commands.`
      }
    }

    try {
      // Track command execution for achievements
      achievementsStore.trackAction('command_executed', { command: commandName })

      return await command.handler(args, flags)
    } catch (error) {
      return {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get command suggestions for autocomplete
   */
  function getSuggestions(partial: string): string[] {
    const allCommands = Object.keys(commands)
    return getCommandSuggestions(partial, allCommands)
  }

  /**
   * Get all available commands
   */
  function getAllCommands(): Command[] {
    return Object.values(commands)
  }

  // ============================================
  // Command Implementations
  // ============================================

  function commandHelp(): CommandResult {
    const helpText = `
Available Commands:

NAVIGATION
  help              Show this help message
  about             Display information about me
  skills            View technical skills
  projects          List all projects
  project <slug>    View specific project details
  experience        View work experience
  education         View education and certifications
  contact           Get contact information
  cv                Download CV/Resume

CONFIGURATION
  theme <name>      Change theme (cyan|amber|green|mono)
  fx <on|off>       Toggle visual effects
  intro <on|off>    Toggle boot sequence
  clear             Clear terminal screen

NAVIGATION
  back              Close current panel
  home              Return to terminal

ALIASES
  ls, list          Same as 'projects'
  cd, open          Same as 'project'
  whoami, info      Same as 'about'
  exp, work         Same as 'experience'
  edu, cert         Same as 'education'
  cls               Same as 'clear'
  exit, close       Same as 'back'

Type any command to get started!
    `.trim()

    return { type: 'text', content: helpText, animated: true, animationSpeed: 0.005 }
  }

  function commandAbout(): CommandResult {
    // Track panel view for achievements
    achievementsStore.trackAction('panel_viewed', { panel: 'about' })

    return {
      type: 'panel',
      panelName: 'about',
      panelData: { about: aboutData }
    }
  }

  function commandSkills(): CommandResult {
    // Track panel view for achievements
    achievementsStore.trackAction('panel_viewed', { panel: 'skills' })

    return {
      type: 'panel',
      panelName: 'skills',
      panelData: { skills: skillsData }
    }
  }

  function commandProjects(): CommandResult {
    // Track panel view for achievements
    achievementsStore.trackAction('panel_viewed', { panel: 'projects' })

    return {
      type: 'panel',
      panelName: 'projects',
      panelData: { projects: projectsData }
    }
  }

  function commandProject(args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'error',
        content: 'Please specify a project slug.\nUsage: project <slug>\nType \'projects\' to see available projects.'
      }
    }

    const slug = args[0].toLowerCase()
    const project = projectsData.find(p => p.slug === slug)

    if (!project) {
      const availableSlugs = projectsData.map(p => p.slug).join(', ')
      return {
        type: 'error',
        content: `Project not found: ${slug}\nAvailable projects: ${availableSlugs}`
      }
    }

    return {
      type: 'panel',
      panelName: 'project-detail',
      panelData: { project }
    }
  }

  function commandExperience(): CommandResult {
    // Track panel view for achievements
    achievementsStore.trackAction('panel_viewed', { panel: 'experience' })

    return {
      type: 'panel',
      panelName: 'experience',
      panelData: { experiences: experienceData }
    }
  }

  function commandEducation(): CommandResult {
    const eduText = `
EDUCATION & CERTIFICATIONS
═══════════════════════════════════════════════════════════

${educationData.map(edu => `
${edu.institution}
  ${edu.degree}${edu.field ? ` - ${edu.field}` : ''}
  ${edu.period}
  ${edu.description || ''}
`).join('\n')}

Type 'skills' to see technical proficiency
Type 'experience' to see work history
    `.trim()

    return { type: 'text', content: eduText, animated: true, animationSpeed: 0.01 }
  }

  function commandContact(): CommandResult {
    // Track panel view for achievements
    achievementsStore.trackAction('panel_viewed', { panel: 'contact' })

    return {
      type: 'panel',
      panelName: 'contact',
      panelData: aboutData
    }
  }

  function commandCV(): CommandResult {
    // Open CV in new tab
    window.open('/assets/Rostel_Missimawu.pdf', '_blank')

    return {
      type: 'success',
      content: `Opening CV in new tab... ✓

Download: /assets/Rostel_Missimawu.pdf

You can also find my full profile on LinkedIn:
${aboutData.linkedin}`
    }
  }

  function commandClear(): CommandResult {
    store.clearHistory()
    return { type: 'system', content: '' }
  }

  function commandTheme(args: string[]): CommandResult {
    const validThemes = getThemeNames()

    if (args.length === 0) {
      return {
        type: 'text',
        content: `Available themes: ${validThemes.join(', ')}\nCurrent theme: ${store.theme}\n\nUsage: theme <name>`
      }
    }

    const themeName = args[0].toLowerCase()

    if (!validThemes.includes(themeName)) {
      return {
        type: 'error',
        content: `Unknown theme: ${themeName}\nAvailable themes: ${validThemes.join(', ')}`
      }
    }

    // Apply theme using useTheme composable
    const success = setTheme(themeName)

    if (!success) {
      return {
        type: 'error',
        content: `Failed to apply theme: ${themeName}`
      }
    }

    // Track theme change for achievements
    achievementsStore.trackAction('theme_changed', { theme: themeName })

    return {
      type: 'success',
      content: `Theme changed to: ${themeName}`
    }
  }

  function commandFx(args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'text',
        content: `Visual effects are currently: ${store.fxEnabled ? 'ON' : 'OFF'}\n\nUsage: fx <on|off>`
      }
    }

    const state = args[0].toLowerCase()

    if (state !== 'on' && state !== 'off') {
      return {
        type: 'error',
        content: 'Invalid argument. Usage: fx <on|off>'
      }
    }

    const enabled = state === 'on'
    store.toggleFx(enabled)

    return {
      type: 'success',
      content: `Visual effects ${enabled ? 'enabled' : 'disabled'}`
    }
  }

  function commandIntro(args: string[]): CommandResult {
    if (args.length === 0) {
      return {
        type: 'text',
        content: `Boot sequence is currently: ${store.introEnabled ? 'ON' : 'OFF'}\n\nUsage: intro <on|off>`
      }
    }

    const state = args[0].toLowerCase()

    if (state !== 'on' && state !== 'off') {
      return {
        type: 'error',
        content: 'Invalid argument. Usage: intro <on|off>'
      }
    }

    const enabled = state === 'on'
    store.toggleIntro(enabled)

    return {
      type: 'success',
      content: `Boot sequence ${enabled ? 'enabled' : 'disabled'}. Refresh page to see changes.`
    }
  }

  function commandBack(): CommandResult {
    if (store.mode === 'panel') {
      store.closePanel()
      return { type: 'system', content: '' }
    }

    return {
      type: 'text',
      content: 'Already in terminal mode.'
    }
  }

  function commandHome(): CommandResult {
    store.closePanel()
    store.clearHistory()
    return {
      type: 'system',
      content: 'Welcome back! Type \'help\' to see available commands.'
    }
  }

  function commandTour(): CommandResult {
    tour.startTour()
    return {
      type: 'success',
      content: 'Starting guided tour... Follow the instructions on screen!'
    }
  }

  /**
   * Easter Egg Commands
   */

  function commandSudo(): CommandResult {
    return {
      type: 'error',
      content: `[sudo] password for rostel:
Permission denied.

Nice try! But you don't have root access here. 😏
This is my portfolio, not your server!

Try 'help' to see what you CAN do.`
    }
  }

  function commandWhoami(): CommandResult {
    return {
      type: 'text',
      content: `visitor@rostel-os

╭──────────────────────────────────╮
│  Role: Guest User                │
│  Permissions: Read-only          │
│  Access Level: Public            │
│  Session: Active                 │
╰──────────────────────────────────╯

Want to know more about the owner?
Type 'about' to learn about Rostel PANOUMASSI.`,
      animated: true,
      animationSpeed: 0.015
    }
  }

  function commandMatrix(): CommandResult {
    // Trigger Matrix rain effect
    if (typeof window !== 'undefined' && (window as any).triggerMatrix) {
      (window as any).triggerMatrix()

      return {
        type: 'success',
        content: `
╔════════════════════════════════════════╗
║  Welcome to the Matrix, Neo...  ║
╚════════════════════════════════════════╝

Following the white rabbit... 🐰

The Matrix rain effect is now active!
Press ESC or click anywhere to exit.

"There is no spoon."`,
        animated: true,
        animationSpeed: 0.02
      }
    }

    return {
      type: 'error',
      content: 'Matrix effect not available. Please reload the page.'
    }
  }

  return {
    executeCommand,
    getSuggestions,
    getAllCommands,
    commands
  }
}
