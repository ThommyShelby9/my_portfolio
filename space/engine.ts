import type { QualitySettings } from './quality'
import { vertexShader, fragmentShader } from './shaders/aurora'

export interface SpaceEngine {
  resize: () => void
  setPaused: (paused: boolean) => void
  destroy: () => void
}

/**
 * Boots the ambient aurora scene on the given canvas. Three.js is loaded
 * dynamically so it stays out of the SSR/initial bundle. Caller is
 * responsible for only invoking this when `quality.enabled` is true.
 */
export async function createSpaceEngine(
  canvas: HTMLCanvasElement,
  quality: QualitySettings,
): Promise<SpaceEngine> {
  const THREE = await import('three')

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr))
  renderer.setSize(window.innerWidth, window.innerHeight, false)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  }

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
  const geometry = new THREE.PlaneGeometry(2, 2)
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const clock = new THREE.Clock()
  let raf = 0
  let destroyed = false

  function render() {
    uniforms.uTime.value = clock.getElapsedTime()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(render)
  }

  function start() {
    if (destroyed || raf) return
    clock.start()
    raf = requestAnimationFrame(render)
  }

  function stop() {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  function resize() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr))
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
  }

  function setPaused(paused: boolean) {
    if (paused) stop()
    else start()
  }

  window.addEventListener('resize', resize, { passive: true })
  start()

  function destroy() {
    destroyed = true
    stop()
    window.removeEventListener('resize', resize)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }

  return { resize, setPaused, destroy }
}
