# Portfolio V3 — Plan 1 : Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap a fresh Nuxt 3 project at the repo root, archive the existing Vue 3 SPA into `legacy/terminal-spa/`, install all required modules, set up the design system (Fraunces / Inter / JetBrains Mono fonts, Tailwind color tokens, CSS variables for dark/light themes), and ship a default layout with `SiteHeader` + `SiteFooter` and a working theme toggle.

**Architecture:** Nuxt 3 with file-based routing, Tailwind v3 driven by CSS custom properties (single source of truth for both themes), `@nuxt/fonts` for self-hosted variable fonts, theme persisted in a cookie via `useTheme()` composable, `prefers-color-scheme` honored at first visit.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript (strict), Tailwind CSS v3, `@nuxt/fonts`, `@nuxtjs/tailwindcss`, `@nuxtjs/i18n` (configured but not yet wired to content), `@nuxt/content`, `@nuxt/image`, `@vueuse/nuxt`, `@pinia/nuxt`, `nuxt-security`, `@nuxtjs/seo`, `pnpm`.

**Reference spec:** `docs/superpowers/specs/2026-04-26-portfolio-redesign-design.md` — sections 5 (visual system), 6.1 (stack), 6.2 (project structure).

**Definition of done:** `pnpm dev` runs cleanly, `pages/index.vue` renders a styled hero placeholder inside the default layout, switching theme (auto/manual) toggles `data-theme="light|dark"` on `<html>` and updates colors live, all three font families load and render correctly, no TypeScript errors.

---

## File Structure

```
my_portfolio/
├─ package.json                     # rewritten for Nuxt 3 + pnpm
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml              # not used — single package
├─ tsconfig.json                    # extends .nuxt/tsconfig.json
├─ nuxt.config.ts                   # all module config
├─ tailwind.config.ts               # design tokens (colors, fonts, sizes)
├─ app.vue                          # NuxtLayout + NuxtPage
├─ .gitignore                       # adds .nuxt, .output, .data, .env
├─ .env.example                     # placeholder for later phases
├─ assets/
│   └─ css/
│       └─ main.css                 # CSS variables for both themes + base styles
├─ components/
│   ├─ site/
│   │   ├─ SiteHeader.vue           # nav, availability, theme/lang toggle
│   │   └─ SiteFooter.vue           # columns + terminal easter egg link
│   └─ ui/
│       ├─ ThemeToggle.vue          # dark/light/auto toggle
│       └─ LangToggle.vue           # FR/EN placeholder (wired in Plan 2)
├─ composables/
│   └─ useTheme.ts                  # auto + manual + cookie persistence
├─ layouts/
│   └─ default.vue                  # SiteHeader + <slot/> + SiteFooter
├─ pages/
│   └─ index.vue                    # placeholder hero
├─ legacy/
│   └─ terminal-spa/                # archive of current Vue 3 SPA (read-only reference)
└─ types/
    └─ theme.ts                     # ThemeMode type
```

---

## Task 1: Branch + Tag + Archive Legacy SPA

**Files:**
- Create: `legacy/terminal-spa/` (move all current source here)
- Modify: `.gitignore` (will be regenerated, but ensure legacy/ is tracked)

- [ ] **Step 1: Verify clean working tree**

```bash
git -C O:/Projets/my_portfolio status
```

Expected: `(clean)` or only untracked files we expect (e.g., `.superpowers/`, `node_modules/`).

If unclean: stop and ask the user to commit or stash before continuing.

- [ ] **Step 2: Tag the current main as the last terminal-only release**

```bash
git -C O:/Projets/my_portfolio tag -a v2-terminal-final main -m "Last release of the terminal-only portfolio (Vue 3 SPA)"
```

Expected: tag created, no output. Verify with `git -C O:/Projets/my_portfolio tag -l v2-terminal-final` → prints the tag name.

- [ ] **Step 3: Create and switch to the v3-redesign branch**

```bash
git -C O:/Projets/my_portfolio checkout -b v3-redesign
```

Expected: `Switched to a new branch 'v3-redesign'`.

- [ ] **Step 4: Move existing SPA source to `legacy/terminal-spa/`**

```bash
cd O:/Projets/my_portfolio
mkdir -p legacy/terminal-spa
git mv src legacy/terminal-spa/src
git mv index.html legacy/terminal-spa/index.html
git mv package.json legacy/terminal-spa/package.json
git mv vite.config.ts legacy/terminal-spa/vite.config.ts 2>/dev/null || true
git mv vitest.config.ts legacy/terminal-spa/vitest.config.ts 2>/dev/null || true
git mv tsconfig.json legacy/terminal-spa/tsconfig.json
git mv tsconfig.node.json legacy/terminal-spa/tsconfig.node.json
git mv tailwind.config.js legacy/terminal-spa/tailwind.config.js 2>/dev/null || true
git mv postcss.config.js legacy/terminal-spa/postcss.config.js
git mv public legacy/terminal-spa/public
```

