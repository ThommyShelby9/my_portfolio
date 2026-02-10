/**
 * Skills Data
 * Technical skills extracted from original HTML
 */

import type { Skill } from '@/types'

export const skillsData: Skill[] = [
  {
    category: 'Backend Development',
    skills: [
      { name: 'Java/Spring Boot', level: 5, proficiency: 'expert' },
      { name: 'Node.js', level: 4, proficiency: 'advanced' },
      { name: 'Django', level: 5, proficiency: 'expert' },
      { name: 'Laravel', level: 5, proficiency: 'expert' },
      { name: 'PHP', level: 4, proficiency: 'advanced' },
      { name: 'Hibernate', level: 4, proficiency: 'advanced' }
    ]
  },
  {
    category: 'Frontend Development',
    skills: [
      { name: 'Vue.js', level: 5, proficiency: 'expert' },
      { name: 'JavaScript', level: 5, proficiency: 'expert' },
      { name: 'TypeScript', level: 4, proficiency: 'advanced' },
      { name: 'Bootstrap', level: 4, proficiency: 'advanced' },
      { name: 'Tailwind CSS', level: 4, proficiency: 'advanced' },
      { name: 'HTML/CSS', level: 5, proficiency: 'expert' },
      { name: 'Nuxt.js', level: 4, proficiency: 'advanced' }
    ]
  },
  {
    category: 'Databases',
    skills: [
      { name: 'MySQL', level: 5, proficiency: 'expert' },
      { name: 'MongoDB', level: 4, proficiency: 'advanced' },
      { name: 'PostgreSQL', level: 4, proficiency: 'advanced' },
      { name: 'MariaDB', level: 4, proficiency: 'advanced' }
    ]
  },
  {
    category: 'DevOps & System Administration',
    skills: [
      { name: 'Linux Server', level: 4, proficiency: 'advanced' },
      { name: 'Docker', level: 4, proficiency: 'advanced' },
      { name: 'Linux Administration', level: 4, proficiency: 'advanced' },
      { name: 'Kubernetes', level: 3, proficiency: 'intermediate' }
    ]
  },
  {
    category: 'Testing & QA',
    skills: [
      { name: 'Selenium', level: 4, proficiency: 'advanced' },
      { name: 'JUnit', level: 4, proficiency: 'advanced' },
      { name: 'QA Automation', level: 4, proficiency: 'advanced' }
    ]
  },
  {
    category: 'Cybersecurity',
    skills: [
      { name: 'Cybersecurity Fundamentals', level: 4, proficiency: 'advanced' },
      { name: 'Cyber Defense', level: 4, proficiency: 'advanced' },
      { name: 'Web Application Security', level: 4, proficiency: 'advanced' }
    ]
  }
]

// Proficiency levels for overview
export const proficiencyLevels = [
  { area: 'Backend Development', percentage: 95 },
  { area: 'Frontend Development', percentage: 90 },
  { area: 'Database Management', percentage: 85 },
  { area: 'DevOps & System Administration', percentage: 80 },
  { area: 'Cybersecurity', percentage: 85 }
]
