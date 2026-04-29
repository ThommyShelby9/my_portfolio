<script setup lang="ts">
import { Color } from 'three'
import { Line2 } from '@tresjs/cientos'

const props = withDefaults(defineProps<{
  // Either continuous polyline points, or per-segment pairs.
  points?: Array<[number, number, number]>
  segments?: Array<[[number, number, number], [number, number, number]]>
  position?: [number, number, number]
  revealed?: boolean
  lineWidth?: number
  color?: string
}>(), {
  position: () => [0, 0, 0],
  revealed: true,
  lineWidth: 2,
  color: '#a5d8ff',
})

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

const lineColor = computed(() => new Color(props.color).multiplyScalar(1.6))

const groupRef = shallowRef<any>(null)
watchEffect(() => {
  const g = (groupRef.value as any)?.value ?? groupRef.value
  if (!g || typeof g.traverse !== 'function') return
  const o = opacity.value
  g.traverse((obj: any) => {
    if (obj.material && 'opacity' in obj.material) {
      obj.material.transparent = true
      obj.material.opacity = o
      obj.material.depthWrite = false
    }
  })
})
</script>

<template>
  <TresGroup ref="groupRef" :position="position">
    <Line2
      v-if="points && points.length >= 2"
      :points="points"
      :color="lineColor"
      :line-width="lineWidth"
    />
    <Line2
      v-for="(seg, i) in segments || []"
      :key="i"
      :points="seg"
      :color="lineColor"
      :line-width="lineWidth"
    />
  </TresGroup>
</template>