Expected: each `git mv` succeeds (or `2>/dev/null || true` swallows missing-file errors for paths that may not exist depending on local state). Verify with `ls O:/Projets/my_portfolio/legacy/terminal-spa/` — should list `src`, `index.html`, `package.json`, etc.

- [ ] **Step 5: Verify root is now empty of stale config**

```bash
ls O:/Projets/my_portfolio/
```

Expected: shows `legacy/`, `node_modules/`, `docs/`, `.git/`, `.superpowers/`, `OLD_FILES/`, possibly `dist/` and `init.md`. **Should NOT show**: `src/`, `index.html`, `package.json`, `tsconfig.json` at root.

If `node_modules/` is still at root, leave it for now — `pnpm install` in Task 2 will overwrite/manage it. If `dist/` exists at root, move it: `git mv dist legacy/terminal-spa/dist`.

- [ ] **Step 6: Commit the archive move**

```bash
git -C O:/Projets/my_portfolio add -A
git -C O:/Projets/my_portfolio commit -m "$(cat <<'EOF'
chore: archive Vue 3 terminal SPA into legacy/terminal-spa/

The terminal portfolio is preserved verbatim under legacy/. It will be
reintegrated as a client-only easter egg page in Plan 4. Tagged
v2-terminal-final on main as a restore point.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds with ~25-50 files changed (mostly renames).

---

## Task 2: Initialize Nuxt 3 at the Repo Root

**Files:**
- Create: `package.json`, `tsconfig.json`, `nuxt.config.ts`, `app.vue`, `.gitignore`, `.env.example`

- [ ] **Step 1: Initialize a new Nuxt 3 project in a temp directory**

```bash
cd /tmp && rm -rf nuxt-init && pnpm dlx nuxi@latest init nuxt-init --no-git --packageManager pnpm
```

Expected: a fresh Nuxt 3 scaffold under `/tmp/nuxt-init/`. We use a temp dir because `nuxi init` refuses to write into a non-empty directory.

- [ ] **Step 2: Copy the scaffolded files into the repo root**

```bash
cp /tmp/nuxt-init/nuxt.config.ts O:/Projets/my_portfolio/nuxt.config.ts
cp /tmp/nuxt-init/app.vue O:/Projets/my_portfolio/app.vue
cp /tmp/nuxt-init/tsconfig.json O:/Projets/my_portfolio/tsconfig.json
cp /tmp/nuxt-init/package.json O:/Projets/my_portfolio/package.json
cp /tmp/nuxt-init/.gitignore O:/Projets/my_portfolio/.gitignore
```

Expected: 5 files created at the repo root.

- [ ] **Step 3: Update `package.json` with the project name**

Open `O:/Projets/my_portfolio/package.json` and replace its content with:

```json
{
  "name": "rostel-portfolio-v3",
  "private": true,
  "version": "3.0.0",
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "typecheck": "nuxt typecheck",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "nuxt": "^3.13.0",
    "vue": "^3.5.0",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 4: Append legacy + Nuxt artifacts to `.gitignore`**

Open `O:/Projets/my_portfolio/.gitignore` and append at the end:

```
# Legacy SPA - kept for reference, builds and node_modules ignored
legacy/terminal-spa/node_modules
legacy/terminal-spa/dist
legacy/terminal-spa/.vite

# Brainstorm session artifacts
.superpowers/

# Local env
.env
.env.local
.env.*.local
```

- [ ] **Step 5: Install root dependencies**

```bash
cd O:/Projets/my_portfolio && pnpm install
```

Expected: pnpm installs Nuxt + Vue + Vue Router + TypeScript. Output ends with `Done in Xs`. A `node_modules/` and `pnpm-lock.yaml` appear at the root.

If pnpm complains about an existing `node_modules` from the legacy install: delete it first with `rm -rf O:/Projets/my_portfolio/node_modules` (the legacy version remains under `legacy/terminal-spa/node_modules` if needed).

- [ ] **Step 6: Verify dev server boots**

```bash
cd O:/Projets/my_portfolio && pnpm dev
```

Expected: console prints `Local: http://localhost:3000/` within 10-30s. Open the URL in a browser → see the default Nuxt welcome page. Stop the server with Ctrl+C.

- [ ] **Step 7: Create `.env.example` with placeholders for later phases**

Create `O:/Projets/my_portfolio/.env.example`:

```env
# Public site URL — used by SEO module and OG image generation
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudflare Turnstile (Plan 3) — get keys from https://dash.cloudflare.com/?to=/:account/turnstile
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# MongoDB (Plan 3) — local dev: mongodb://localhost:27017/portfolio
MONGODB_URI=mongodb://localhost:27017/portfolio

# SMTP for outgoing email (Plan 3)
SMTP_HOST=mail.rostelmissimawu.com
SMTP_PORT=587
SMTP_USER=noreply@rostelmissimawu.com
SMTP_PASS=
SMTP_FROM=noreply@rostelmissimawu.com
NOTIFICATION_EMAIL=rmissimawu@gmail.com

# Telegram bot for brief notifications (Plan 3, optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Umami analytics (Plan 4)
NUXT_PUBLIC_UMAMI_WEBSITE_ID=
NUXT_PUBLIC_UMAMI_SCRIPT_URL=
```

- [ ] **Step 8: Commit the bootstrap**

```bash
cd O:/Projets/my_portfolio
git add package.json pnpm-lock.yaml nuxt.config.ts app.vue tsconfig.json .gitignore .env.example
git commit -m "$(cat <<'EOF'
chore: bootstrap Nuxt 3 at repo root

Fresh scaffold via nuxi init. Adds .env.example documenting all secrets
required across plans 1-4. Legacy SPA remains under legacy/terminal-spa/.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Install and Configure Nuxt Modules

**Files:**
- Modify: `package.json` (add module deps)
- Modify: `nuxt.config.ts` (register modules + base config)

- [ ] **Step 1: Install all required modules in one command**

```bash
cd O:/Projets/my_portfolio
pnpm add @nuxt/content@^3 @nuxtjs/i18n@^9 @nuxt/image@^1 @nuxt/fonts@^0.10 @nuxtjs/tailwindcss@^6 @vueuse/nuxt@^11 @pinia/nuxt@^0.5 nuxt-security@^2 @nuxtjs/seo@^2 @nuxtjs/sitemap@^7 @nuxtjs/robots@^5
pnpm add -D vitest @vitest/ui @vue/test-utils happy-dom @playwright/test
```

Expected: all packages install. `package.json` `dependencies` and `devDependencies` are populated.

- [ ] **Step 2: Replace `nuxt.config.ts` with the full configuration**

Open `O:/Projets/my_portfolio/nuxt.config.ts` and replace its content with:

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/seo',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-security',
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: false, // turned on by `pnpm typecheck`
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  runtimeConfig: {
    // Server-only secrets (filled by env vars at runtime)
    mongodbUri: process.env.MONGODB_URI || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || '',
    notificationEmail: process.env.NOTIFICATION_EMAIL || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || '',

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
      umamiWebsiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || '',
      umamiScriptUrl: process.env.NUXT_PUBLIC_UMAMI_SCRIPT_URL || '',
    },
  },

  // Module-specific config follows in later tasks (i18n in Plan 2, content in Plan 2, etc.)
  // For Plan 1 we only need Tailwind + fonts + base SEO.

  i18n: {
    defaultLocale: 'fr',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français' },
      { code: 'en', language: 'en-US', name: 'English' },
    ],
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'fr',
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Rostel Panoumassi',
    description: 'Lead Engineering — disponible pour deux missions par trimestre.',
    defaultLocale: 'fr',
  },

  fonts: {
    families: [
      { name: 'Fraunces', provider: 'google', weights: [400, 500, 600], styles: ['normal', 'italic'] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
  },
})
```

- [ ] **Step 3: Verify the dev server still boots with all modules**

```bash
cd O:/Projets/my_portfolio && pnpm dev
```

Expected: server starts. There may be warnings about `assets/css/main.css` not yet existing — ignore them, that file is Task 4. There may be warnings about content/ folder not existing — also fine. Stop with Ctrl+C.

If it errors on a specific module: read the error, install missing peer deps if any, retry.

- [ ] **Step 4: Commit module install**

```bash
cd O:/Projets/my_portfolio
git add package.json pnpm-lock.yaml nuxt.config.ts
git commit -m "chore: install and register Nuxt modules

@nuxt/content, @nuxtjs/i18n, @nuxt/image, @nuxt/fonts, @nuxtjs/tailwindcss,
@vueuse/nuxt, @pinia/nuxt, nuxt-security, @nuxtjs/seo, @nuxtjs/sitemap,
@nuxtjs/robots. i18n configured FR default + EN switch
(prefix_except_default). runtimeConfig wires all env vars expected by
later plans.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Tailwind Config and CSS Variables (Design Tokens)

**Files:**
- Create: `tailwind.config.ts`
- Create: `assets/css/main.css`
- Create: `types/theme.ts`

- [ ] **Step 1: Create the theme type**

Create `O:/Projets/my_portfolio/types/theme.ts`:

```ts
export type ThemeMode = 'light' | 'dark' | 'auto'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_COOKIE = 'theme'
export const THEME_DEFAULT: ThemeMode = 'auto'
```

- [ ] **Step 2: Create `tailwind.config.ts` with all design tokens from spec section 5**

Create `O:/Projets/my_portfolio/tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './content/**/*.md',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-raised': 'var(--bg-raised)',
        'bg-overlay': 'var(--bg-overlay)',
        text: 'var(--text)',
        'text-mute': 'var(--text-mute)',
        'text-soft': 'var(--text-soft)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        available: 'var(--available)',
        error: 'var(--error)',
        success: 'var(--success)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing }]
        'display-1': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-2': ['3.5rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'h1': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h2': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h3': ['1.375rem', { lineHeight: '1.3' }],
        'body-l': ['1.125rem', { lineHeight: '1.65' }],
        'body': ['1rem', { lineHeight: '1.65' }],
        'body-s': ['0.875rem', { lineHeight: '1.55' }],
        'mono-s': ['0.75rem', { lineHeight: '1.5' }],
      },
      maxWidth: {
        container: '1200px',
        reading: '720px',
      },
      spacing: {
        section: '6rem',         // 96px — compact section padding
        'section-lg': '8rem',    // 128px — standard
        'section-xl': '10rem',   // 160px — important
      },
      transitionTimingFunction: {
        'soft-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Create `assets/css/main.css` with CSS variables for both themes**

Create `O:/Projets/my_portfolio/assets/css/main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* =========================================================
   Theme tokens — both themes live here, switched by [data-theme]
   ========================================================= */
:root,
[data-theme='dark'] {
  --bg: #0a0a0c;
  --bg-raised: #111114;
  --bg-overlay: #18181c;
  --text: #e8e6e1;
  --text-mute: #a8a59f;
  --text-soft: #5a5852;
  --border: #1f1f22;
  --border-strong: #2a2a2e;
  --accent: #00fff7;
  --accent-soft: rgba(0, 255, 247, 0.18);
  --available: #5fb37a;
  --error: #f56565;
  --success: #5fb37a;
  color-scheme: dark;
}

[data-theme='light'] {
  --bg: #faf8f4;
  --bg-raised: #f3f0e9;
  --bg-overlay: #ffffff;
  --text: #1a1a1a;
  --text-mute: #555555;
  --text-soft: #8a8682;
  --border: #e8e3d8;
  --border-strong: #d4cdbb;
  --accent: #0891b2;
  --accent-soft: rgba(8, 145, 178, 0.12);
  --available: #2a7a4a;
  --error: #c53030;
  --success: #2a7a4a;
  color-scheme: light;
}

/* =========================================================
   Base
   ========================================================= */
@layer base {
  html {
    background: var(--bg);
    color: var(--text);
    font-family: theme('fontFamily.body');
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    min-height: 100dvh;
  }

  ::selection {
    background: var(--accent-soft);
    color: var(--text);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: theme('fontFamily.display');
    font-weight: 400;
  }

  /* Custom scrollbar (subtle, matches the mood) */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border-strong);
    border: 3px solid var(--bg);
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-soft);
  }

  /* Focus visible — accent ring for keyboard users only */
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

/* =========================================================
   Reduced motion
   ========================================================= */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Verify Tailwind compiles**

Run `pnpm dev`. Expected: server boots, no Tailwind errors. Open http://localhost:3000 — the welcome page should now use the dark background (`#0a0a0c`) automatically because no `data-theme` is set yet, but `:root` defaults to dark tokens.

- [ ] **Step 5: Commit design tokens**

```bash
cd O:/Projets/my_portfolio
git add tailwind.config.ts assets/css/main.css types/theme.ts
git commit -m "feat: design tokens for dark + light themes

Tailwind config exposes color/typography/spacing tokens as utilities.
CSS custom properties live in assets/css/main.css and are switched by
[data-theme] on <html>. Dark is the default. Reduced-motion media query
neutralises animations.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Theme Composable + Cookie Persistence (TDD)

**Files:**
- Create: `composables/useTheme.ts`
- Create: `tests/unit/useTheme.spec.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create the Vitest config**

Create `O:/Projets/my_portfolio/vitest.config.ts`:

```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/unit/**/*.spec.ts'],
  },
})
```

Then install the Nuxt test utils helper:

```bash
cd O:/Projets/my_portfolio && pnpm add -D @nuxt/test-utils
```

- [ ] **Step 2: Write the failing test for `useTheme`**

Create `O:/Projets/my_portfolio/tests/unit/useTheme.spec.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

// We'll unit-test the pure resolver function and the cookie reader.
// Full integration is covered by an e2e smoke test in Task 10.

import { resolveTheme } from '../../composables/useTheme'

describe('resolveTheme', () => {
  it('returns dark when mode is dark', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('dark', true)).toBe('dark')
  })

  it('returns light when mode is light', () => {
    expect(resolveTheme('light', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
  })

  it('returns the system preference when mode is auto', () => {
    expect(resolveTheme('auto', true)).toBe('dark')
    expect(resolveTheme('auto', false)).toBe('light')
  })

  it('defaults to dark for any unknown mode', () => {
    // @ts-expect-error testing runtime fallback
    expect(resolveTheme('something', true)).toBe('dark')
    // @ts-expect-error
    expect(resolveTheme('something', false)).toBe('dark')
  })
})
```

Run: `pnpm test`
Expected: FAIL — `resolveTheme` is not exported yet.

- [ ] **Step 3: Implement `useTheme.ts`**

Create `O:/Projets/my_portfolio/composables/useTheme.ts`:

```ts
import type { ThemeMode, ResolvedTheme } from '~/types/theme'
import { THEME_COOKIE, THEME_DEFAULT } from '~/types/theme'

/**
 * Resolve a theme mode into a concrete light|dark choice.
 * Pure function — testable without a browser.
 */
export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  if (mode === 'auto') return prefersDark ? 'dark' : 'light'
  return 'dark'
}

/**
 * Composable: reactive theme state synced with a cookie and the DOM.
 *
 * - On first visit: cookie absent → mode = 'auto', resolved from prefers-color-scheme.
 * - User toggle: writes cookie + applies data-theme on <html>.
 * - SSR-safe: writes data-theme during render so there is no flash.
 */
export function useTheme() {
  const cookie = useCookie<ThemeMode>(THEME_COOKIE, {
    default: () => THEME_DEFAULT,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  const mode = computed<ThemeMode>({
    get: () => cookie.value || THEME_DEFAULT,
    set: (next) => { cookie.value = next },
  })

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  const resolved = computed<ResolvedTheme>(() => resolveTheme(mode.value, prefersDark.value))

  // Apply to <html> on the client whenever resolved changes
  if (import.meta.client) {
    watchEffect(() => {
      document.documentElement.setAttribute('data-theme', resolved.value)
    })
  }

  function setMode(next: ThemeMode) {
    mode.value = next
  }

  function cycle() {
    const order: ThemeMode[] = ['auto', 'light', 'dark']
    const i = order.indexOf(mode.value)
    setMode(order[(i + 1) % order.length])
  }

  return { mode, resolved, setMode, cycle }
}
```

- [ ] **Step 4: Verify the test passes**

Run: `pnpm test`
Expected: 4/4 pass.

- [ ] **Step 5: Add SSR-side theme application in `app.vue`**

Replace `O:/Projets/my_portfolio/app.vue` with:

```vue
<script setup lang="ts">
const { resolved } = useTheme()

useHead({
  htmlAttrs: {
    'data-theme': resolved,
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

This ensures `<html data-theme="...">` is set during SSR so the user never sees a flash of unstyled content.

- [ ] **Step 6: Commit theme composable**

```bash
cd O:/Projets/my_portfolio
git add composables/useTheme.ts tests/unit/useTheme.spec.ts vitest.config.ts package.json pnpm-lock.yaml app.vue
git commit -m "feat: useTheme composable with cookie persistence

resolveTheme() is a pure resolver covered by 4 unit tests. The composable
syncs a 'theme' cookie with <html data-theme>, honours
prefers-color-scheme on first visit, and applies the resolved theme
during SSR to prevent flash.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: ThemeToggle UI Component

**Files:**
- Create: `components/ui/ThemeToggle.vue`

- [ ] **Step 1: Implement the component**

Create `O:/Projets/my_portfolio/components/ui/ThemeToggle.vue`:

```vue
<script setup lang="ts">
const { mode, cycle } = useTheme()

const labels = {
  auto: 'Auto',
  light: 'Clair',
  dark: 'Sombre',
} as const

const ariaLabel = computed(() => `Thème : ${labels[mode.value]} — cliquer pour changer`)
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="ariaLabel"
    @click="cycle"
  >
    <span class="theme-toggle__icon" aria-hidden="true">
      <svg v-if="mode === 'dark'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg v-else-if="mode === 'light'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
      </svg>
    </span>
    <span class="theme-toggle__label">{{ labels[mode] }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-mute);
  background: transparent;
  transition: color 150ms, border-color 150ms;
}

.theme-toggle:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.theme-toggle__icon {
  display: inline-flex;
  color: var(--text-soft);
}

.theme-toggle:hover .theme-toggle__icon {
  color: var(--accent);
}
</style>
```

- [ ] **Step 2: Smoke-test in the browser**

Run `pnpm dev`. We can't see the toggle yet (no header) — we'll wire it up in Task 7. Just verify Nuxt auto-imports detect the component (no compile error in the terminal).

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/ui/ThemeToggle.vue
git commit -m "feat: ThemeToggle component (auto/light/dark cycle)

Mono pill matching the design system. SVG icons for each mode,
aria-label describes current state.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: LangToggle Placeholder Component

**Files:**
- Create: `components/ui/LangToggle.vue`

- [ ] **Step 1: Implement a placeholder that uses the Nuxt i18n composable**

Create `O:/Projets/my_portfolio/components/ui/LangToggle.vue`:

```vue
<script setup lang="ts">
// Plan 2 wires this fully to switchLocalePath. For Plan 1 we use the
// raw i18n composable so the UI is real but does nothing in routes
// that don't yet exist.
const { locale, locales, setLocale } = useI18n()

const otherLocale = computed(() => {
  return (locales.value as Array<{ code: string; name: string }>).find(l => l.code !== locale.value)
})
</script>

<template>
  <button
    v-if="otherLocale"
    type="button"
    class="lang-toggle"
    :aria-label="`Switch to ${otherLocale.name}`"
    @click="setLocale(otherLocale.code as 'fr' | 'en')"
  >
    <span :class="['lang-toggle__opt', { active: locale === 'fr' }]">FR</span>
    <span class="lang-toggle__sep">|</span>
    <span :class="['lang-toggle__opt', { active: locale === 'en' }]">EN</span>
  </button>
</template>

<style scoped>
.lang-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  background: transparent;
  color: var(--text-soft);
  transition: border-color 150ms, color 150ms;
}

.lang-toggle:hover {
  border-color: var(--border-strong);
}

.lang-toggle__opt.active {
  color: var(--text);
}

.lang-toggle__sep {
  color: var(--border-strong);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/ui/LangToggle.vue
git commit -m "feat: LangToggle placeholder (FR | EN pill)

Uses useI18n() so the component is wired to the real locale state from
day one. Plan 2 connects it to switchLocalePath when EN routes exist.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: SiteHeader Component

**Files:**
- Create: `components/site/SiteHeader.vue`

- [ ] **Step 1: Implement the header**

Create `O:/Projets/my_portfolio/components/site/SiteHeader.vue`:

```vue
<script setup lang="ts">
// Hardcoded availability copy for now. Plan 2 will move this into i18n strings.
const availabilityLabel = 'dispo Q3 2026'
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink to="/" class="site-header__brand">
        Rostel <em>Panoumassi</em>
      </NuxtLink>

      <nav class="site-header__nav" aria-label="Primary">
        <NuxtLink to="/work" class="site-header__link">Travaux</NuxtLink>
        <NuxtLink to="/about" class="site-header__link">Approche</NuxtLink>
        <span class="site-header__avail">
          <span class="site-header__dot" aria-hidden="true" />
          {{ availabilityLabel }}
        </span>
      </nav>

      <div class="site-header__actions">
        <LangToggle />
        <ThemeToggle />
        <NuxtLink to="/brief" class="site-header__cta">
          Démarrer un brief →
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in oklab, var(--bg) 92%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.site-header__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.site-header__brand {
  font-family: theme('fontFamily.display');
  font-size: 1rem;
  color: var(--text);
  text-decoration: none;
  white-space: nowrap;
}

.site-header__brand em {
  font-style: italic;
  color: var(--text-mute);
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex: 1;
}

.site-header__link {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-mute);
  text-decoration: none;
  transition: color 150ms;
}

