# Prompt pour Claude Code - Portfolio Terminal OS

## Contexte du projet
Je suis Rostel PANOUMASSI, Responsable Ingénierie & Innovation chez KPS Groupe. Je souhaite créer un portfolio interactif sous forme de Terminal OS avec une expérience utilisateur cinématographique et des animations impressionnantes mais professionnelles.

## Stack technique imposée
- **Vue 3** + Vite + **TypeScript**
- **TailwindCSS** pour le layout
- **GSAP** pour les animations
- **@vueuse/core** (keyboard, localStorage, prefers-reduced-motion)
- **Pinia** pour la gestion d'état
- **Lenis** (scroll smooth - optionnel)
- **Shiki** ou highlight.js pour la coloration syntaxique

## Direction artistique
**Thème principal : Cyan Neon (futur/premium)**
- Fond : noir cassé (#0b0f14)
- Accent primaire : cyan électrique (#00fff7)
- Accent secondaire : cyan sombre (#0891b2)
- Typographie : JetBrains Mono ou IBM Plex Mono
- Chrome de fenêtre terminal avec 3 boutons macOS + léger reflet
- Grain animé + scanlines très légers
- Effets glitch subtils sur erreurs
- Mode "Performance mode" + "Reduced motion" obligatoires

## Architecture du projet

### Structure des dossiers
```
src/
├── assets/
│   ├── fonts/
│   └── data/
│       ├── about.ts
│       ├── skills.ts
│       ├── projects.ts
│       ├── experience.ts
│       └── services.ts
├── components/
│   ├── terminal/
│   │   ├── TerminalWindow.vue
│   │   ├── TerminalHeader.vue
│   │   ├── TerminalBody.vue
│   │   ├── TerminalInput.vue
│   │   ├── TerminalHistory.vue
│   │   └── TerminalCursor.vue
│   ├── panels/
│   │   ├── ProjectsPanel.vue
│   │   ├── ProjectDetailPanel.vue
│   │   ├── ContactPanel.vue
│   │   ├── SkillsPanel.vue
│   │   └── ExperiencePanel.vue
│   ├── boot/
│   │   └── BootSequence.vue
│   └── effects/
│       ├── GrainEffect.vue
│       ├── ScanlinesEffect.vue
│       └── GlitchEffect.vue
├── composables/
│   ├── useTerminal.ts
│   ├── useCommands.ts
│   ├── useAnimations.ts
│   ├── useTheme.ts
│   └── useKeyboard.ts
├── stores/
│   └── terminal.ts
├── types/
│   ├── terminal.ts
│   ├── commands.ts
│   └── project.ts
├── utils/
│   ├── commandParser.ts
│   └── animations.ts
└── App.vue
```

---

## SPRINTS BLOQUANTS (Ordre strict à respecter)

### 🔴 SPRINT 0 : Setup & Configuration (Bloquant pour tout)
**Durée estimée : 2h**

**Tâches obligatoires :**
1. Initialiser projet Vite + Vue 3 + TypeScript
2. Installer et configurer TailwindCSS avec config custom :
   - Couleurs cyan neon (#00fff7, #0891b2)
   - Fond noir cassé (#0b0f14)
   - Font JetBrains Mono
3. Installer dépendances :
   ```bash
   npm install gsap @vueuse/core pinia shiki
   npm install -D @types/node
   ```
4. Configurer TypeScript strict mode
5. Créer la structure de dossiers complète
6. Configurer Pinia store
7. Configurer path aliases (@/, @components/, @composables/, etc.)

**Livrables :**
- Projet initialisé et qui démarre sans erreur
- TailwindCSS fonctionnel avec thème custom
- Structure de dossiers créée
- Configuration TypeScript stricte

---

### 🔴 SPRINT 1 : Terminal Engine Core (Bloquant pour UI)
**Durée estimée : 6h**

**Dépendances :** Sprint 0 terminé

**Tâches obligatoires :**

#### 1.1 Types TypeScript
Créer tous les types dans `src/types/` :
```typescript
// terminal.ts
interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error' | 'system'
  content: string
  timestamp: Date
}

interface TerminalState {
  history: TerminalLine[]
  currentInput: string
  mode: 'terminal' | 'panel'
  activePanel: string | null
  theme: string
  fxEnabled: boolean
  introEnabled: boolean
  reducedMotion: boolean
}

// commands.ts
interface Command {
  name: string
  description: string
  usage: string
  aliases?: string[]
  handler: (args: string[]) => Promise<CommandResult>
}

interface CommandResult {
  type: 'text' | 'panel' | 'error'
  content?: string
  panelName?: string
  panelData?: any
}
```

#### 1.2 Pinia Store - Terminal
Créer `src/stores/terminal.ts` avec :
- State initial (history, currentInput, mode, etc.)
- Actions :
  - `addLine(line: TerminalLine)`
  - `clearHistory()`
  - `setMode(mode: string)`
  - `openPanel(name: string, data?: any)`
  - `closePanel()`
  - `setTheme(theme: string)`
  - `toggleFx()`
  - `setReducedMotion(boolean)`
- Getters :
  - `visibleHistory`
  - `currentTheme`
  - `isInPanel`

#### 1.3 Composable - useTerminal
Créer `src/composables/useTerminal.ts` :
- Wrapper autour du store
- Méthodes utilitaires :
  - `executeCommand(input: string)`
  - `addOutput(content: string, type: string)`
  - `handleError(message: string)`

#### 1.4 Command Parser
Créer `src/utils/commandParser.ts` :
```typescript
function parseCommand(input: string): {
  command: string
  args: string[]
  flags: Record<string, string>
}
```

**Tests obligatoires :**
- Store se charge correctement
- addLine ajoute bien dans l'historique
- parseCommand split correctement "project creatiswap --detail"

**Livrables :**
- Types complets et exportés
- Store Pinia fonctionnel
- Composable useTerminal testable
- Parser de commandes fonctionnel

---

### 🔴 SPRINT 2 : System de Commandes (Bloquant pour contenu)
**Durée estimée : 8h**

**Dépendances :** Sprint 1 terminé

**Tâches obligatoires :**

#### 2.1 Data Files
Créer tous les fichiers dans `src/assets/data/` :

**about.ts**
```typescript
export const aboutData = {
  name: 'Rostel PANOUMASSI',
  role: 'Responsable Ingénierie & Innovation',
  company: 'KPS Groupe',
  location: 'Cotonou, Benin',
  email: 'rmissimawu@gmail.com',
  linkedin: 'www.linkedin.com/in/rostelpanoumassi-6b6608335',
  bio: `Head of Engineering & Innovation at KPS Groupe...` // Full bio from CV
}
```

**skills.ts** (toutes les compétences du CV structurées)

**projects.ts** (minimum 5 projets structurés) :
```typescript
export interface Project {
  slug: string
  name: string
  company: string
  period: string
  description: string
  tags: string[]
  highlights: string[]
  tech: string[]
  status: 'completed' | 'in-progress'
}
```

**experience.ts** (toutes les expériences du CV)

**services.ts** (services que tu proposes)

#### 2.2 Composable - useCommands
Créer `src/composables/useCommands.ts` :

Commandes obligatoires à implémenter :
```typescript
const commands = {
  // Essentielles
  help: () => listAllCommands(),
  about: () => showAbout(),
  skills: () => openSkillsPanel(),
  projects: () => openProjectsPanel(),
  project: (slug) => openProjectDetail(slug),
  experience: () => openExperiencePanel(),
  services: () => showServices(),
  contact: () => openContactPanel(),
  cv: () => downloadCV(),
  clear: () => clearTerminal(),
  
  // Configuration
  theme: (name) => changeTheme(name), // amber|cyan|green|mono
  fx: (state) => toggleEffects(state), // on|off
  intro: (state) => toggleIntro(state), // on|off
  perf: (mode) => setPerformanceMode(mode), // on|off
  
  // Navigation
  back: () => closePanel(),
  home: () => resetToTerminal(),
  
  // Fun
  easter: () => showEasterEgg(),
  matrix: () => matrixEffect(),
  
  // Aliases
  ls: () => projects(),
  cd: (slug) => project(slug),
  cat: (file) => about() // selon le file
}
```

Chaque handler doit :
- Valider les arguments
- Retourner un `CommandResult`
- Gérer les erreurs proprement
- Supporter l'autocomplétion

#### 2.3 Autocomplete
Dans `useCommands.ts`, ajouter :
```typescript
function getSuggestions(partial: string): string[] {
  // Return matching commands + args
}

function getCommandHelp(command: string): string {
  // Return usage string
}
```

**Tests obligatoires :**
- Toutes les commandes s'exécutent sans crash
- help affiche toutes les commandes
- Autocomplete fonctionne avec Tab
- Commandes avec args (project <slug>) fonctionnent

**Livrables :**
- Tous les data files remplis avec vraies données
- 15+ commandes fonctionnelles
- Autocomplete opérationnel
- Système d'aide complet

---

### 🔴 SPRINT 3 : UI Terminal de Base (Bloquant pour visuel)
**Durée estimée : 10h**

**Dépendances :** Sprints 1 & 2 terminés

**Tâches obligatoires :**

#### 3.1 Terminal Window
`src/components/terminal/TerminalWindow.vue` :
- Container principal avec chrome macOS
- 3 boutons (rouge/jaune/vert) fonctionnels :
  - Rouge : réinitialiser
  - Jaune : minimize (collapse)
  - Vert : fullscreen toggle
- Ombre et reflet subtil
- Responsive (mobile : fullscreen automatique)

#### 3.2 Terminal Header
`src/components/terminal/TerminalHeader.vue` :
- Titre dynamique basé sur mode/panel
- Info système (user@host)
- Indicateurs : thème actuel, FX on/off
- Bouton settings (ouvre panel config)

#### 3.3 Terminal Body
`src/components/terminal/TerminalBody.vue` :
- Scrollable container
- Grain + scanlines en overlay (CSS/Canvas)
- Gère le conditionnellement :
  - Terminal history (mode terminal)
  - Panel content (mode panel)

#### 3.4 Terminal History
`src/components/terminal/TerminalHistory.vue` :
```vue
<template>
  <div class="history">
    <div
      v-for="line in history"
      :key="line.id"
      :class="lineClass(line.type)"
    >
      <span class="prompt" v-if="line.type === 'input'">
        rostel@kps:~$
      </span>
      <span v-html="formatContent(line.content)" />
    </div>
  </div>
</template>
```
- Affiche historique avec coloration
- Prompt stylé pour inputs
- Erreurs en rouge avec icon
- System messages en cyan

#### 3.5 Terminal Input
`src/components/terminal/TerminalInput.vue` :
```vue
<template>
  <div class="input-line">
    <span class="prompt">rostel@kps:~$</span>
    <input
      ref="inputRef"
      v-model="currentInput"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
      autofocus
      autocomplete="off"
    />
    <TerminalCursor v-if="isFocused" />
  </div>
</template>
```
- Input natif stylé invisiblement
- Gestion keyboard :
  - Enter : execute command
  - Tab : autocomplete
  - ↑/↓ : history navigation
  - Ctrl+C : cancel input
  - Ctrl+L : clear screen
- Focus automatique après chaque commande

#### 3.6 Terminal Cursor
`src/components/terminal/TerminalCursor.vue` :
- Bloc animé qui blink (GSAP)
- Position absolue après l'input
- Variantes : bloc | barre | underscore

#### 3.7 Composable - useKeyboard
`src/composables/useKeyboard.ts` :
```typescript
import { useMagicKeys } from '@vueuse/core'

export function useKeyboard() {
  const keys = useMagicKeys()
  
  // History navigation
  const { up, down } = keys
  
  // Autocomplete
  const { tab } = keys
  
  // Shortcuts
  const { ctrl_c, ctrl_l, escape } = keys
  
  return {
    handleArrowUp: () => navigateHistoryUp(),
    handleArrowDown: () => navigateHistoryDown(),
    handleTab: () => triggerAutocomplete(),
    handleCtrlC: () => cancelInput(),
    handleCtrlL: () => clearScreen(),
    handleEscape: () => closePanel(),
  }
}
```

**Critères d'acceptation obligatoires :**
- Terminal s'affiche correctement
- Input focus fonctionne
- On peut taper et exécuter commandes
- Histoire s'affiche avec coloration
- Keyboard shortcuts marchent
- Responsive mobile (input accessible)

**Livrables :**
- Terminal fonctionnel visuellement
- Toutes interactions clavier marchent
- Histoire visible et scrollable
- Input responsive et accessible

---

### 🔴 SPRINT 4 : Panels System (Bloquant pour navigation)
**Durée estimée : 12h**

**Dépendances :** Sprint 3 terminé

**Tâches obligatoires :**

#### 4.1 Panel Base Component
`src/components/panels/BasePanel.vue` :
```vue
<template>
  <div class="panel-overlay" @click="close">
    <div class="panel-container" @click.stop>
      <div class="panel-header">
        <h2>{{ title }}</h2>
        <button @click="close">✕</button>
      </div>
      <div class="panel-body">
        <slot />
      </div>
      <div class="panel-footer">
        <span class="hint">ESC to close</span>
      </div>
    </div>
  </div>
</template>
```

#### 4.2 Projects Panel
`src/components/panels/ProjectsPanel.vue` :
- Liste tous les projets (grid 2 colonnes sur desktop)
- Cards cliquables avec :
  - Nom + entreprise
  - Tags
  - Status (badge)
  - Hover effect (neon glow)
- Click → exécute `project <slug>`

#### 4.3 Project Detail Panel
`src/components/panels/ProjectDetailPanel.vue` :
```vue
<template>
  <BasePanel title="project.name">
    <div class="project-detail">
      <div class="meta">
        <span>{{ project.company }}</span>
        <span>{{ project.period }}</span>
        <span class="status">{{ project.status }}</span>
      </div>
      
      <div class="description">
        {{ project.description }}
      </div>
      
      <div class="highlights">
        <h3>Highlights</h3>
        <ul>
          <li v-for="h in project.highlights">{{ h }}</li>
        </ul>
      </div>
      
      <div class="tech-stack">
        <h3>Tech Stack</h3>
        <div class="tags">
          <span v-for="t in project.tech" class="tag">{{ t }}</span>
        </div>
      </div>
    </div>
  </BasePanel>
</template>
```

#### 4.4 Skills Panel
`src/components/panels/SkillsPanel.vue` :
- Catégories : Backend, Frontend, DevOps, Mobile, Other
- Skill bars animées ou stars
- Certifications en bas

#### 4.5 Experience Panel
`src/components/panels/ExperiencePanel.vue` :
- Timeline verticale
- Chaque poste avec :
  - Logo entreprise (optionnel)
  - Dates
  - Titre
  - Bullet points
- Scroll smooth

#### 4.6 Contact Panel
`src/components/panels/ContactPanel.vue` :
```vue
<template>
  <BasePanel title="/contact">
    <div class="contact-grid">
      <a :href="`mailto:${email}`" class="contact-item">
        <Icon name="mail" />
        <span>{{ email }}</span>
      </a>
      
      <a :href="linkedin" class="contact-item">
        <Icon name="linkedin" />
        <span>LinkedIn</span>
      </a>
      
      <button @click="copyEmail" class="contact-item">
        <Icon name="copy" />
        <span>Copy Email</span>
      </button>
    </div>
    
    <div class="contact-form">
      <h3>Send Message via Terminal</h3>
      <p>Type: <code>message "Your message here"</code></p>
    </div>
  </BasePanel>
</template>
```

#### 4.7 Panel Manager
Dans `src/stores/terminal.ts`, ajouter :
```typescript
const panelComponents = {
  projects: ProjectsPanel,
  project: ProjectDetailPanel,
  skills: SkillsPanel,
  experience: ExperiencePanel,
  contact: ContactPanel,
}

function getCurrentPanelComponent() {
  return panelComponents[state.activePanel]
}
```

**Critères d'acceptation :**
- Tous les panels s'ouvrent via commandes
- Navigation panel → panel possible
- ESC ferme panel
- Click overlay ferme panel
- Contenu réel affiché (pas de lorem)
- Responsive mobile (panels fullscreen)

**Livrables :**
- 5 panels fonctionnels
- Navigation fluide entre panels
- Contenu réel du CV affiché
- Base pour animations

---

### 🔴 SPRINT 5 : Boot Sequence (Bloquant pour première impression)
**Durée estimée : 6h**

**Dépendances :** Sprint 3 terminé

**Tâches obligatoires :**

#### 5.1 Boot Sequence Component
`src/components/boot/BootSequence.vue` :
```vue
<template>
  <div v-if="isBooting" class="boot-overlay">
    <div class="boot-content">
      <h1 class="boot-logo">ROSTEL_OS</h1>
      <div class="boot-logs">
        <div
          v-for="log in logs"
          :key="log.id"
          class="boot-log"
          :class="log.status"
        >
          <span class="icon">{{ log.icon }}</span>
          <span class="text">{{ log.text }}</span>
        </div>
      </div>
      <div class="boot-progress">
        <div class="bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>
```

#### 5.2 Boot Timeline (GSAP)
`src/utils/animations.ts` :
```typescript
export function createBootSequence() {
  const tl = gsap.timeline()
  
  // 1. Logo fade in + glitch (0.5s)
  tl.from('.boot-logo', {
    opacity: 0,
    scale: 0.8,
    duration: 0.5,
    ease: 'power2.out'
  })
  
  // 2. Logs apparition séquentielle (1.5s)
  tl.to('.boot-log', {
    opacity: 1,
    x: 0,
    stagger: 0.1,
    duration: 0.3
  })
  
  // 3. Progress bar (1s)
  tl.to('.boot-progress .bar', {
    width: '100%',
    duration: 1,
    ease: 'power1.inOut'
  })
  
  // 4. Fade out overlay (0.5s)
  tl.to('.boot-overlay', {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      store.setBootComplete()
    }
  })
  
  return tl
}
```

#### 5.3 Boot Logs Data
```typescript
const bootLogs = [
  { icon: '✓', text: 'Initializing ROSTEL_OS v4.5...', status: 'success' },
  { icon: '✓', text: 'Loading user profile...', status: 'success' },
  { icon: '✓', text: 'Mounting filesystems...', status: 'success' },
  { icon: '✓', text: 'Starting network services...', status: 'success' },
  { icon: '✓', text: 'Loading projects database...', status: 'success' },
  { icon: '✓', text: 'Initializing terminal interface...', status: 'success' },
  { icon: '✓', text: 'System ready.', status: 'success' },
]
```

#### 5.4 Skip & Persistence
- Bouton "Skip" en bas à droite
- localStorage : `intro_enabled`
- Composable useTheme gère la préférence

**Critères d'acceptation :**
- Boot joue au premier chargement
- Séquence dure ~3.5s max
- Skip fonctionne et persiste
- Timeline GSAP fluide (60fps)
- Peut être désactivé via commande `intro off`

**Livrables :**
- Boot sequence animée
- Skip fonctionnel
- Préférence persistante
- Intégré dans App.vue

---

### 🔴 SPRINT 6 : Animations GSAP Core (Bloquant pour polish)
**Durée estimée : 10h**

**Dépendances :** Sprints 4 & 5 terminés

**Tâches obligatoires :**

#### 6.1 Composable - useAnimations
`src/composables/useAnimations.ts` :
```typescript
export function useAnimations() {
  const store = useTerminalStore()
  
  // Panel animations
  function animatePanelOpen(panelEl: HTMLElement) {
    const tl = gsap.timeline()
    
    // Terminal shake
    tl.to('.terminal-window', {
      x: -5,
      duration: 0.05,
      repeat: 3,
      yoyo: true
    })
    
    // Flash
    tl.to('.terminal-body', {
      backgroundColor: 'rgba(0, 255, 247, 0.1)',
      duration: 0.1,
      yoyo: true,
      repeat: 1
    }, '<')
    
    // Panel slide in
    tl.fromTo(panelEl, {
      x: '100%',
      opacity: 0
    }, {
      x: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    })
    
    return tl
  }
  
  function animatePanelClose(panelEl: HTMLElement) {
    return gsap.to(panelEl, {
      x: '100%',
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    })
  }
  
  // Command animations
  function animateCommandExecute() {
    const tl = gsap.timeline()
    
    tl.to('.terminal-input', {
      opacity: 0.5,
      duration: 0.1
    })
    
    tl.to('.terminal-input', {
      opacity: 1,
      duration: 0.1
    })
    
    return tl
  }
  
  // Error animation
  function animateError() {
    const tl = gsap.timeline()
    
    // Glitch effect
    tl.to('.terminal-window', {
      x: () => Math.random() * 10 - 5,
      y: () => Math.random() * 10 - 5,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: 'none'
    })
    
    // Red flash
    tl.to('.terminal-body', {
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      duration: 0.1,
      yoyo: true,
      repeat: 1
    }, '<')
    
    return tl
  }
  
  // Cursor blink
  function createCursorBlink(cursorEl: HTMLElement) {
    return gsap.to(cursorEl, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'steps(1)'
    })
  }
  
  // Typing effect (pour easter eggs)
  function typeText(element: HTMLElement, text: string, speed = 0.03) {
    return gsap.to(element, {
      text: text,
      duration: text.length * speed,
      ease: 'none'
    })
  }
  
  return {
    animatePanelOpen,
    animatePanelClose,
    animateCommandExecute,
    animateError,
    createCursorBlink,
    typeText
  }
}
```

#### 6.2 Intégration dans Components
- `TerminalCursor.vue` : utilise `createCursorBlink` sur mounted
- `BasePanel.vue` : utilise `animatePanelOpen/Close` dans transitions
- `TerminalInput.vue` : utilise `animateCommandExecute` sur submit
- `TerminalHistory.vue` : utilise `animateError` pour erreurs

#### 6.3 Performance Mode
Dans useTheme :
```typescript
const perfMode = ref(false)

function setPerformanceMode(enabled: boolean) {
  perfMode.value = enabled
  
  if (enabled) {
    // Disable heavy animations
    gsap.globalTimeline.timeScale(2) // Speed up
    // Disable particles, grain, scanlines
  } else {
    gsap.globalTimeline.timeScale(1)
  }
}
```

#### 6.4 Reduced Motion Support
```typescript
import { usePreferredReducedMotion } from '@vueuse/core'

const reducedMotion = usePreferredReducedMotion()

watch(reducedMotion, (prefersReduced) => {
  if (prefersReduced === 'reduce') {
    store.setReducedMotion(true)
    // Disable all GSAP animations
    gsap.globalTimeline.kill()
  }
})
```

**Critères d'acceptation :**
- Toutes animations fluides (60fps)
- Panel transitions cinématiques
- Erreurs ont effet glitch
- Curseur blink smooth
- Performance mode fonctionne
- Reduced motion respecté

**Livrables :**
- Composable useAnimations complet
- Toutes transitions animées
- Performance optimisée
- Accessibilité respectée

---

### 🔴 SPRINT 7 : Visual Effects (Bloquant pour immersion)
**Durée estimée : 8h**

**Dépendances :** Sprint 6 terminé

**Tâches obligatoires :**

#### 7.1 Grain Effect
`src/components/effects/GrainEffect.vue` :
```vue
<template>
  <canvas
    ref="canvasRef"
    class="grain-effect"
    :class="{ disabled: !fxEnabled }"
  />
</template>

<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement>()
const store = useTerminalStore()
const { fxEnabled } = storeToRefs(store)

onMounted(() => {
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!
  
  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  
  function drawGrain() {
    if (!fxEnabled.value) return
    
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 50
      data[i] = noise     // R
      data[i + 1] = noise // G
      data[i + 2] = noise // B
      data[i + 3] = 10    // A (très transparent)
    }
    
    ctx.putImageData(imageData, 0, 0)
    requestAnimationFrame(drawGrain)
  }
  
  resize()
  window.addEventListener('resize', resize)
  drawGrain()
})
</script>

<style scoped>
.grain-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  opacity: 0.03;
  mix-blend-mode: screen;
}

.grain-effect.disabled {
  display: none;
}
</style>
```

#### 7.2 Scanlines Effect
`src/components/effects/ScanlinesEffect.vue` :
```vue
<template>
  <div
    v-if="fxEnabled"
    class="scanlines"
  />
</template>

<style scoped>
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 247, 0.03),
    rgba(0, 255, 247, 0.03) 1px,
    transparent 1px,
    transparent 2px
  );
  animation: scanlines-move 8s linear infinite;
}

@keyframes scanlines-move {
  0% { transform: translateY(0); }
  100% { transform: translateY(100%); }
}
</style>
```

#### 7.3 Glitch Effect (Component réutilisable)
`src/components/effects/GlitchEffect.vue` :
```vue
<template>
  <div class="glitch-wrapper">
    <slot />
    <div v-if="active" class="glitch-overlay" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  active: boolean
  intensity?: number
}>()

watch(() => props.active, (isActive) => {
  if (isActive) {
    gsap.to('.glitch-overlay', {
      opacity: props.intensity || 0.3,
      duration: 0.05,
      repeat: 5,
      yoyo: true
    })
  }
})
</script>

<style scoped>
.glitch-wrapper {
  position: relative;
}

.glitch-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 0, 0, 0.1),
    rgba(0, 255, 0, 0.1) 2px,
    rgba(0, 0, 255, 0.1) 4px
  );
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0;
}
</style>
```

#### 7.4 Intégration dans App.vue
```vue
<template>
  <div id="app">
    <BootSequence v-if="!bootComplete" />
    
    <GrainEffect />
    <ScanlinesEffect />
    
    <TerminalWindow />
  </div>
</template>
```

#### 7.5 FX Toggle Command
Dans useCommands :
```typescript
fx: (state: 'on' | 'off') => {
  const enabled = state === 'on'
  store.toggleFx(enabled)
  
  return {
    type: 'text',
    content: `Visual effects ${enabled ? 'enabled' : 'disabled'}`
  }
}
```

**Critères d'acceptation :**
- Grain subtil et fluide
- Scanlines animées doucement
- Glitch activable sur demande
- Désactivable via `fx off`
- Pas de lag (même sur mobile)

**Livrables :**
- 3 effets visuels fonctionnels
- Toggle FX opérationnel
- Performance maintenue
- Style immersif mais subtil

---

### 🔴 SPRINT 8 : Themes System (Bloquant pour personnalisation)
**Durée estimée : 6h**

**Dépendances :** Sprint 7 terminé

**Tâches obligatoires :**

#### 8.1 Theme Configuration
`src/composables/useTheme.ts` :
```typescript
export interface Theme {
  name: string
  colors: {
    bg: string
    bgSecondary: string
    text: string
    textSecondary: string
    accent: string
    accentDark: string
    error: string
    success: string
    border: string
  }
  font: string
  effects: {
    glow: boolean
    scanlines: boolean
    grain: boolean
  }
}

const themes: Record<string, Theme> = {
  cyan: {
    name: 'Cyan Neon',
    colors: {
      bg: '#0b0f14',
      bgSecondary: '#1a1f26',
      text: '#e4e4e7',
      textSecondary: '#a1a1aa',
      accent: '#00fff7',
      accentDark: '#0891b2',
      error: '#ef4444',
      success: '#10b981',
      border: '#27272a'
    },
    font: 'JetBrains Mono',
    effects: { glow: true, scanlines: true, grain: true }
  },
  
  amber: {
    name: 'Amber CRT',
    colors: {
      bg: '#1a1108',
      bgSecondary: '#2d1f10',
      text: '#ffb86c',
      textSecondary: '#d19a5c',
      accent: '#ff9500',
      accentDark: '#cc7700',
      error: '#ff5555',
      success: '#50fa7b',
      border: '#3d2f1a'
    },
    font: 'IBM Plex Mono',
    effects: { glow: true, scanlines: true, grain: true }
  },
  
  green: {
    name: 'Matrix Green',
    colors: {
      bg: '#0d1117',
      bgSecondary: '#161b22',
      text: '#00ff00',
      textSecondary: '#00cc00',
      accent: '#00ff00',
      accentDark: '#008800',
      error: '#ff0000',
      success: '#00ff00',
      border: '#30363d'
    },
    font: 'JetBrains Mono',
    effects: { glow: true, scanlines: true, grain: true }
  },
  
  mono: {
    name: 'Monochrome',
    colors: {
      bg: '#000000',
      bgSecondary: '#111111',
      text: '#ffffff',
      textSecondary: '#888888',
      accent: '#ffffff',
      accentDark: '#cccccc',
      error: '#ffffff',
      success: '#ffffff',
      border: '#333333'
    },
    font: 'IBM Plex Mono',
    effects: { glow: false, scanlines: false, grain: false }
  }
}

export function useTheme() {
  const currentTheme = ref<Theme>(themes.cyan)
  
  function setTheme(name: string) {
    if (!themes[name]) {
      throw new Error(`Theme "${name}" not found`)
    }
    
    currentTheme.value = themes[name]
    applyThemeToDom(themes[name])
    localStorage.setItem('theme', name)
  }
  
  function applyThemeToDom(theme: Theme) {
    const root = document.documentElement
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    root.style.setProperty('--font-mono', theme.font)
  }
  
  function loadThemeFromStorage() {
    const saved = localStorage.getItem('theme')
    if (saved && themes[saved]) {
      setTheme(saved)
    }
  }
  
  onMounted(() => {
    loadThemeFromStorage()
  })
  
  return {
    currentTheme,
    themes,
    setTheme,
    loadThemeFromStorage
  }
}
```

#### 8.2 CSS Variables Integration
`src/App.vue` :
```css
:root {
  /* Default to cyan */
  --color-bg: #0b0f14;
  --color-text: #e4e4e7;
  --color-accent: #00fff7;
  /* ... other vars */
  --font-mono: 'JetBrains Mono', monospace;
}

* {
  font-family: var(--font-mono);
}

.terminal-window {
  background: var(--color-bg);
  color: var(--color-text);
}

.accent {
  color: var(--color-accent);
}

/* Glow effect */
.glow {
  text-shadow: 0 0 10px var(--color-accent);
}
```

#### 8.3 Theme Command
Dans useCommands :
```typescript
theme: (name: string) => {
  const validThemes = ['cyan', 'amber', 'green', 'mono']
  
  if (!name) {
    return {
      type: 'text',
      content: `Available themes: ${validThemes.join(', ')}\nUsage: theme <name>`
    }
  }
  
  if (!validThemes.includes(name)) {
    return {
      type: 'error',
      content: `Unknown theme "${name}"`
    }
  }
  
  const { setTheme } = useTheme()
  setTheme(name)
  
  return {
    type: 'text',
    content: `Theme changed to: ${name}`
  }
}
```

#### 8.4 Theme Preview
Ajouter dans help :
```typescript
help: () => {
  return {
    type: 'text',
    content: `
Available commands:
  ...
  theme <name>      Change color theme (cyan|amber|green|mono)
  
Try: theme amber
    `
  }
}
```

**Critères d'acceptation :**
- 4 thèmes fonctionnels
- Changement instant (pas de reload)
- Persistence dans localStorage
- CSS variables appliquées partout
- Commande `theme` liste les options

**Livrables :**
- 4 thèmes complets et cohérents
- Système de théming réutilisable
- Persistence fonctionnelle
- Documentation dans help

---

### 🔴 SPRINT 9 : Mobile & Responsive (Bloquant pour accessibilité)
**Durée estimée : 8h**

**Dépendances :** Tous sprints précédents terminés

**Tâches obligatoires :**

#### 9.1 Breakpoints Tailwind
`tailwind.config.js` :
```javascript
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

#### 9.2 Terminal Window Responsive
```vue
<template>
  <div
    class="terminal-window"
    :class="{
      'mobile-fullscreen': isMobile,
      'desktop-window': !isMobile
    }"
  >
    <!-- Content -->
  </div>
</template>

<script setup>
import { useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints({
  mobile: 0,
  tablet: 768,
  desktop: 1024
})

const isMobile = breakpoints.smaller('tablet')
</script>

<style scoped>
.mobile-fullscreen {
  @apply fixed inset-0 rounded-none;
}

.desktop-window {
  @apply w-[90vw] max-w-6xl h-[85vh] rounded-lg;
}
</style>
```

#### 9.3 Mobile Input Handling
```vue
<!-- TerminalInput.vue -->
<template>
  <div class="input-container">
    <!-- Mobile: bouton pour focus input -->
    <button
      v-if="isMobile && !inputFocused"
      @click="focusInput"
      class="mobile-input-trigger"
    >
      Tap to type command
    </button>
    
    <!-- Input (toujours présent) -->
    <input
      ref="inputRef"
      v-model="currentInput"
      @focus="inputFocused = true"
      @blur="inputFocused = false"
      :class="{ 'mobile-input': isMobile }"
    />
  </div>
</template>
```

#### 9.4 Panels Mobile
```vue
<!-- BasePanel.vue -->
<style scoped>
.panel-overlay {
  @apply fixed inset-0 bg-black/80 z-50;
}

.panel-container {
  @apply bg-[var(--color-bg)] border border-[var(--color-border)];
  
  /* Desktop: side panel */
  @apply md:absolute md:right-0 md:top-0 md:bottom-0 md:w-[600px];
  
  /* Mobile: fullscreen */
  @apply absolute inset-0;
}
</style>
```

#### 9.5 Touch Gestures
```typescript
// composables/useTouchGestures.ts
import { useSwipe } from '@vueuse/core'

export function useTouchGestures() {
  const { direction } = useSwipe(document, {
    onSwipeEnd(e, direction) {
      if (direction === 'right') {
        // Close panel
        const store = useTerminalStore()
        if (store.activePanel) {
          store.closePanel()
        }
      }
    }
  })
  
  return { direction }
}
```

#### 9.6 Virtual Keyboard Handling
```typescript
// composables/useKeyboardAdjustment.ts
export function useKeyboardAdjustment() {
  const originalHeight = ref(window.innerHeight)
  
  onMounted(() => {
    window.visualViewport?.addEventListener('resize', () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      
      if (currentHeight < originalHeight.value * 0.7) {
        // Keyboard is open
        document.body.classList.add('keyboard-open')
      } else {
        document.body.classList.remove('keyboard-open')
      }
    })
  })
}
```

#### 9.7 Responsive Typography
```css
/* App.vue global styles */
html {
  /* Desktop: 16px */
  font-size: 16px;
}

@media (max-width: 768px) {
  html {
    /* Mobile: 14px */
    font-size: 14px;
  }
}

.terminal-history {
  /* Desktop: 0.9rem */
  @apply text-sm leading-relaxed;
}

@media (max-width: 768px) {
  .terminal-history {
    /* Mobile: 1rem (relatif au 14px de base) */
    @apply text-base leading-normal;
  }
}
```

**Critères d'acceptation :**
- Terminal fullscreen sur mobile
- Input accessible sur mobile (clavier virtuel)
- Panels fullscreen sur mobile
- Swipe right pour fermer panel
- Typography lisible sur petit écran
- Pas de scroll horizontal
- Tests sur iPhone et Android

**Livrables :**
- UI responsive fonctionnelle
- Touch gestures implémentés
- Input mobile optimisé
- Tests sur devices réels

---

### 🔴 SPRINT 10 : Easter Eggs & Polish (Optionnel mais fun)
**Durée estimée : 6h**

**Dépendances :** Sprint 9 terminé

**Tâches obligatoires :**

#### 10.1 Easter Egg: Matrix Effect
```typescript
// commands/easter.ts
matrix: () => {
  const canvas = document.createElement('canvas')
  canvas.className = 'matrix-overlay'
  document.body.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const chars = 'アイウエオカキクケコサシスセソタチツテト01'
  const fontSize = 16
  const columns = canvas.width / fontSize
  const drops: number[] = Array(Math.floor(columns)).fill(1)
  
  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#0f0'
    ctx.font = `${fontSize}px monospace`
    
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)]
      ctx.fillText(text, i * fontSize, drops[i] * fontSize)
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }
  }
  
  const interval = setInterval(draw, 33)
  
  // Auto stop après 10s
  setTimeout(() => {
    clearInterval(interval)
    canvas.remove()
  }, 10000)
  
  return {
    type: 'text',
    content: 'Wake up, Neo... (Press ESC to stop)'
  }
}
```

#### 10.2 Easter Egg: Konami Code
```typescript
// composables/useKonamiCode.ts
import { useMagicKeys } from '@vueuse/core'

