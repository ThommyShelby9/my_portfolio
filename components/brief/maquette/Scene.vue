<script setup lang="ts">
const { step } = useBriefForm()

const STEP_PRESETS: Record<number, { pos: [number, number, number]; look: [number, number, number] }> = {
  1: { pos: [4, 3, 6],   look: [0, 0.5, 0] },
  2: { pos: [4, 3, 6.5], look: [-0.4, 0.5, 0.3] },
  3: { pos: [3, 4, 6],   look: [0, 0.4, 0] },
  4: { pos: [3.5, 3, 6], look: [0.3, 0.5, 0.3] },
  5: { pos: [4.5, 3.5, 7], look: [0, 0.7, 0] },
}

const cameraPos = ref<[number, number, number]>(STEP_PRESETS[1].pos)
const cameraLook = ref<[number, number, number]>(STEP_PRESETS[1].look)

const reduceMotion = import.meta.client
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

watch(() => step.value, (s) => {
  const preset = STEP_PRESETS[s] ?? STEP_PRESETS[1]
  if (reduceMotion) {
    cameraPos.value = preset.pos
    cameraLook.value = preset.look
    return
  }
  const start = performance.now()
  const fromPos = [...cameraPos.value] as [number, number, number]
  const fromLook = [...cameraLook.value] as [number, number, number]
  const tick = (t: number) => {
    const k = Math.min(1, (t - start) / 800)
    const e = k * k * (3 - 2 * k)
    cameraPos.value = [
      fromPos[0] + (preset.pos[0] - fromPos[0]) * e,
      fromPos[1] + (preset.pos[1] - fromPos[1]) * e,
      fromPos[2] + (preset.pos[2] - fromPos[2]) * e,
    ]
    cameraLook.value = [
      fromLook[0] + (preset.look[0] - fromLook[0]) * e,
      fromLook[1] + (preset.look[1] - fromLook[1]) * e,
      fromLook[2] + (preset.look[2] - fromLook[2]) * e,
    ]
    if (k < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

const inspectorRef = ref<{ onPieceHover: (id: string, pos: [number, number, number]) => void; onPieceLeave: () => void } | null>(null)

function handleHover(id: string, pos: [number, number, number]) {
  inspectorRef.value?.onPieceHover(id, pos)
}

function handleLeave() {
  inspectorRef.value?.onPieceLeave()
}
</script>

<template>
  <TresCanvas clear-color="#0a1525" :alpha="false">
    <TresPerspectiveCamera :args="[35, 1, 0.1, 100]" :position="cameraPos" :look-at="cameraLook" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :intensity="0.6" :position="[5, 8, 4]" />
    <TresGridHelper :args="[10, 20, '#7ec8ff', '#7ec8ff']" :position="[0, 0, 0]" />
    <ProjectTypePiece @hover="handleHover" @leave="handleLeave" />
    <ContextPiece @hover="handleHover" @leave="handleLeave" />
    <FramePiece @hover="handleHover" @leave="handleLeave" />
    <IdentityPiece @hover="handleHover" @leave="handleLeave" />
    <PitchTag />
    <Annotations />
    <OrbitInspector v-if="step === 5" ref="inspectorRef" />
  </TresCanvas>
</template>

<style scoped>
:deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
