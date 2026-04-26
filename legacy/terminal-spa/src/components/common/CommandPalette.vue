<template>
  <Teleport to="body">
    <Transition name="palette-overlay">
      <div v-if="isOpen" class="palette-overlay" @click.self="close">
        <div class="palette-container" @click.stop>
          <!-- Search Input -->
          <div class="palette-search">
            <span class="search-icon">🔍</span>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Type a command or search..."
              class="search-input"
              @keydown="handleKeydown"
              @input="resetSelection"
            />
            <kbd class="search-hint">ESC</kbd>
          </div>

          <!-- Scrollable Content Container -->
          <div class="palette-content">
            <!-- Recent Commands (when no search) -->
            <div v-if="!searchQuery && recentCommands.length > 0" class="palette-section">
            <div class="section-title">Recent</div>
            <div
              v-for="(cmdName, index) in recentCommands"
              :key="`recent-${cmdName}`"
              class="palette-item"
              :class="{ active: selectedIndex === index }"
              @click="execute(cmdName)"
              @mouseenter="selectedIndex = index"
            >
              <div class="item-icon">⏱️</div>
              <div class="item-content">
                <div class="item-name">{{ cmdName }}</div>
                <div class="item-description">{{ getCommandDescription(cmdName) }}</div>
              </div>
            </div>
          </div>

          <!-- Filtered Commands by Category -->
          <div v-if="filteredCategories.length > 0">
            <div
              v-for="category in filteredCategories"
              :key="category.name"
              class="palette-section"
            >
              <div class="section-title">{{ category.name }}</div>
              <div
                v-for="(cmd, cmdIndex) in category.commands"
                :key="cmd.name"
                class="palette-item"
                :class="{ active: isSelected(category.name, cmdIndex) }"
                @click="execute(cmd.name)"
                @mouseenter="setSelected(category.name, cmdIndex)"
              >
                <div class="item-icon">{{ getCategoryIcon(category.name) }}</div>
                <div class="item-content">
                  <div class="item-name" v-html="highlightMatch(cmd.name)"></div>
                  <div class="item-description">{{ cmd.description }}</div>
                </div>
                <div class="item-usage">{{ cmd.usage }}</div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="showEmptyState" class="palette-empty">
            <div class="empty-icon">🤔</div>
            <div class="empty-text">No commands found</div>
            <div class="empty-hint">Try different keywords</div>
          </div>
          </div>
          <!-- End Scrollable Content -->

          <!-- Footer -->
          <div class="palette-footer">
            <div class="footer-shortcuts">
              <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
              <span><kbd>Enter</kbd> Execute</span>
              <span><kbd>ESC</kbd> Close</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommandPaletteStore } from '@/stores/commandPalette'
import { useCommands } from '@/composables/useCommands'
import { fuzzyFilter, highlightMatches } from '@/utils/fuzzySearch'
import type { Command, CommandCategory } from '@/types/commands'

const paletteStore = useCommandPaletteStore()
const { isOpen, searchQuery, selectedIndex, recentCommands } = storeToRefs(paletteStore)
const { close, execute, resetSelection } = paletteStore

const commands = useCommands()
const allCommands = commands.getAllCommands()

const searchInput = ref<HTMLInputElement>()

// Auto-focus search input when palette opens
watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    searchInput.value?.focus()
  }
})

// Get command description by name
function getCommandDescription(name: string): string {
  const cmd = allCommands.find(c => c.name === name)
  return cmd?.description || ''
}

// Category mapping
const categoryNames: Record<CommandCategory, string> = {
  'navigation': 'Navigation',
  'configuration': 'Configuration',
  'system': 'System',
  'easter-eggs': 'Easter Eggs'
}

const categoryIcons: Record<string, string> = {
  'Navigation': '🧭',
  'Configuration': '⚙️',
  'System': '💻',
  'Easter Eggs': '🥚',
  'Recent': '⏱️'
}

function getCategoryIcon(categoryName: string): string {
  return categoryIcons[categoryName] || '📌'
}

// Filter and categorize commands
const filteredCategories = computed(() => {
  let filtered = allCommands

  // Apply fuzzy search if query exists
  if (searchQuery.value) {
    filtered = fuzzyFilter(allCommands, searchQuery.value)
  }

  // Group by category
  const categories: Record<string, Command[]> = {}

  filtered.forEach(cmd => {
    const categoryKey = cmd.category || 'navigation'
    const categoryName = categoryNames[categoryKey]

    if (!categories[categoryName]) {
      categories[categoryName] = []
    }
    categories[categoryName].push(cmd)
  })

  // Convert to array format
  return Object.entries(categories).map(([name, commands]) => ({
    name,
    commands
  }))
})

// Show empty state when search has no results
const showEmptyState = computed(() => {
  return searchQuery.value && filteredCategories.value.length === 0
})

// Total number of items for navigation
const totalItems = computed(() => {
  if (!searchQuery.value && recentCommands.value.length > 0) {
    return recentCommands.value.length
  }

  return filteredCategories.value.reduce((sum, cat) => sum + cat.commands.length, 0)
})

// Check if item is selected
function isSelected(categoryName: string, cmdIndex: number): boolean {
  if (!searchQuery.value && recentCommands.value.length > 0) {
    return false // Recent items use different selection
  }

  let currentIndex = 0
  for (const category of filteredCategories.value) {
    if (category.name === categoryName) {
      return selectedIndex.value === currentIndex + cmdIndex
    }
    currentIndex += category.commands.length
  }
  return false
}

// Set selected item
function setSelected(categoryName: string, cmdIndex: number) {
  if (!searchQuery.value && recentCommands.value.length > 0) {
    selectedIndex.value = cmdIndex
    return
  }

  let currentIndex = 0
  for (const category of filteredCategories.value) {
    if (category.name === categoryName) {
      selectedIndex.value = currentIndex + cmdIndex
      return
    }
    currentIndex += category.commands.length
  }
}

