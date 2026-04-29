<script setup lang="ts">
import { OrbitControls, Html } from '@tresjs/cientos'

const hovered = ref<{ id: string; pos: [number, number, number] } | null>(null)
const { state } = useBriefForm()

const tooltipText: Record<string, (s: any) => string> = {
  'project-type': (s) => `Type : ${s.projectType}`,
  'context': (s) => `Équipe : ${s.teamSize}`,
  'frame': (s) => `Deadline ${s.deadline} · budget ${s.budget}`,
  'identity': (s) => `${s.firstName} ${s.lastName}`,
}

function onPieceHover(id: string, pos: [number, number, number]) {
  hovered.value = { id, pos }
}

function onPieceLeave() {
  hovered.value = null
}

defineExpose({ onPieceHover, onPieceLeave })
</script>

<template>
  <OrbitControls
    :enable-pan="false"
    :enable-zoom="true"
    :enable-damping="true"
    :damping-factor="0.08"
    :min-distance="3"
    :max-distance="10"
    :min-polar-angle="Math.PI * 0.1"
    :max-polar-angle="Math.PI * 0.45"
  />
  <Html v-if="hovered" :position="hovered.pos" center>
    <span class="inspector-tooltip">
      {{ tooltipText[hovered.id]?.(state) ?? '' }}
    </span>
  </Html>
</template>

<style scoped>
.inspector-tooltip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #0a1525;
  background: #7ec8ff;
  padding: 4px 8px;
  white-space: nowrap;
  pointer-events: none;
}
</style>
