# Portfolio V3 — Plan 4 : Terminal Migration + SEO/Perf/A11y + Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resurrect the legacy terminal portfolio as a client-only easter egg under `/terminal` with zero behavioural regression, polish SEO / accessibility / performance to ship Lighthouse > 95 across all categories, wire Umami analytics, add the Cmd+K command palette and `r-o-s-t-e-l` secret keyboard sequence, ship a multi-stage production Dockerfile with healthcheck, document Coolify deployment, and merge `v3-redesign` into `main` for production cutover.

**Architecture:**
- The full legacy SPA tree under `legacy/terminal-spa/src/` is copied verbatim into `components/terminal/_legacy/`. A single Nuxt page `pages/terminal.vue` wraps the old `App.vue` root in `<ClientOnly>` and `<Suspense>`. All Pinia stores, composables, GSAP timelines, and panels keep their original logic.
- Path aliases (`@/`, `@components/`, `@composables/`, etc.) are rewritten to relative imports during the copy step — Nuxt's auto-import only operates at the project root, not inside arbitrary subdirectories.
- The terminal page disables the site layout (`definePageMeta({ layout: false })`) so the easter egg renders full-bleed without the new header / footer.
- Analytics: Umami is injected via a `useHead({ script })` directive when the runtime config has a script URL. Privacy-first, no cookies, opt-in friendly.
- SEO: every public page emits structured `useSeoMeta`, the sitemap module auto-discovers `pages/` and `content/`, robots.txt allows production but blocks `*.preview.*`. OG images use `@nuxtjs/og-image` (page-by-page generation at build time).
- Production Docker image: `node:20-alpine` multi-stage with `pnpm`, reproducible via `--frozen-lockfile`, image footprint < 200 MB, exposes 3000, healthcheck hits `/api/health`.
- Coolify config is documented (not code) — environment variables, separate Mongo service, Let's Encrypt TLS.

**Tech Stack:** Nuxt 3 client-only pages, Pinia, GSAP (already installed), Cloudflare Turnstile, Umami, Docker, Coolify.

**Reference spec:** `docs/superpowers/specs/2026-04-26-portfolio-redesign-design.md` — sections 4.7 (terminal), 5.6 (interactions signature), 6.6–6.7 (Dockerfile, Coolify), 10 (validation V1).

**Prerequisites:** Plans 1–3 complete. The site under `v3-redesign` is fully functional except for the terminal easter egg, deployment, and final SEO polish. The legacy SPA is archived under `legacy/terminal-spa/`.

**Definition of done:**
- `/terminal` (and `/en/terminal`) renders the full legacy UI: boot sequence, command prompt, all 15+ commands, all panels, themes, achievements, konami code, easter eggs — every behaviour of the old portfolio works
- Cmd+K opens a command palette listing site routes + "Open terminal"
- Typing `r-o-s-t-e-l` on any public page navigates to `/terminal`
- Lighthouse desktop > 95 across all 4 categories on `/`, `/work`, `/work/banque-regionale`, `/about`, `/brief`
- Skip-to-content link, focus-visible rings, semantic landmarks, alt text everywhere
- Sitemap.xml lists all FR + EN routes, robots.txt allows prod
- OG image generated per public page
- Umami snippet loads only when env vars are set
- `Dockerfile` builds an image that runs locally (`docker run -p 3000:3000 ...`) and serves the site
- `/api/health` returns 200 from inside the container
- Cutover commits land on `main`, tag `v3.0.0` is created, the production Coolify deployment serves the new site

---

## File Structure

```
my_portfolio/
├─ Dockerfile                                # multi-stage, prod
├─ .dockerignore
├─ docs/
│   └─ deployment/
│       └─ coolify.md                        # operational runbook
├─ components/
│   └─ terminal/
│       ├─ TerminalApp.vue                   # entry — replaces legacy App.vue
│       └─ _legacy/                          # COPY of legacy/terminal-spa/src/
│           ├─ components/
│           ├─ assets/data/
│           └─ … (full tree)
├─ stores/
│   └─ terminal/                             # legacy Pinia stores moved here
├─ composables/
│   ├─ useCommandPalette.ts                  # Cmd+K
│   └─ useSecretSequence.ts                  # r-o-s-t-e-l listener
├─ components/
│   └─ ui/
│       └─ CommandPalette.vue                # the palette UI
├─ plugins/
│   ├─ secret-sequence.client.ts             # registers global listener on client
│   └─ umami.client.ts                       # injects Umami if configured
├─ pages/
│   └─ terminal.vue                          # public route → mounts TerminalApp client-only
├─ server/
│   └─ api/
│       └─ og/[slug].get.ts                  # dynamic OG image generation (optional, falls
│                                             back to static og-default if module absent)
├─ public/
│   └─ og-default.png                        # 1200×630 fallback OG image
└─ tests/
    └─ e2e/
        ├─ terminal.spec.ts                   # smoke: terminal route renders, accepts input
        └─ accessibility.spec.ts              # axe-core on key routes
```

---

## Task 1: Copy Legacy SPA Tree into the Project

**Files:**
- Create: `components/terminal/_legacy/` (copy of `legacy/terminal-spa/src/`)
- Create: `stores/terminal/` (moved from copy)

- [ ] **Step 1: Copy the legacy `src/` tree**

```bash
cd O:/Projets/my_portfolio
mkdir -p components/terminal/_legacy
cp -r legacy/terminal-spa/src/. components/terminal/_legacy/
```

Expected: `components/terminal/_legacy/` now mirrors the legacy `src/` (components, composables, stores, types, utils, assets).

- [ ] **Step 2: Move stores out of `_legacy/` to root `stores/terminal/`**

Nuxt auto-imports stores from `stores/`. Keep the Pinia stores at the root so auto-import picks them up.

```bash
cd O:/Projets/my_portfolio
mkdir -p stores/terminal
mv components/terminal/_legacy/stores/* stores/terminal/
rmdir components/terminal/_legacy/stores
```

Verify:

```bash
ls O:/Projets/my_portfolio/stores/terminal/
```

Expected: lists `terminal.ts`, `achievements.ts`, `commandPalette.ts`, `tour.ts` (or whichever stores existed in the legacy code).