// Get selected command
function getSelectedCommand(): string | null {
  // Recent commands
  if (!searchQuery.value && recentCommands.value.length > 0) {
    return recentCommands.value[selectedIndex.value] || null
  }

  // Filtered commands
  let currentIndex = 0
  for (const category of filteredCategories.value) {
    if (selectedIndex.value < currentIndex + category.commands.length) {
      const cmdIndex = selectedIndex.value - currentIndex
      return category.commands[cmdIndex]?.name || null
    }
    currentIndex += category.commands.length
  }

  return null
}

// Execute selected command
function executeSelected() {
  const cmdName = getSelectedCommand()
  if (cmdName) {
    execute(cmdName)
  }
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (selectedIndex.value < totalItems.value - 1) {
        selectedIndex.value++
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (selectedIndex.value > 0) {
        selectedIndex.value--
      }
      break
    case 'Enter':
      event.preventDefault()
      executeSelected()
      break
    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}

// Highlight matched characters
function highlightMatch(name: string): string {
  return highlightMatches(name, searchQuery.value)
}
</script>

<style scoped>
/* Overlay */
.palette-overlay {
  @apply fixed inset-0 z-[10000];
  @apply bg-black/60;
  backdrop-filter: blur(4px);
  @apply flex items-start justify-center;
  @apply pt-20;
}

/* Container */
.palette-container {
  @apply w-full max-w-2xl;
  @apply bg-theme-secondary;
  @apply border-2 border-theme-accent;
  @apply rounded-lg shadow-2xl;
  @apply overflow-hidden;
  box-shadow: 0 0 40px rgba(0, 255, 247, 0.5);
}

@media (max-width: 768px) {
  .palette-overlay {
    @apply pt-4 px-4;
  }

  .palette-container {
    @apply max-w-full;
  }
}

/* Search Section */
.palette-search {
  @apply flex items-center gap-3;
  @apply px-4 py-4;
  @apply border-b border-theme;
}

.search-icon {
  @apply text-xl flex-shrink-0;
}

.search-input {
  @apply flex-1;
  @apply bg-transparent;
  @apply text-theme-primary text-lg;
  @apply outline-none;
  @apply font-mono;
}

.search-input::placeholder {
  @apply text-theme-secondary;
}

.search-hint {
  @apply px-2 py-1 rounded;
  @apply bg-theme-primary;
  @apply border border-theme;
  @apply text-theme-secondary text-xs;
  @apply font-mono;
}

/* Scrollable Content Container */
.palette-content {
  @apply overflow-y-auto;
  @apply max-h-[calc(80vh-180px)];
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

@media (max-width: 768px) {
  .palette-content {
    @apply max-h-[calc(100vh-200px)];
  }
}

@media (max-width: 768px) {
  .palette-content {
    @apply max-h-[calc(100vh-250px)];
  }
}

/* Sections */
.palette-section {
  /* Remove individual section max-height since parent is scrollable */
}

.section-title {
  @apply px-4 py-2;
  @apply text-xs uppercase tracking-wider;
  @apply text-theme-accent font-bold;
  @apply bg-theme-primary;
  @apply sticky top-0 z-10;
}

/* Command Items */
.palette-item {
  @apply flex items-center gap-3;
  @apply px-4 py-3;
  @apply cursor-pointer;
  @apply transition-all duration-150;
}

.palette-item:hover,
.palette-item.active {
  @apply bg-theme-accent-dark;
}

.palette-item.active {
  @apply border-l-2 border-theme-accent;
}

.item-icon {
  @apply text-xl flex-shrink-0;
}

.item-content {
  @apply flex-1 min-w-0;
}

.item-name {
  @apply text-theme-primary font-semibold;
  @apply truncate;
}

.item-name :deep(mark.highlight) {
  @apply text-theme-accent bg-transparent font-bold;
}

.item-description {
  @apply text-sm text-theme-secondary;
  @apply truncate;
}

.item-usage {
  @apply text-xs text-theme-secondary;
  @apply font-mono;
  @apply flex-shrink-0;
}

@media (max-width: 768px) {
  .item-usage {
    @apply hidden;
  }
}

/* Empty State */
.palette-empty {
  @apply flex flex-col items-center justify-center;
  @apply py-12 px-4;
  @apply text-center;
}

.empty-icon {
  @apply text-4xl mb-2;
}

.empty-text {
  @apply text-theme-primary font-semibold mb-1;
}

.empty-hint {
  @apply text-sm text-theme-secondary;
}

/* Footer */
.palette-footer {
  @apply px-4 py-3;
  @apply border-t border-theme;
  @apply bg-theme-primary;
}

.footer-shortcuts {
  @apply flex items-center gap-4;
  @apply text-xs text-theme-secondary;
}

.footer-shortcuts span {
  @apply flex items-center gap-1;
}

.footer-shortcuts kbd {
  @apply px-1.5 py-0.5 rounded;
  @apply bg-theme-secondary;
  @apply border border-theme;
  @apply text-theme-primary;
  @apply font-mono text-xs;
}

/* Transitions */
.palette-overlay-enter-active,
.palette-overlay-leave-active {
  transition: all 0.2s ease;
}

.palette-overlay-enter-active .palette-container,
.palette-overlay-leave-active .palette-container {
  transition: all 0.2s ease;
}

.palette-overlay-enter-from,
.palette-overlay-leave-to {
  @apply opacity-0;
}

.palette-overlay-enter-from .palette-container,
.palette-overlay-leave-to .palette-container {
  @apply opacity-0 scale-95 -translate-y-4;
}
</style>