export function useKonamiCode(callback: () => void) {
  const keys = useMagicKeys()
  const sequence = ref<string[]>([])
  const konami = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a']
  
  watch(keys, (current) => {
    const pressed = Object.keys(current).find(key => current[key])
    if (pressed) {
      sequence.value.push(pressed)
      
      if (sequence.value.length > konami.length) {
        sequence.value.shift()
      }
      
      if (JSON.stringify(sequence.value) === JSON.stringify(konami)) {
        callback()
        sequence.value = []
      }
    }
  })
}
```

#### 10.3 Easter Egg: Secret Command
```typescript
// commands/easter.ts
secret: () => {
  return {
    type: 'panel',
    panelName: 'secret',
    panelData: {
      title: 'You found the secret!',
      content: `
        Congratulations! You're one of the few who reads documentation.
        
        Here's a secret: I'm always looking for passionate developers
        who pay attention to details.
        
        Interested in working together? Use: contact
      `
    }
  }
}
```

#### 10.4 Command: sudo
```typescript
sudo: (args: string[]) => {
  const command = args.join(' ')
  
  if (!command) {
    return {
      type: 'error',
      content: 'sudo: command not specified'
    }
  }
  
  // Petit délai + message drôle
  setTimeout(() => {
    store.addLine({
      type: 'error',
      content: `sudo: ${command}: command not found. Did you really think you had root access? 😏`
    })
  }, 1000)
  
  return {
    type: 'text',
    content: '[sudo] password for rostel: '
  }
}
```

#### 10.5 Command: whoami
```typescript
whoami: () => {
  return {
    type: 'text',
    content: `rostel
    
You are: visitor@rostel-os
Role: Guest
Permissions: Limited (try 'sudo' if you dare)

Want to know more? Try: about`
  }
}
```

#### 10.6 Loading States
```vue
<!-- components/shared/LoadingSpinner.vue -->
<template>
  <div class="loading">
    <div class="spinner">
      <span v-for="i in 8" :key="i" />
    </div>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<style scoped>
