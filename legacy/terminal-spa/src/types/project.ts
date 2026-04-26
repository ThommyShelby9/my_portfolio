/**
 * Project Types
 * Type definitions for portfolio content
 */

export interface Project {
  slug: string
  name: string
  company?: string
  period?: string
  description: string
  tags?: string[]
  highlights: string[]
  tech: string[]
  status: 'completed' | 'in-progress'
  links?: {
    live?: string
    code?: string
    demo?: string
  }
  image?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  period: string
  location: string
  description: string
  achievements: string[]
  tech?: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field?: string
  period: string
  location?: string
  description?: string
}

export interface Skill {
  category: string
  skills: Array<{
    name: string
    level?: number // 1-5
    proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }>
}

export interface AboutData {
  name: string
  role: string
  company: string
  location: string
  email: string
  linkedin: string
  phone?: string
  bio: string
  availability?: string
}