- [ ] **Step 3: Inspect the legacy code for any path aliases**

```bash
grep -RIn "@/" components/terminal/_legacy/ | head -50
grep -RIn "@components/\|@composables/\|@stores/" components/terminal/_legacy/ | head -50
```

If matches appear, note them — Step 4 rewrites them.

- [ ] **Step 4: Rewrite `@/` aliases inside `_legacy/` to relative paths or to root-level Nuxt aliases**

Nuxt's `~/` alias points to the project root. Since the legacy code lives at `components/terminal/_legacy/`, an import like `@/components/Foo.vue` should become `~/components/terminal/_legacy/components/Foo.vue` OR a relative path.

Use a search-and-replace to convert `@/` (legacy alias) to the explicit relative path. Run this in a Bash shell with `sed`:

```bash
cd O:/Projets/my_portfolio/components/terminal/_legacy
# 1) imports of stores: rewrite @/stores/ to ~/stores/terminal/ (the new location)
grep -RIl "from '@/stores/" . | xargs sed -i "s|from '@/stores/|from '~/stores/terminal/|g"
# 2) imports of components, composables, types, utils, assets: keep them inside _legacy/
grep -RIl "from '@/components/" . | xargs sed -i "s|from '@/components/|from '~/components/terminal/_legacy/components/|g" 2>/dev/null || true
grep -RIl "from '@/composables/" . | xargs sed -i "s|from '@/composables/|from '~/components/terminal/_legacy/composables/|g" 2>/dev/null || true
grep -RIl "from '@/types/" . | xargs sed -i "s|from '@/types/|from '~/components/terminal/_legacy/types/|g" 2>/dev/null || true
grep -RIl "from '@/utils/" . | xargs sed -i "s|from '@/utils/|from '~/components/terminal/_legacy/utils/|g" 2>/dev/null || true
grep -RIl "from '@/assets/" . | xargs sed -i "s|from '@/assets/|from '~/components/terminal/_legacy/assets/|g" 2>/dev/null || true
```

If `xargs` errors with "No such file" on Windows: that's fine, it just means no files matched the pattern.

- [ ] **Step 5: Verify no `@/` aliases remain inside `_legacy/`**

```bash
grep -RIn "@/" O:/Projets/my_portfolio/components/terminal/_legacy/ | head
```

Expected: no output (or only matches inside comments / strings unrelated to imports).

If matches remain, edit the offending files manually to use `~/components/terminal/_legacy/...` paths.

- [ ] **Step 6: Commit the migration**

```bash
cd O:/Projets/my_portfolio
git add components/terminal/_legacy stores/terminal
git commit -m "chore: copy legacy terminal SPA into components/terminal/_legacy

Stores moved to stores/terminal/ for Nuxt auto-import. Path aliases
rewritten from @/ to explicit ~/ paths. No code logic changed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Wrap the Legacy Root in `TerminalApp.vue` and Mount via `/terminal`

**Files:**
- Create: `components/terminal/TerminalApp.vue`
- Create: `pages/terminal.vue`

- [ ] **Step 1: Inspect the legacy root component**

```bash
cat O:/Projets/my_portfolio/components/terminal/_legacy/App.vue | head -50
```

The legacy `App.vue` is the root that mounts the terminal window, boot sequence, and effects. We'll re-render it via a thin wrapper.

- [ ] **Step 2: Implement `TerminalApp.vue`**

Create `O:/Projets/my_portfolio/components/terminal/TerminalApp.vue`:

```vue
<script setup lang="ts">
// The legacy root component renders the entire terminal portfolio.
// We import it relatively from _legacy and let it own its sub-tree.
import LegacyApp from './_legacy/App.vue'
</script>

<template>
  <div class="terminal-host">
    <LegacyApp />
  </div>
</template>

<style scoped>
.terminal-host {
  min-height: 100dvh;
  /* Reset any inherited site theme — legacy code controls its own colors */
  background: #0b0f14;
  color: #e4e4e7;
}
</style>
```

- [ ] **Step 3: Implement `pages/terminal.vue`**

Create `O:/Projets/my_portfolio/pages/terminal.vue`:

```vue
<script setup lang="ts">
definePageMeta({
  layout: false,    // no SiteHeader / SiteFooter — terminal is full-bleed
})

useSeoMeta({
  title: 'Terminal — Rostel Panoumassi',
  description: 'The original terminal portfolio. Type help to explore.',
  robots: 'noindex',  // easter egg, don't want it competing with the canonical site
})
</script>

<template>
  <ClientOnly>
    <Suspense>
      <TerminalApp />
      <template #fallback>
        <div class="terminal-loading">$ booting...</div>
      </template>
    </Suspense>
  </ClientOnly>
</template>

<style scoped>
.terminal-loading {
  background: #0b0f14;
  color: #00fff7;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.04em;
}
</style>
```

- [ ] **Step 4: Smoke-test in dev**

```bash
cd O:/Projets/my_portfolio && pnpm dev
```

Open http://localhost:3000/terminal. Expected:
- Boot sequence plays (logo, logs scrolling, progress bar)
- Terminal prompt appears: `rostel@kps:~$`
- Type `help` → list of commands
- Type `projects` → projects panel opens
- Type `theme amber` → theme switches
- Press Esc → panel closes
- All easter eggs (`matrix`, `sudo`, `whoami`) work

If the terminal fails to mount: read the browser console. Most common issues:
- Import path mismatch — check Step 4 in Task 1 didn't miss a file.
- A module from the legacy code uses an API that does not exist in this version of Vue 3 / Pinia / VueUse — pin the dep in `package.json` to match the legacy version, or update the call site.
- `process.client` or `import.meta.client` mismatch — Nuxt prefers `import.meta.client`. The legacy SPA uses Vite directly so it might use other globals; surround offending blocks with `if (import.meta.client)`.

- [ ] **Step 5: Verify both locales work**

http://localhost:3000/en/terminal should also render the terminal (English UI is not separately translated — the legacy app stays in its original language; that's acceptable for an easter egg).

- [ ] **Step 6: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/terminal/TerminalApp.vue pages/terminal.vue
git commit -m "feat: /terminal easter egg — mounts legacy SPA client-only

Suspense fallback shows a brief boot line. Layout disabled so the
terminal renders full-bleed. SEO noindex (don't compete with canonical
site for search rankings).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Cmd+K Command Palette

**Files:**
- Create: `composables/useCommandPalette.ts`
- Create: `components/ui/CommandPalette.vue`
- Modify: `layouts/default.vue` (mount palette)

- [ ] **Step 1: Implement the composable**

Create `O:/Projets/my_portfolio/composables/useCommandPalette.ts`:

```ts
export type PaletteCommand = {
  id: string
  label: string
  hint?: string
  icon?: string
  perform: () => void | Promise<void>
}

