<template>
  <BasePanel title="projects">
    <div class="projects-grid">
      <div
        v-for="(project, index) in projects"
        :key="project.slug"
        :ref="(el: any) => setCardRef(el, index as number)"
        class="project-card"
        :style="getCardStyle(index as number)"
        @click="openProject(project.slug)"
        role="button"
        tabindex="0"
        @keydown.enter="openProject(project.slug)"
      >
        <!-- Project Image -->
        <div class="project-image" v-if="project.image">
          <img :src="project.image" :alt="project.name" />
          <div class="project-overlay">
            <span class="overlay-text">View Details</span>
          </div>
        </div>

        <!-- Project Info -->
        <div class="project-info">
          <div class="project-header">
            <h3 class="project-name">{{ project.name }}</h3>
            <span class="project-status" :class="`status-${project.status}`">
              {{ project.status === 'completed' ? '✓ Completed' : '⚡ In Progress' }}
            </span>
          </div>

          <p class="project-company" v-if="project.company">
            {{ project.company }}
          </p>

          <p class="project-description">
            {{ truncate(project.description, 100) }}
          </p>

          <!-- Tech Stack -->
          <div class="project-tech">
            <span v-for="tech in project.tech" :key="tech" class="tech-tag">
              {{ tech }}
            </span>
          </div>
        </div>

        <!-- 3D Card Glare Effect -->
        <div class="card-glare" :style="getGlareStyle(index as number)"></div>
      </div>
    </div>

    <!-- Summary -->
    <div class="projects-summary">
      <p class="text-theme-secondary text-sm">
        {{ projects.length }} projects total • Click on a project to view details
      </p>
    </div>
  </BasePanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import { use3DCard } from '@/composables/use3DCard'
import BasePanel from './BasePanel.vue'
import { projectsData } from '@/assets/data'

const store = useTerminalStore()
const { activePanelData } = storeToRefs(store)

const projects = computed(() => activePanelData.value?.projects || projectsData)

// 3D Card Effect - Store card3D instances instead of individual computed refs
const cardRefs = ref<Record<number, HTMLElement | null>>({})
const card3DInstances = ref<Record<number, any>>({})

function setCardRef(el: any, index: number) {
  if (el && typeof index === 'number') {
    cardRefs.value[index] = el

    // Only initialize use3DCard once per card to prevent infinite loops
    if (!card3DInstances.value[index]) {
      const cardRef = computed(() => cardRefs.value[index] || undefined)
      card3DInstances.value[index] = use3DCard(cardRef)
    }
  }
}

// Helper functions to get styles
function getCardStyle(index: number) {
  return card3DInstances.value[index]?.cardStyle || {}
}

function getGlareStyle(index: number) {
  return card3DInstances.value[index]?.glareStyle || {}
}

function openProject(slug: string) {
  const project = projectsData.find(p => p.slug === slug)
  if (project) {
    store.openPanel('project-detail', { project })
  }
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
</script>

<style scoped>
.projects-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 mb-6;
}

.project-card {
  @apply bg-theme-secondary border border-theme rounded-lg overflow-hidden;
  @apply cursor-pointer transition-all duration-300;
  @apply hover:border-theme-accent hover:shadow-lg;
  @apply relative;
  transform-style: preserve-3d;
  will-change: transform;
}

.project-card:hover {
  box-shadow: 0 0 20px rgba(0, 255, 247, 0.2);
}

/* 3D Card Glare Effect */
.card-glare {
  @apply absolute inset-0 pointer-events-none;
  @apply rounded-lg;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .card-glare {
  opacity: 1;
}

.project-image {
  @apply relative h-48 overflow-hidden bg-theme-primary;
}

.project-image img {
  @apply w-full h-full object-cover;
}

.project-overlay {
  @apply absolute inset-0 bg-black/70;
  @apply flex items-center justify-center;
  @apply opacity-0 hover:opacity-100;
  @apply transition-opacity duration-300;
}

.overlay-text {
  @apply text-theme-accent font-semibold;
}

.project-info {
  @apply p-4;
}

.project-header {
  @apply flex items-start justify-between gap-2 mb-2;
}

.project-name {
  @apply text-lg font-bold text-theme-accent;
}

.project-status {
  @apply text-xs px-2 py-1 rounded whitespace-nowrap;
  @apply border;
}

.status-completed {
  @apply text-success border-success;
}

.status-in-progress {
  @apply text-yellow-500 border-yellow-500;
}

.project-company {
  @apply text-sm text-theme-secondary mb-2;
}

.project-description {
  @apply text-sm text-theme-primary mb-3 leading-relaxed;
}

.project-tech {
  @apply flex flex-wrap gap-2;
}

.tech-tag {
  @apply text-xs px-2 py-1 rounded;
  @apply bg-theme-primary border border-cyan-dark text-theme-accent;
}

.projects-summary {
  @apply pt-4 border-t border-theme text-center;
}
</style>
