<script setup lang="ts">
import { resolveQuality } from '~/space/quality'
import type { SpaceEngine } from '~/space/engine'

const { supported, lowPerf } = useWebGLCapability()
const { reduce } = useReducedMotion()
const space = useSpaceStore()

const canvas = ref<HTMLCanvasElement | null>(null)
let engine: SpaceEngine | null = null
let onVisibility: (() => void) | null = null
let unmounted = false

onMounted(async () => {
  const quality = resolveQuality({
    supported: supported.value,
    lowPerf: lowPerf.value,
    reduce: reduce.value,
  })
  space.setEnabled(quality.enabled)

  if (!quality.enabled || !canvas.value) return

  const { createSpaceEngine } = await import('~/space/engine')
  engine = await createSpaceEngine(canvas.value, quality)

  if (unmounted) {
    engine.destroy()
    engine = null
    return
  }

  onVisibility = () => engine?.setPaused(document.hidden)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  unmounted = true
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  engine?.destroy()
  engine = null
})
</script>

<template>
  <div class="space-bg" aria-hidden="true">
    <canvas ref="canvas" class="space-bg__canvas" />
  </div>
</template>

<style scoped>
.space-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* Static fallback: painted whenever the canvas is absent/transparent
     (no WebGL, reduced motion, or before the engine boots). */
  background:
    radial-gradient(80% 70% at 20% 25%, rgba(25, 201, 140, 0.10), transparent 60%),
    radial-gradient(70% 80% at 85% 20%, rgba(122, 92, 240, 0.18), transparent 60%),
    radial-gradient(90% 90% at 60% 100%, rgba(255, 90, 170, 0.08), transparent 60%),
    var(--bg, #070612);
}
.space-bg__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