.site-header__link:hover {
  color: var(--text);
}

.site-header__link.router-link-active {
  color: var(--text);
}

.site-header__avail {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--text-soft);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}

.site-header__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--available);
  display: inline-block;
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.site-header__cta {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--text);
  color: var(--bg);
  padding: 0.625rem 1rem;
  text-decoration: none;
  transition: opacity 150ms;
}

.site-header__cta:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .site-header__inner {
    flex-wrap: wrap;
    gap: 1rem;
  }
  .site-header__nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  .site-header__avail {
    margin-left: 0;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/site/SiteHeader.vue
git commit -m "feat: SiteHeader with brand, nav, availability, theme/lang toggles, CTA

Mono nav links, serif italic brand, green dot availability indicator,
sticky with subtle blur backdrop. CTA points to /brief which doesn't
exist yet — that's expected in Plan 1 (no broken UX, just a 404 on
click until Plan 3).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: SiteFooter Component

**Files:**
- Create: `components/site/SiteFooter.vue`

- [ ] **Step 1: Implement the footer**

Create `O:/Projets/my_portfolio/components/site/SiteFooter.vue`:

```vue
<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__col">
        <h3 class="site-footer__heading">Navigation</h3>
        <ul>
          <li><NuxtLink to="/">Accueil</NuxtLink></li>
          <li><NuxtLink to="/work">Travaux</NuxtLink></li>
          <li><NuxtLink to="/about">Approche</NuxtLink></li>
          <li><NuxtLink to="/brief">Démarrer un brief</NuxtLink></li>
        </ul>
      </div>

      <div class="site-footer__col">
        <h3 class="site-footer__heading">Contact</h3>
        <ul>
          <li><a href="mailto:rmissimawu@gmail.com">rmissimawu@gmail.com</a></li>
          <li><NuxtLink to="/contact">Page contact</NuxtLink></li>
          <li><a href="/cv.pdf" download>Télécharger CV</a></li>
        </ul>
      </div>

      <div class="site-footer__col">
        <h3 class="site-footer__heading">Ailleurs</h3>
        <ul>
          <li><a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href="https://github.com/ThommyShelby9" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
      </div>

      <div class="site-footer__col site-footer__col--legal">
        <h3 class="site-footer__heading">Légal</h3>
        <ul>
          <li><NuxtLink to="/legal">Mentions</NuxtLink></li>
          <li><NuxtLink to="/privacy">Confidentialité</NuxtLink></li>
        </ul>
      </div>
    </div>

    <div class="site-footer__bottom">
      <p class="site-footer__credit">
        Made in Cotonou · {{ year }}
      </p>
      <NuxtLink to="/terminal" class="site-footer__easter">
        $ ./terminal
      </NuxtLink>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  background: var(--bg);
  padding: 5rem 1.5rem 2.5rem;
  margin-top: 8rem;
}

.site-footer__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
}

@media (max-width: 768px) {
  .site-footer__inner {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

.site-footer__heading {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0 0 1rem;
  font-weight: 500;
}

.site-footer__col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.site-footer__col a {
  color: var(--text-mute);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 150ms;
}

.site-footer__col a:hover {
  color: var(--text);
}

.site-footer__bottom {
  max-width: theme('maxWidth.container');
  margin: 4rem auto 0;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  letter-spacing: 0.06em;
}

.site-footer__easter {
  color: var(--text-soft);
  text-decoration: none;
  transition: color 150ms;
}

.site-footer__easter:hover {
  color: var(--accent);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/site/SiteFooter.vue
git commit -m "feat: SiteFooter with 4 columns, credit line, terminal easter egg

The \$ ./terminal link in the bottom row is the canonical entry point
to /terminal. The page will be created in Plan 4; until then the link
404s — accepted in Plan 1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Default Layout + Index Page Smoke Test

**Files:**
- Create: `layouts/default.vue`
- Create: `pages/index.vue`

- [ ] **Step 1: Create the default layout**

Create `O:/Projets/my_portfolio/layouts/default.vue`:

```vue
<template>
  <div class="layout">
    <SiteHeader />
    <main class="layout__main">
      <slot />
    </main>
    <SiteFooter />
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

