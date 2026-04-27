import { describe, it, expect } from 'vitest'
import { buildBriefEmailHtml, buildBriefEmailSubject, buildBriefEmailText } from '../../server/utils/brief-email'
import type { BriefInput } from '../../server/utils/schemas/brief'

const sample: BriefInput = {
  projectType: 'new',
  pitch: 'A B2B fintech app for African SMEs.',
  currentState: 'idea',
  teamSize: 'solo',
  hasTechTeam: false,
  hasDesigner: false,
  hasProductOwner: false,
  notes: 'NDA required',
  deadline: '1-3m',
  budget: '15-40k',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  company: 'Acme Inc.',
  website: 'https://acme.example',
  source: 'LinkedIn',
  prefersCall: true,
  turnstileToken: 'tok',
  locale: 'fr',
}

describe('brief email builders', () => {
  it('subject contains name + sector hint + budget', () => {
    const s = buildBriefEmailSubject(sample)
    expect(s).toContain('Jane Doe')
    expect(s).toContain('15-40k')
  })

  it('html body contains all critical fields', () => {
    const html = buildBriefEmailHtml(sample)
    expect(html).toContain('Jane Doe')
    expect(html).toContain('jane@example.com')
    expect(html).toContain('A B2B fintech app for African SMEs.')
    expect(html).toContain('15-40k')
    expect(html).toContain('1-3m')
    expect(html).toContain('NDA required')
    expect(html).toContain('Acme Inc.')
    expect(html).toContain('LinkedIn')
    expect(html).toContain('prefers a call')
  })

  it('text fallback contains the same critical fields', () => {
    const txt = buildBriefEmailText(sample)
    expect(txt).toContain('Jane Doe')
    expect(txt).toContain('jane@example.com')
    expect(txt).toContain('15-40k')
  })

  it('handles null optional fields cleanly', () => {
    const minimal = { ...sample, company: null, website: null, source: null, notes: null, prefersCall: false }
    const html = buildBriefEmailHtml(minimal)
    expect(html).not.toContain('null')
    expect(html).not.toContain('undefined')
  })
})
