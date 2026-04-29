import { describe, expect, it } from 'vitest'
import { computeMaquetteState } from '../../../composables/useMaquetteState'
import type { BriefInput } from '../../../types/brief'

type FormState = Omit<BriefInput, 'turnstileToken' | 'locale'>

const empty: FormState = {
  projectType: 'new',
  pitch: '',
  currentState: 'idea',
  teamSize: 'solo',
  hasTechTeam: false,
  hasDesigner: false,
  hasProductOwner: false,
  notes: null,
  deadline: 'flexible',
  budget: 'undefined',
  firstName: '',
  lastName: '',
  email: '',
  company: null,
  website: null,
  source: null,
  prefersCall: false,
}

describe('computeMaquetteState', () => {
  it('returns 4 pieces, all hidden when state is empty and step is 1', () => {
    const pieces = computeMaquetteState(empty, 1)
    expect(pieces).toHaveLength(4)
    expect(pieces.every(p => !p.revealed)).toBe(true)
  })

  it('reveals project-type piece when projectType is filled and pitch is non-empty', () => {
    const state = { ...empty, projectType: 'new' as const, pitch: 'a real pitch text' }
    const pieces = computeMaquetteState(state, 1)
    expect(pieces.find(p => p.id === 'project-type')?.revealed).toBe(true)
  })

  it('does not reveal project-type when pitch is empty', () => {
    const pieces = computeMaquetteState(empty, 1)
    expect(pieces.find(p => p.id === 'project-type')?.revealed).toBe(false)
  })

  it('reveals context piece when at step 2 with pitch filled', () => {
    const state = { ...empty, pitch: 'pitch', teamSize: '2-5' as const }
    const pieces = computeMaquetteState(state, 2)
    expect(pieces.find(p => p.id === 'context')?.revealed).toBe(true)
  })

  it('reveals frame piece when at step 3', () => {
    const state = { ...empty, pitch: 'pitch', deadline: '1-3m' as const, budget: '15-40k' as const }
    const pieces = computeMaquetteState(state, 3)
    expect(pieces.find(p => p.id === 'frame')?.revealed).toBe(true)
  })

  it('reveals identity piece when at step 4 with firstName + lastName', () => {
    const state = { ...empty, pitch: 'pitch', firstName: 'Rostel', lastName: 'Panoumassi' }
    const pieces = computeMaquetteState(state, 4)
    expect(pieces.find(p => p.id === 'identity')?.revealed).toBe(true)
  })

  it('all 4 pieces revealed at step 5 with full state', () => {
    const state: FormState = {
      ...empty,
      projectType: 'revamp',
      pitch: 'pitch text',
      currentState: 'mvpInProd',
      teamSize: '6-15',
      deadline: '3-6m',
      budget: '40-100k',
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.fr',
    }
    const pieces = computeMaquetteState(state, 5)
    expect(pieces.every(p => p.revealed)).toBe(true)
  })

  it('maps projectType=audit to sphere kind', () => {
    const state = { ...empty, projectType: 'audit' as const, pitch: 'p' }
    const pieces = computeMaquetteState(state, 1)
    expect(pieces.find(p => p.id === 'project-type')?.kind).toBe('sphere')
  })

  it('maps projectType=spot to plate kind', () => {
    const state = { ...empty, projectType: 'spot' as const, pitch: 'p' }
    const pieces = computeMaquetteState(state, 1)
    expect(pieces.find(p => p.id === 'project-type')?.kind).toBe('plate')
  })

  it('cylinder height grows with teamSize', () => {
    const small = computeMaquetteState({ ...empty, pitch: 'p', teamSize: 'solo' }, 2)
    const large = computeMaquetteState({ ...empty, pitch: 'p', teamSize: '15+' }, 2)
    const hSmall = small.find(p => p.id === 'context')!.dimensions[1]
    const hLarge = large.find(p => p.id === 'context')!.dimensions[1]
    expect(hLarge).toBeGreaterThan(hSmall)
  })
})
