<template>
  <BasePanel title="skills">
    <div class="skills-panel">
      <!-- Skills Categories -->
      <div class="skills-grid">
        <div
          v-for="category in skills"
          :key="category.category"
          class="skill-category"
        >
          <h3 class="category-title">{{ category.category }}</h3>
          <div class="skills-list">
            <div
              v-for="skill in category.skills"
              :key="skill.name"
              class="skill-item"
            >
              <div class="skill-info">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-level">{{ getLevelText(skill.level) }}</span>
              </div>
              <div class="skill-bar">
                <div
                  class="skill-progress"
                  :style="{ width: `${(skill.level / 5) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Proficiency Overview -->
      <div class="proficiency-section">
        <h3 class="section-title">Overall Proficiency</h3>
        <div class="proficiency-bars">
          <div v-for="area in proficiencyAreas" :key="area.name" class="proficiency-item">
            <div class="proficiency-header">
              <span class="proficiency-name">{{ area.name }}</span>
              <span class="proficiency-percentage">{{ area.percentage }}%</span>
            </div>
            <div class="proficiency-bar">
              <div
                class="proficiency-fill"
                :style="{ width: `${area.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasePanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import BasePanel from './BasePanel.vue'
import { skillsData, proficiencyLevels } from '@/assets/data'

const store = useTerminalStore()
const { activePanelData } = storeToRefs(store)

const skills = computed(() => activePanelData.value?.skills || skillsData)

const proficiencyAreas = computed(() =>
  proficiencyLevels.map(level => ({
    name: level.area,
    percentage: level.percentage
  }))
)

function getLevelText(level?: number): string {
  if (!level) return ''
  const levels = ['Beginner', 'Intermediate', 'Intermediate+', 'Advanced', 'Expert']
  return levels[level - 1] || ''
}
</script>

<style scoped>
.skills-panel {
  @apply space-y-8;
}

.skills-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.skill-category {
  @apply bg-bg-secondary border border-border-color rounded-lg p-4;
}

.category-title {
  @apply text-lg font-bold text-cyan-neon mb-4;
}

.skills-list {
  @apply space-y-3;
}

.skill-item {
  @apply space-y-1;
}

.skill-info {
  @apply flex items-center justify-between;
}

.skill-name {
  @apply text-sm text-text-primary font-medium;
}

.skill-level {
  @apply text-xs text-text-secondary;
}

.skill-bar {
  @apply h-2 bg-bg-dark rounded-full overflow-hidden;
}

.skill-progress {
  @apply h-full bg-gradient-to-r from-cyan-dark to-cyan-neon rounded-full;
  transition: width 0.5s ease-out;
}

.proficiency-section {
  @apply pt-6 border-t border-border-color;
}

.section-title {
  @apply text-xl font-bold text-cyan-neon mb-4;
}

.proficiency-bars {
  @apply space-y-4;
}

.proficiency-item {
  @apply space-y-2;
}

.proficiency-header {
  @apply flex items-center justify-between;
}

.proficiency-name {
  @apply text-text-primary font-medium;
}

.proficiency-percentage {
  @apply text-cyan-neon font-bold;
}

.proficiency-bar {
  @apply h-3 bg-bg-secondary rounded-full overflow-hidden border border-border-color;
}

.proficiency-fill {
  @apply h-full bg-gradient-to-r from-cyan-dark to-cyan-neon;
  transition: width 0.8s ease-out;
}
</style>
