import { describe, it, expect } from 'vitest'
import { vertexShader, fragmentShader } from '../../../space/shaders/aurora'

describe('aurora shader', () => {
  it('vertex shader sets gl_Position and a vUv varying', () => {
    expect(vertexShader).toContain('gl_Position')
    expect(vertexShader).toContain('vUv')
  })

  it('fragment shader animates on uTime and writes gl_FragColor', () => {
    expect(fragmentShader).toContain('uniform float uTime')
    expect(fragmentShader).toContain('gl_FragColor')
  })
})
