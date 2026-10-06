# Portfolio V3 — Plan 3 : Brief Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/brief` skeleton from Plan 2 with the complete conversion funnel — a 4-step form with localStorage progress, client-side and server-side Zod validation, Cloudflare Turnstile anti-spam, rate-limited POST endpoint, MongoDB persistence via Mongoose, transactional SMTP email via Nodemailer (`noreply@rostelmissimawu.com`), optional Telegram bot notification, and a dedicated `/brief/confirmation` route.

**Architecture:**
- A single Zod schema (`server/utils/schemas/brief.ts`) is the source of truth, imported by both the client (for live UX feedback) and the server (for security validation).
- The form is orchestrated by `useBriefForm()` — a composable holding reactive state, localStorage persistence per step, and step navigation. Each step is a focused presentational component reading/writing into the same shared state.
- Server route `POST /api/brief` runs middleware → Zod validate → Turnstile verify → Mongo insert → SMTP send → Telegram notify → respond.
- Failures are explicit: 422 for validation, 403 for Turnstile, 429 for rate-limit, 500 for infra. The client surfaces field-level errors for 422 and a generic banner for the rest.
- The confirmation page is a real route (`/brief/confirmation`), not an inline state — so it survives refresh and is shareable.

**Tech Stack:** Nuxt 3 server routes (Nitro), Mongoose, Nodemailer, Zod, Cloudflare Turnstile, in-memory rate-limit (LRU), Vitest, Playwright.

**Reference spec:** `docs/superpowers/specs/2026-04-26-portfolio-redesign-design.md` — sections 4.5 (form anatomy), 6.3 (Mongo schema), 6.4 (submission flow).

**Prerequisites:** Plan 2 complete. `/brief` placeholder route exists. i18n strings already populated.

**Definition of done:**
- A user can fill the 4 steps, navigate forward and backward, see localStorage persist their answers across reloads
- Submitting a complete + valid brief inserts a document in MongoDB, sends an HTML email to `rmissimawu@gmail.com`, posts a Telegram notification (if configured), and redirects to `/brief/confirmation`
- All validation errors surface inline (per-field) in the matching step
- A second submission within an hour from the same IP returns 429 with a clear French/English message
- `/api/health` returns 200 with DB status
- Vitest covers Zod schema, rate-limit utility, and email body builder
- Playwright covers the happy path end-to-end (mocking SMTP/Mongo via env)
- `pnpm typecheck` clean

---

## File Structure

```
my_portfolio/
├─ server/
│   ├─ api/
│   │   ├─ brief.post.ts                  # main endpoint
│   │   └─ health.get.ts
│   ├─ middleware/
│   │   └─ rate-limit.ts                   # per-IP cap on /api/brief
│   └─ utils/
│       ├─ mongo.ts                        # mongoose lazy connection
│       ├─ mailer.ts                       # nodemailer SMTP
│       ├─ telegram.ts                     # bot notification
│       ├─ rate-limiter.ts                 # in-memory LRU per IP
│       ├─ brief-email.ts                  # HTML email body builder
│       └─ schemas/
│           └─ brief.ts                    # Zod schema (shared)
├─ models/
│   └─ Brief.ts                            # mongoose model
├─ composables/
│   └─ useBriefForm.ts                     # form state + localStorage
├─ components/
│   ├─ brief/
│   │   ├─ BriefForm.vue                   # orchestrator
│   │   ├─ BriefStep1Project.vue
│   │   ├─ BriefStep2Context.vue
│   │   ├─ BriefStep3Frame.vue
│   │   ├─ BriefStep4Identity.vue
│   │   ├─ BriefStepNav.vue                # back/next buttons + indicator
│   │   ├─ BriefField.vue                  # label + input + error wrapper
│   │   ├─ BriefRadio.vue                  # styled radio group
│   │   ├─ BriefCheckbox.vue               # styled checkbox
│   │   └─ BriefTurnstile.vue              # Cloudflare widget wrapper
├─ pages/
│   ├─ brief.vue                           # rewritten — hosts BriefForm
│   └─ brief/
│       └─ confirmation.vue                # post-submit landing
├─ types/
│   └─ brief.ts                            # TS types derived from Zod schema
└─ tests/
    ├─ unit/
    │   ├─ briefSchema.spec.ts
    │   ├─ rateLimiter.spec.ts
    │   └─ briefEmail.spec.ts
    └─ e2e/
        └─ brief.spec.ts
```

---

## Task 1: Install Backend Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Mongoose, Nodemailer, Zod, LRU cache**

```bash
cd O:/Projets/my_portfolio
pnpm add mongoose nodemailer zod lru-cache
pnpm add -D @types/nodemailer
```

Expected: 5 deps + 1 dev dep added. Verify in `package.json`.

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add package.json pnpm-lock.yaml
git commit -m "chore: install backend deps (mongoose, nodemailer, zod, lru-cache)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Zod Brief Schema (Shared Source of Truth) + Tests

**Files:**
- Create: `server/utils/schemas/brief.ts`
- Create: `types/brief.ts`
- Create: `tests/unit/briefSchema.spec.ts`

The schema mirrors the spec section 4.5 fields and section 6.3 Mongo shape.

- [ ] **Step 1: Write the failing tests**

Create `O:/Projets/my_portfolio/tests/unit/briefSchema.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { briefSchema } from '../../server/utils/schemas/brief'

const valid = {
  // Step 1
  projectType: 'new',
  pitch: 'Une plateforme de paiement B2B pour des PME africaines.',
  // Step 2
  currentState: 'idea',
  teamSize: 'solo',
  hasTechTeam: false,
  hasDesigner: false,
  hasProductOwner: false,
  notes: null,
  // Step 3
  deadline: '1-3m',
  budget: '15-40k',
  // Step 4
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  company: null,
  website: null,
  source: null,
  prefersCall: false,
  // Server-injected
  turnstileToken: 'fake-token',
  locale: 'fr' as const,
} as const

describe('briefSchema', () => {
  it('accepts a complete valid payload', () => {
    expect(() => briefSchema.parse(valid)).not.toThrow()
  })

  it('rejects an invalid email', () => {
    const r = briefSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues.some(i => i.path.includes('email'))).toBe(true)
    }
  })

  it('rejects an enum mismatch on projectType', () => {
    const r = briefSchema.safeParse({ ...valid, projectType: 'bogus' })
    expect(r.success).toBe(false)
  })

  it('rejects pitch over 500 chars', () => {
    const r = briefSchema.safeParse({ ...valid, pitch: 'x'.repeat(501) })
    expect(r.success).toBe(false)
  })

  it('rejects empty firstName', () => {
    const r = briefSchema.safeParse({ ...valid, firstName: '' })
    expect(r.success).toBe(false)
  })

  it('coerces undefined optional fields to null', () => {
    const r = briefSchema.parse({
      ...valid,
      company: undefined,
      website: undefined,
      source: undefined,
      notes: undefined,
    })
    expect(r.company).toBeNull()
    expect(r.website).toBeNull()
    expect(r.source).toBeNull()
    expect(r.notes).toBeNull()
  })

  it('rejects an obviously malformed website URL', () => {
    const r = briefSchema.safeParse({ ...valid, website: 'not a url' })
    expect(r.success).toBe(false)
  })
})
```

Run: `pnpm test --run tests/unit/briefSchema.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 2: Implement the schema**

Create `O:/Projets/my_portfolio/server/utils/schemas/brief.ts`:

```ts
import { z } from 'zod'

export const projectTypeEnum = z.enum(['new', 'revamp', 'audit', 'spot', 'unsure'])
export const currentStateEnum = z.enum([
  'idea',
  'design',
  'inProgressBlocked',
  'mvpInProd',
  'existingRevamp',
  'auditOnly',
])
export const teamSizeEnum = z.enum(['solo', '2-5', '6-15', '15+'])
export const deadlineEnum = z.enum(['<1m', '1-3m', '3-6m', 'flexible'])
export const budgetEnum = z.enum(['<5k', '5-15k', '15-40k', '40-100k', '100k+', 'undefined'])
export const localeEnum = z.enum(['fr', 'en'])

const optionalNullableString = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform(v => (v === undefined || v === '' ? null : v))

const optionalNullableUrl = z
  .union([z.string().url(), z.literal('')])
  .nullable()
  .optional()
  .transform(v => (v === undefined || v === '' ? null : v))

export const briefSchema = z.object({
  // Step 1
  projectType: projectTypeEnum,
  pitch: z.string().trim().min(10, 'Décris le projet en au moins 10 caractères').max(500),

  // Step 2
  currentState: currentStateEnum,
  teamSize: teamSizeEnum,
  hasTechTeam: z.boolean().default(false),
  hasDesigner: z.boolean().default(false),
  hasProductOwner: z.boolean().default(false),
  notes: optionalNullableString,

  // Step 3
  deadline: deadlineEnum,
  budget: budgetEnum,

  // Step 4
  firstName: z.string().trim().min(1, 'Prénom requis').max(80),
  lastName: z.string().trim().min(1, 'Nom requis').max(80),
  email: z.string().trim().email('Email invalide').max(200),
  company: optionalNullableString,
  website: optionalNullableUrl,
  source: optionalNullableString,
  prefersCall: z.boolean().default(false),

  // Server-checked
  turnstileToken: z.string().min(1, 'Captcha manquant'),
  locale: localeEnum.default('fr'),
})

export type BriefInput = z.infer<typeof briefSchema>
```

Create `O:/Projets/my_portfolio/types/brief.ts`:

```ts
export type {
  BriefInput,
} from '~/server/utils/schemas/brief'

export type BriefStep = 1 | 2 | 3 | 4
export const TOTAL_BRIEF_STEPS = 4 as const

