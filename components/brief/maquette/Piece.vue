<script setup lang="ts">
import {
  BoxGeometry, CylinderGeometry, SphereGeometry,
  EdgesGeometry, LineBasicMaterial,
} from 'three'
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
      opacity.value = 0.9
      return
    }
    const start = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 400)
      opacity.value = k * 0.9
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
      return new CylinderGeometry(w, w, h, 16)
    case 'sphere':
      return new SphereGeometry(w / 2, 16, 12)
  }
})

const edges = computed(() => new EdgesGeometry(baseGeometry.value))
const material = computed(() => new LineBasicMaterial({
  color: '#7ec8ff',
  transparent: true,
  opacity: opacity.value,
}))

watchEffect(() => {
  if (material.value) material.value.opacity = opacity.value
})

onUnmounted(() => {
  baseGeometry.value?.dispose()
  edges.value?.dispose()
  material.value?.dispose()
})
</script>

<template>
  <TresGroup
    :position="position"
    @pointer-enter="emit('hover')"
    @pointer-leave="emit('leave')"
  >
    <TresLineSegments :geometry="edges" :material="material" />
  </TresGroup>
</template>
