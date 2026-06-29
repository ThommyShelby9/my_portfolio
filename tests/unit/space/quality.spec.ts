import { describe, it, expect } from 'vitest'
import { resolveQuality } from '../../../space/quality'

describe('resolveQuality', () => {
  it('disables WebGL when unsupported', () => {
    expect(resolveQuality({ supported: false, lowPerf: false, reduce: false }))
      .toEqual({ enabled: false, maxDpr: 1 })
  })

  it('disables WebGL when reduced motion is requested', () => {
    expect(resolveQuality({ supported: true, lowPerf: false, reduce: true }))
      .toEqual({ enabled: false, maxDpr: 1 })
  })

  it('enables at full DPR on a capable device', () => {
    expect(resolveQuality({ supported: true, lowPerf: false, reduce: false }))
      .toEqual({ enabled: true, maxDpr: 1.75 })
  })

  it('enables but caps DPR to 1 on low-perf devices', () => {
    expect(resolveQuality({ supported: true, lowPerf: true, reduce: false }))
      .toEqual({ enabled: true, maxDpr: 1 })
  })
})
