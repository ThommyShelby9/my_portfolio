<script setup lang="ts">
// Canvas constellation — points drift, connect to nearest neighbours,
// repel from cursor. Lightweight (no WebGL) and respects reduced motion.
const canvas = ref<HTMLCanvasElement | null>(null)
let raf = 0
let dpr = 1
let w = 0
let h = 0

type P = { x: number; y: number; vx: number; vy: number; r: number }
const points: P[] = []
const mouse = { x: -9999, y: -9999, active: false }

function resize() {
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = rect.width
  h = rect.height
  canvas.value.width = Math.floor(w * dpr)
  canvas.value.height = Math.floor(h * dpr)
  const ctx = canvas.value.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function init() {
  points.length = 0
  const density = Math.max(40, Math.floor((w * h) / 22000))
  for (let i = 0; i < density; i++) {
    points.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 1 + Math.random() * 1.4,
    })
  }
}

function tick() {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, w, h)

  // Theme accent
  const styles = getComputedStyle(document.documentElement)
  const accent = styles.getPropertyValue('--accent').trim() || '#9b86ff'
  const ink = styles.getPropertyValue('--text').trim() || '#ede4d3'

  // Update + draw points
  for (const p of points) {
    // Mouse repulsion
    if (mouse.active) {
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const dist2 = dx * dx + dy * dy
      const max = 140
      if (dist2 < max * max) {
        const dist = Math.sqrt(dist2)
        const f = (1 - dist / max) * 0.6
        p.vx += (dx / dist) * f
        p.vy += (dy / dist) * f
      }
    }
    p.vx *= 0.985
    p.vy *= 0.985
    p.x += p.vx
    p.y += p.vy
    // Wrap
    if (p.x < -20) p.x = w + 20
    if (p.x > w + 20) p.x = -20
    if (p.y < -20) p.y = h + 20
    if (p.y > h + 20) p.y = -20

    ctx.beginPath()
    ctx.fillStyle = ink + '88'
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Connect lines
  const maxLink = 130
  ctx.lineWidth = 0.7
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i]
      const b = points[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const d = Math.hypot(dx, dy)
      if (d < maxLink) {
        const alpha = (1 - d / maxLink) * 0.45
        const near = mouse.active && Math.hypot(a.x - mouse.x, a.y - mouse.y) < 180
        ctx.strokeStyle = near
          ? `${accent}${Math.round(alpha * 220).toString(16).padStart(2, '0')}`
          : `${ink}${Math.round(alpha * 90).toString(16).padStart(2, '0')}`
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }

  raf = requestAnimationFrame(tick)
}

function onMove(e: MouseEvent) {
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
  mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= w && mouse.y <= h
}

function onLeave() { mouse.active = false }

let ro: ResizeObserver | null = null

onMounted(() => {
  if (!canvas.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  init()

  if (reduce) {
    // Single static frame
    tick()
    cancelAnimationFrame(raf)
    return
  }

  raf = requestAnimationFrame(tick)
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseleave', onLeave)
  ro = new ResizeObserver(() => { resize(); init() })
  ro.observe(canvas.value)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseleave', onLeave)
  ro?.disconnect()
})
</script>

<template>
  <canvas ref="canvas" class="constellation" aria-hidden="true" />
</template>

<style scoped>
.constellation {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