export function useCommandPalette() {
  const open = useState<boolean>('cmdk-open', () => false)
  const query = useState<string>('cmdk-query', () => '')

  function show() {
    open.value = true
    query.value = ''
  }

  function hide() {
    open.value = false
  }

  function toggle() {
    open.value ? hide() : show()
  }

  return { open, query, show, hide, toggle }
}
```

- [ ] **Step 2: Implement the palette UI**

Create `O:/Projets/my_portfolio/components/ui/CommandPalette.vue`:

```vue
<script setup lang="ts">
import type { PaletteCommand } from '~/composables/useCommandPalette'

const { open, query, hide } = useCommandPalette()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const { cycle, mode } = useTheme()

// Build the static command list — locale-aware labels
const commands = computed<PaletteCommand[]>(() => [
  { id: 'home', label: t('nav.home'), perform: () => router.push(localePath('/')) },
  { id: 'work', label: t('nav.work'), perform: () => router.push(localePath('/work')) },
  { id: 'about', label: t('nav.about'), perform: () => router.push(localePath('/about')) },
  { id: 'brief', label: t('nav.brief'), perform: () => router.push(localePath('/brief')) },
  { id: 'contact', label: t('nav.contact'), perform: () => router.push(localePath('/contact')) },
  {
    id: 'terminal',
    label: locale.value === 'en' ? 'Open terminal (easter egg)' : 'Ouvrir le terminal (easter egg)',
    perform: () => router.push('/terminal'),
  },
  {
    id: 'switch-locale',
    label: locale.value === 'fr' ? 'Switch to English' : 'Basculer en français',
    perform: () => {
      const target = locale.value === 'fr' ? 'en' : 'fr'
      const switchLocalePath = useSwitchLocalePath()
      router.push(switchLocalePath(target as any))
    },
  },
  {
    id: 'cycle-theme',
    label: locale.value === 'en' ? `Theme: ${mode.value} → next` : `Thème : ${mode.value} → suivant`,
    perform: () => cycle(),
  },
])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return commands.value
  return commands.value.filter(c => c.label.toLowerCase().includes(q))
})

const activeIndex = ref(0)
watch(filtered, () => { activeIndex.value = 0 })

const inputRef = ref<HTMLInputElement | null>(null)
watch(open, (v) => {
  if (v) nextTick(() => inputRef.value?.focus())
})

// Global Cmd+K / Ctrl+K binding
onMounted(() => {
  function onKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      const { toggle } = useCommandPalette()
      toggle()
    } else if (open.value && e.key === 'Escape') {
      hide()
    } else if (open.value && e.key === 'ArrowDown') {
      e.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
    } else if (open.value && e.key === 'ArrowUp') {
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
    } else if (open.value && e.key === 'Enter') {
      e.preventDefault()
      runActive()
    }
  }
  window.addEventListener('keydown', onKeydown)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
})

async function runActive() {
  const cmd = filtered.value[activeIndex.value]
  if (!cmd) return
  hide()
  await cmd.perform()
}

