import { describe, it, expect } from 'vitest'
import { sectorColor, caseStudyToBody, buildBodies } from '../../../space/bodies'

const sample = {
  slug: 'zenlife', sector: 'Wellness · SaaS', duration: '3 mois (août — octobre 2024)',
  stack: ['Laravel 10', 'Vue 3', 'MySQL', 'TailwindCSS'], featured: false,
  results: [{ value: '1 200+', label: 'users' }],
}

describe('sectorColor', () => {
  it('maps known sector keywords to flux hexes (case-insensitive)', () => {
    expect(sectorColor('Fintech B2B')).toBe('#19c98c')
    expect(sectorColor('Data / AI')).toBe('#7a5cf0')
    expect(sectorColor('Wellness · SaaS')).toBe('#ff5aaa')
    expect(sectorColor('E-commerce')).toBe('#ffae3b')
  })
  it('falls back to violet for unknown sectors', () => {
    expect(sectorColor('Something else')).toBe('#9b86ff')
  })
})

describe('caseStudyToBody', () => {
  it('is deterministic for the same input', () => {
    const a = caseStudyToBody(sample, 3)
    const b = caseStudyToBody(sample, 3)
    expect(a).toEqual(b)
  })
  it('derives sane ranges', () => {
    const p = caseStudyToBody(sample, 3)
    expect(p.slug).toBe('zenlife')
    expect(p.color).toBe('#ff5aaa')
    expect(p.size).toBeGreaterThanOrEqual(0.7)
    expect(p.size).toBeLessThanOrEqual(1.5)
    expect(p.ringCount).toBeGreaterThanOrEqual(0)
    expect(p.ringCount).toBeLessThanOrEqual(3)
    expect(p.glow).toBeGreaterThanOrEqual(0.2)
    expect(p.glow).toBeLessThanOrEqual(1)
    expect(p.orbitRadius).toBeGreaterThan(0)
    expect(p.orbitPhase).toBeGreaterThanOrEqual(0)
    expect(p.orbitPhase).toBeLessThan(Math.PI * 2)
  })
  it('parses duration months into ring count', () => {
    expect(caseStudyToBody({ ...sample, duration: '1 mois' }, 0).ringCount).toBe(0)
    expect(caseStudyToBody({ ...sample, duration: '3 mois' }, 0).ringCount).toBe(1)
    expect(caseStudyToBody({ ...sample, duration: '8 mois' }, 0).ringCount).toBe(2)
    expect(caseStudyToBody({ ...sample, duration: '12 mois' }, 0).ringCount).toBe(3)
  })
})

describe('buildBodies', () => {
  it('maps a list preserving order and assigning increasing orbit radii', () => {
    const bodies = buildBodies([sample, { ...sample, slug: 'ccns', sector: 'Fintech' }])
    expect(bodies.map(b => b.slug)).toEqual(['zenlife', 'ccns'])
    expect(bodies[1].orbitRadius).toBeGreaterThan(bodies[0].orbitRadius)
  })
})