.spinner {
  @apply relative w-12 h-12;
}

.spinner span {
  @apply absolute w-1 h-3 bg-[var(--color-accent)] rounded-full;
  animation: spinner 1.2s linear infinite;
}

.spinner span:nth-child(1) { transform: rotate(0deg) translateY(-150%); animation-delay: 0s; }
.spinner span:nth-child(2) { transform: rotate(45deg) translateY(-150%); animation-delay: 0.15s; }
.spinner span:nth-child(3) { transform: rotate(90deg) translateY(-150%); animation-delay: 0.3s; }
/* ... etc */

@keyframes spinner {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
</style>
```

**Livrables :**
- 3+ easter eggs fonctionnels
- Konami code détecté
- Commandes fun (sudo, whoami)
- Loading states pour async ops
- Polish général

---

### 🔴 SPRINT 11 : Performance & SEO (Bloquant pour prod)
**Durée estimée : 6h**

**Dépendances :** Tous sprints terminés

**Tâches obligatoires :**

#### 11.1 Meta Tags
`index.html` :
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO -->
  <title>Rostel PANOUMASSI - Full-Stack Developer | Engineering Lead</title>
  <meta name="description" content="Head of Engineering & Innovation at KPS Groupe. Expert in Django, Spring Boot, Laravel, Vue.js. Building scalable solutions in Cotonou, Benin.">
  <meta name="keywords" content="Full-Stack Developer, Backend, Django, Spring Boot, Laravel, Vue.js, Benin, KPS Groupe">
  <meta name="author" content="Rostel PANOUMASSI">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Rostel PANOUMASSI - Full-Stack Developer">
  <meta property="og:description" content="Engineering Lead building scalable solutions with modern tech stack">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://rostel.dev">
  <meta property="og:image" content="/og-image.png">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Rostel PANOUMASSI">
  <meta name="twitter:description" content="Full-Stack Developer | Engineering Lead">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  
  <!-- Preload critical fonts -->
  <link rel="preload" href="/fonts/JetBrainsMono-Regular.woff2" as="font" type="font/woff2" crossorigin>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

#### 11.2 Performance Optimizations
```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Lazy load GSAP si pas en boot
if (!localStorage.getItem('intro_enabled')) {
  import('gsap').then(({ gsap }) => {
    window.gsap = gsap
  })
}

app.mount('#app')
```

#### 11.3 Code Splitting
```typescript
// router ou dynamic imports
const ProjectsPanel = defineAsyncComponent(() =>
  import('./components/panels/ProjectsPanel.vue')
)

const ProjectDetailPanel = defineAsyncComponent(() =>
  import('./components/panels/ProjectDetailPanel.vue')
)
```

#### 11.4 Image Optimization
- Créer un `/public/images` avec:
  - `og-image.png` (1200x630)
  - `favicon.svg`
- Compresser toutes les images
- Utiliser WebP si possible

#### 11.5 Lazy Loading Effects
```vue
<!-- App.vue -->
<template>
  <div id="app">
    <BootSequence v-if="showBoot" />
    
    <!-- Lazy load effects -->
    <component
      v-if="fxEnabled"
      :is="GrainEffect"
    />
    <component
      v-if="fxEnabled"
      :is="ScanlinesEffect"
    />
    
    <TerminalWindow />
  </div>
</template>

<script setup>
const GrainEffect = defineAsyncComponent(() =>
  import('./components/effects/GrainEffect.vue')
)

const ScanlinesEffect = defineAsyncComponent(() =>
  import('./components/effects/ScanlinesEffect.vue')
)
</script>
```

#### 11.6 Bundle Analysis
```bash
npm install -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    vue(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
}
```

#### 11.7 Lighthouse Targets
Tests obligatoires :
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

**Livrables :**
- Meta tags complets
- Code splitting configuré
- Images optimisées
- Bundle < 500KB (gzipped)
- Lighthouse scores OK

---

### 🔴 SPRINT 12 : Testing & Documentation (Bloquant pour livraison)
**Durée estimée : 8h**

**Dépendances :** Sprint 11 terminé

**Tâches obligatoires :**

#### 12.1 README.md
```markdown
# ROSTEL_OS - Terminal Portfolio

Interactive terminal-based portfolio built with Vue 3, TypeScript, TailwindCSS, and GSAP.

## Features

- 🖥️ Realistic terminal emulation with command history
- 🎨 4 themes (Cyan Neon, Amber CRT, Matrix Green, Monochrome)
- ✨ Cinematic animations with GSAP
- 📱 Fully responsive (desktop & mobile)
- ⚡ Performance optimized with code splitting
- ♿ Accessibility compliant (reduced motion support)
- 🎮 Easter eggs & Konami code support

## Quick Start

```bash
npm install
npm run dev
```

## Available Commands

### Navigation
- `help` - Show all commands
- `about` - About me
- `skills` - Technical skills
- `projects` - List all projects
- `project <slug>` - View project details
- `experience` - Work history
- `contact` - Get in touch
- `cv` - Download CV

### Configuration
- `theme <name>` - Change theme (cyan|amber|green|mono)
- `fx <on|off>` - Toggle visual effects
- `intro <on|off>` - Toggle boot sequence
- `clear` - Clear terminal

### Fun
- `matrix` - Matrix rain effect
- `easter` - Find hidden content
- `sudo` - Try it 😏

## Tech Stack

- Vue 3 + TypeScript
- TailwindCSS
- GSAP (animations)
- Pinia (state)
- @vueuse/core (composables)
- Vite (build)

## Project Structure

```
src/
├── components/
│   ├── terminal/     # Terminal UI components
│   ├── panels/       # Content panels
│   ├── boot/         # Boot sequence
│   └── effects/      # Visual effects
├── composables/      # Reusable logic
├── stores/           # Pinia stores
├── types/            # TypeScript types
└── utils/            # Helpers
```

## Performance

- Bundle size: < 500KB (gzipped)
- Lighthouse scores: 90+ all categories
- 60fps animations
- Code splitting for panels
- Lazy loading for effects

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 10+)