async function runCommand(cmd: PaletteCommand) {
  hide()
  await cmd.perform()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="cmdk">
      <div v-if="open" class="cmdk-backdrop" @click="hide">
        <div class="cmdk-panel" role="dialog" aria-modal="true" @click.stop>
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="cmdk-input"
            :placeholder="locale === 'en' ? 'Type a command...' : 'Tape une commande…'"
          />
          <ul class="cmdk-list">
            <li
              v-for="(cmd, i) in filtered"
              :key="cmd.id"
              :class="['cmdk-item', { 'cmdk-item--active': i === activeIndex }]"
              @mouseenter="activeIndex = i"
              @click="runCommand(cmd)"
            >
              {{ cmd.label }}
            </li>
            <li v-if="filtered.length === 0" class="cmdk-empty">
              {{ locale === 'en' ? 'No matches.' : 'Aucun résultat.' }}
            </li>
          </ul>
          <p class="cmdk-hint">
            ↑↓ {{ locale === 'en' ? 'navigate' : 'naviguer' }} · ⏎ {{ locale === 'en' ? 'select' : 'choisir' }} · ⎋ {{ locale === 'en' ? 'close' : 'fermer' }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cmdk-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12vh 1rem 1rem;
}

.cmdk-panel {
  width: 100%;
  max-width: 540px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
}

.cmdk-input {
  border: 0;
  border-bottom: 1px solid var(--border);
  padding: 1rem 1.25rem;
  background: transparent;
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  color: var(--text);
  outline: none;
}

.cmdk-input::placeholder { color: var(--text-soft); }

.cmdk-list {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  max-height: 50vh;
  overflow-y: auto;
}

.cmdk-item {
  padding: 0.625rem 1.25rem;
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem;
  color: var(--text-mute);
  cursor: pointer;
}

.cmdk-item--active {
  background: var(--bg-raised);
  color: var(--text);
}

.cmdk-empty {
  padding: 1rem 1.25rem;
  color: var(--text-soft);
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
}

.cmdk-hint {
  border-top: 1px solid var(--border);
  padding: 0.5rem 1.25rem;
  margin: 0;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  letter-spacing: 0.04em;
}

.cmdk-enter-active, .cmdk-leave-active {
  transition: opacity 150ms;
}
.cmdk-enter-from, .cmdk-leave-to { opacity: 0; }
</style>
```

- [ ] **Step 3: Mount the palette in the default layout**

Edit `O:/Projets/my_portfolio/layouts/default.vue` to include the palette:

```vue
<template>
  <div class="layout">
    <SiteHeader />
    <main class="layout__main">
      <slot />
    </main>
    <SiteFooter />
    <CommandPalette />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.layout__main {
  flex: 1;
}
</style>
```

- [ ] **Step 4: Smoke-test**

`pnpm dev`, open http://localhost:3000:
- Press `Cmd+K` (or `Ctrl+K`) → palette opens, focus on input
- Type "ter" → filters to "Ouvrir le terminal"
- Press Enter → navigates to `/terminal`
- On any page, press Cmd+K → ↓↓ → Enter → navigates to "Approche"
- Press Esc → palette closes

- [ ] **Step 5: Commit**

```bash
cd O:/Projets/my_portfolio
git add composables/useCommandPalette.ts components/ui/CommandPalette.vue layouts/default.vue
git commit -m "feat: Cmd+K command palette

Lists site routes + locale switch + theme cycle + open terminal.
Keyboard nav (↑↓ Enter Esc), live filtering, focus-trapped on open.
Mounted globally in default layout.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Secret Keyboard Sequence (`r-o-s-t-e-l` → `/terminal`)

**Files:**
- Create: `composables/useSecretSequence.ts`
- Create: `plugins/secret-sequence.client.ts`

- [ ] **Step 1: Implement the composable**

Create `O:/Projets/my_portfolio/composables/useSecretSequence.ts`:

```ts
/**
 * Listens for a sequence of keystrokes typed in the document and fires
 * a callback when the full sequence is matched. Resets if the user types
 * something that doesn't match. Ignores keystrokes inside form elements.
 */
export function useSecretSequence(sequence: string, onMatch: () => void) {
  const buffer = ref<string[]>([])
  const target = sequence.toLowerCase().split('')

  function isFormField(el: EventTarget | null): boolean {
    if (!el || !(el instanceof HTMLElement)) return false
    const tag = el.tagName.toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
    if (el.isContentEditable) return true
    return false
  }

  function handler(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (isFormField(e.target)) return
    if (e.key.length !== 1) return

    const k = e.key.toLowerCase()
    buffer.value.push(k)

    // Trim to the last N keystrokes (matches sequence length)
    if (buffer.value.length > target.length) {
      buffer.value = buffer.value.slice(-target.length)
    }

    // Check whole match
    if (buffer.value.length === target.length &&
        buffer.value.every((ch, i) => ch === target[i])) {
      buffer.value = []
      onMatch()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handler)
  })
}
```

- [ ] **Step 2: Wire it globally via a client-only plugin**

Create `O:/Projets/my_portfolio/plugins/secret-sequence.client.ts`:

```ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const router = useRouter()
    useSecretSequence('rostel', () => {
      router.push('/terminal')
    })
  })
})
```

- [ ] **Step 3: Smoke-test**

Open http://localhost:3000. Click anywhere outside an input. Type `r o s t e l` quickly (one letter at a time, no delay > 1-2s). Expected: navigates to `/terminal`.

Test the negation: type `r o s t a l`. Expected: nothing happens.

Test it doesn't fire inside `/brief` form: focus a textarea, type `rostel` — should not navigate.

- [ ] **Step 4: Commit**

```bash
cd O:/Projets/my_portfolio
git add composables/useSecretSequence.ts plugins/secret-sequence.client.ts
git commit -m "feat: r-o-s-t-e-l secret keyboard sequence opens /terminal

Listener ignores keystrokes inside form fields and modifier-key
combinations. Buffer trims to sequence length so partial typos still
allow re-matching.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Umami Analytics Injection (Privacy-First)

**Files:**
- Create: `plugins/umami.client.ts`

- [ ] **Step 1: Implement the plugin**

Create `O:/Projets/my_portfolio/plugins/umami.client.ts`:

```ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const websiteId = config.public.umamiWebsiteId
  const scriptUrl = config.public.umamiScriptUrl

  if (!websiteId || !scriptUrl) return

  useHead({
    script: [
      {
        src: scriptUrl,
        async: true,
        defer: true,
        'data-website-id': websiteId,
        'data-do-not-track': 'true',     // honor browser DNT
        'data-cache': 'true',
      },
    ],
  })
})
```

- [ ] **Step 2: Verify**

If `NUXT_PUBLIC_UMAMI_WEBSITE_ID` and `NUXT_PUBLIC_UMAMI_SCRIPT_URL` are unset (default in dev), nothing is injected. Check the page `<head>` in dev tools — no Umami script.

If you set both vars and reload, the Umami script appears in `<head>` with the correct attributes.

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add plugins/umami.client.ts
git commit -m "feat: Umami analytics injection (no-op when unconfigured)

Honors DNT, cached, deferred. Public-safe: site key + script URL only.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: SEO Polish — Sitemap, Robots, OG, Structured Data

**Files:**
- Modify: `nuxt.config.ts` (sitemap + robots config)
- Create: `public/og-default.png` (1200×630, manually created or sourced)
- Create: `public/robots.txt` (handled by module — only override if needed)
- Modify: `app.vue` (default OG fallback)

- [ ] **Step 1: Configure sitemap and robots**

Open `O:/Projets/my_portfolio/nuxt.config.ts` and add (or update) at the appropriate position:

```ts
  sitemap: {
    sources: ['/api/__sitemap__/urls'],   // optional dynamic source for future case studies
    exclude: ['/terminal', '/en/terminal', '/brief/confirmation', '/en/brief/confirmation'],
  },

  robots: {
    sitemap: '/sitemap.xml',
    groups: [
      {
        userAgent: ['*'],
        allow: ['/'],
        disallow: ['/api/', '/terminal', '/en/terminal'],
      },
    ],
  },
```

- [ ] **Step 2: Default OG image fallback**

Create a 1200×630 PNG at `O:/Projets/my_portfolio/public/og-default.png`. Quick options:

1. Take a screenshot of the production home page in dark mode (Cmd+Shift+4 on Mac, Snipping Tool on Windows), crop to 1200×630.
2. Use a generator like https://og-playground.vercel.app/ — paste the hero copy, export.
3. Manually compose in any image tool: dark background `#0a0a0c`, "Rostel Panoumassi" in Fraunces serif, "Lead Engineering — Cotonou, BJ" subtitle, accent dot.

