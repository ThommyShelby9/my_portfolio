<template>
  <BasePanel :title="`project: ${project.slug}`">
    <div class="project-detail">
      <!-- Header -->
      <div class="detail-header">
        <div>
          <h1 class="detail-title">{{ project.name }}</h1>
          <p class="detail-meta">
            <span v-if="project.company">{{ project.company }}</span>
            <span v-if="project.period" class="meta-separator">•</span>
            <span v-if="project.period">{{ project.period }}</span>
          </p>
        </div>
        <span class="detail-status" :class="`status-${project.status}`">
          {{ project.status === 'completed' ? '✓ Completed' : '⚡ In Progress' }}
        </span>
      </div>

      <!-- Image -->
      <div class="detail-image" v-if="project.image">
        <img :src="project.image" :alt="project.name" />
      </div>

      <!-- Description -->
      <div class="detail-section">
        <h3 class="section-title">Description</h3>
        <p class="section-content">{{ project.description }}</p>
      </div>

      <!-- Highlights -->
      <div class="detail-section" v-if="project.highlights.length > 0">
        <h3 class="section-title">Key Highlights</h3>
        <ul class="highlights-list">
          <li v-for="(highlight, index) in project.highlights" :key="index">
            <span class="highlight-bullet">▸</span>
            <span>{{ highlight }}</span>
          </li>
        </ul>
      </div>

      <!-- Tech Stack -->
      <div class="detail-section">
        <h3 class="section-title">Tech Stack</h3>
        <div class="tech-stack">
          <span v-for="tech in project.tech" :key="tech" class="tech-badge">
            {{ tech }}
          </span>
        </div>
      </div>

      <!-- Links -->
      <div class="detail-section" v-if="project.links && (project.links.live || project.links.code)">
        <h3 class="section-title">Links</h3>
        <div class="links-container">
          <a
            v-if="project.links.live"
            :href="project.links.live"
            target="_blank"
            rel="noopener noreferrer"
            class="link-btn"
          >
            <span>🌐</span>
            <span>Live Demo</span>
          </a>
          <a
            v-if="project.links.code"
            :href="project.links.code"
            target="_blank"
            rel="noopener noreferrer"
            class="link-btn"
          >
            <span>💻</span>
            <span>Source Code</span>
          </a>
        </div>
      </div>

      <!-- Back to projects -->
      <div class="detail-footer">
        <button @click="backToProjects" class="back-btn">
          ← Back to Projects
        </button>
      </div>
    </div>
  </BasePanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import BasePanel from './BasePanel.vue'
import type { Project } from '@/types'

const store = useTerminalStore()
const { activePanelData } = storeToRefs(store)

const project = computed<Project>(() => activePanelData.value?.project)

function backToProjects() {
  store.openPanel('projects', { projects: null })
}
</script>

<style scoped>
.project-detail {
  @apply space-y-6;
}

.detail-header {
  @apply flex items-start justify-between gap-4;
}

.detail-title {
  @apply text-3xl font-bold text-theme-accent mb-2;
}

.detail-meta {
  @apply text-sm text-theme-secondary flex items-center gap-2;
}

.meta-separator {
  @apply text-border-color;
}

.detail-status {
  @apply text-sm px-3 py-1 rounded border whitespace-nowrap;
}

.status-completed {
  @apply text-success border-success;
}

.status-in-progress {
  @apply text-yellow-500 border-yellow-500;
}

.detail-image {
  @apply rounded-lg overflow-hidden border border-theme;
  @apply h-64 bg-theme-secondary;
}

.detail-image img {
  @apply w-full h-full object-cover;
}

.detail-section {
  @apply space-y-3;
}

.section-title {
  @apply text-lg font-semibold text-theme-accent;
}

.section-content {
  @apply text-theme-primary leading-relaxed;
}

.highlights-list {
  @apply space-y-2;
}

.highlights-list li {
  @apply flex items-start gap-3 text-theme-primary;
}

.highlight-bullet {
  @apply text-theme-accent flex-shrink-0 mt-1;
}

.tech-stack {
  @apply flex flex-wrap gap-2;
}

.tech-badge {
  @apply px-3 py-1.5 rounded;
  @apply bg-theme-primary border border-cyan-dark text-theme-accent;
  @apply text-sm font-semibold;
}

.links-container {
  @apply flex flex-wrap gap-3;
}

.link-btn {
  @apply px-4 py-2 rounded;
  @apply bg-theme-accent text-bg-dark;
  @apply hover:bg-theme-accent-dark;
  @apply transition-colors duration-200;
  @apply font-semibold text-sm;
  @apply flex items-center gap-2;
}

.detail-footer {
  @apply pt-4 border-t border-theme;
}

.back-btn {
  @apply px-4 py-2 rounded;
  @apply bg-theme-secondary border border-theme text-theme-primary;
  @apply hover:border-theme-accent hover:text-theme-accent;
  @apply transition-all duration-200;
  @apply font-semibold text-sm;
}
</style>