export const BRIEF_LOCALSTORAGE_KEY = 'rostel_portfolio_brief_draft_v1'
```

- [ ] **Step 3: Verify tests pass**

Run: `pnpm test --run tests/unit/briefSchema.spec.ts`
Expected: 7/7 pass.

- [ ] **Step 4: Commit**

```bash
cd O:/Projets/my_portfolio
git add server/utils/schemas/brief.ts types/brief.ts tests/unit/briefSchema.spec.ts
git commit -m "feat: Zod brief schema + types

Single source of truth for client UX validation and server boundary.
7 tests cover happy path, enum mismatches, length bounds, optional
field normalization to null, URL validity.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Mongoose Connection Utility + `Brief` Model

**Files:**
- Create: `server/utils/mongo.ts`
- Create: `models/Brief.ts`

- [ ] **Step 1: Implement the lazy connection**

Create `O:/Projets/my_portfolio/server/utils/mongo.ts`:

```ts
import mongoose from 'mongoose'

type Cache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: Cache | undefined
}

const cache: Cache = globalThis.__mongooseCache ?? (globalThis.__mongooseCache = { conn: null, promise: null })

/**
 * Lazy, cached Mongoose connection.
 * - Reuses the same connection across hot reloads (Nitro dev) and across requests in prod.
 * - Throws clearly if MONGODB_URI is missing — fail-fast at first request.
 */
export async function connectMongo() {
  if (cache.conn) return cache.conn

  const uri = useRuntimeConfig().mongodbUri
  if (!uri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MONGODB_URI is not configured',
    })
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true)
    cache.promise = mongoose.connect(uri, {
      // No options needed for modern mongoose; defaults are sane.
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}

export async function isMongoHealthy(): Promise<boolean> {
  try {
    const conn = await connectMongo()
    return conn.connection.readyState === 1
  } catch {
    return false
  }
}
```

- [ ] **Step 2: Implement the `Brief` Mongoose model**

Create `O:/Projets/my_portfolio/models/Brief.ts`:

```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const briefSchema = new Schema(
  {
    // Step 1
    projectType: { type: String, required: true, enum: ['new', 'revamp', 'audit', 'spot', 'unsure'] },
    pitch: { type: String, required: true, maxlength: 500 },

    // Step 2
    currentState: {
      type: String,
      required: true,
      enum: ['idea', 'design', 'inProgressBlocked', 'mvpInProd', 'existingRevamp', 'auditOnly'],
    },
    teamSize: { type: String, required: true, enum: ['solo', '2-5', '6-15', '15+'] },
    hasTechTeam: { type: Boolean, default: false },
    hasDesigner: { type: Boolean, default: false },
    hasProductOwner: { type: Boolean, default: false },
    notes: { type: String, default: null },

    // Step 3
    deadline: { type: String, required: true, enum: ['<1m', '1-3m', '3-6m', 'flexible'] },
    budget: { type: String, required: true, enum: ['<5k', '5-15k', '15-40k', '40-100k', '100k+', 'undefined'] },

    // Step 4
    firstName: { type: String, required: true, maxlength: 80 },
    lastName: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 200 },
    company: { type: String, default: null },
    website: { type: String, default: null },
    source: { type: String, default: null },
    prefersCall: { type: Boolean, default: false },

    // Server-side metadata
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    locale: { type: String, default: 'fr', enum: ['fr', 'en'] },
    turnstileVerified: { type: Boolean, default: false },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

briefSchema.index({ createdAt: -1 })
briefSchema.index({ email: 1, createdAt: -1 })

export type BriefDoc = InferSchemaType<typeof briefSchema>

export const Brief = mongoose.models.Brief || mongoose.model('Brief', briefSchema)
```

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add server/utils/mongo.ts models/Brief.ts
git commit -m "feat: Mongoose connection utility + Brief model

Lazy global-cached connection survives Nitro hot reloads.
Brief schema mirrors spec 6.3 with indexes on createdAt and email.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: SMTP Mailer Utility + Email Body Builder

**Files:**
- Create: `server/utils/mailer.ts`
- Create: `server/utils/brief-email.ts`
- Create: `tests/unit/briefEmail.spec.ts`

- [ ] **Step 1: Write the failing test for the email body builder**

Create `O:/Projets/my_portfolio/tests/unit/briefEmail.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildBriefEmailHtml, buildBriefEmailText, buildBriefEmailSubject } from '../../server/utils/brief-email'
import type { BriefInput } from '../../server/utils/schemas/brief'

const sample: BriefInput = {
  projectType: 'new',
  pitch: 'A B2B fintech app for African SMEs.',
  currentState: 'idea',
  teamSize: 'solo',
  hasTechTeam: false,
  hasDesigner: false,
  hasProductOwner: false,
  notes: 'NDA required',
  deadline: '1-3m',
  budget: '15-40k',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  company: 'Acme Inc.',
  website: 'https://acme.example',
  source: 'LinkedIn',
  prefersCall: true,
  turnstileToken: 'tok',
  locale: 'fr',
}

describe('brief email builders', () => {
  it('subject contains name + sector hint + budget', () => {
    const s = buildBriefEmailSubject(sample)
    expect(s).toContain('Jane Doe')
    expect(s).toContain('15-40k')
  })

  it('html body contains all critical fields', () => {
    const html = buildBriefEmailHtml(sample)
    expect(html).toContain('Jane Doe')
    expect(html).toContain('jane@example.com')
    expect(html).toContain('A B2B fintech app for African SMEs.')
    expect(html).toContain('15-40k')
    expect(html).toContain('1-3m')
    expect(html).toContain('NDA required')
    expect(html).toContain('Acme Inc.')
    expect(html).toContain('LinkedIn')
    expect(html).toContain('prefers a call')
  })

  it('text fallback contains the same critical fields', () => {
    const txt = buildBriefEmailText(sample)
    expect(txt).toContain('Jane Doe')
    expect(txt).toContain('jane@example.com')
    expect(txt).toContain('15-40k')
  })

  it('handles null optional fields cleanly', () => {
    const minimal = { ...sample, company: null, website: null, source: null, notes: null, prefersCall: false }
    const html = buildBriefEmailHtml(minimal)
    expect(html).not.toContain('null')
    expect(html).not.toContain('undefined')
  })
})
```

Run: FAIL — module not found.

- [ ] **Step 2: Implement the email body builder**

Create `O:/Projets/my_portfolio/server/utils/brief-email.ts`:

```ts
import type { BriefInput } from './schemas/brief'

const PROJECT_TYPE_LABELS: Record<BriefInput['projectType'], string> = {
  new: 'Build from scratch',
  revamp: 'Revamp / refonte',
  audit: 'Technical audit',
  spot: 'Spot mission',
  unsure: 'Unsure — wants to discuss',
}

const STATE_LABELS: Record<BriefInput['currentState'], string> = {
  idea: 'Idea / paper spec',
  design: 'Mockup / design ready',
  inProgressBlocked: 'In progress, blocked',
  mvpInProd: 'MVP in production',
  existingRevamp: 'Existing product to revamp',
  auditOnly: 'No product, audit only',
}

const TEAM_LABELS: Record<BriefInput['teamSize'], string> = {
  solo: 'Solo',
  '2-5': '2 — 5 people',
  '6-15': '6 — 15 people',
  '15+': '15+ people',
}

const DEADLINE_LABELS: Record<BriefInput['deadline'], string> = {
  '<1m': 'Under 1 month',
  '1-3m': '1 — 3 months',
  '3-6m': '3 — 6 months',
  flexible: 'Flexible',
}

export function buildBriefEmailSubject(b: BriefInput): string {
  return `[BRIEF] ${b.firstName} ${b.lastName} — ${b.budget} — ${b.projectType}`
}

function row(label: string, value: string | null | boolean): string {
  if (value === null || value === undefined || value === '') return ''
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
  return `<tr>
    <td style="padding:8px 12px;color:#888;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;vertical-align:top;width:160px;">${label}</td>
    <td style="padding:8px 12px;color:#111;font-family:'Inter',sans-serif;font-size:14px;line-height:1.5;">${escapeHtml(display)}</td>
  </tr>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildBriefEmailHtml(b: BriefInput): string {
  const checks: string[] = []
  if (b.hasTechTeam) checks.push('Has tech team')
  if (b.hasDesigner) checks.push('Has designer')
  if (b.hasProductOwner) checks.push('Has PO')

  const callNote = b.prefersCall ? '<p style="margin:0 0 24px;padding:12px 16px;background:#f4f6fa;border-left:3px solid #0891b2;font-family:Inter,sans-serif;font-size:14px;color:#111;">⚡ This person <strong>prefers a call first</strong>.</p>' : ''

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#fafaf7;font-family:Inter,sans-serif;color:#111;">
  <div style="max-width:640px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e8e3d8;">
    <p style="margin:0 0 8px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#888;">New brief received</p>
    <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;line-height:1.2;font-weight:400;">${escapeHtml(b.firstName)} ${escapeHtml(b.lastName)}</h1>

    ${callNote}

    <h2 style="margin:24px 0 12px;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#444;">Project</h2>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8e3d8;">
      ${row('Type', PROJECT_TYPE_LABELS[b.projectType])}
      ${row('Pitch', b.pitch)}
    </table>

    <h2 style="margin:24px 0 12px;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#444;">Context</h2>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8e3d8;">
      ${row('Stage', STATE_LABELS[b.currentState])}
      ${row('Team size', TEAM_LABELS[b.teamSize])}
      ${row('Resources', checks.join(' · ') || 'None indicated')}
      ${row('Notes', b.notes)}
    </table>

    <h2 style="margin:24px 0 12px;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#444;">Frame</h2>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8e3d8;">
      ${row('Deadline', DEADLINE_LABELS[b.deadline])}
      ${row('Budget (EUR)', b.budget)}
    </table>

    <h2 style="margin:24px 0 12px;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#444;">Identity</h2>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e8e3d8;">
      ${row('Email', b.email)}
      ${row('Company', b.company)}
      ${row('Website', b.website)}
      ${row('Source', b.source)}
      ${row('Locale', b.locale.toUpperCase())}
    </table>

    <p style="margin:32px 0 0;font-family:'JetBrains Mono',monospace;font-size:11px;color:#888;">Reply directly to this email — it is set to reply-to ${escapeHtml(b.email)}.</p>
  </div>
</body>
</html>`
}

export function buildBriefEmailText(b: BriefInput): string {
  return `New brief received
====================

${b.firstName} ${b.lastName}
${b.email}${b.company ? ` — ${b.company}` : ''}${b.website ? ` — ${b.website}` : ''}

PROJECT
- Type: ${PROJECT_TYPE_LABELS[b.projectType]}
- Pitch: ${b.pitch}

CONTEXT
- Stage: ${STATE_LABELS[b.currentState]}
- Team size: ${TEAM_LABELS[b.teamSize]}
- Has tech team: ${b.hasTechTeam ? 'yes' : 'no'}
- Has designer: ${b.hasDesigner ? 'yes' : 'no'}
- Has PO: ${b.hasProductOwner ? 'yes' : 'no'}
${b.notes ? `- Notes: ${b.notes}` : ''}

FRAME
- Deadline: ${DEADLINE_LABELS[b.deadline]}
- Budget: ${b.budget}

EXTRA
- Source: ${b.source ?? 'not specified'}
- Locale: ${b.locale.toUpperCase()}
- Prefers a call: ${b.prefersCall ? 'YES' : 'no'}

Reply directly to this email — reply-to is set to ${b.email}.`
}
```

- [ ] **Step 3: Verify email tests pass**

Run: `pnpm test --run tests/unit/briefEmail.spec.ts`
Expected: 4/4 pass.

- [ ] **Step 4: Implement the SMTP mailer**

Create `O:/Projets/my_portfolio/server/utils/mailer.ts`:

```ts
import nodemailer, { type Transporter } from 'nodemailer'
import type { BriefInput } from './schemas/brief'
import {
  buildBriefEmailHtml,
  buildBriefEmailText,
  buildBriefEmailSubject,
} from './brief-email'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) return transporter
  const config = useRuntimeConfig()
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    throw new Error('SMTP credentials missing — set SMTP_HOST/USER/PASS')
  }
  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort) || 587,
    secure: Number(config.smtpPort) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  })
  return transporter
}

/**
 * Send the brief notification email.
 * Throws on infra failure (caller catches and decides whether to 5xx).
 */
export async function sendBriefEmail(brief: BriefInput): Promise<void> {
  const config = useRuntimeConfig()
  const t = getTransporter()
  await t.sendMail({
    from: { name: 'Rostel Portfolio', address: config.smtpFrom },
    to: config.notificationEmail,
    replyTo: brief.email,
    subject: buildBriefEmailSubject(brief),
    text: buildBriefEmailText(brief),
    html: buildBriefEmailHtml(brief),
  })
}
```

- [ ] **Step 5: Commit**

```bash
cd O:/Projets/my_portfolio
git add server/utils/mailer.ts server/utils/brief-email.ts tests/unit/briefEmail.spec.ts
git commit -m "feat: SMTP mailer + brief email builder

Email body has structured sections (Project, Context, Frame, Identity)
in editorial typography. Text fallback covers same fields. Reply-to
is set to the prospect's email so a single Reply lands in their inbox.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Telegram Notification Utility

**Files:**
- Create: `server/utils/telegram.ts`

- [ ] **Step 1: Implement (no-op when not configured)**

Create `O:/Projets/my_portfolio/server/utils/telegram.ts`:

```ts
import type { BriefInput } from './schemas/brief'

/**
 * Send a short Telegram notification. No-op if bot token or chat id is not configured.
 * Never throws — Telegram failure must not break the brief submission.
 */
export async function notifyTelegram(brief: BriefInput): Promise<void> {
  const config = useRuntimeConfig()
  const token = config.telegramBotToken
  const chatId = config.telegramChatId
  if (!token || !chatId) return

  const text =
    `🟢 *Brief reçu*\n` +
    `*${escape(brief.firstName)} ${escape(brief.lastName)}*\n` +
    `${escape(brief.email)}${brief.company ? ` — ${escape(brief.company)}` : ''}\n` +
    `Type: \`${brief.projectType}\` · Budget: \`${brief.budget}\` · Deadline: \`${brief.deadline}\`\n` +
    `${brief.prefersCall ? '⚡ Préfère un appel' : ''}`

  try {
    await $fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    })
  } catch (err) {
    // Log and swallow — primary notification (email) already happened.
    console.error('[telegram] failed to send notification', err)
  }
}

function escape(s: string): string {
  return s.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add server/utils/telegram.ts
git commit -m "feat: Telegram notification utility (no-op when unconfigured)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: In-Memory Rate Limiter (TDD)

**Files:**
- Create: `server/utils/rate-limiter.ts`
- Create: `tests/unit/rateLimiter.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `O:/Projets/my_portfolio/tests/unit/rateLimiter.spec.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRateLimiter } from '../../server/utils/rate-limiter'

describe('rate limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-26T10:00:00Z'))
  })

  it('allows up to N requests within the window', () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 })
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: true, remaining: 2 })
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: true, remaining: 1 })
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: true, remaining: 0 })
  })

  it('blocks the (N+1)-th request', () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 60_000 })
    limiter.check('2.2.2.2')
    limiter.check('2.2.2.2')
    const r = limiter.check('2.2.2.2')
    expect(r.allowed).toBe(false)
    expect(r.retryAfterMs).toBeGreaterThan(0)
  })

  it('resets after the window passes', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 })
    limiter.check('3.3.3.3')
    expect(limiter.check('3.3.3.3').allowed).toBe(false)
    vi.advanceTimersByTime(61_000)
    expect(limiter.check('3.3.3.3').allowed).toBe(true)
  })

  it('keeps separate counters per key', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 })
    expect(limiter.check('a').allowed).toBe(true)
    expect(limiter.check('a').allowed).toBe(false)
    expect(limiter.check('b').allowed).toBe(true)
  })
})
```

Run: FAIL — module not found.

- [ ] **Step 2: Implement**

Create `O:/Projets/my_portfolio/server/utils/rate-limiter.ts`:

```ts
import { LRUCache } from 'lru-cache'

type Bucket = { count: number; resetAt: number }
type Result = { allowed: boolean; remaining: number; retryAfterMs?: number }

export type RateLimiterOptions = {
  max: number
  windowMs: number
  cacheSize?: number
}

export function createRateLimiter(opts: RateLimiterOptions) {
  const cache = new LRUCache<string, Bucket>({
    max: opts.cacheSize ?? 5_000,
    ttl: opts.windowMs,
    updateAgeOnGet: false,
  })

  function check(key: string): Result {
    const now = Date.now()
    const bucket = cache.get(key)

    if (!bucket || bucket.resetAt <= now) {
      cache.set(key, { count: 1, resetAt: now + opts.windowMs })
      return { allowed: true, remaining: opts.max - 1 }
    }

    if (bucket.count >= opts.max) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: bucket.resetAt - now,
      }
    }

    bucket.count += 1
    cache.set(key, bucket)
    return { allowed: true, remaining: opts.max - bucket.count }
  }

  return { check }
}

// Singleton used by the brief endpoint: 5 submissions per hour per IP.
let briefLimiter: ReturnType<typeof createRateLimiter> | null = null
export function getBriefRateLimiter() {
  if (!briefLimiter) {
    briefLimiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 })
  }
  return briefLimiter
}
```

- [ ] **Step 3: Verify tests pass**

Run: `pnpm test --run tests/unit/rateLimiter.spec.ts`
Expected: 4/4 pass.

- [ ] **Step 4: Commit**

```bash
cd O:/Projets/my_portfolio
git add server/utils/rate-limiter.ts tests/unit/rateLimiter.spec.ts
git commit -m "feat: in-memory rate limiter (LRU-backed)

createRateLimiter() is a generic factory; getBriefRateLimiter() is the
shared singleton for /api/brief (5/h per IP). 4 tests cover allow,
block, reset, and per-key isolation.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: `/api/health` Endpoint (Coolify Healthcheck)

**Files:**
- Create: `server/api/health.get.ts`

- [ ] **Step 1: Implement**

Create `O:/Projets/my_portfolio/server/api/health.get.ts`:

```ts
import { isMongoHealthy } from '../utils/mongo'

export default defineEventHandler(async (event) => {
  const mongoOk = await isMongoHealthy()
  setResponseStatus(event, mongoOk ? 200 : 503)
  return {
    ok: mongoOk,
    timestamp: new Date().toISOString(),
    services: { mongo: mongoOk ? 'up' : 'down' },
  }
})
```

- [ ] **Step 2: Smoke-test**

```bash
cd O:/Projets/my_portfolio && pnpm dev
```

Then in another shell:

```bash
curl -i http://localhost:3000/api/health
```

Expected response (assuming MongoDB is running locally):

```
HTTP/1.1 200 OK
{"ok":true,"timestamp":"...","services":{"mongo":"up"}}
```

If Mongo is not running locally, the response is 503 with `mongo: down` — that is the correct behaviour.

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add server/api/health.get.ts
git commit -m "feat: /api/health endpoint with mongo readiness probe

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Turnstile Verification Helper

**Files:**
- Create: `server/utils/turnstile.ts`

- [ ] **Step 1: Implement**