Save the file at `public/og-default.png`.

- [ ] **Step 3: Update `app.vue` for default OG meta**

Replace `O:/Projets/my_portfolio/app.vue` content with:

```vue
<script setup lang="ts">
const { resolved } = useTheme()
const config = useRuntimeConfig()

useHead({
  htmlAttrs: {
    'data-theme': resolved,
  },
})

useSeoMeta({
  ogImage: () => `${config.public.siteUrl}/og-default.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Rostel Panoumassi — Lead Engineering',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

Per-page `useSeoMeta()` calls override these defaults.

- [ ] **Step 4: Verify**

Run `pnpm dev` then check:
- http://localhost:3000/sitemap.xml — XML listing all FR + EN public routes (excluding `/terminal`, `/brief/confirmation`)
- http://localhost:3000/robots.txt — allows all, disallows API and terminal
- View source on http://localhost:3000 — `og:image` points to `/og-default.png`
- Test with https://www.opengraph.xyz/ once deployed (Plan 4 final step)

- [ ] **Step 5: Commit**

```bash
cd O:/Projets/my_portfolio
git add nuxt.config.ts app.vue public/og-default.png
git commit -m "feat: SEO — sitemap, robots, default OG image

Sitemap excludes terminal + confirmation. Robots disallows /api and
terminal. Default OG image set in app.vue, per-page overrides allowed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Accessibility Polish — Skip Link, Landmarks, Focus

**Files:**
- Modify: `layouts/default.vue` (add skip link + main landmark)
- Modify: `assets/css/main.css` (skip-link style + sr-only utility)

- [ ] **Step 1: Add `sr-only` utility and `.skip-link` style**

Append to `O:/Projets/my_portfolio/assets/css/main.css`:

```css
/* =========================================================
   Accessibility utilities
   ========================================================= */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 1rem;
  z-index: 100;
  background: var(--text);
  color: var(--bg);
  padding: 0.75rem 1.25rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  border-radius: 4px;
  transition: top 150ms;
}

.skip-link:focus,
.skip-link:focus-visible {
  top: 1rem;
  outline: 2px solid var(--accent);
}
```

- [ ] **Step 2: Add skip link + main landmark to the default layout**

Replace `O:/Projets/my_portfolio/layouts/default.vue`:

```vue
<script setup lang="ts">
const { t, locale } = useI18n()
const skipLabel = computed(() => locale.value === 'en' ? 'Skip to content' : 'Aller au contenu')
</script>

<template>
  <div class="layout">
    <a href="#main-content" class="skip-link">{{ skipLabel }}</a>
    <SiteHeader />
    <main id="main-content" class="layout__main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
    <CommandPalette />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.layout__main {
  flex: 1;
}
</style>
```

- [ ] **Step 3: Install axe-core for E2E accessibility checks**

```bash
cd O:/Projets/my_portfolio && pnpm add -D @axe-core/playwright
```

- [ ] **Step 4: Write the accessibility spec**

Create `O:/Projets/my_portfolio/tests/e2e/accessibility.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ROUTES = ['/', '/work', '/work/banque-regionale', '/about', '/contact', '/brief']