## License

MIT © Rostel PANOUMASSI

## Contact

- Email: rmissimawu@gmail.com
- LinkedIn: [rostelpanoumassi](https://linkedin.com/in/rostelpanoumassi-6b6608335)
```

#### 12.2 COMMANDS.md (Documentation détaillée)
Créer un fichier avec toutes les commandes + exemples

#### 12.3 Unit Tests (minimum)
```typescript
// tests/composables/useTerminal.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useTerminal } from '@/composables/useTerminal'

describe('useTerminal', () => {
  beforeEach(() => {
    // Reset store
  })
  
  it('should add line to history', () => {
    const { addLine, history } = useTerminal()
    
    addLine({
      type: 'output',
      content: 'test'
    })
    
    expect(history.value).toHaveLength(1)
    expect(history.value[0].content).toBe('test')
  })
  
  it('should execute valid command', async () => {
    const { executeCommand } = useTerminal()
    
    const result = await executeCommand('help')
    
    expect(result.type).toBe('text')
    expect(result.content).toContain('Available commands')
  })
  
  it('should handle invalid command', async () => {
    const { executeCommand } = useTerminal()
    
    const result = await executeCommand('invalid')
    
    expect(result.type).toBe('error')
  })
})
```

#### 12.4 E2E Tests (critiques)
```typescript
// tests/e2e/terminal.spec.ts
import { test, expect } from '@playwright/test'

test('should boot and show terminal', async ({ page }) => {
  await page.goto('/')
  
  // Skip boot
  await page.click('text=Skip')
  
  // Terminal visible
  await expect(page.locator('.terminal-window')).toBeVisible()
  
  // Input focused
  await expect(page.locator('.terminal-input')).toBeFocused()
})

test('should execute help command', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Skip')
  
  // Type help
  await page.keyboard.type('help')
  await page.keyboard.press('Enter')
  
  // Check output
  await expect(page.locator('text=Available commands')).toBeVisible()
})

