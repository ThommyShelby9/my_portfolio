<template>
  <div class="terminal-body" ref="bodyRef" @click="handleBodyClick">
    <!-- Terminal Mode: Show history and input -->
    <div v-if="mode === 'terminal'" class="terminal-mode">
      <TerminalHistory />
      <TerminalInput ref="inputComponentRef" />
    </div>

    <!-- Panel Mode: Show active panel -->
    <div v-else-if="mode === 'panel'" class="panel-mode">
      <component :is="currentPanelComponent" v-if="currentPanelComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import TerminalHistory from './TerminalHistory.vue'
import TerminalInput from './TerminalInput.vue'

// Lazy load panel components
const ProjectsPanel = defineAsyncComponent(() => import('@/components/panels/ProjectsPanel.vue'))
const ProjectDetailPanel = defineAsyncComponent(() => import('@/components/panels/ProjectDetailPanel.vue'))
const SkillsPanel = defineAsyncComponent(() => import('@/components/panels/SkillsPanel.vue'))
const ExperiencePanel = defineAsyncComponent(() => import('@/components/panels/ExperiencePanel.vue'))
const ContactPanel = defineAsyncComponent(() => import('@/components/panels/ContactPanel.vue'))

const store = useTerminalStore()
const { mode, activePanel, history } = storeToRefs(store)

const bodyRef = ref<HTMLElement>()
const inputComponentRef = ref<InstanceType<typeof TerminalInput>>()

// Auto-scroll to bottom when history updates
watch(history, async () => {
  await nextTick()
  if (bodyRef.value) {
    bodyRef.value.scrollTop = bodyRef.value.scrollHeight
  }
}, { deep: true })

// Get current panel component
const currentPanelComponent = computed(() => {
  const panelMap: Record<string, any> = {
    'projects': ProjectsPanel,
    'project-detail': ProjectDetailPanel,
    'skills': SkillsPanel,
    'experience': ExperiencePanel,
    'contact': ContactPanel
  }

  return activePanel.value ? panelMap[activePanel.value] : null
})

// Auto-refocus input when clicking anywhere in terminal body
function handleBodyClick() {
  // Only refocus if we're in terminal mode (not panel mode)
  if (mode.value === 'terminal' && inputComponentRef.value) {
    inputComponentRef.value.focusInput()
  }
}
</script>

<style scoped>
.terminal-body {
  @apply flex-1 overflow-y-auto overflow-x-hidden;
  @apply bg-bg-dark p-4;
  @apply relative;
}

/* Custom scrollbar */
.terminal-body::-webkit-scrollbar {
  @apply w-2;
}

.terminal-body::-webkit-scrollbar-track {
  @apply bg-bg-secondary;
}

.terminal-body::-webkit-scrollbar-thumb {
  @apply bg-cyan-dark rounded;
}

.terminal-body::-webkit-scrollbar-thumb:hover {
  @apply bg-cyan-neon;
}

.terminal-mode {
  @apply flex flex-col gap-2;
  min-height: 100%;
}

.panel-mode {
  min-height: 100%;
}
</style>
