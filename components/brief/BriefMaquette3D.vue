<script setup lang="ts">
const Scene = defineAsyncComponent(() => import('./maquette/Scene.vue'))

defineProps<{ mode?: 'form' | 'display-only' }>()

const { step } = useBriefForm()
const interactive = computed(() => step.value === 5)

const supported = ref(false)
const lowPerf = ref(false)
const wideEnough = ref(false)

if (import.meta.client) {
  const cap = useWebGLCapability()
  supported.value = cap.supported.value
  lowPerf.value = cap.lowPerf.value
  wideEnough.value = window.innerWidth >= 768

  const onResize = () => {
    wideEnough.value = window.innerWidth >= 768
  }
  window.addEventListener('resize', onResize)
  onUnmounted(() => window.removeEventListener('resize', onResize))
}

const enabled = computed(() => supported.value && !lowPerf.value && wideEnough.value)
defineExpose({ enabled })
</script>

<template>
  <div v-if="enabled" class="maquette" :class="{ 'maquette--interactive': interactive }" data-test="brief-maquette">
    <Suspense>
      <Scene />
      <template #fallback>
        <p class="maquette__placeholder">◆ chargement</p>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.maquette {
  width: 100%;
  height: 100%;
  background: #0a1525;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  pointer-events: none;
}
.maquette--interactive {
  pointer-events: auto;
}
.maquette__placeholder {
  color: #7ec8ff;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  opacity: 0.4;
  letter-spacing: 0.06em;
}
</style>
