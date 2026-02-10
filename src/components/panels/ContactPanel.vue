<template>
  <BasePanel title="contact">
    <div class="contact-panel">
      <!-- Contact Info Grid -->
      <div class="contact-grid">
        <!-- Email -->
        <a
          :href="`mailto:${contactInfo.email}`"
          class="contact-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="contact-icon">
            <span class="icon-text">📧</span>
          </div>
          <div class="contact-details">
            <h3 class="contact-label">Email</h3>
            <p class="contact-value">{{ contactInfo.email }}</p>
          </div>
          <span class="contact-arrow">→</span>
        </a>

        <!-- LinkedIn -->
        <a
          :href="contactInfo.linkedin"
          class="contact-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="contact-icon">
            <span class="icon-text">💼</span>
          </div>
          <div class="contact-details">
            <h3 class="contact-label">LinkedIn</h3>
            <p class="contact-value">Rostel PANOUMASSI</p>
          </div>
          <span class="contact-arrow">→</span>
        </a>

        <!-- Location -->
        <div class="contact-card static">
          <div class="contact-icon">
            <span class="icon-text">📍</span>
          </div>
          <div class="contact-details">
            <h3 class="contact-label">Location</h3>
            <p class="contact-value">{{ contactInfo.location }}</p>
          </div>
        </div>

        <!-- Copy Email Button -->
        <button
          @click="copyEmail"
          class="contact-card"
        >
          <div class="contact-icon">
            <span class="icon-text">{{ copied ? '✓' : '📋' }}</span>
          </div>
          <div class="contact-details">
            <h3 class="contact-label">{{ copied ? 'Copied!' : 'Copy Email' }}</h3>
            <p class="contact-value">Click to copy</p>
          </div>
          <span class="contact-arrow" v-if="!copied">→</span>
        </button>
      </div>

      <!-- Quick Contact Section -->
      <div class="quick-contact">
        <h3 class="section-title">Let's Connect</h3>
        <p class="section-description">
          I'm always open to discussing new opportunities, collaborations,
          or just having a chat about technology and innovation.
        </p>
        <div class="contact-actions">
          <a
            :href="`mailto:${contactInfo.email}`"
            class="action-btn primary"
          >
            Send Email
          </a>
          <a
            :href="contactInfo.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="action-btn secondary"
          >
            Connect on LinkedIn
          </a>
        </div>
      </div>

      <!-- Availability -->
      <div class="availability" v-if="contactInfo.availability">
        <span class="availability-indicator"></span>
        <span class="availability-text">{{ contactInfo.availability }}</span>
      </div>
    </div>
  </BasePanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTerminalStore } from '@/stores/terminal'
import BasePanel from './BasePanel.vue'
import { aboutData } from '@/assets/data'

const store = useTerminalStore()
const { activePanelData } = storeToRefs(store)

const contactInfo = computed(() => activePanelData.value || aboutData)
const copied = ref(false)

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(contactInfo.value.email)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy email:', error)
  }
}
</script>

<style scoped>
.contact-panel {
  @apply space-y-8;
}

.contact-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.contact-card {
  @apply flex items-center gap-4 p-4;
  @apply bg-theme-secondary border border-theme rounded-lg;
  @apply transition-all duration-300;
  @apply cursor-pointer;
  text-decoration: none;
}

.contact-card:not(.static):hover {
  @apply border-theme-accent;
  box-shadow: 0 0 20px rgba(0, 255, 247, 0.2);
  transform: translateY(-2px);
}

.contact-card.static {
  @apply cursor-default;
}

.contact-icon {
  @apply w-12 h-12 rounded-full;
  @apply bg-theme-primary border border-cyan-dark;
  @apply flex items-center justify-center;
  @apply text-2xl;
}

.icon-text {
  @apply inline-block;
}

.contact-details {
  @apply flex-1;
}

.contact-label {
  @apply text-sm font-semibold text-theme-accent mb-1;
}

.contact-value {
  @apply text-theme-primary text-sm;
}

.contact-arrow {
  @apply text-theme-accent text-xl;
}

.quick-contact {
  @apply bg-theme-secondary border border-theme rounded-lg p-6;
  @apply text-center;
}

.section-title {
  @apply text-xl font-bold text-theme-accent mb-3;
}

.section-description {
  @apply text-theme-primary leading-relaxed mb-6;
}

.contact-actions {
  @apply flex flex-wrap gap-4 justify-center;
}

.action-btn {
  @apply px-6 py-3 rounded font-semibold;
  @apply transition-all duration-200;
  text-decoration: none;
}

.action-btn.primary {
  @apply bg-theme-accent text-bg-dark;
  @apply hover:bg-theme-accent-dark;
}

.action-btn.secondary {
  @apply bg-theme-primary border border-theme-accent text-theme-accent;
  @apply hover:bg-theme-accent hover:text-bg-dark;
}

.availability {
  @apply flex items-center justify-center gap-2;
  @apply text-sm text-theme-secondary;
}

.availability-indicator {
  @apply w-2 h-2 rounded-full bg-success;
  animation: pulse-dot 2s ease-in-out infinite;
}

.availability-text {
  @apply text-success;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>
