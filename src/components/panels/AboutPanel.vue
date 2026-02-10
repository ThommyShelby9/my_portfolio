<template>
  <BasePanel title="About Me">
    <div class="about-container">
      <!-- Profile Section -->
      <div class="profile-section">
        <!-- Profile Photo -->
        <div class="profile-photo">
          <img
            v-if="profileImage"
            :src="profileImage"
            :alt="aboutData.name"
            class="photo"
          />
          <div v-else class="photo-placeholder">
            <span class="initials">{{ getInitials(aboutData.name) }}</span>
          </div>
        </div>

        <!-- Quick Info -->
        <div class="quick-info">
          <h2 class="name">{{ aboutData.name }}</h2>
          <p class="role">{{ aboutData.role }}</p>
          <p class="company">
            <span class="icon">🏢</span>
            {{ aboutData.company }}
          </p>
          <p class="location">
            <span class="icon">📍</span>
            {{ aboutData.location }}
          </p>
          <div class="availability">
            <span class="status-dot"></span>
            {{ aboutData.availability }}
          </div>
        </div>
      </div>

      <!-- Contact Links -->
      <div class="contact-section">
        <a :href="`mailto:${aboutData.email}`" class="contact-link" target="_blank">
          <span class="icon">📧</span>
          {{ aboutData.email }}
        </a>
        <a :href="aboutData.linkedin" class="contact-link" target="_blank" rel="noopener">
          <span class="icon">💼</span>
          LinkedIn Profile
        </a>
      </div>

      <!-- Bio -->
      <div class="bio-section">
        <h3 class="section-title">About</h3>
        <div class="bio-text">
          {{ aboutData.bio }}
        </div>
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <h3 class="section-title">Explore</h3>
        <div class="links-grid">
          <button class="quick-link-btn" @click="executeCommand('experience')">
            <span class="link-icon">💼</span>
            <span class="link-text">Work Experience</span>
          </button>
          <button class="quick-link-btn" @click="executeCommand('skills')">
            <span class="link-icon">⚡</span>
            <span class="link-text">Technical Skills</span>
          </button>
          <button class="quick-link-btn" @click="executeCommand('projects')">
            <span class="link-icon">🚀</span>
            <span class="link-text">Projects</span>
          </button>
          <button class="quick-link-btn" @click="executeCommand('cv')">
            <span class="link-icon">📄</span>
            <span class="link-text">Download CV</span>
          </button>
        </div>
      </div>
    </div>
  </BasePanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BasePanel from './BasePanel.vue'
import { aboutData } from '@/assets/data'
import { useTerminal } from '@/composables/useTerminal'

const { executeCommand } = useTerminal()

// Profile image
const profileImage = computed(() => {
  return '/images/profile.jpg'
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}
</script>

<style scoped>
.about-container {
  @apply flex flex-col gap-6;
}

/* Profile Section */
.profile-section {
  @apply flex flex-col md:flex-row gap-6 items-center md:items-start;
  @apply pb-6 border-b border-theme;
}

.profile-photo {
  @apply flex-shrink-0;
}

.photo {
  @apply w-32 h-32 rounded-full object-cover;
  @apply border-2 border-theme-accent;
  box-shadow: 0 0 20px rgba(0, 255, 247, 0.3);
}

.photo-placeholder {
  @apply w-32 h-32 rounded-full;
  @apply bg-theme-accent-dark;
  @apply flex items-center justify-center;
  @apply border-2 border-theme-accent;
  box-shadow: 0 0 20px rgba(0, 255, 247, 0.3);
}

.initials {
  @apply text-4xl font-bold text-theme-primary;
}

.quick-info {
  @apply flex-1 text-center md:text-left;
}

.name {
  @apply text-2xl font-bold text-theme-accent mb-2;
}

.role {
  @apply text-lg text-theme-primary font-semibold mb-1;
}

.company,
.location {
  @apply text-theme-secondary text-sm mb-1;
  @apply flex items-center gap-2;
  @apply justify-center md:justify-start;
}

.icon {
  @apply text-base;
}

.availability {
  @apply inline-flex items-center gap-2;
  @apply mt-3 px-3 py-1 rounded-full;
  @apply bg-theme-secondary text-theme-accent text-sm;
}

.status-dot {
  @apply w-2 h-2 rounded-full bg-theme-accent;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Contact Section */
.contact-section {
  @apply flex flex-col sm:flex-row gap-3;
  @apply pb-6 border-b border-theme;
}

.contact-link {
  @apply flex items-center gap-2;
  @apply px-4 py-2 rounded;
  @apply bg-theme-secondary text-theme-primary;
  @apply hover:bg-theme-accent hover:text-theme-primary;
  @apply transition-all duration-200;
  @apply text-sm;
  @apply no-underline;
}

/* Bio Section */
.bio-section {
  @apply pb-6 border-b border-theme;
}

.section-title {
  @apply text-lg font-bold text-theme-accent mb-3;
}

.bio-text {
  @apply text-theme-primary leading-relaxed;
  @apply whitespace-pre-line;
}

/* Quick Links */
.quick-links {
  @apply pb-2;
}

.links-grid {
  @apply grid grid-cols-2 gap-3;
}

.quick-link-btn {
  @apply flex items-center gap-3;
  @apply px-4 py-3 rounded;
  @apply bg-theme-secondary;
  @apply border border-theme;
  @apply hover:border-theme-accent hover:bg-theme-accent-dark;
  @apply transition-all duration-200;
  @apply cursor-pointer;
}

.link-icon {
  @apply text-xl;
}

.link-text {
  @apply text-sm text-theme-primary font-medium;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .links-grid {
    @apply grid-cols-1;
  }
}
</style>
