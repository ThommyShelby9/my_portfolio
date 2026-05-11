<script setup lang="ts">
// Lightweight TresJS ambient piece — a single wireframe torus knot rotating slowly,
// rendered transparent over its container. Capability-gated and reduced-motion safe.
// TresCanvas + TresXxx components are auto-registered globally by @tresjs/nuxt.
import * as THREE from 'three'

const props = withDefaults(defineProps<{
  height?: string
}>(), {
  height: '100%',
})

const { supported, lowPerf } = useWebGLCapability()
const reduce = ref(false)
const enabled = computed(() => supported.value && !lowPerf.value && !reduce.value)

const rotation = ref<[number, number, number]>([0, 0, 0])
let raf = 0
let last = 0
const target = { x: 0, y: 0 }
const cur = { x: 0, y: 0 }

function tick(t: number) {
  const dt = last ? (t - last) / 1000 : 0.016
  last = t
  cur.x += (target.x - cur.x) * 0.08
  cur.y += (target.y - cur.y) * 0.08
  rotation.value = [
    rotation.value[0] + dt * 0.12 + cur.y * 0.003,
    rotation.value[1] + dt * 0.18 + cur.x * 0.003,
    0,
  ]
  raf = requestAnimationFrame(tick)
}

function onMove(e: MouseEvent) {
  target.x = (e.clientX / window.innerWidth - 0.5) * 100
  target.y = (e.clientY / window.innerHeight - 0.5) * 100
}

onMounted(() => {
  reduce.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!enabled.value) return
  raf = requestAnimationFrame(tick)
  window.addEventListener('mousemove', onMove, { passive: true })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMove)
})

// Accent color sampled from CSS var on mount
const accentColor = ref('#ff5728')
onMounted(() => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  if (raw) accentColor.value = raw
})
const lineColor = computed(() => new THREE.Color(accentColor.value))
</script>

<template>
  <ClientOnly>
    <div v-if="enabled" class="ambient3d" :style="{ height: props.height }" aria-hidden="true">
      <TresCanvas
        clear-color="transparent"
        :alpha="true"
        :antialias="true"
        :dpr="[1, 1.5]"
        preset="realistic"
      >
        <TresPerspectiveCamera :position="[0, 0, 4]" :fov="55" />
        <TresAmbientLight :intensity="0.4" />
        <TresDirectionalLight :position="[3, 3, 5]" :intensity="0.7" />
        <TresMesh :rotation="rotation">
          <TresTorusKnotGeometry :args="[1, 0.32, 160, 24, 2, 3]" />
          <TresMeshBasicMaterial
            :color="lineColor"
            :wireframe="true"
            :transparent="true"
            :opacity="0.35"
          />
        </TresMesh>
      </TresCanvas>
    </div>
  </ClientOnly>
</template>

<style scoped>
.ambient3d {
  position: absolute;
  inset: 0;
  width: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
