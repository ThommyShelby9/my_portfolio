import { describe, it, expect } from 'vitest'
import { briefSchema } from '../../server/utils/schemas/brief'

const valid = {
  projectType: 'new',
  pitch: 'Une plateforme de paiement B2B pour des PME africaines.',
  currentState: 'idea',
  teamSize: 'solo',
  hasTechTeam: false,
  hasDesigner: false,
  hasProductOwner: false,
  notes: null,
  deadline: '1-3m',
  budget: '15-40k',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  company: null,
  website: null,
  source: null,
  prefersCall: false,
  turnstileToken: 'fake-token',
  locale: 'fr' as const,
} as const

describe('briefSchema', () => {
  it('accepts a complete valid payload', () => {
    expect(() => briefSchema.parse(valid)).not.toThrow()
  })

  it('rejects an invalid email', () => {
    const r = briefSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues.some(i => i.path.includes('email'))).toBe(true)
    }
  })

  it('rejects an enum mismatch on projectType', () => {
    const r = briefSchema.safeParse({ ...valid, projectType: 'bogus' })
    expect(r.success).toBe(false)
  })

  it('rejects pitch over 500 chars', () => {
    const r = briefSchema.safeParse({ ...valid, pitch: 'x'.repeat(501) })
    expect(r.success).toBe(false)
  })

  it('rejects empty firstName', () => {
    const r = briefSchema.safeParse({ ...valid, firstName: '' })
    expect(r.success).toBe(false)
  })

  it('coerces undefined optional fields to null', () => {
    const r = briefSchema.parse({
      ...valid,
      company: undefined,
      website: undefined,
      source: undefined,
      notes: undefined,
    })
    expect(r.company).toBeNull()
    expect(r.website).toBeNull()
    expect(r.source).toBeNull()
    expect(r.notes).toBeNull()
  })

  it('rejects an obviously malformed website URL', () => {
    const r = briefSchema.safeParse({ ...valid, website: 'not a url' })
    expect(r.success).toBe(false)
  })
})