Create `O:/Projets/my_portfolio/server/utils/turnstile.ts`:

```ts
type TurnstileResponse = {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

/**
 * Verify a Turnstile token with Cloudflare. Returns true on success.
 * In development mode, when TURNSTILE_SECRET_KEY is empty, this is a no-op
 * that returns true — handy for local testing without a Cloudflare account.
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const config = useRuntimeConfig()
  const secret = config.turnstileSecretKey

  // Dev escape hatch — never enable in production
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[turnstile] TURNSTILE_SECRET_KEY missing in production')
      return false
    }
    return true
  }

  try {
    const body = new URLSearchParams()
    body.append('secret', secret)
    body.append('response', token)
    if (ip) body.append('remoteip', ip)

    const res = await $fetch<TurnstileResponse>(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body,
      }
    )
    return res.success === true
  } catch (err) {
    console.error('[turnstile] verification request failed', err)
    return false
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add server/utils/turnstile.ts
git commit -m "feat: Cloudflare Turnstile verification helper

Returns true with no secret in dev (lets local devs proceed). In
production an empty secret is a hard fail.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: `/api/brief` POST Endpoint

**Files:**
- Create: `server/api/brief.post.ts`

- [ ] **Step 1: Implement the orchestration**

Create `O:/Projets/my_portfolio/server/api/brief.post.ts`:

```ts
import { briefSchema } from '../utils/schemas/brief'
import { connectMongo } from '../utils/mongo'
import { Brief } from '~/models/Brief'
import { verifyTurnstile } from '../utils/turnstile'
import { sendBriefEmail } from '../utils/mailer'
import { notifyTelegram } from '../utils/telegram'
import { getBriefRateLimiter } from '../utils/rate-limiter'

export default defineEventHandler(async (event) => {
  // ---- Rate limit ----
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const limiter = getBriefRateLimiter()
  const r = limiter.check(ip)
  if (!r.allowed) {
    setResponseHeader(event, 'Retry-After', Math.ceil((r.retryAfterMs ?? 0) / 1000).toString())
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: {
        message: 'Trop de soumissions depuis ton IP. Réessaye dans une heure.',
        message_en: 'Too many submissions from your IP. Try again in an hour.',
      },
    })
  }

  // ---- Read + validate body ----
  const raw = await readBody(event)
  const parsed = briefSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: {
        issues: parsed.error.issues.map(i => ({ path: i.path, message: i.message })),
      },
    })
  }
  const brief = parsed.data

  // ---- Turnstile ----
  const turnstileOk = await verifyTurnstile(brief.turnstileToken, ip)
  if (!turnstileOk) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Captcha verification failed',
      data: {
        message: 'Vérification anti-robot échouée. Recharge la page et réessaye.',
        message_en: 'Anti-bot verification failed. Reload the page and retry.',
      },
    })
  }

  // ---- Persist ----
  await connectMongo()
  const userAgent = getRequestHeader(event, 'user-agent') ?? null
  const doc = await Brief.create({
    ...brief,
    ip,
    userAgent,
    turnstileVerified: true,
  })

  // ---- Notify (email is required, telegram is best-effort) ----
  try {
    await sendBriefEmail(brief)
    await Brief.findByIdAndUpdate(doc._id, { notifiedAt: new Date() })
  } catch (err) {
    console.error('[brief] email failed', err)
    // Persist still succeeded — return success-with-warning so the user sees confirmation
    return {
      success: true,
      briefId: String(doc._id),
      warning: 'persisted_but_email_failed',
    }
  }

  // Telegram is fire-and-forget (already swallows errors internally)
  await notifyTelegram(brief)

  return {
    success: true,
    briefId: String(doc._id),
  }
})
```

- [ ] **Step 2: Local end-to-end smoke test**

Set up `.env`:

```bash
cd O:/Projets/my_portfolio
cp .env.example .env
```

Edit `.env` to point at your local MongoDB and a valid SMTP server (or use a service like Mailtrap for testing). Leave `TURNSTILE_SECRET_KEY` empty — the dev escape hatch will let requests through.

Run dev:

```bash
pnpm dev
```

In another shell:

```bash
curl -i -X POST http://localhost:3000/api/brief \
  -H 'Content-Type: application/json' \
  -d '{
    "projectType":"new",
    "pitch":"Test pitch for local smoke",
    "currentState":"idea",
    "teamSize":"solo",
    "hasTechTeam":false,
    "hasDesigner":false,
    "hasProductOwner":false,
    "deadline":"1-3m",
    "budget":"15-40k",
    "firstName":"Smoke",
    "lastName":"Test",
    "email":"smoke@test.local",
    "prefersCall":false,
    "turnstileToken":"local-dev",
    "locale":"fr"
  }'
```

Expected: `HTTP/1.1 200 OK` with `{"success":true,"briefId":"..."}`.

Verify in MongoDB shell:

```bash
mongosh portfolio --eval "db.briefs.find().sort({createdAt:-1}).limit(1).pretty()"
```

You should see the document with `turnstileVerified: true` and `notifiedAt` set if SMTP succeeded.

- [ ] **Step 3: Test the failure paths**

Validation failure:

```bash
curl -i -X POST http://localhost:3000/api/brief \
  -H 'Content-Type: application/json' \
  -d '{"projectType":"BOGUS"}'
```

Expected: 422 with `data.issues` listing field errors.

Rate-limit:

Run the success curl 5 times in quick succession, then a 6th:

Expected on the 6th: 429 with `Retry-After` header and the message.

- [ ] **Step 4: Commit**

```bash
cd O:/Projets/my_portfolio
git add server/api/brief.post.ts
git commit -m "feat: POST /api/brief — full submission pipeline

Pipeline: rate-limit → Zod → Turnstile → Mongo insert → SMTP send →
Telegram notify. Email failure is non-fatal (returns success with
warning). 422 surfaces field-level issues for the client.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: `useBriefForm` Composable (State + localStorage + Submission)

**Files:**
- Create: `composables/useBriefForm.ts`

- [ ] **Step 1: Implement**

Create `O:/Projets/my_portfolio/composables/useBriefForm.ts`:

```ts
import type { BriefInput } from '~/types/brief'
import { BRIEF_LOCALSTORAGE_KEY, TOTAL_BRIEF_STEPS, type BriefStep } from '~/types/brief'

type FormState = Omit<BriefInput, 'turnstileToken' | 'locale'>

type FieldErrors = Record<string, string>

const defaultState: FormState = {
  projectType: 'new',
  pitch: '',
  currentState: 'idea',
  teamSize: 'solo',
  hasTechTeam: false,
  hasDesigner: false,
  hasProductOwner: false,
  notes: null,
  deadline: 'flexible',
  budget: 'undefined',
  firstName: '',
  lastName: '',
  email: '',
  company: null,
  website: null,
  source: null,
  prefersCall: false,
}

export function useBriefForm() {
  const state = useState<FormState>('brief-form-state', () => ({ ...defaultState }))
  const step = useState<BriefStep>('brief-form-step', () => 1)
  const errors = useState<FieldErrors>('brief-form-errors', () => ({}))
  const submitting = useState<boolean>('brief-form-submitting', () => false)
  const submitError = useState<string | null>('brief-form-submit-error', () => null)
  const turnstileToken = useState<string | null>('brief-form-turnstile', () => null)

  // Hydrate from localStorage on the client
  if (import.meta.client) {
    onMounted(() => {
      const raw = localStorage.getItem(BRIEF_LOCALSTORAGE_KEY)
      if (raw) {
        try {
          const draft = JSON.parse(raw)
          if (draft && typeof draft === 'object') {
            state.value = { ...defaultState, ...draft.state }
            step.value = (draft.step as BriefStep) ?? 1
          }
        } catch {
          // corrupted draft — ignore
        }
      }
    })

    watch(
      [state, step],
      () => {
        try {
          localStorage.setItem(
            BRIEF_LOCALSTORAGE_KEY,
            JSON.stringify({ state: state.value, step: step.value })
          )
        } catch {
          /* private mode or quota */
        }
      },
      { deep: true }
    )
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    state.value[key] = value
    if (errors.value[key as string]) {
      delete errors.value[key as string]
      errors.value = { ...errors.value }
    }
  }

  function next() {
    if (step.value < TOTAL_BRIEF_STEPS) {
      step.value = (step.value + 1) as BriefStep
      if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function back() {
    if (step.value > 1) {
      step.value = (step.value - 1) as BriefStep
      if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function clearDraft() {
    if (import.meta.client) {
      localStorage.removeItem(BRIEF_LOCALSTORAGE_KEY)
    }
  }

  async function submit() {
    if (!turnstileToken.value) {
      submitError.value = 'Captcha non vérifié — merci de patienter quelques secondes.'
      return false
    }

    const { locale } = useI18n()

    submitting.value = true
    submitError.value = null
    errors.value = {}

    try {
      const res = await $fetch<{ success: boolean; briefId: string }>('/api/brief', {
        method: 'POST',
        body: {
          ...state.value,
          turnstileToken: turnstileToken.value,
          locale: locale.value,
        },
      })

      clearDraft()

      // Reset state in memory for next visit
      state.value = { ...defaultState }
      step.value = 1

      const localePath = useLocalePath()
      const target = localePath('/brief/confirmation')
      const query = state.value.prefersCall ? '?call=1' : ''
      await navigateTo(`${target}${query}`)

      return res
    } catch (err: any) {
      const status = err?.statusCode ?? err?.status ?? 0
      const data = err?.data?.data ?? err?.data ?? {}

      if (status === 422 && Array.isArray(data.issues)) {
        const map: FieldErrors = {}
        for (const issue of data.issues) {
          const key = (issue.path?.[0] ?? '') as string
          if (key && !map[key]) map[key] = issue.message
        }
        errors.value = map
        submitError.value = 'Corrige les champs surlignés.'
      } else if (status === 429) {
        submitError.value = data.message ?? 'Trop de soumissions, réessayez dans une heure.'
      } else if (status === 403) {
        submitError.value = data.message ?? 'Captcha invalide. Recharge la page.'
      } else {
        submitError.value = 'Une erreur s\'est produite. Écris-moi à rmissimawu@gmail.com.'
      }
      return false
    } finally {
      submitting.value = false
    }
  }

  return {
    state,
    step,
    errors,
    submitting,
    submitError,
    turnstileToken,
    setField,
    next,
    back,
    submit,
    clearDraft,
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add composables/useBriefForm.ts
git commit -m "feat: useBriefForm composable — state + localStorage + submit

State is shared via useState across the multi-step form components.
localStorage hydration on mount, persistence on every change. submit()
maps 422 issues to per-field errors and surfaces 429/403/5xx as a
top-of-form banner. Resets and redirects to /brief/confirmation on
success.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Reusable Form Primitives (`BriefField`, `BriefRadio`, `BriefCheckbox`, `BriefTurnstile`)

**Files:**
- Create: `components/brief/BriefField.vue`
- Create: `components/brief/BriefRadio.vue`
- Create: `components/brief/BriefCheckbox.vue`
- Create: `components/brief/BriefTurnstile.vue`
- Create: `components/brief/BriefStepNav.vue`

- [ ] **Step 1: `BriefField.vue`** — label + slot + error wrapper

Create `O:/Projets/my_portfolio/components/brief/BriefField.vue`:

```vue
<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  error?: string
  required?: boolean
  for?: string
}>()
</script>

