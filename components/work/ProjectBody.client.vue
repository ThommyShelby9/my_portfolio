<script setup lang="ts">
import { caseStudyToBody } from '~/space/bodies'
import type { CaseStudyLike } from '~/space/bodies'
import { resolveQuality } from '~/space/quality'
import type { ProjectBodyHandle } from '~/space/projectBody'

const props = defineProps<{ study: CaseStudyLike }>()

const { supported, lowPerf } = useWebGLCapability()
const { reduce } = useReducedMotion()

// Computed once — client-only component, capability/motion known at setup.
const quality = resolveQuality({
  supported: supported.value,
  lowPerf: lowPerf.value,
  reduce: reduce.value,
})

const stage = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let handle: ProjectBodyHandle | null = null
let onVisibility: (() => void) | null = null
let ro: ResizeObserver | null = null
let unmounted = false

onMounted(async () => {
  if (!quality.enabled || !canvas.value) return

  const { createProjectBody } = await import('~/space/projectBody')

  // Guard: component may have been unmounted during the async import
  if (unmounted) return

  const params = caseStudyToBody(props.study, 0)

  handle = await createProjectBody(canvas.value, params, {
    maxDpr: quality.maxDpr,
  })

  // Guard: component may have been unmounted while createProjectBody was initialising
  if (unmounted) {
    handle.destroy()
    handle = null
    return
  }

  ro = new ResizeObserver(() => handle?.resize())
  if (stage.value) ro.observe(stage.value)

  onVisibility = () => handle?.setPaused(document.hidden)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  unmounted = true
  if (onVisibility) {
    document.removeEventListener('visibilitychange', onVisibility)
    onVisibility = null
  }
  ro?.disconnect()
  ro = null
  handle?.destroy()
  handle = null
})
</script>

<template>
  <div v-if="quality.enabled" ref="stage" class="project-body" aria-hidden="true">
    <canvas ref="canvas" class="project-body__canvas" aria-hidden="true" />
  </div>
</template>

<style scoped>
.project-body {
  width: 100%;
  max-width: clamp(220px, 32vw, 360px);
  aspect-ratio: 1;
  margin-left: auto;
  flex-shrink: 0;
}

.project-body__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
