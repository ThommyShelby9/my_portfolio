import { describe, it, expect } from 'vitest'
import { clamp, ingestT, computeEngulf, computeFeed } from '../../../assets/manifesto/engulf'

const VH = 1000

describe('clamp', () => {
  it('bounds below, within, above', () => {
    expect(clamp(-5, 0, 1)).toBe(0)
    expect(clamp(0.3, 0, 1)).toBe(0.3)
    expect(clamp(9, 0, 1)).toBe(1)
  })
})

describe('ingestT', () => {
  it('is 0 while the block sits at/below the start line (distance = 0.15*vh)', () => {
    expect(ingestT(0.15 * VH, VH)).toBe(0)
    expect(ingestT(0.5 * VH, VH)).toBe(0)
  })
  it('is 1 once the block is well above the hole (distance = -0.45*vh)', () => {
    expect(ingestT(-0.45 * VH, VH)).toBe(1)
    expect(ingestT(-0.9 * VH, VH)).toBe(1)
  })
  it('passes through 0.5 at the mid-ingestion distance', () => {
    // t = 0.5  =>  distance = 0.15*vh - 0.5*0.60*vh = -0.15*vh
    expect(ingestT(-0.15 * VH, VH)).toBeCloseTo(0.5, 5)
  })
})

describe('computeEngulf', () => {
  it('is the identity transform at t=0', () => {
    const e = computeEngulf(0.15 * VH, VH)
    expect(e.scale).toBeCloseTo(1, 5)
    expect(e.opacity).toBeCloseTo(1, 5)
    expect(e.blur).toBeCloseTo(0, 5)
    expect(e.shift).toBeCloseTo(0, 5)
    expect(e.rotate).toBeCloseTo(0, 5)
  })
  it('collapses toward the hole at t=1', () => {
    const d = -0.45 * VH
    const e = computeEngulf(d, VH)
    expect(e.scale).toBeCloseTo(0.08, 5)
    expect(e.opacity).toBeCloseTo(0, 5)
    expect(e.blur).toBeCloseTo(13, 5)
    expect(e.rotate).toBeCloseTo(-34, 5)
    expect(e.shift).toBeCloseTo(-d, 5) // pulled onto the hole center
  })
})

describe('computeFeed', () => {
  it('is 0 at the extremes and peaks at 1 mid-ingestion', () => {
    expect(computeFeed(0.15 * VH, VH)).toBeCloseTo(0, 5)
    expect(computeFeed(-0.45 * VH, VH)).toBeCloseTo(0, 5)
    expect(computeFeed(-0.15 * VH, VH)).toBeCloseTo(1, 5) // t=0.5 => 0.5*0.5*4
  })
})