<template>
  <div :class="['field', { 'field--error': error }]">
    <label v-if="label" :for="(props as any).for" class="field__label">
      {{ label }}<span v-if="required" class="field__required" aria-hidden="true"> *</span>
    </label>
    <p v-if="hint" class="field__hint">{{ hint }}</p>
    <slot />
    <p v-if="error" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 2rem;
}

.field__label {
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  color: var(--text);
  font-weight: 500;
}

.field__required {
  color: var(--accent);
}

.field__hint {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-soft);
  margin: 0;
  letter-spacing: 0.02em;
}

.field__error {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--error);
  margin: 0;
}

.field--error :deep(input),
.field--error :deep(textarea),
.field--error :deep(.brief-radio__option) {
  border-color: var(--error);
}
</style>
```

- [ ] **Step 2: `BriefRadio.vue`** — styled radio group

Create `O:/Projets/my_portfolio/components/brief/BriefRadio.vue`:

```vue
<script setup lang="ts" generic="T extends string">
const props = defineProps<{
  modelValue: T
  options: Array<{ value: T; label: string; hint?: string }>
  name: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

function pick(v: T) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="brief-radio" role="radiogroup">
    <label
      v-for="opt in options"
      :key="opt.value"
      :class="['brief-radio__option', { 'brief-radio__option--active': modelValue === opt.value }]"
    >
      <input
        type="radio"
        :name="name"
        :value="opt.value"
        :checked="modelValue === opt.value"
        class="brief-radio__input"
        @change="pick(opt.value)"
      />
      <span class="brief-radio__indicator" aria-hidden="true">
        <span class="brief-radio__dot" />
      </span>
      <span class="brief-radio__body">
        <span class="brief-radio__label">{{ opt.label }}</span>
        <span v-if="opt.hint" class="brief-radio__hint">{{ opt.hint }}</span>
      </span>
    </label>
  </div>
</template>

<style scoped>
.brief-radio {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.brief-radio__option {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
  border-radius: 4px;
}

.brief-radio__option:hover {
  border-color: var(--border-strong);
}

.brief-radio__option--active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.brief-radio__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.brief-radio__indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.125rem;
  background: var(--bg);
}

.brief-radio__option--active .brief-radio__indicator {
  border-color: var(--accent);
}

.brief-radio__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
}

.brief-radio__option--active .brief-radio__dot {
  background: var(--accent);
}

.brief-radio__body {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  font-family: theme('fontFamily.body');
}

.brief-radio__label {
  color: var(--text);
  font-size: 0.9375rem;
  line-height: 1.4;
}

.brief-radio__hint {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  letter-spacing: 0.02em;
}
</style>
```

- [ ] **Step 3: `BriefCheckbox.vue`**

Create `O:/Projets/my_portfolio/components/brief/BriefCheckbox.vue`:

```vue
<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label :class="['brief-checkbox', { 'brief-checkbox--active': modelValue }]">
    <input
      type="checkbox"
      :checked="modelValue"
      class="brief-checkbox__input"
      @change="emit('update:modelValue', !modelValue)"
    />
    <span class="brief-checkbox__box" aria-hidden="true">
      <svg v-if="modelValue" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" stroke-width="2" />
      </svg>
    </span>
    <span class="brief-checkbox__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.brief-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0;
  cursor: pointer;
  font-family: theme('fontFamily.body');
  color: var(--text-mute);
}

.brief-checkbox:hover {
  color: var(--text);
}

.brief-checkbox--active {
  color: var(--text);
}

.brief-checkbox__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.brief-checkbox__box {
  width: 18px;
  height: 18px;
  border: 1px solid var(--border-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--bg);
  background: var(--bg);
  border-radius: 3px;
  transition: background 150ms, border-color 150ms;
}

.brief-checkbox--active .brief-checkbox__box {
  background: var(--accent);
  border-color: var(--accent);
}

.brief-checkbox__label {
  font-size: 0.9375rem;
}
</style>
```

- [ ] **Step 4: `BriefTurnstile.vue`** — wraps the Cloudflare widget

Create `O:/Projets/my_portfolio/components/brief/BriefTurnstile.vue`:

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
const siteKey = config.public.turnstileSiteKey
const { locale } = useI18n()

const containerRef = ref<HTMLElement | null>(null)
const widgetId = ref<string | null>(null)

const emit = defineEmits<{ token: [string] }>()

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if ((window as any).turnstile) return Promise.resolve()
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-turnstile]')) {
      const wait = setInterval(() => {
        if ((window as any).turnstile) { clearInterval(wait); resolve() }
      }, 50)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.defer = true
    s.async = true
    s.dataset.turnstile = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  // If no site key, skip rendering — emit a dev placeholder token so the form is testable locally.
  if (!siteKey) {
    emit('token', 'local-dev')
    return
  }
  try {
    await loadScript()
    if (!containerRef.value) return
    widgetId.value = (window as any).turnstile.render(containerRef.value, {
      sitekey: siteKey,
      theme: 'auto',
      language: locale.value,
      callback: (token: string) => emit('token', token),
      'error-callback': () => emit('token', ''),
      'expired-callback': () => emit('token', ''),
    })
  } catch (err) {
    console.error('[turnstile widget]', err)
  }
})

onBeforeUnmount(() => {
  if (widgetId.value && (window as any).turnstile) {
    try { (window as any).turnstile.remove(widgetId.value) } catch { /* */ }
  }
})
</script>

<template>
  <div class="brief-turnstile">
    <div ref="containerRef" />
    <p v-if="!siteKey" class="brief-turnstile__dev">
      Dev mode — Turnstile désactivé (un token factice est envoyé).
    </p>
  </div>
</template>

<style scoped>
.brief-turnstile {
  margin: 1.5rem 0;
}

.brief-turnstile__dev {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  letter-spacing: 0.04em;
  margin: 0;
}
</style>
```

- [ ] **Step 5: `BriefStepNav.vue`** — step indicator + back/next buttons

Create `O:/Projets/my_portfolio/components/brief/BriefStepNav.vue`:

```vue
<script setup lang="ts">
import { TOTAL_BRIEF_STEPS } from '~/types/brief'

const { t } = useI18n()
const props = defineProps<{
  step: number
  canGoBack: boolean
  isLastStep: boolean
  submitting?: boolean
}>()
const emit = defineEmits<{ back: []; next: []; submit: [] }>()
</script>

<template>
  <div class="step-nav">
    <BriefStepIndicator :current="step" :total="TOTAL_BRIEF_STEPS" />

    <div class="step-nav__buttons">
      <button
        v-if="canGoBack"
        type="button"
        class="step-nav__back"
        :disabled="submitting"
        @click="emit('back')"
      >
        {{ t('brief.back') }}
      </button>
      <span v-else />

      <button
        v-if="!isLastStep"
        type="button"
        class="step-nav__next"
        @click="emit('next')"
      >
        {{ t('brief.next') }}
      </button>
      <button
        v-else
        type="button"
        class="step-nav__submit"
        :disabled="submitting"
        @click="emit('submit')"
      >
        {{ submitting ? '…' : t('brief.submit') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-nav {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 3rem;
}

.step-nav__buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-nav__back {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  background: transparent;
  color: var(--text-mute);
  border: 0;
  padding: 0.625rem 1rem;
  cursor: pointer;
}

.step-nav__back:hover { color: var(--text); }

.step-nav__next, .step-nav__submit {
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--text);
  color: var(--bg);
  border: 0;
  padding: 0.875rem 1.5rem;
  cursor: pointer;
  transition: opacity 150ms;
}

.step-nav__next:disabled, .step-nav__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 6: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/brief/BriefField.vue components/brief/BriefRadio.vue components/brief/BriefCheckbox.vue components/brief/BriefTurnstile.vue components/brief/BriefStepNav.vue
git commit -m "feat: brief form primitives (Field/Radio/Checkbox/Turnstile/StepNav)

All consume the design tokens. BriefTurnstile auto-emits a dev token
when no site key is configured. BriefStepNav handles the back/next/submit
button logic externally so steps stay focused on their fields.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Step Components (1 — Project, 2 — Context)

**Files:**
- Create: `components/brief/BriefStep1Project.vue`
- Create: `components/brief/BriefStep2Context.vue`

- [ ] **Step 1: `BriefStep1Project.vue`**

Create `O:/Projets/my_portfolio/components/brief/BriefStep1Project.vue`:

```vue
<script setup lang="ts">
const { t, locale } = useI18n()
const { state, errors, setField } = useBriefForm()