- [ ] **Step 2: Create a placeholder `pages/index.vue`**

Create `O:/Projets/my_portfolio/pages/index.vue`:

```vue
<script setup lang="ts">
useSeoMeta({
  title: 'Rostel Panoumassi — Lead Engineering',
  description: 'Je conçois et livre des produits logiciels fiables pour des équipes qui n\'ont pas le droit à l\'erreur.',
})
</script>

<template>
  <section class="hero">
    <div class="hero__inner">
      <p class="hero__kicker">v3.0 · cotonou, BJ</p>
      <h1 class="hero__title">
        Je conçois et livre des produits
        <em>logiciels fiables</em>
        pour des équipes qui n'ont pas le droit à l'erreur.
      </h1>
      <p class="hero__sub">
        Lead Engineering chez KPS Groupe. Disponible pour deux missions
        sélectionnées par trimestre — fintech, data, plateformes B2B.
      </p>
      <div class="hero__actions">
        <NuxtLink to="/brief" class="hero__cta-primary">Démarrer un projet →</NuxtLink>
        <NuxtLink to="/about" class="hero__cta-secondary">Lire mon approche</NuxtLink>
      </div>
      <p class="hero__meta">
        03 case studies — 5 années — 12 produits livrés
      </p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 8rem 1.5rem 6rem;
}

.hero__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.hero__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.hero__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 400;
  max-width: 18ch;
  margin: 2.5rem 0 0;
  color: var(--text);
}

.hero__title em {
  font-style: italic;
  color: var(--text-mute);
}

.hero__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-mute);
  max-width: 36rem;
  margin: 1.5rem 0 0;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.hero__cta-primary {
  background: var(--text);
  color: var(--bg);
  padding: 0.875rem 1.5rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  transition: opacity 150ms;
}

.hero__cta-primary:hover {
  opacity: 0.9;
}

.hero__cta-secondary {
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem;
  color: var(--text);
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
  text-decoration: none;
}

.hero__meta {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  margin: 6rem 0 0;
}
</style>
```

