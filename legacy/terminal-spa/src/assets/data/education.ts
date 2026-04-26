/**
 * Education Data
 * Education and certifications extracted from original HTML
 */

import type { Education } from '@/types'

export const educationData: Education[] = [
  {
    id: 'ecole229',
    institution: 'Ecole 229',
    degree: 'Certification',
    field: 'Web and Mobile Development',
    period: 'March 2023 - March 2024',
    location: 'Benin',
    description: 'Comprehensive training in modern web and mobile development technologies, including full-stack development, API design, and mobile app creation.'
  },
  {
    id: 'mindluster',
    institution: 'Mindluster',
    degree: 'Certificate',
    field: 'Computer and Information Systems Security',
    period: 'January 2025 - February 2025',
    description: 'Advanced certification focusing on cybersecurity principles, threat detection, and information systems security best practices.'
  },
  {
    id: 'asin',
    institution: 'ASIN',
    degree: 'Attestation',
    field: 'Computer and Information Systems Security',
    period: 'December 2023',
    description: 'Specialized training in computer security, network protection, and secure software development practices.'
  },
  {
    id: 'injeps',
    institution: 'INJEPS',
    degree: 'Professional License',
    field: 'STASE option Andragogie',
    period: 'October 2019 - August 2022',
    location: 'Benin',
    description: 'Professional license program focusing on adult education and training methodologies.'
  }
]