const projectOptions = computed(() => locale.value === 'en'
  ? [
      { value: 'new', label: 'Build a product from scratch' },
      { value: 'revamp', label: 'Improve / revamp an existing product' },
      { value: 'audit', label: 'Technical audit / second opinion' },
      { value: 'spot', label: 'Spot mission (integration, migration, perf)' },
      { value: 'unsure', label: 'Not sure yet — I want to discuss' },
    ]
  : [
      { value: 'new', label: 'Construire un produit depuis zéro' },
      { value: 'revamp', label: 'Améliorer / refondre un produit existant' },
      { value: 'audit', label: 'Audit technique / second avis architecture' },
      { value: 'spot', label: 'Mission ponctuelle (intégration, migration, perf)' },
      { value: 'unsure', label: 'Je ne sais pas encore — je veux discuter' },
    ]
)

const labels = computed(() => locale.value === 'en' ? {
  needsTitle: 'What does your project need?',
  pitchTitle: 'In one sentence, what is it?',
  pitchPlaceholder: 'A B2B payment platform for African SMEs',
} : {
  needsTitle: 'De quoi a besoin ton projet ?',
  pitchTitle: 'En une phrase, c\'est quoi ?',
  pitchPlaceholder: 'Une plateforme de paiement B2B pour des PME africaines',
})
</script>

<template>
  <section class="step">
    <BriefField :label="labels.needsTitle" required :error="errors.projectType">
      <BriefRadio
        :model-value="state.projectType"
        :options="(projectOptions as any)"
        name="projectType"
        @update:model-value="(v: any) => setField('projectType', v)"
      />
    </BriefField>

    <BriefField :label="labels.pitchTitle" required :error="errors.pitch">
      <textarea
        :value="state.pitch"
        :placeholder="labels.pitchPlaceholder"
        class="step__textarea"
        rows="3"
        maxlength="500"
        @input="(e) => setField('pitch', (e.target as HTMLTextAreaElement).value)"
      />
      <p class="step__counter">{{ state.pitch.length }} / 500</p>
    </BriefField>
  </section>
</template>

<style scoped>
.step__textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-overlay);
  color: var(--text);
  padding: 0.875rem 1rem;
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  border-radius: 4px;
  transition: border-color 150ms;
}

.step__textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.step__counter {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  margin: 0.5rem 0 0;
  text-align: right;
  letter-spacing: 0.04em;
}
</style>
```

- [ ] **Step 2: `BriefStep2Context.vue`**

Create `O:/Projets/my_portfolio/components/brief/BriefStep2Context.vue`:

```vue
<script setup lang="ts">
const { t, locale } = useI18n()
const { state, errors, setField } = useBriefForm()

const stateOptions = computed(() => locale.value === 'en'
  ? [
      { value: 'idea', label: 'Idea / paper spec' },
      { value: 'design', label: 'Mockup / design' },
      { value: 'inProgressBlocked', label: 'Code in progress, blocked' },
      { value: 'mvpInProd', label: 'MVP in prod, to scale' },
      { value: 'existingRevamp', label: 'Existing to revamp' },
      { value: 'auditOnly', label: 'No product, audit only' },
    ]
  : [
      { value: 'idea', label: 'Idée / spec papier' },
      { value: 'design', label: 'Maquette / design' },
      { value: 'inProgressBlocked', label: 'Code en cours mais bloqué' },
      { value: 'mvpInProd', label: 'MVP en prod, à scaler' },
      { value: 'existingRevamp', label: 'Existant à refondre' },
      { value: 'auditOnly', label: 'Pas de produit, audit pur' },
    ]
)

const teamOptions = computed(() => [
  { value: 'solo', label: 'Solo' },
  { value: '2-5', label: '2 — 5' },
  { value: '6-15', label: '6 — 15' },
  { value: '15+', label: '15+' },
])

const labels = computed(() => locale.value === 'en' ? {
  state: 'Where is it today?',
  team: 'Who is on the client side?',
  resources: 'Available resources',
  techTeam: 'A tech team already exists',
  designer: 'Designer available',
  po: 'Product Owner available',
  notes: 'Anything important to know? (optional)',
  notesHint: 'NDA, launch deadline, the previous dev disappeared, etc.',
} : {
  state: 'Où en est-il aujourd\'hui ?',
  team: 'Qui est dans l\'équipe côté client ?',
  resources: 'Ressources disponibles',
  techTeam: 'Une équipe tech existe déjà',
  designer: 'Designer dispo',
  po: 'Product Owner dispo',
  notes: 'Quelque chose d\'important à savoir ? (optionnel)',
  notesHint: 'NDA strict, lancement prévu en juin, le précédent dev a disparu, etc.',
})
</script>

<template>
  <section class="step">
    <BriefField :label="labels.state" required :error="errors.currentState">
      <BriefRadio
        :model-value="state.currentState"
        :options="(stateOptions as any)"
        name="currentState"
        @update:model-value="(v: any) => setField('currentState', v)"
      />
    </BriefField>

    <BriefField :label="labels.team" required :error="errors.teamSize">
      <BriefRadio
        :model-value="state.teamSize"
        :options="(teamOptions as any)"
        name="teamSize"
        @update:model-value="(v: any) => setField('teamSize', v)"
      />
    </BriefField>

    <BriefField :label="labels.resources">
      <div class="step__checks">
        <BriefCheckbox
          :model-value="state.hasTechTeam"
          :label="labels.techTeam"
          @update:model-value="(v: boolean) => setField('hasTechTeam', v)"
        />
        <BriefCheckbox
          :model-value="state.hasDesigner"
          :label="labels.designer"
          @update:model-value="(v: boolean) => setField('hasDesigner', v)"
        />
        <BriefCheckbox
          :model-value="state.hasProductOwner"
          :label="labels.po"
          @update:model-value="(v: boolean) => setField('hasProductOwner', v)"
        />
      </div>
    </BriefField>

    <BriefField :label="labels.notes" :hint="labels.notesHint">
      <textarea
        :value="state.notes ?? ''"
        class="step__textarea"
        rows="3"
        @input="(e) => setField('notes', ((e.target as HTMLTextAreaElement).value || null))"
      />
    </BriefField>
  </section>
</template>

<style scoped>
.step__textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-overlay);
  color: var(--text);
  padding: 0.875rem 1rem;
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  border-radius: 4px;
  transition: border-color 150ms;
}

