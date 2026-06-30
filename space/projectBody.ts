import type { BodyParams } from './bodies'
import type { BufferGeometry, Material, Texture } from 'three'

export interface ProjectBodyHandle {
  resize: () => void
  setPaused: (p: boolean) => void
  destroy: () => void
}

export async function createProjectBody(
  canvas: HTMLCanvasElement,
  params: BodyParams,
  opts: { maxDpr: number },
): Promise<ProjectBodyHandle> {
  const THREE = await import('three')

  // ── Renderer ──────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr))

  function getCanvasSize() {
    return { w: canvas.clientWidth || 1, h: canvas.clientHeight || 1 }
  }

  const { w: initW, h: initH } = getCanvasSize()
  renderer.setSize(initW, initH, false)

  // ── Scene + Camera ────────────────────────────────────────────────────────
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, initW / initH, 0.1, 50)
  // Camera distance chosen so the body + rings (~radius 1.4*size sphere) fill ~70% of frame
  const camDist = (0.9 * params.size * 3.5) + 2.2
  camera.position.set(0, 0.4, camDist)
  camera.lookAt(0, 0, 0)

  // ── Lighting ──────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.18)
  scene.add(ambient)

  const pointLight = new THREE.PointLight(0xc9b6ff, 2.2, 18)
  pointLight.position.set(2, 2, 3)
  scene.add(pointLight)

  // ── Disposal registry ─────────────────────────────────────────────────────
  const geometries: BufferGeometry[] = []
  const materials: Material[] = []
  const textures: Texture[] = []

  function trackGeo<T extends BufferGeometry>(g: T): T {
    geometries.push(g)
    return g
  }
  function trackMat<T extends Material>(m: T): T {
    materials.push(m)
    return m
  }
  function trackTex(t: Texture): Texture {
    textures.push(t)
    return t
  }

  // ── Body sphere ───────────────────────────────────────────────────────────
  const radius = 0.9 * params.size
  const bodyColor = new THREE.Color(params.color)
  const baseEmissive = 0.4 + params.glow

  const bodyGeo = trackGeo(new THREE.SphereGeometry(radius, 32, 32))
  const bodyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: bodyColor,
      emissive: bodyColor,
      emissiveIntensity: baseEmissive,
      roughness: 0.38,
      metalness: 0.08,
    }),
  )
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
  scene.add(bodyMesh)

  // ── Rings ─────────────────────────────────────────────────────────────────
  for (let r = 0; r < params.ringCount; r++) {
    const innerR = radius * (1.4 + r * 0.38)
    const tubeR = radius * 0.035
    const ringGeo = trackGeo(new THREE.TorusGeometry(innerR, tubeR, 8, 80))
    const ringMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: bodyColor,
        emissive: bodyColor,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.55,
        roughness: 0.5,
      }),
    )
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 2 + (r + 1) * 0.22
    ringMesh.rotation.z = r * 0.15
    bodyMesh.add(ringMesh)
  }

  // ── Glow halo ─────────────────────────────────────────────────────────────
  function makeGlowTexture(): Texture {
    const size = 128
    const cvs = document.createElement('canvas')
    cvs.width = size
    cvs.height = size
    const ctx = cvs.getContext('2d')!
    const colorStr = params.color
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, `${colorStr}e6`)
    grad.addColorStop(0.3, `${colorStr}66`)
    grad.addColorStop(1, `${colorStr}00`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    return trackTex(new THREE.CanvasTexture(cvs))
  }

  const glowTex = makeGlowTexture()
  const glowMat = trackMat(
    new THREE.SpriteMaterial({
      map: glowTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  )
  const glowSprite = new THREE.Sprite(glowMat)
  const glowScale = radius * 4.5
  glowSprite.scale.set(glowScale, glowScale, 1)
  scene.add(glowSprite)

  // ── Clock + rAF ───────────────────────────────────────────────────────────
  const clock = new THREE.Clock()
  let raf = 0
  let elapsed = 0
  let destroyed = false

  const ROT_SPEED = 0.3 // rad/s
  const BOB_AMP = 0.06
  const BOB_FREQ = 0.7

  function render() {
    const dt = clock.getDelta()
    elapsed += dt

    // Slow Y self-rotation + gentle vertical bob
    bodyMesh.rotation.y += ROT_SPEED * dt
    bodyMesh.position.y = Math.sin(elapsed * BOB_FREQ) * BOB_AMP

    // Subtle emissive pulse
    bodyMat.emissiveIntensity = baseEmissive + 0.08 * Math.sin(elapsed * 1.2)

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
    clock.stop()
  }

  // ── Public API ────────────────────────────────────────────────────────────
  function resize() {
    if (destroyed) return
    const { w, h } = getCanvasSize()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function setPaused(p: boolean) {
    if (destroyed) return
    if (p) stop()
    else start()
  }

  function destroy() {
    destroyed = true
    stop()
    for (const g of geometries) g.dispose()
    for (const m of materials) m.dispose()
    for (const t of textures) t.dispose()
    renderer.dispose()
  }

  start()

  return { resize, setPaused, destroy }
}
