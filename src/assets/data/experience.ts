/**
 * Experience Data
 * Work experience extracted from original HTML
 */

import type { Experience } from '@/types'

export const experienceData: Experience[] = [
  {
    id: 'gprhme',
    company: 'Cabinet GPRHME',
    position: 'Full-stack Developer',
    period: 'September 2024 - Present',
    location: 'Cotonou, Benin',
    description: 'Leading the development and continuous improvement of HR management platforms with a focus on security and user experience.',
    achievements: [
      'Development and improvement of the TadagbeRhPlus HR management platform',
      'Redesign of the TadagbeRhPlus platform for enhanced UX',
      'Design of related platforms (INTER-NAT, HIPEJUS)'
    ],
    tech: ['Django', 'Vue.js', 'MySQL', 'Laravel']
  },
  {
    id: 'leconsultant',
    company: 'LeConsultant',
    position: 'Full Stack Developer',
    period: 'August 2023 - December 2024',
    location: 'Benin',
    description: 'Designed and continuously improved a tender announcement platform connecting businesses with opportunities.',
    achievements: [
      'Design and continuous improvement of the LeConsultant tender announcement platform',
      'Implementation of real-time notification systems',
      'Optimization of search and filtering capabilities'
    ],
    tech: ['Laravel', 'JavaScript', 'MySQL']
  },
  {
    id: 'noizet',
    company: 'N01zet',
    position: 'QA Tests Automation (Freelance)',
    period: 'March 2024 - August 2024',
    location: 'Remote',
    description: 'Implemented automated testing solutions to ensure software quality and reliability.',
    achievements: [
      'Implementation of automated tests with Selenium, Java, and JUnit',
      'Created comprehensive test suites for web applications',
      'Improved testing efficiency and code coverage'
    ],
    tech: ['Selenium', 'Java', 'JUnit']
  },
  {
    id: 'dsmc',
    company: 'DSMC Benin',
    position: 'Full-stack Developer',
    period: 'March 2024 - July 2024',
    location: 'Benin',
    description: 'Developed payment solutions and enhanced cybersecurity platforms.',
    achievements: [
      'Design of a payment aggregator (Full Laravel)',
      'Improvement of the DSMC MILLENIUM CYBERSECURITY platform',
      'Integration of multiple payment gateways'
    ],
    tech: ['Laravel', 'PHP', 'MySQL']
  },
  {
    id: 'jscom',
    company: 'JSCOM-Bénin',
    position: 'Professional Internship',
    period: 'November 2023 - March 2024',
    location: 'Benin',
    description: 'Developed an inventory management system as part of professional training.',
    achievements: [
      'Development of an inventory management platform',
      'Built with Spring-Boot (Java) backend and VueJs frontend',
      'Implemented real-time stock tracking features'
    ],
    tech: ['Spring Boot', 'Java', 'Vue.js', 'PostgreSQL']
  }
]