.step__textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.step__checks {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/brief/BriefStep1Project.vue components/brief/BriefStep2Context.vue
git commit -m "feat: brief steps 1 (project) and 2 (context)

Both consume useBriefForm() shared state and locale-aware option lists.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Step Components (3 — Frame, 4 — Identity)

**Files:**
- Create: `components/brief/BriefStep3Frame.vue`
- Create: `components/brief/BriefStep4Identity.vue`

- [ ] **Step 1: `BriefStep3Frame.vue`**

Create `O:/Projets/my_portfolio/components/brief/BriefStep3Frame.vue`:

```vue
<script setup lang="ts">
const { locale } = useI18n()
const { state, errors, setField } = useBriefForm()

const deadlineOptions = computed(() => locale.value === 'en'
  ? [
      { value: '<1m', label: 'Under 1 month' },
      { value: '1-3m', label: '1 — 3 months' },
      { value: '3-6m', label: '3 — 6 months' },
      { value: 'flexible', label: 'Flexible' },
    ]
  : [
      { value: '<1m', label: '< 1 mois' },
      { value: '1-3m', label: '1 — 3 mois' },
      { value: '3-6m', label: '3 — 6 mois' },
      { value: 'flexible', label: 'Flexible' },
    ]
)

const budgetOptions = computed(() => locale.value === 'en'
  ? [
      { value: '<5k', label: '< 5k EUR', hint: 'Small spot mission' },
      { value: '5-15k', label: '5 — 15k EUR', hint: 'Module / short phase' },
      { value: '15-40k', label: '15 — 40k EUR', hint: 'Full project or revamp' },
      { value: '40-100k', label: '40 — 100k EUR', hint: 'Product or platform' },
      { value: '100k+', label: '100k+ EUR', hint: 'Long-term programme' },
      { value: 'undefined', label: 'Not yet defined', hint: 'Open to estimation' },
    ]
  : [
      { value: '<5k', label: '< 5k EUR', hint: 'petite mission ponctuelle' },
      { value: '5-15k', label: '5 — 15k EUR', hint: 'module / phase courte' },
      { value: '15-40k', label: '15 — 40k EUR', hint: 'projet complet ou refonte' },
      { value: '40-100k', label: '40 — 100k EUR', hint: 'produit ou plateforme' },
      { value: '100k+', label: '100k+ EUR', hint: 'programme long terme' },
      { value: 'undefined', label: 'Pas encore défini', hint: 'Ouvert à l\'estimation' },
    ]
)

const labels = computed(() => locale.value === 'en' ? {
  deadline: 'Wished delivery deadline',
  budget: 'Budget envisaged (EUR)',
  budgetHint: 'Indication, not a commitment. Used to check we are in the same reality.',
} : {
  deadline: 'Échéance souhaitée pour livrer',
  budget: 'Budget envisagé (EUR)',
  budgetHint: 'Indication, pas un engagement. Sert à vérifier qu\'on est dans la même réalité.',
})
</script>

<template>
  <section class="step">
    <BriefField :label="labels.deadline" required :error="errors.deadline">
      <BriefRadio
        :model-value="state.deadline"
        :options="(deadlineOptions as any)"
        name="deadline"
        @update:model-value="(v: any) => setField('deadline', v)"
      />
    </BriefField>

    <BriefField :label="labels.budget" required :error="errors.budget" :hint="labels.budgetHint">
      <BriefRadio
        :model-value="state.budget"
        :options="(budgetOptions as any)"
        name="budget"
        @update:model-value="(v: any) => setField('budget', v)"
      />
    </BriefField>
  </section>
</template>
```

- [ ] **Step 2: `BriefStep4Identity.vue`**

Create `O:/Projets/my_portfolio/components/brief/BriefStep4Identity.vue`:

```vue
<script setup lang="ts">
const { locale } = useI18n()
const { state, errors, setField, turnstileToken } = useBriefForm()

const labels = computed(() => locale.value === 'en' ? {
  firstName: 'First name', lastName: 'Last name', email: 'Email',
  company: 'Company (optional)', website: 'Website (optional)',
  source: 'How did you find this site? (optional)',
  prefersCall: 'I prefer a call first (Calendly opens after submit)',
  sourceOptions: ['', 'Google', 'LinkedIn', 'Referral', 'Other'],
} : {
  firstName: 'Prénom', lastName: 'Nom', email: 'Email',
  company: 'Entreprise (optionnel)', website: 'Site web (optionnel)',
  source: 'Comment as-tu trouvé ce site ? (optionnel)',
  prefersCall: 'Je préfère un appel d\'abord (Calendly s\'ouvre après envoi)',
  sourceOptions: ['', 'Google', 'LinkedIn', 'Recommandation', 'Autre'],
})

function onTurnstileToken(token: string) {
  turnstileToken.value = token
}
</script>

<template>
  <section class="step">
    <div class="step__row">
      <BriefField :label="labels.firstName" for="firstName" required :error="errors.firstName">
        <input
          id="firstName"
          type="text"
          autocomplete="given-name"
          class="step__input"
          :value="state.firstName"
          @input="(e) => setField('firstName', (e.target as HTMLInputElement).value)"
        />
      </BriefField>

      <BriefField :label="labels.lastName" for="lastName" required :error="errors.lastName">
        <input
          id="lastName"
          type="text"
          autocomplete="family-name"
          class="step__input"
          :value="state.lastName"
          @input="(e) => setField('lastName', (e.target as HTMLInputElement).value)"
        />
      </BriefField>
    </div>

    <BriefField :label="labels.email" for="email" required :error="errors.email">
      <input
        id="email"
        type="email"
        autocomplete="email"
        class="step__input"
        :value="state.email"
        @input="(e) => setField('email', (e.target as HTMLInputElement).value)"
      />
    </BriefField>

    <div class="step__row">
      <BriefField :label="labels.company" for="company">
        <input
          id="company"
          type="text"
          autocomplete="organization"
          class="step__input"
          :value="state.company ?? ''"
          @input="(e) => setField('company', ((e.target as HTMLInputElement).value || null))"
        />
      </BriefField>

      <BriefField :label="labels.website" for="website" :error="errors.website">
        <input
          id="website"
          type="url"
          autocomplete="url"
          class="step__input"
          placeholder="https://"
          :value="state.website ?? ''"
          @input="(e) => setField('website', ((e.target as HTMLInputElement).value || null))"
        />
      </BriefField>
    </div>

    <BriefField :label="labels.source" for="source">
      <select
        id="source"
        class="step__input"
        :value="state.source ?? ''"
        @change="(e) => setField('source', ((e.target as HTMLSelectElement).value || null))"
      >
        <option v-for="o in labels.sourceOptions" :key="o" :value="o">{{ o }}</option>
      </select>
    </BriefField>

    <BriefField label="">
      <BriefCheckbox
        :model-value="state.prefersCall"
        :label="labels.prefersCall"
        @update:model-value="(v: boolean) => setField('prefersCall', v)"
      />
    </BriefField>

    <BriefTurnstile @token="onTurnstileToken" />
  </section>
</template>

<style scoped>
.step__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .step__row { grid-template-columns: 1fr; }
}

.step__input {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-overlay);
  color: var(--text);
  padding: 0.75rem 1rem;
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.4;
  border-radius: 4px;
  transition: border-color 150ms;
}

.step__input:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
```

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/brief/BriefStep3Frame.vue components/brief/BriefStep4Identity.vue
git commit -m "feat: brief steps 3 (frame) and 4 (identity + turnstile)

Step 4 wires the Turnstile token via the BriefTurnstile component into
the shared state. Source select uses locale-specific labels.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: `BriefForm` Orchestrator + Rewritten `/brief`

**Files:**
- Create: `components/brief/BriefForm.vue`
- Modify: `pages/brief.vue`

- [ ] **Step 1: Implement the orchestrator**

Create `O:/Projets/my_portfolio/components/brief/BriefForm.vue`:

```vue
<script setup lang="ts">
import { TOTAL_BRIEF_STEPS } from '~/types/brief'

const { step, submitting, submitError, next, back, submit } = useBriefForm()
</script>

<template>
  <form class="brief-form" @submit.prevent="submit">
    <transition name="step" mode="out-in">
      <BriefStep1Project v-if="step === 1" key="step-1" />
      <BriefStep2Context v-else-if="step === 2" key="step-2" />
      <BriefStep3Frame v-else-if="step === 3" key="step-3" />
      <BriefStep4Identity v-else key="step-4" />
    </transition>

    <p v-if="submitError" class="brief-form__error" role="alert">
      {{ submitError }}
    </p>

    <BriefStepNav
      :step="step"
      :can-go-back="step > 1"
      :is-last-step="step === TOTAL_BRIEF_STEPS"
      :submitting="submitting"
      @back="back"
      @next="next"
      @submit="submit"
    />
  </form>
</template>

<style scoped>
.brief-form {
  display: flex;
  flex-direction: column;
}

.brief-form__error {
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  color: var(--error);
  background: color-mix(in oklab, var(--error) 12%, transparent);
  border: 1px solid color-mix(in oklab, var(--error) 30%, transparent);
  padding: 0.875rem 1rem;
  border-radius: 4px;
  margin: 1.5rem 0 0;
  letter-spacing: 0.02em;
}

.step-enter-active, .step-leave-active {
  transition: opacity 200ms, transform 200ms;
}
.step-enter-from { opacity: 0; transform: translateX(8px); }
.step-leave-to { opacity: 0; transform: translateX(-8px); }
</style>
```

- [ ] **Step 2: Rewrite `pages/brief.vue` to host the form**

Replace `O:/Projets/my_portfolio/pages/brief.vue` content with:

```vue
<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => `${t('brief.title')} — ${t('site.name')}`,
  description: () => t('brief.sub'),
})
</script>

<template>
  <article class="brief">
    <header class="brief__header">
      <h1 class="brief__title">{{ t('brief.title') }}</h1>
      <p class="brief__sub">{{ t('brief.sub') }}</p>
    </header>

    <BriefForm />
  </article>
</template>

<style scoped>
.brief {
  padding: 6rem 1.5rem;
  max-width: theme('maxWidth.reading');
  margin: 0 auto;
}

.brief__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 4rem;
}

.brief__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  font-weight: 400;
  margin: 0;
}

.brief__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--text-mute);
  margin: 0;
}
</style>
```

- [ ] **Step 3: Smoke-test the full flow**

`pnpm dev` → http://localhost:3000/brief :
- Step 1 visible, fill `projectType` + pitch (10+ chars), click Continuer
- Step 2 visible, fill, Continuer
- Step 3 visible, fill, Continuer
- Step 4 visible, fill name + email, Turnstile placeholder shows dev token immediately
- Click "Envoyer le brief →" — request goes to `/api/brief`, returns 200, redirected to `/brief/confirmation`
- Reload `/brief` → Step 1 appears with all fields cleared (because `clearDraft()` ran)

If the form submits before all steps are filled (e.g. invalid email): error appears under that field, banner says "Corrige les champs surlignés."

- [ ] **Step 4: Commit**

```bash
cd O:/Projets/my_portfolio
git add components/brief/BriefForm.vue pages/brief.vue
git commit -m "feat: BriefForm orchestrator + rewritten /brief page

Animated step transitions, error banner, navigation wired through
useBriefForm. Hosts the 4 step components.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: `/brief/confirmation` Page

**Files:**
- Create: `pages/brief/confirmation.vue`

- [ ] **Step 1: Implement**

Create `O:/Projets/my_portfolio/pages/brief/confirmation.vue`:

```vue
<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const wantsCall = computed(() => route.query.call === '1')

useSeoMeta({
  title: () => locale.value === 'en' ? 'Brief received — Rostel Panoumassi' : 'Brief reçu — Rostel Panoumassi',
  description: () => locale.value === 'en'
    ? 'Your brief is on its way. You will get a personal reply within 48 business hours.'
    : 'Ton brief est en route. Tu auras une réponse personnalisée sous 48h ouvrées.',
  robots: 'noindex',
})

definePageMeta({ layout: 'default' })

const calendlyUrl = 'https://calendly.com/rostelpanoumassi'

const labels = computed(() => locale.value === 'en' ? {
  kicker: '/ confirmation',
  title: 'Brief received.',
  body1: 'You will get a personal reply within 48 business hours.',
  body2: 'If I am not the right match, I will tell you in the same email — and recommend someone if I can.',
  callTitle: 'You asked for a call first',
  callBody: 'You can book directly here:',
  bookCall: 'Book a 30-min call',
  back: '← View case studies',
  urgency: 'In a hurry?',
  email: 'rmissimawu@gmail.com',
} : {
  kicker: '/ confirmation',
  title: 'Brief reçu.',
  body1: 'Tu auras une réponse personnalisée sous 48h ouvrées.',
  body2: 'Si je ne suis pas le bon match, je te le dirai dans le même mail — et je te recommanderai quelqu\'un si je peux.',
  callTitle: 'Tu as demandé un appel d\'abord',
  callBody: 'Tu peux réserver directement ici :',
  bookCall: 'Réserver un appel de 30 min',
  back: '← Voir les case studies',
  urgency: 'En urgence ?',
  email: 'rmissimawu@gmail.com',
})
</script>

<template>
  <article class="confirmation">
    <p class="confirmation__kicker">{{ labels.kicker }}</p>

    <h1 class="confirmation__title">{{ labels.title }}</h1>
    <p class="confirmation__body">{{ labels.body1 }}</p>
    <p class="confirmation__body">{{ labels.body2 }}</p>

    <div v-if="wantsCall" class="confirmation__call">
      <h2 class="confirmation__call-title">{{ labels.callTitle }}</h2>
      <p class="confirmation__body">{{ labels.callBody }}</p>
      <a :href="calendlyUrl" target="_blank" rel="noopener noreferrer" class="confirmation__cta">
        → {{ labels.bookCall }}
      </a>
    </div>

    <hr class="confirmation__rule" />

    <div class="confirmation__after">
      <NuxtLink :to="localePath('/work')" class="confirmation__link">
        {{ labels.back }}
      </NuxtLink>
      <p class="confirmation__urgency">
        {{ labels.urgency }} <a :href="`mailto:${labels.email}`">{{ labels.email }}</a>
      </p>
    </div>
  </article>
</template>

<style scoped>
.confirmation {
  padding: 8rem 1.5rem;
  max-width: theme('maxWidth.reading');
  margin: 0 auto;
}

.confirmation__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.confirmation__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  font-weight: 400;
  margin: 1.5rem 0 2rem;
  color: var(--text);
}

