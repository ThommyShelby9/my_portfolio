/**
 * Projects Data
 * Portfolio projects extracted from original HTML
 */

import type { Project } from '@/types'

export const projectsData: Project[] = [
  {
    slug: 'zenlife',
    name: 'ZenLife',
    description: 'Find your balance and serenity. ZenLife accompanies you in your quest for daily well-being. Plan your life, manage your finances, track your health, and cultivate positivity with ease.',
    tech: ['Spring Boot', 'Vue.js', 'PostgreSQL'],
    status: 'completed',
    links: {
      live: 'https://zenlife-gs2w.onrender.com/'
    },
    image: '/images/zenlife.png',
    highlights: [
      'Life planning and goal tracking system',
      'Personal finance management dashboard',
      'Health metrics monitoring',
      'Integrated wellness features'
    ]
  },
  {
    slug: 'ccns',
    name: 'Commission Catholique Nationale pour la Santé',
    description: 'Complete platform for the National Catholic Health Commission, offering management, monitoring, and coordination services for nationwide health initiatives.',
    tech: ['Node.js', 'Vue.js', 'MongoDB'],
    status: 'completed',
    links: {
      live: 'https://ccnsbenin.vercel.app/'
    },
    image: '/images/ccns.png',
    highlights: [
      'Health program management system',
      'Nationwide coordination platform',
      'Real-time monitoring and reporting',
      'Multi-level access control'
    ]
  },
  {
    slug: 'tadagberhplus',
    name: 'TadagbeRhPlus',
    company: 'Cabinet GPRHME',
    description: 'HR management platform with comprehensive employee tracking, payroll, and performance evaluation features.',
    tech: ['Django', 'Vue.js', 'MySQL'],
    status: 'in-progress',
    image: '/images/tadagbe.png',
    highlights: [
      'Complete HR management solution',
      'Employee tracking and attendance',
      'Payroll processing system',
      'Performance evaluation tools',
      'Currently being redesigned for enhanced UX'
    ]
  },
  {
    slug: 'bilal-sekou',
    name: 'Bilal Sekou Portfolio',
    description: 'Portfolio website showcasing Bilal Sekou\'s skills and projects with modern design and smooth animations.',
    tech: ['Nuxt.js', 'Node.js', 'MongoDB'],
    status: 'completed',
    links: {
      live: 'https://bilalsekou.onrender.com/'
    },
    image: '/images/bilal.png',
    highlights: [
      'Modern portfolio design',
      'Project showcase system',
      'Contact form integration',
      'Responsive across all devices'
    ]
  },
  {
    slug: 'leconsultant',
    name: 'LeConsultant Platform',
    company: 'LeConsultant',
    description: 'Tender announcement platform providing businesses with timely updates on new opportunities across various sectors.',
    tech: ['Laravel', 'JavaScript', 'MySQL'],
    status: 'completed',
    links: {
      live: 'https://leconsultant.bj/'
    },
    image: '/images/consultant.png',
    highlights: [
      'Real-time tender announcements',
      'Advanced search and filtering',
      'Email notification system',
      'Business opportunity tracking',
      'Continuous platform improvements'
    ]
  }
]