for (const route of ROUTES) {
  test(`a11y: ${route} has no critical violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    // Allow some color-contrast tolerance — fail only on serious + critical
    const blocking = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
    expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0)
  })
}

test('skip link is reachable via keyboard', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')   // first tab should focus the skip link
  const focused = await page.evaluate(() => document.activeElement?.className)
  expect(focused).toContain('skip-link')
})
```

- [ ] **Step 5: Run a11y tests**

```bash
cd O:/Projets/my_portfolio && pnpm test:e2e tests/e2e/accessibility.spec.ts
```

Expected: 7/7 pass. If any test fails, the AxeBuilder JSON tells you exactly which element + WCAG rule. Fix the offending markup (most common: missing alt text on images, missing label on inputs, low color contrast).

- [ ] **Step 6: Commit**

```bash
cd O:/Projets/my_portfolio
git add layouts/default.vue assets/css/main.css tests/e2e/accessibility.spec.ts package.json pnpm-lock.yaml
git commit -m "feat(a11y): skip link, main landmark, axe-core e2e

7 routes pass axe-core wcag2a + wcag2aa with zero serious/critical
violations. Skip link is keyboard-reachable on first Tab.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Performance Polish — Lazy Routes, Image Hints, Preload

**Files:**
- Modify: `nuxt.config.ts` (route rules for caching)
- Modify: `pages/index.vue` (preload key fonts)

- [ ] **Step 1: Add route rules for caching public pages and isolating the brief endpoint**

Open `O:/Projets/my_portfolio/nuxt.config.ts` and add:

```ts
  routeRules: {
    // Public content pages — pre-rendered at build, cached aggressively
    '/': { prerender: true },
    '/about': { prerender: true },
    '/contact': { prerender: true },
    '/work': { prerender: true },
    '/work/**': { prerender: true },
    '/en': { prerender: true },
    '/en/about': { prerender: true },
    '/en/contact': { prerender: true },
    '/en/work': { prerender: true },
    '/en/work/**': { prerender: true },

    // Forms — never cached
    '/brief': { prerender: false, headers: { 'Cache-Control': 'no-store' } },
    '/brief/confirmation': { prerender: false, headers: { 'Cache-Control': 'no-store' } },
    '/en/brief': { prerender: false, headers: { 'Cache-Control': 'no-store' } },
    '/en/brief/confirmation': { prerender: false, headers: { 'Cache-Control': 'no-store' } },

    // API — server-rendered, no caching
    '/api/**': { cors: false, headers: { 'Cache-Control': 'no-store' } },

    // Terminal — client-only, can be cached but rarely changes
    '/terminal': { ssr: false, headers: { 'Cache-Control': 'public, max-age=300' } },
    '/en/terminal': { ssr: false, headers: { 'Cache-Control': 'public, max-age=300' } },
  },
```

- [ ] **Step 2: Run a build and inspect output**

```bash
cd O:/Projets/my_portfolio && pnpm build
```

Expected:
- Build completes without errors
- `Σ Total size` line in output
- Pre-rendered pages appear in `.output/public/`

If build fails on `legacy/` or `_legacy/` chunks: check `Vue` SFC syntax — Vue 3.4+ might warn about deprecated patterns the legacy code uses. Fix specific files as they surface.

- [ ] **Step 3: Run preview and check Lighthouse**

```bash
cd O:/Projets/my_portfolio && pnpm preview
```

Open Chrome DevTools → Lighthouse → Desktop preset → Run on http://localhost:3000.

Expected:
- Performance ≥ 95
- Accessibility = 100
- Best Practices ≥ 95
- SEO ≥ 95

If Performance < 95: most common offenders are unoptimized images (`/images/profile.jpg` should be served as WebP — `@nuxt/image` handles this if `<NuxtImg>` is used) and excessive JS payload (the terminal SPA is the biggest chunk; isolated under `/terminal`, it shouldn't impact home perf).

- [ ] **Step 4: Commit**

```bash
cd O:/Projets/my_portfolio
git add nuxt.config.ts
git commit -m "perf: route rules — prerender public, no-store on forms

Home, /work, /about, /contact pre-rendered at build for static delivery.
Brief and confirmation pages never cached (avoid stale form state).
Terminal stays client-only with short edge cache.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Reduced Motion — Final Audit

**Files:**
- Verify: `assets/css/main.css` (already added in Plan 1)
- Verify: `components/ui/FadeUp.vue` (already added in Plan 2)

- [ ] **Step 1: Manual audit**

Run `pnpm dev`. Open Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". Reload.

- [ ] Hero on home renders immediately, no fade-up
- [ ] Featured Work list renders all 3 cards immediately
- [ ] Approach block renders immediately
- [ ] Theme toggle still works (animations are CSS transitions on color, technically allowed — but they should be ≤ 50ms under reduced motion)
- [ ] Brief step transitions are instant (no slide)

If any animation still plays: locate the offending CSS keyframes or GSAP timeline. CSS keyframes are caught by the global `@media (prefers-reduced-motion: reduce)` rule. GSAP must be killed in code — the `useReducedMotion` composable + the `if (reduce.value) return` check in FadeUp covers our scroll animations. The legacy terminal SPA has its own GSAP timelines; those are inside `_legacy/` and the legacy code already supports a "performance mode" toggle.

- [ ] **Step 2: Commit (no code; marker)**

```bash
cd O:/Projets/my_portfolio
git commit --allow-empty -m "chore: verified prefers-reduced-motion respected on every page

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Production Dockerfile

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Create `.dockerignore`**

Create `O:/Projets/my_portfolio/.dockerignore`:

```
# VCS
.git
.gitignore

# Local env / secrets — NEVER copy into the image
.env
.env.*
!.env.example

# Node
node_modules
.pnpm-store
**/node_modules

# Nuxt build artifacts (will rebuild in Stage 2)
.nuxt
.output
.data
.cache

# Tests
tests
playwright.config.ts
playwright-report
test-results
coverage

# Legacy SPA — already incorporated into components/terminal/_legacy
legacy

# Docs
docs
*.md
!README.md

# IDE
.vscode
.idea

# Brainstorm session artefacts
.superpowers
```

- [ ] **Step 2: Create the Dockerfile**

Create `O:/Projets/my_portfolio/Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1.7

# =====================================================================
# Stage 1 — install deps (cached unless lockfile changes)
# =====================================================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# =====================================================================
# Stage 2 — build the Nuxt app
# =====================================================================
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build
RUN pnpm build

# =====================================================================
# Stage 3 — runtime image (minimal)
# =====================================================================
FROM node:20-alpine AS runner

# Use a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nuxt

WORKDIR /app

# Healthcheck dep
RUN apk add --no-cache wget

# Copy only the build output
COPY --from=build --chown=nuxt:nodejs /app/.output ./.output

USER nuxt

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", ".output/server/index.mjs"]
```

- [ ] **Step 3: Build locally to verify**

```bash
cd O:/Projets/my_portfolio
docker build -t rostel-portfolio:dev .
```

Expected: 3 stages succeed, image size < 200 MB. Check size with `docker images | grep rostel-portfolio`.

If build fails:
- "module not found" during build stage: a peer dep is missing — add to `package.json` and re-lock.
- "permission denied" on the runner stage: Alpine non-root user — verify the `--chown` flag in COPY.

- [ ] **Step 4: Run the image locally**

```bash
docker run --rm -d -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/portfolio \
  -e NUXT_PUBLIC_SITE_URL=http://localhost:3000 \
  -e SMTP_HOST=smtp.example.com \
  -e SMTP_USER=test \
  -e SMTP_PASS=test \
  -e SMTP_FROM=test@example.com \
  -e NOTIFICATION_EMAIL=test@example.com \
  --name rostel-portfolio-test \
  rostel-portfolio:dev
```

Wait 10 seconds, then:

```bash
curl -i http://localhost:3000/api/health
```

Expected: 200 OK with `{"ok":true}` if Mongo on the host is reachable.

Open http://localhost:3000 in browser → home renders.

Stop the container:

```bash
docker stop rostel-portfolio-test
```

- [ ] **Step 5: Commit**

```bash
cd O:/Projets/my_portfolio
git add Dockerfile .dockerignore
git commit -m "feat: production Dockerfile (multi-stage, non-root, healthcheck)

3 stages: deps (cached) → build → minimal runtime. Non-root user nuxt
(uid 1001). Healthcheck pings /api/health. Image footprint < 200 MB.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Coolify Deployment Runbook

**Files:**
- Create: `docs/deployment/coolify.md`

- [ ] **Step 1: Write the runbook**

Create `O:/Projets/my_portfolio/docs/deployment/coolify.md`:

```markdown
# Coolify Deployment Runbook

This runbook covers a from-scratch deployment of the portfolio onto a self-hosted Coolify instance.

## Prerequisites

- A Coolify-managed server (Hetzner / DigitalOcean / VPS)
- A domain you control (e.g., `rostelmissimawu.com`) with DNS access
- An SMTP provider with a verified `noreply@rostelmissimawu.com` mailbox
- A Cloudflare account (for Turnstile keys)
- (Optional) A Telegram bot created via @BotFather

## 1. Create the MongoDB service

In the Coolify dashboard:

1. **Resources → New → Database → MongoDB 7**
2. Name: `rostel-portfolio-mongo`
3. Persistent volume: enabled (default)
4. Save the auto-generated `MONGODB_URI` — you will paste it into the app's env vars

## 2. Create the Application

1. **Resources → New → Application → Public Git repository**
2. Repo URL: `https://github.com/<you>/my_portfolio.git`
3. Branch: `main`
4. Build pack: **Dockerfile**
5. Port: `3000`

## 3. Environment variables

Paste the following into the Coolify "Environment" tab. **Never commit real values to git.**

| Key | Value |
|-----|-------|
| `NUXT_PUBLIC_SITE_URL` | `https://rostelmissimawu.com` |
| `MONGODB_URI` | (from step 1) |
| `SMTP_HOST` | `mail.rostelmissimawu.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `noreply@rostelmissimawu.com` |
| `SMTP_PASS` | (your SMTP password) |
| `SMTP_FROM` | `noreply@rostelmissimawu.com` |
| `NOTIFICATION_EMAIL` | `rmissimawu@gmail.com` |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | (from Cloudflare → Turnstile → site key) |
| `TURNSTILE_SECRET_KEY` | (from Cloudflare → Turnstile → secret key) |
| `TELEGRAM_BOT_TOKEN` | (optional — from @BotFather) |
| `TELEGRAM_CHAT_ID` | (optional — your chat ID, get via /getUpdates) |
| `NUXT_PUBLIC_UMAMI_WEBSITE_ID` | (optional — from your Umami dashboard) |
| `NUXT_PUBLIC_UMAMI_SCRIPT_URL` | (optional — your Umami script URL) |

## 4. Domain + TLS

1. In Coolify, set the application "FQDN" to `https://rostelmissimawu.com`.
2. Enable "Force HTTPS"
3. Coolify auto-provisions a Let's Encrypt cert (via Traefik). Verify the cert appears in the dashboard.
4. In your DNS panel, point `rostelmissimawu.com` (and `www`) at the Coolify server's IP.

## 5. Deploy

1. Click **Deploy** in the Coolify UI.
2. The build runs the Dockerfile. Watch the build logs.
3. Once green, hit `https://rostelmissimawu.com/api/health` — expect `{"ok":true}`.
4. Browse the site, walk through `/` → `/work` → `/work/banque-regionale` → `/about` → `/brief` → `/terminal`.

## 6. Smoke test the brief funnel

Submit a real brief from a different IP (mobile data is convenient). Verify:

- [ ] Email lands in `rmissimawu@gmail.com`
- [ ] Telegram notification fires (if configured)
- [ ] Mongo has the document — connect via Coolify's "Connect Terminal" feature on the Mongo service:
      ```
      mongosh "$MONGO_INITDB_DATABASE" --eval "db.briefs.find().sort({createdAt:-1}).limit(1).pretty()"
      ```

## 7. Backups

Coolify can schedule automated backups for managed databases:

1. **Database → rostel-portfolio-mongo → Backups → Schedule**
2. Frequency: daily at 03:00 UTC
3. Retention: 7 days
4. Storage: local volume (or S3 if configured)

## 8. Updates

Push to `main`. Coolify auto-deploys (if "Auto Deploy" is enabled) or you click Deploy. For risky updates, use a feature branch and Coolify's preview-deployment feature.

## 9. Rollback

1. **Coolify dashboard → Deployments → previous green build → Redeploy**
2. Or: `git revert <commit> && git push origin main`

## 10. Troubleshooting

- **502 Bad Gateway** → Container is down. Check Coolify logs. Most often a missing env var.
- **Mongo connection failed** → Verify the Mongo service is running, the URI in app env is the **internal** Coolify URI (not the external preview), and they share the same Coolify network.
- **Email not delivered** → Check SMTP credentials; check the SMTP provider's reputation logs (sometimes the receiving domain rejects mail from new IPs).
- **Turnstile always fails** → Site key + secret must come from the **same** Cloudflare Turnstile widget. Verify `Site key` is in `NUXT_PUBLIC_TURNSTILE_SITE_KEY` (public) and `Secret key` is in `TURNSTILE_SECRET_KEY` (server-only).
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add docs/deployment/coolify.md
git commit -m "docs: Coolify deployment runbook

End-to-end: Mongo service, app config, env vars matrix, domain + TLS,
deploy, smoke test, backups, rollback, troubleshooting.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Terminal E2E Smoke Test

**Files:**
- Create: `tests/e2e/terminal.spec.ts`

- [ ] **Step 1: Write the spec**

Create `O:/Projets/my_portfolio/tests/e2e/terminal.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('Terminal easter egg', () => {
  test('/terminal renders the legacy UI', async ({ page }) => {
    await page.goto('/terminal')
    // Boot sequence or prompt should appear within a few seconds
    await expect(page.locator('body')).toContainText(/rostel|ROSTEL|\$/i, { timeout: 10_000 })
  })

  test('command palette opens with Cmd+K', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('ControlOrMeta+k')
    await expect(page.locator('.cmdk-panel')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.cmdk-panel')).not.toBeVisible()
  })

  test('command palette can navigate to /terminal', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('ControlOrMeta+k')
    await page.locator('.cmdk-input').fill('terminal')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/terminal$/)
  })

  test('typing rostel on a content page navigates to /terminal', async ({ page }) => {
    await page.goto('/about')
    // Make sure no input is focused
    await page.locator('body').click({ position: { x: 5, y: 5 } })
    await page.keyboard.type('rostel', { delay: 30 })
    await expect(page).toHaveURL(/\/terminal$/)
  })

  test('typing rostel inside an input does NOT navigate', async ({ page }) => {
    await page.goto('/brief')
    await page.locator('text=Construire un produit depuis zéro').click()
    const textarea = page.locator('textarea').first()
    await textarea.click()
    await textarea.fill('rostel')
    await expect(page).toHaveURL(/\/brief$/)
  })
})
```

- [ ] **Step 2: Run all e2e suites**

```bash
cd O:/Projets/my_portfolio && pnpm test:e2e
```

Expected: total of ~15-17 e2e tests pass (Plan 2 navigation + Plan 3 brief + Plan 4 terminal + a11y).

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add tests/e2e/terminal.spec.ts
git commit -m "test: e2e terminal easter egg + Cmd+K + secret sequence

5 tests: terminal renders, palette opens/closes, palette navigates,
secret sequence works on content pages, secret sequence is suppressed
inside form fields.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Final Pre-Cutover Verification

- [ ] **Step 1: Full type + unit + e2e green**

```bash
cd O:/Projets/my_portfolio && pnpm typecheck && pnpm test --run && pnpm test:e2e
```

Expected: 0 typecheck errors, all unit tests pass, all e2e tests pass.

- [ ] **Step 2: Production build clean**

```bash
cd O:/Projets/my_portfolio && pnpm build
```

Expected: builds without warnings (or only acceptable warnings about prerender). Check `.output/public/` lists all expected pre-rendered pages (FR + EN home, work index, all 5 case studies, about, contact for both locales).

- [ ] **Step 3: Lighthouse audit on the production build**

```bash
cd O:/Projets/my_portfolio && pnpm preview &
```

Then:

```bash
pnpm dlx lighthouse http://localhost:3000 --view --preset=desktop
pnpm dlx lighthouse http://localhost:3000/work/banque-regionale --view --preset=desktop
pnpm dlx lighthouse http://localhost:3000/about --view --preset=desktop
pnpm dlx lighthouse http://localhost:3000/brief --view --preset=desktop
```

Targets:
- Performance ≥ 95
- Accessibility = 100
- Best Practices ≥ 95
- SEO ≥ 95

- [ ] **Step 4: Manual happy-path checklist**

Walk through every page in both locales and check:

- [ ] / hero serif headline visible
- [ ] / featured work shows 3 cards
- [ ] / scroll: approach + CTA fade in smoothly
- [ ] /work shows 5 studies, sector chips filter
- [ ] /work/banque-regionale renders all sections, "Étude suivante" links to next study
- [ ] /about shows portrait, body, CV download link works
- [ ] /contact shows 4 channels
- [ ] /brief: 4 steps work, draft persists across reload, submit reaches /brief/confirmation
- [ ] /terminal: boot sequence, all commands, themes all work
- [ ] Cmd+K palette: filtering, navigation, theme cycle all work
- [ ] Typing `rostel` → /terminal
- [ ] Footer "$ ./terminal" link → /terminal
- [ ] Theme toggle: auto → clair → sombre → auto, persists
- [ ] Lang toggle: FR ↔ EN, persists
- [ ] No 404s except `/work/does-not-exist`

- [ ] **Step 5: Stop the preview**

```bash
# Find the pid and kill it
ps aux | grep node | grep preview
kill <pid>
```

---

## Task 14: Cutover — Merge to Main

- [ ] **Step 1: Verify clean working tree**

```bash
git -C O:/Projets/my_portfolio status
```

Expected: clean.

- [ ] **Step 2: Merge `v3-redesign` into `main` with a merge commit**

```bash
cd O:/Projets/my_portfolio
git checkout main
git pull origin main
git merge --no-ff v3-redesign -m "feat: portfolio v3 redesign — Nuxt 3 + content site + brief funnel + terminal easter egg

Replaces the Vue 3 SPA terminal portfolio with a public-facing Nuxt 3
site (FR default + EN switch) targeting international freelance clients
and tech recruiters. The original terminal experience is preserved
verbatim under /terminal as an easter egg.

See docs/superpowers/specs/2026-04-26-portfolio-redesign-design.md
for the full spec and docs/superpowers/plans/2026-04-26-portfolio-v3-plan-*.md
for the four-plan implementation history."
```

- [ ] **Step 3: Tag the release**

```bash
git tag -a v3.0.0 -m "v3.0.0 — Public portfolio redesign

Highlights:
- New public site: home, /work, /work/[slug], /about, /contact, /brief
- Bilingual FR (default) + EN
- Brief form with MongoDB persistence + SMTP + Telegram + Turnstile
- Cmd+K command palette
- Terminal easter egg under /terminal
- Lighthouse > 95 across all categories
- Production Dockerfile + Coolify deployment runbook"
```

- [ ] **Step 4: Push main + tag**

```bash
git push origin main
git push origin v3.0.0
```

- [ ] **Step 5: Trigger Coolify deployment**

- If auto-deploy is enabled in Coolify, the push to `main` triggers a build automatically.
- Otherwise, click **Deploy** in the Coolify UI.
- Monitor the build logs.

- [ ] **Step 6: Production smoke test**

After Coolify reports the build green, visit `https://rostelmissimawu.com` (or your final domain) and run the manual checklist from Task 13 Step 4 against production.

- [ ] **Step 7: OG verification on social**

Test with https://www.opengraph.xyz/url/https%3A%2F%2Frostelmissimawu.com — verify the home OG image, title, description render correctly. Repeat with `/work/banque-regionale` to confirm per-page OG works.

- [ ] **Step 8: Cleanup**

After 7 days of production stability, you may delete the `v3-redesign` branch:

```bash
git push origin --delete v3-redesign
git branch -d v3-redesign
```

The `legacy/terminal-spa/` archive can stay indefinitely — it costs nothing in storage and provides a forensic reference for the migration.

---

## Plan 4 Complete

State at end of Plan 4:
- Production deployment live at `https://rostelmissimawu.com`
- All four plans (foundation, content site, brief funnel, terminal + deploy) merged to `main`
- Tag `v3.0.0` exists
- Lighthouse > 95 across the board
- Brief funnel verified end-to-end in production (Mongo + SMTP + Telegram + Turnstile)
- Terminal easter egg fully functional under `/terminal`
- Cmd+K palette + secret keyboard sequence work
- Coolify backups scheduled, rollback path documented
- The legacy SPA is archived under `legacy/terminal-spa/` for future reference

Outstanding spec items deliberately deferred to V2 (per spec section 8):
- `/notes` blog
- Sentry monitoring
- Custom cursor
- Generated SVG monograms per case study
- Optional witness quotes block on the home (when signable testimonials become available)
- Real content for "Hors du code" section, full case study bodies, polished approach copy (handled by the parallel content phase)