- [ ] **Step 3: Run dev server and visually verify**

```bash
cd O:/Projets/my_portfolio && pnpm dev
```

Expected:
- Page renders at http://localhost:3000
- Header shows brand "Rostel Panoumassi" (italic), "Travaux", "Approche", green dot + "dispo Q3 2026", FR|EN toggle, Auto theme toggle, "Démarrer un brief" CTA
- Hero shows "v3.0 · cotonou, BJ", a 3-line serif headline, sub-text, two CTAs, meta line
- Footer shows 4 columns + bottom row with "Made in Cotonou · 2026" and "$ ./terminal"
- Click "Auto" → cycles to "Clair" (light theme applies — beige background) → "Sombre" → back to "Auto"
- The light theme uses `#faf8f4` background, `#1a1a1a` text, accent `#0891b2`
- The dark theme uses `#0a0a0c` background, `#e8e6e1` text, accent `#00fff7`

Take a screenshot of both themes for the spec record (optional but nice).

- [ ] **Step 4: Run typecheck**

```bash
cd O:/Projets/my_portfolio && pnpm typecheck
```

Expected: 0 errors.

If errors appear: read them, fix the offending files (most likely missing `import type`s or wrong `useI18n` typing if Nuxt's auto-import didn't pick up).

- [ ] **Step 5: Run unit tests**

