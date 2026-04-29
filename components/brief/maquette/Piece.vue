<script setup lang="ts">
import {
  BoxGeometry, CylinderGeometry, SphereGeometry,
  EdgesGeometry, Color,
} from 'three'
import { Line2 } from '@tresjs/cientos'
import type { PieceKind } from '~/composables/useMaquetteState'

const props = defineProps<{
  position: [number, number, number]
  kind: PieceKind
  dimensions: [number, number, number]
  revealed: boolean
}>()

const emit = defineEmits<{ hover: []; leave: [] }>()

const opacity = ref(0)

watch(() => props.revealed, (now) => {
  if (now) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      opacity.value = 1
      return
    }
    const start = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 400)
      opacity.value = k
      if (k < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  else {
    opacity.value = 0
  }
}, { immediate: true })

const baseGeometry = computed(() => {
  const [w, h, d] = props.dimensions
  switch (props.kind) {
    case 'box':
    case 'frame':
    case 'plate':
      return new BoxGeometry(w, h, d)
    case 'cylinder':
      return new CylinderGeometry(w, w, h, 24)
    case 'sphere':
      return new SphereGeometry(w / 2, 24, 16)
  }
})

// Extract per-segment endpoint pairs from EdgesGeometry so we can render each as a thick Line2.
const edgeSegments = computed<Array<[[number, number, number], [number, number, number]]>>(() => {
  const edges = new EdgesGeometry(baseGeometry.value)
  const pos = edges.attributes.position
  const out: Array<[[number, number, number], [number, number, number]]> = []
  for (let i = 0; i < pos.count; i += 2) {
    out.push([
      [pos.getX(i), pos.getY(i), pos.getZ(i)],
      [pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1)],
    ])
  }
  edges.dispose()
  return out
})

// HDR-ish cyan to push past bloom luminance threshold.
const lineColor = computed(() => new Color('#a5d8ff').multiplyScalar(1.6))

// Group ref to drive opacity on every Line2 child via traverse.
const groupRef = shallowRef<{ value: any } | null>(null)

watchEffect(() => {
  const group = (groupRef.value as any)?.value ?? groupRef.value
  if (!group || typeof group.traverse !== 'function') return
  const o = opacity.value
  group.traverse((obj: any) => {
    if (obj.material && 'opacity' in obj.material) {
      obj.material.transparent = true
      obj.material.opacity = o
      obj.material.depthWrite = false
    }
  })
})

onUnmounted(() => {
  baseGeometry.value?.dispose()
})
</script>

<template>
  <TresGroup
    ref="groupRef"
    :position="position"
    @pointer-enter="emit('hover')"
    @pointer-leave="emit('leave')"
  >
    <Line2
      v-for="(seg, i) in edgeSegments"
      :key="i"
      :points="seg"
      :color="lineColor"
      :line-width="2.5"
    />
  </TresGroup>
</template>