test('should open projects panel', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Skip')
  
  await page.keyboard.type('projects')
  await page.keyboard.press('Enter')
  
  // Panel opens
  await expect(page.locator('.panel-container')).toBeVisible()
  
  // Contains projects
  await expect(page.locator('text=TadagbeRhPlus')).toBeVisible()
})
```

#### 12.5 Manual Testing Checklist
Créer `TESTING.md` :
```markdown
# Testing Checklist

## Desktop (Chrome, Firefox, Safari)
- [ ] Boot sequence joue
- [ ] Skip boot fonctionne
- [ ] Toutes commandes s'exécutent
- [ ] Panels s'ouvrent/ferment
- [ ] Animations fluides (60fps)
- [ ] Keyboard shortcuts marchent
- [ ] Themes changent correctement
- [ ] FX toggle fonctionne
- [ ] Autocomplete marche (Tab)
- [ ] History navigation (↑↓)

## Mobile (iOS & Android)
- [ ] Terminal fullscreen
- [ ] Input accessible
- [ ] Clavier virtuel OK
- [ ] Panels fullscreen
- [ ] Swipe ferme panel
- [ ] Typography lisible
- [ ] Pas de scroll horizontal
- [ ] Touch gestures OK

## Accessibility
- [ ] Reduced motion respecté
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] Focus visible
- [ ] Contrast ratios OK