```bash
cd O:/Projets/my_portfolio && pnpm test --run
```

Expected: 4/4 pass (`useTheme.spec.ts`).

- [ ] **Step 6: Commit the layout + smoke page**

```bash
cd O:/Projets/my_portfolio
git add layouts/default.vue pages/index.vue
git commit -m "feat: default layout + index hero placeholder

Plan 1 closing commit. The index page renders a hero with the canonical
copy from the spec, all three font families load, and the dark/light
theme toggle works end-to-end. /work, /about, /brief, /contact, /terminal
will be created in plans 2-4 — clicking those links 404s for now (expected).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 7: Final Plan 1 verification — Lighthouse on the index page**

Manual step (requires Chrome DevTools or `lighthouse` CLI).

```bash
# Optional: with Chrome installed
pnpm dlx lighthouse http://localhost:3000 --view --preset=desktop
```

Expected (Plan 1 baseline):
- Performance: > 95 (it's basically a static page)
- Accessibility: 100 (semantic HTML, focus styles, aria-labels)
- Best Practices: > 95
- SEO: > 90 (will hit 100 after Plan 2 wires the SEO module fully per page)

If any score is below target, file the issue in `docs/superpowers/plans/notes-plan-1.md` for Plan 4 to address. Don't fix in Plan 1 unless it's a regression — Plan 1's job is foundation, not perfection.

---

## Plan 1 Complete

At this point:
- Repo is on branch `v3-redesign` with `legacy/terminal-spa/` archive
- Tag `v2-terminal-final` on main is the rollback anchor
- Nuxt 3 + 11 modules installed and configured
- Design tokens live in `tailwind.config.ts` + `assets/css/main.css`
- `useTheme()` + `ThemeToggle` work end-to-end
- `SiteHeader` + `SiteFooter` + default layout render correctly
- `pages/index.vue` shows a hero placeholder
- `pnpm dev`, `pnpm typecheck`, `pnpm test` all pass

Plan 2 (Content site) starts from this state.
