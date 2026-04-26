import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Re-declare the schema locally for the test (shape is small enough — avoids
// importing the @nuxt/content config which has Nuxt-only side effects).
const workSchema = z.object({
  slug: z.string(),
  title: z.string(),
  kicker: z.string(),
  excerpt: z.string(),
  year: z.number().int(),
  order: z.number().int().default(99),
  featured: z.boolean().default(false),
  client: z.string(),
  sector: z.string(),
  role: z.string(),
  team: z.string(),
  duration: z.string(),
  stack: z.array(z.string()),
  results: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1)
    .max(3),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

describe('case study front-matter schema', () => {
  it('accepts a complete valid front-matter', () => {
    const ok = workSchema.parse({
      slug: 'banque-regionale',
      title: 'Une plateforme de paiement pour une banque régionale',
      kicker: 'Issue 03 · Fintech B2B · 2024',
      excerpt: 'Comment nous avons remplacé un système legacy en six semaines.',
      year: 2024,
      featured: true,
      client: 'Banque régionale (anonymisé · NDA)',
      sector: 'Fintech / Paiement',
      role: 'Lead Engineer · Architecture · Livraison',
      team: '4 devs · 2 ops · 1 PO',
      duration: '6 semaines (Mar – Avr 2024)',
      stack: ['Django', 'DRF', 'PostgreSQL', 'Redis', 'K8s'],
      results: [
        { value: '+180 %', label: 'Volume traité en 6 mois' },
        { value: '12 000', label: 'Commerces migrés' },
        { value: '99,98 %', label: 'SLA tenu sur 12 mois' },
      ],
    })
    expect(ok.slug).toBe('banque-regionale')
    expect(ok.results).toHaveLength(3)
    expect(ok.order).toBe(99)
  })

  it('rejects empty results array', () => {
    expect(() =>
      workSchema.parse({
        slug: 'x',
        title: 'x',
        kicker: 'x',
        excerpt: 'x',
        year: 2024,
        client: 'x',
        sector: 'x',
        role: 'x',
        team: 'x',
        duration: 'x',
        stack: [],
        results: [],
      })
    ).toThrow()
  })

  it('rejects more than 3 results', () => {
    expect(() =>
      workSchema.parse({
        slug: 'x',
        title: 'x',
        kicker: 'x',
        excerpt: 'x',
        year: 2024,
        client: 'x',
        sector: 'x',
        role: 'x',
        team: 'x',
        duration: 'x',
        stack: [],
        results: [
          { value: '1', label: 'a' },
          { value: '2', label: 'b' },
          { value: '3', label: 'c' },
          { value: '4', label: 'd' },
        ],
      })
    ).toThrow()
  })
})