## Performance
- [ ] Lighthouse > 90 (all)
- [ ] Bundle < 500KB gzipped
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth on mobile

## Easter Eggs
- [ ] Konami code déclenche effet
- [ ] matrix command marche
- [ ] sudo répond drôlement
- [ ] easter command révèle secret
```

**Livrables :**
- README complet
- Tests unitaires (≥5 tests)
- Tests E2E (≥3 tests)
- Checklist manuel complète
- Documentation commandes

---

## 🎯 DÉFINITION DE "DONE" POUR CHAQUE SPRINT

Un sprint est considéré **terminé** quand :

1. ✅ **Tous les fichiers créés** (pas de TODOs)
2. ✅ **Pas d'erreurs TypeScript** (`npm run type-check`)
3. ✅ **App démarre sans erreur** (`npm run dev`)
4. ✅ **Fonctionnalités testables manuellement**
5. ✅ **Code formatté** (Prettier/ESLint)
6. ✅ **Commit Git avec message clair**

---

## 📊 RÉCAPITULATIF DES SPRINTS

| Sprint | Nom | Durée | Bloque |
|--------|-----|-------|--------|
| 0 | Setup & Config | 2h | Tout |
| 1 | Terminal Engine Core | 6h | UI |
| 2 | Commandes System | 8h | Contenu |
| 3 | UI Terminal Base | 10h | Visuel |
| 4 | Panels System | 12h | Navigation |
| 5 | Boot Sequence | 6h | 1ère impression |
| 6 | Animations GSAP | 10h | Polish |
| 7 | Visual Effects | 8h | Immersion |
| 8 | Themes System | 6h | Personnalisation |
| 9 | Mobile & Responsive | 8h | Accessibilité |
| 10 | Easter Eggs | 6h | Fun (optionnel) |
| 11 | Performance & SEO | 6h | Prod |
| 12 | Testing & Docs | 8h | Livraison |

**TOTAL : ~96 heures** (12 jours à 8h/jour)

---

## 🚀 ORDRE D'EXÉCUTION STRICT

```
Sprint 0 (setup)
    ↓
