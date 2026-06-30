import type { BodyParams } from './bodies'
import type {
  BufferGeometry,
  Material,
  Mesh,
  MeshStandardMaterial,
  Texture,
  Vector2,
  Vector3,
} from 'three'

export interface OrreryHandle {
  resize: () => void
  setPaused: (p: boolean) => void
  destroy: () => void
}

export interface OrreryOpts {
  maxDpr: number
  onHover: (slug: string | null) => void
  onSelect: (slug: string) => void
}

export async function createOrrery(
  canvas: HTMLCanvasElement,
  bodies: BodyParams[],
  opts: OrreryOpts,
): Promise<OrreryHandle> {
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
  const camera = new THREE.PerspectiveCamera(50, initW / initH, 0.1, 100)
  camera.position.set(0, 2.5, 11)
  camera.lookAt(0, 0, 0)

  // ── Lighting ──────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.25)
  scene.add(ambient)

  const pointLight = new THREE.PointLight(0xc9b6ff, 2.5, 20)
  pointLight.position.set(0, 0, 0)
  scene.add(pointLight)

  // ── Disposal registry ─────────────────────────────────────────────────────
  const geometries: BufferGeometry[] = []
  const materials: Material[] = []

  function trackGeo<T extends BufferGeometry>(g: T): T {
    geometries.push(g)
    return g
  }
  function trackMat<T extends Material>(m: T): T {
    materials.push(m)
    return m
  }

  // ── System group (rotates slowly as a whole) ──────────────────────────────
  const system = new THREE.Group()
  scene.add(system)

  // ── Central core ─────────────────────────────────────────────────────────
  const CORE_COLOR = 0xc9b6ff
  const coreGeo = trackGeo(new THREE.SphereGeometry(0.6, 32, 32))
  const coreMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: CORE_COLOR,
      emissive: CORE_COLOR,
      emissiveIntensity: 1.2,
      roughness: 0.3,
      metalness: 0.1,
    }),
  )
  const coreMesh = new THREE.Mesh(coreGeo, coreMat)
  system.add(coreMesh)

  // Glow halo (additive sprite using a canvas texture)
  function makeGlowTexture(): Texture {
    const size = 128
    const cvs = document.createElement('canvas')
    cvs.width = size
    cvs.height = size
    const ctx = cvs.getContext('2d')!
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(201,182,255,0.9)')
    grad.addColorStop(0.3, 'rgba(201,182,255,0.4)')
    grad.addColorStop(1, 'rgba(201,182,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(cvs)
    return tex
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
  glowSprite.scale.set(4.5, 4.5, 1)
  system.add(glowSprite)

  // ── Body state ────────────────────────────────────────────────────────────
  interface BodyState {
    params: BodyParams
    angle: number
    mesh: Mesh
    mat: MeshStandardMaterial
    baseEmissive: number
    ringMeshes: Mesh[]
  }

  const bodyStates: BodyState[] = []
  const bodyMeshes: Mesh[] = [] // for raycasting

  const ORBIT_LINE_COLOR = 0x4a3a6e

  for (const params of bodies) {
    // Orbit circle (LineLoop)
    const orbitPts: Vector3[] = []
    const segments = 128
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2
      orbitPts.push(new THREE.Vector3(Math.cos(a) * params.orbitRadius, 0, Math.sin(a) * params.orbitRadius))
    }
    const orbitGeo = trackGeo(new THREE.BufferGeometry().setFromPoints(orbitPts))
    const orbitMat = trackMat(
      new THREE.LineBasicMaterial({ color: ORBIT_LINE_COLOR, transparent: true, opacity: 0.22 }),
    )
    const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat)
    system.add(orbitLine)

    // Body sphere
    const radius = 0.18 * params.size
    const bodyGeo = trackGeo(new THREE.SphereGeometry(radius, 24, 24))
    const bodyColor = new THREE.Color(params.color)
    const baseEmissive = 0.4 + params.glow
    const bodyMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: bodyColor,
        emissive: bodyColor,
        emissiveIntensity: baseEmissive,
        roughness: 0.4,
        metalness: 0.1,
      }),
    )
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    bodyMesh.userData.slug = params.slug

    // Position on orbit
    const startX = Math.cos(params.orbitPhase) * params.orbitRadius
    const startZ = Math.sin(params.orbitPhase) * params.orbitRadius
    bodyMesh.position.set(startX, 0, startZ)

    system.add(bodyMesh)
    bodyMeshes.push(bodyMesh)

    // Rings
    const ringMeshes: Mesh[] = []
    for (let r = 0; r < params.ringCount; r++) {
      const innerR = radius * (1.4 + r * 0.35)
      const outerR = innerR + 0.025
      const ringGeo = trackGeo(new THREE.TorusGeometry(innerR + (outerR - innerR) / 2, (outerR - innerR) / 2, 8, 64))
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
      // Tilt slightly differently per ring
      ringMesh.rotation.x = Math.PI / 2 + (r + 1) * 0.22
      ringMesh.rotation.z = r * 0.15
      bodyMesh.add(ringMesh)
      ringMeshes.push(ringMesh)
    }

    bodyStates.push({
      params,
      angle: params.orbitPhase,
      mesh: bodyMesh,
      mat: bodyMat,
      baseEmissive,
      ringMeshes,
    })
  }

  // ── Raycasting state ──────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let pointerDirty = false
  let hoveredSlug: string | null = null

  function onPointerMove(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    pointerDirty = true
  }

  function onClick(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    const clickPointer = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(clickPointer, camera)
    const hits = raycaster.intersectObjects(bodyMeshes, false)
    if (hits.length > 0) {
      const slug = hits[0].object.userData.slug as string
      opts.onSelect(slug)
    }
  }

  canvas.addEventListener('pointermove', onPointerMove, { passive: true })
  canvas.addEventListener('click', onClick)

  // ── Clock + rAF ───────────────────────────────────────────────────────────
  const clock = new THREE.Clock()
  let raf = 0
  let elapsed = 0
  let destroyed = false

  function resolveHover() {
    if (!pointerDirty) return
    pointerDirty = false

    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(bodyMeshes, false)

    const hitSlug: string | null = hits.length > 0 ? (hits[0].object.userData.slug as string) : null

    if (hitSlug !== hoveredSlug) {
      // Restore previous
      if (hoveredSlug !== null) {
        const prev = bodyStates.find((b) => b.params.slug === hoveredSlug)
        if (prev) {
          prev.mesh.scale.setScalar(1)
          prev.mat.emissiveIntensity = prev.baseEmissive
        }
      }
      // Highlight new
      if (hitSlug !== null) {
        const next = bodyStates.find((b) => b.params.slug === hitSlug)
        if (next) {
          next.mesh.scale.setScalar(1.35)
          next.mat.emissiveIntensity = next.baseEmissive + 0.6
        }
      }
      hoveredSlug = hitSlug
      opts.onHover(hitSlug)
    }
  }

  function render() {
    const dt = clock.getDelta()
    elapsed += dt

    // Resolve hover from last pointermove
    resolveHover()

    // Slow whole-system Y rotation
    system.rotation.y += 0.02 * dt

    // Core pulse
    const pulse = 1.1 + 0.1 * Math.sin(elapsed * 1.4)
    coreMat.emissiveIntensity = pulse

    // Body orbits
    for (const state of bodyStates) {
      state.angle += state.params.orbitSpeed * dt
      const x = Math.cos(state.angle) * state.params.orbitRadius
      const z = Math.sin(state.angle) * state.params.orbitRadius
      state.mesh.position.set(x, 0, z)
    }

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
    const { w, h } = getCanvasSize()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function setPaused(p: boolean) {
    if (p) stop()
    else start()
  }

  function destroy() {
    destroyed = true
    stop()
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('click', onClick)
    glowTex.dispose()
    for (const g of geometries) g.dispose()
    for (const m of materials) m.dispose()
    renderer.dispose()
  }

  start()

  return { resize, setPaused, destroy }
}