.confirmation__body {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0 0 1rem;
  max-width: 36rem;
}

.confirmation__call {
  margin: 3rem 0 2rem;
  padding: 2rem;
  background: var(--accent-soft);
  border-left: 2px solid var(--accent);
  border-radius: 0 4px 4px 0;
}

.confirmation__call-title {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 400;
  margin: 0 0 0.75rem;
  color: var(--text);
}

.confirmation__cta {
  display: inline-block;
  margin-top: 1rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--text);
  border-bottom: 1px solid var(--accent);
  padding-bottom: 4px;
  text-decoration: none;
  letter-spacing: 0.04em;
}

.confirmation__rule {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 4rem 0 2rem;
}

.confirmation__after {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.confirmation__link {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--text-mute);
  text-decoration: none;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
}

.confirmation__link:hover { color: var(--text); }

.confirmation__urgency {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-soft);
  margin: 0;
}

.confirmation__urgency a {
  color: var(--text-mute);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
cd O:/Projets/my_portfolio
git add pages/brief/confirmation.vue
git commit -m "feat: /brief/confirmation page

Calendly inline section appears when ?call=1. SEO: noindex (don't
let confirmation pages get indexed).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: E2E — Brief Funnel Happy Path

**Files:**
- Create: `tests/e2e/brief.spec.ts`

The full submission would hit Mongo + SMTP. We mock the API by intercepting the POST and returning a fake 200 — that exercises the entire client flow without external dependencies.

- [ ] **Step 1: Write the spec**

Create `O:/Projets/my_portfolio/tests/e2e/brief.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('Brief funnel', () => {
  test('happy path: 4 steps → confirmation', async ({ page }) => {
    // Intercept the API to avoid hitting Mongo / SMTP from CI
    await page.route('**/api/brief', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, briefId: 'test-id' }),
      })
    })

    await page.goto('/brief')
    await expect(page.locator('h1')).toContainText('Démarrer un brief')

    // ---- Step 1 ----
    await page.locator('text=Construire un produit depuis zéro').click()
    await page.locator('textarea').fill('Une plateforme de paiement B2B pour PME africaines.')
    await page.locator('text=Continuer →').click()

    // ---- Step 2 ----
    await page.locator('text=Idée / spec papier').click()
    await page.locator('text=Solo').click()
    await page.locator('text=Continuer →').click()

    // ---- Step 3 ----
    await page.locator('text=1 — 3 mois').click()
    await page.locator('label:has-text("15 — 40k EUR")').click()
    await page.locator('text=Continuer →').click()

    // ---- Step 4 ----
    await page.fill('input[autocomplete="given-name"]', 'Jane')
    await page.fill('input[autocomplete="family-name"]', 'Doe')
    await page.fill('input[type="email"]', 'jane@example.com')

    // Wait for the dev-mode Turnstile token to be emitted (BriefTurnstile auto-emits on mount)
    await page.waitForTimeout(150)

    await page.locator('text=Envoyer le brief →').click()

    // ---- Confirmation ----
    await expect(page).toHaveURL(/\/brief\/confirmation/)
    await expect(page.locator('h1')).toContainText('Brief reçu')
  })

  test('back navigation preserves answers from step 1', async ({ page }) => {
    await page.goto('/brief')
    await page.locator('text=Audit technique').click()
    await page.locator('textarea').fill('Audit de l\'architecture existante pour un fintech.')
    await page.locator('text=Continuer →').click()

    // Now on step 2, go back
    await page.locator('text=← Retour').click()
    await expect(page.locator('textarea')).toHaveValue('Audit de l\'architecture existante pour un fintech.')
  })

  test('localStorage draft survives reload', async ({ page }) => {
    await page.goto('/brief')
    await page.locator('text=Refondre').click()
    await page.locator('textarea').fill('Refonte du produit existant pour scaler 10x.')

    // Reload — draft should be hydrated from localStorage
    await page.reload()
    await expect(page.locator('textarea')).toHaveValue('Refonte du produit existant pour scaler 10x.')
  })

  test('422 validation surfaces inline error', async ({ page }) => {
    await page.route('**/api/brief', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { issues: [{ path: ['email'], message: 'Email invalide' }] },
        }),
      })
    })

    await page.goto('/brief')
    // Fast-forward through 4 steps with valid stub data
    await page.locator('text=Construire un produit depuis zéro').click()
    await page.locator('textarea').fill('A fake project that should validate up to step 4.')
    await page.locator('text=Continuer →').click()
    await page.locator('text=Idée / spec papier').click()
    await page.locator('text=Solo').click()
    await page.locator('text=Continuer →').click()
    await page.locator('text=1 — 3 mois').click()
    await page.locator('label:has-text("15 — 40k EUR")').click()
    await page.locator('text=Continuer →').click()
    await page.fill('input[autocomplete="given-name"]', 'Jane')
    await page.fill('input[autocomplete="family-name"]', 'Doe')
    await page.fill('input[type="email"]', 'invalid')
    await page.waitForTimeout(150)
    await page.locator('text=Envoyer le brief →').click()

    await expect(page.locator('text=Email invalide')).toBeVisible()
    await expect(page.locator('text=Corrige les champs surlignés.')).toBeVisible()
  })
})
```

- [ ] **Step 2: Run e2e**

```bash
cd O:/Projets/my_portfolio && pnpm test:e2e
```

Expected: 4/4 brief tests pass + the 6 navigation tests from Plan 2 still pass = 10/10 total.

- [ ] **Step 3: Commit**

```bash
cd O:/Projets/my_portfolio
git add tests/e2e/brief.spec.ts
git commit -m "test: e2e brief funnel happy path + back nav + draft + 422

4 tests: complete 4-step flow, back preserves answers, localStorage
draft survives reload, 422 surfaces inline field error. API is mocked
via page.route to avoid Mongo/SMTP dependencies in CI.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 17: Final Plan 3 Verification

- [ ] **Step 1: Typecheck + unit + e2e**

```bash
cd O:/Projets/my_portfolio && pnpm typecheck && pnpm test --run && pnpm test:e2e
```

Expected: all green.

- [ ] **Step 2: Manual end-to-end with real Mongo + SMTP**

If you have local MongoDB running and a working SMTP (e.g., Mailtrap):

```bash
pnpm dev
```

Open http://localhost:3000/brief, fill all 4 steps with real data, submit. Then:

```bash
mongosh portfolio --eval "db.briefs.find().sort({createdAt:-1}).limit(1).pretty()"
```

Confirm:
- Document inserted with all fields
- `notifiedAt` is populated → email was sent
- `turnstileVerified: true` (dev mode bypasses)
- Email landed in your test inbox

- [ ] **Step 3: Closing commit**

```bash
cd O:/Projets/my_portfolio
git commit --allow-empty -m "milestone: Plan 3 complete — brief funnel live

Full 4-step funnel: Zod schema, Mongoose persistence, SMTP email,
Telegram notification, Turnstile, rate limiting. Confirmation page
ships separately for shareability. 10/10 e2e + 15/15 unit tests pass.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Plan 3 Complete

State at end of Plan 3:
- `/brief` shows a 4-step form, with localStorage persistence and animated step transitions
- Submission goes through `/api/brief`, validated by Zod, captcha-checked by Turnstile, persisted in MongoDB, emailed to `rmissimawu@gmail.com` via SMTP, and (optionally) Telegram-notified
- `/brief/confirmation` is a real route with `noindex`, and offers Calendly embedding when `?call=1` is set
- Rate limit caps abuse at 5 submissions per hour per IP
- All flows covered by Vitest unit tests (Zod schema, rate limiter, email builder) and Playwright e2e tests (happy path, back nav, draft persistence, 422)

Plan 4 (Terminal migration + SEO + Deploy) starts from this state.