Sprint 1 (engine) → Sprint 2 (commands)
    ↓                      ↓
Sprint 3 (UI) ←───────────┘
    ↓
Sprint 4 (panels) + Sprint 5 (boot)
    ↓                      ↓
Sprint 6 (animations) ←────┘
    ↓
Sprint 7 (effects)
    ↓
Sprint 8 (themes)
    ↓
Sprint 9 (mobile)
    ↓
Sprint 10 (easter eggs - optionnel)
    ↓
Sprint 11 (performance)
    ↓
Sprint 12 (testing & docs)
    ↓
🎉 PRODUCTION READY
```

---

## 💡 NOTES IMPORTANTES POUR CLAUDE CODE

1. **Ne jamais skip un sprint** - Ils sont bloquants pour une raison
2. **Tester après chaque sprint** - Pas de "je teste à la fin"
3. **Commit après chaque sprint** - Historique propre
4. **TypeScript strict** - Pas de `any`, tout typé
5. **Performance first** - 60fps non négociable
6. **Accessibilité first** - Reduced motion obligatoire
7. **Mobile first** - Tester sur devices réels

---

Voilà le prompt complet et structuré ! Chaque sprint est **bloquant** et **détaillé** avec tous les fichiers à créer, le code à écrire, et les critères d'acceptation.

Tu peux maintenant copier ce prompt directement dans Claude Code et il saura exactement quoi faire, dans quel ordre, et comment valider chaque étape. 🚀