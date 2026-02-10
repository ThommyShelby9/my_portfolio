<template>
  <BasePanel title="experience">
    <div class="experience-panel">
      <!-- Timeline -->
      <div class="timeline">
        <div
          v-for="(exp, index) in experiences"
          :key="exp.id"
          class="timeline-item"
        >
          <!-- Timeline connector -->
          <div class="timeline-connector">
            <div class="timeline-dot"></div>
            <div v-if="Number(index) < experiences.length - 1" class="timeline-line"></div>
          </div>

          <!-- Experience content -->
          <div class="experience-content">
            <div class="experience-header">
              <div>
                <h3 class="experience-company">{{ exp.company }}</h3>
                <p class="experience-position">{{ exp.position }}</p>
              </div>
              <div class="experience-meta">
                <span class="experience-period">{{ exp.period }}</span>
                <span class="experience-location" v-if="exp.location">
                  📍 {{ exp.location }}
                </span>
              </div>
            </div>

            <p class="experience-description">{{ exp.description }}</p>

            <!-- Achievements -->
            <div class="achievements">
              <h4 class="achievements-title">Key Achievements:</h4>
              <ul class="achievements-list">
                <li v-for="(achievement, idx) in exp.achievements" :key="idx">
                  <span class="achievement-bullet">▸</span>
                  <span>{{ achievement }}</span>
                </li>
              </ul>
            </div>

            <!-- Tech stack -->
            <div class="experience-tech" v-if="exp.tech && exp.tech.length > 0">
              <span v-for="tech in exp.tech" :key="tech" class="tech-tag">
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="experience-summary">
        <p class="text-text-secondary text-sm text-center">
          {{ experiences.length }} positions • {{ calculateTotalYears() }} of experience
        </p>
      </div>
    </div>
  </BasePanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import BasePanel from './BasePanel.vue'
import { experienceData } from '@/assets/data'

const store = useTerminalStore()
const { activePanelData } = storeToRefs(store)

const experiences = computed(() => activePanelData.value?.experiences || experienceData)

function calculateTotalYears(): string {
  // Simple calculation - can be improved
  const years = experiences.value.length * 0.5 // Rough estimate
  return `${Math.round(years)}+ years`
}
</script>

<style scoped>
.experience-panel {
  @apply space-y-6;
}

.timeline {
  @apply space-y-6;
}

.timeline-item {
  @apply flex gap-4;
}

.timeline-connector {
  @apply flex flex-col items-center flex-shrink-0 pt-1;
}

.timeline-dot {
  @apply w-4 h-4 rounded-full bg-cyan-neon;
  @apply border-4 border-bg-dark;
  box-shadow: 0 0 0 2px var(--color-cyan-neon);
}

.timeline-line {
  @apply w-0.5 flex-1 bg-cyan-dark mt-2;
  min-height: 60px;
}

.experience-content {
  @apply flex-1 bg-bg-secondary border border-border-color rounded-lg p-4;
  @apply hover:border-cyan-dark transition-colors duration-300;
}

.experience-header {
  @apply flex items-start justify-between gap-4 mb-3;
}

.experience-company {
  @apply text-xl font-bold text-cyan-neon;
}

.experience-position {
  @apply text-text-primary font-semibold;
}

.experience-meta {
  @apply flex flex-col items-end gap-1 text-sm text-text-secondary;
}

.experience-period {
  @apply font-mono;
}

.experience-location {
  @apply text-xs;
}

.experience-description {
  @apply text-text-primary text-sm leading-relaxed mb-4;
}

.achievements {
  @apply mb-4;
}

.achievements-title {
  @apply text-sm font-semibold text-cyan-neon mb-2;
}

.achievements-list {
  @apply space-y-2;
}

.achievements-list li {
  @apply flex items-start gap-2 text-sm text-text-primary;
}

.achievement-bullet {
  @apply text-cyan-neon flex-shrink-0 mt-0.5;
}

.experience-tech {
  @apply flex flex-wrap gap-2 pt-3 border-t border-border-color;
}

.tech-tag {
  @apply text-xs px-2 py-1 rounded;
  @apply bg-bg-dark border border-cyan-dark text-cyan-neon;
}

.experience-summary {
  @apply pt-4 border-t border-border-color;
}
</style>
