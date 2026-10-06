# Visionary Engineer, Lot 4 (conversion: brief, contact, Firestore, email, stats, legal) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the site convert: a project brief and a short contact form that work without JavaScript, store every submission in Firestore, alert Rostel by email, resist spam, count visits without cookies, and publish honest privacy and terms pages.

**Architecture:** Pure server modules in `src/lib/server/` (Firestore via `firebase-admin`, SMTP via Nodemailer, in-memory rate limiter, a `deliver()` orchestrator with the spec's fallback rules) are unit-tested with fakes. Forms are React Server Actions bound with `useActionState` (progressive enhancement: plain POST without JS, inline errors with JS) and redirect to a thank-you page. A tiny `HitBeacon` client component posts `{ path, ref }` with `navigator.sendBeacon` to a route handler that increments daily counters. The Firestore emulator backs e2e tests; production reads `FIREBASE_SERVICE_ACCOUNT`.

**Tech Stack:** Next.js 16.3.7 Server Actions + route handlers, React 19 `useActionState`, firebase-admin, nodemailer, Zod 4, Vitest, Playwright (+ Firebase emulator, Java 21 present).

**Spec:** `docs/superpowers/specs/2026-09-29-portfolio-v6-visionary-engineer-design.md` §4 (routes), §5.4 (forms, data, stats), §2 (rules), §7 (quality), §8 (tests).

## Global Constraints

- Firebase project **`rostel-portfolio-v6`**; Firestore `(default)` exists with deny-all client rules (already deployed). Credentials: `FIREBASE_SERVICE_ACCOUNT` (base64 JSON) + `FIREBASE_PROJECT_ID` in `.env.local` (gitignored, never print or commit). Emulator: `FIRESTORE_EMULATOR_HOST` + project id `demo-rostel-portfolio`.
- Collections: `submissions` (`{ type: 'brief' | 'contact', locale, payload, createdAt: serverTimestamp }`, no IP, no user agent) and `stats_daily/{YYYY-MM-DD}` (`total`, `paths.<key>`, `refs.<host>`, `countries.<CC>` only when `cf-ipcountry` exists). Path keys are encoded so they are valid field names (`/` → `~`, `.` → `_`, max 120 chars).
- Delivery order and fallbacks (spec §5.4): Firestore first, then email. Firestore fails → still email, log. Email fails after Firestore ok → success, log. Both fail → user-facing error inviting a direct email to `rmissimawu@gmail.com`. Email not configured (no SMTP env) counts as "email skipped", not failure.
- Anti-spam: honeypot field `nickname` (hidden, `tabindex=-1`, `autocomplete="off"`); filled → fake success, nothing stored. Rate limit 5 submissions per hour per IP (IP from `cf-connecting-ip`, `x-real-ip`, first `x-forwarded-for`), in memory, never persisted.
- No cookies anywhere; no third-party script. The beacon never blocks rendering and never throws.
- Budget: initial JS for `/` ≤ 160 KB gzip (currently 155.7 KB). The beacon must be tiny (no library). The form client code only loads on `/brief` and `/contact`.
- Owner rules: no em dash, FR `’`, rectangular controls (inputs, chips, buttons ≤ 2 px radius), champagne the only accent, `graphite` never for text, no emoji icons, visible focus, WCAG 2.2 AA (labels, `aria-describedby` for errors, `aria-live` region, error summary).
- Legal texts describe the real system (this plan's Task 5) and are flagged for the owner's review in the report.
- e2e: `PW_PORT=3111 pnpm test:e2e`; never kill the foreign process on port 3000.
- Never touch or stage `new.md`, `image*.png`, `3002/`, `.claude/`, `.env.local`.
- Next.js 16 docs in `node_modules/next/dist/docs/` (Server Actions, `redirect`, `headers()` is async, route handlers).
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. A visitor without JavaScript must be able to submit the brief and land on the thank-you page (and see errors when fields are invalid). Pinned in Tasks 3-4 (server action + `useActionState` permalink) and tested in Task 6.
2. A bot filling the honeypot gets a success page but nothing is stored or emailed. Pinned in Task 2 and tested in Tasks 2 and 6.
3. A sixth submission within the hour from the same IP is refused with a readable message. Pinned in Task 2, tested in Task 2.
4. Firestore down must not lose the request when email works, and both down must tell the visitor to write directly. Pinned in Task 2 (`deliver` with fakes).
5. The stats endpoint must answer 204 fast for anything (bad JSON, bots, huge paths) and never store an IP. Pinned in Task 5, tested in Tasks 5 and 6.

---

### Task 1: Server foundations (Firestore, mailer, rate limit, config)

**Files:** `src/lib/server/firestore.ts`, `src/lib/server/mailer.ts`, `src/lib/server/rate-limit.ts`, `src/lib/server/client-ip.ts`, `firebase.json`, `firestore.rules`, `.env.example`, `tests/unit/rate-limit.test.ts`, `tests/unit/client-ip.test.ts`; deps `firebase-admin`, `nodemailer`, `@types/nodemailer`.

**Interfaces:**
- `getDb(): Firestore | null` — returns a lazily initialised Admin Firestore when `FIRESTORE_EMULATOR_HOST` is set (projectId from `FIREBASE_PROJECT_ID` or `demo-rostel-portfolio`) or when `FIREBASE_SERVICE_ACCOUNT` decodes to valid JSON; otherwise `null`. Never throws at import time. Server-only.
- `sendMail({ subject, text, html?, replyTo? }): Promise<'sent' | 'skipped'>` — `'skipped'` when `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/`MAIL_TO` are missing; throws on transport errors. Default `MAIL_TO` falls back to `rmissimawu@gmail.com` only when SMTP is configured without it.
- `createRateLimiter({ limit, windowMs, now? })` → `{ check(key): { allowed: boolean; retryAfterMs: number } }` (sliding window, in memory, prunes old keys); `formLimiter` singleton `limit 5`, `windowMs 3_600_000`.
- `clientIp(headers: Headers): string` — `cf-connecting-ip` > `x-real-ip` > first of `x-forwarded-for` > `'unknown'`, trimmed, max 64 chars.
- `firebase.json`: `{ "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8085 }, "ui": { "enabled": false } } }`; `firestore.rules` = the deny-all rules already deployed (all reads/writes false).
- `.env.example` lists every env var with a comment, no values: `NEXT_PUBLIC_SITE_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`, `MAIL_FROM`.

**Tests:** rate limiter (5 allowed, 6th refused with retryAfter > 0, window slides with injected `now`, keys independent); `clientIp` precedence and trimming. TDD. `pnpm test`, `pnpm build` (the build must succeed without any Firebase env). Commit `feat(v6): server foundations for Firestore, SMTP and rate limiting`.

---

### Task 2: Form schemas and delivery orchestration

**Files:** `src/lib/forms/brief-schema.ts`, `src/lib/forms/contact-schema.ts`, `src/lib/server/deliver.ts`, `src/lib/server/submission-email.ts`, `tests/unit/forms.test.ts`, `tests/unit/deliver.test.ts`.

**Brief schema** (from the v5 schema, `git show v5-manifesto:server/utils/schemas/brief.ts`, adapted to Zod 4 and FormData): `projectType` enum `new | revamp | audit | spot | unsure`; `pitch` 10..1000 chars; `currentState` enum `idea | design | inProgressBlocked | mvpInProd | existingRevamp | auditOnly`; `teamSize` `solo | 2-5 | 6-15 | 15+`; `hasTechTeam`, `hasDesigner`, `hasProductOwner` booleans from checkboxes (`'on'` → true, absent → false); `notes` optional ≤ 2000; `deadline` `<1m | 1-3m | 3-6m | flexible`; `budget` `<5k | 5-15k | 15-40k | 40-100k | 100k+ | undefined` (labels in the UI state the currency EUR and an XOF equivalent is not required); `firstName`, `lastName` 1..80; `email` valid ≤ 200; `company` optional ≤ 120; `website` optional URL; `source` optional ≤ 200; `prefersCall` boolean; `locale` `fr | en`. Error messages are message keys (e.g. `errors.pitchTooShort`), not literal text, so FR/EN render from `messages`.
**Contact schema:** `name` 1..120, `email`, `message` 10..3000, `locale`.
Both: `parseForm(schema, formData)` returns `{ ok: true, data } | { ok: false, fieldErrors: Record<string, string[]>, values: Record<string, string> }` (values echoed back so the no-JS re-render keeps the input).

**`deliver({ type, locale, payload, ip, honeypot }, deps)`** where `deps = { save(sub): Promise<string>, mail(sub): Promise<'sent' | 'skipped'>, limiter, log }` (defaults wire Firestore + mailer + `formLimiter` + `console`): returns `{ status: 'ok' | 'rate-limited' | 'failed', stored: boolean, mailed: 'sent' | 'skipped' | 'failed' }`:
- honeypot non-empty → `{ status: 'ok', stored: false, mailed: 'skipped' }` and nothing called;
- limiter refuses → `'rate-limited'`;
- `getDb()` null → save counts as failed-soft (not configured): try mail;
- save throws → log, try mail; mail `'sent'` → ok; mail skipped/failed → `'failed'`;
- save ok → mail; mail throws → log, still `'ok'`.
`submission-email.ts` builds a readable plain-text + simple HTML email (subject `[Brief] <projectType> · <firstName> <lastName>` / `[Contact] <name>`, `replyTo` = the visitor's email; every value escaped in HTML).

**Tests:** all branches of `deliver` with fakes (including honeypot not calling anything, both-fail, Firestore-null + mail skipped = failed); schema happy paths and each error key; checkbox coercion; value echo. Commit `feat(v6): brief and contact schemas with Firestore-first delivery and fallbacks`.

---

### Task 3: `/brief` page and thank-you page

**Files:** `src/app/[locale]/brief/page.tsx`, `src/app/[locale]/brief/actions.ts` (`'use server'`), `src/app/[locale]/brief/merci/page.tsx`, `src/components/forms/{BriefForm.tsx (client), Field.tsx, ChoiceGroup.tsx, ErrorSummary.tsx, SubmitButton.tsx}`, `src/i18n/routing.ts` (`'/brief/merci': { fr: '/brief/merci', en: '/brief/thanks' }`), messages `brief.*`, `forms.*`, `errors.*` FR + EN.

**Behaviour:**
- Layout: page hero (kicker `Brief projet` / `Project brief`, h1 `Décrivez votre projet.` / `Tell me about your project.`, lede: "Quelques minutes suffisent. Je vous réponds sous 48 heures." / "A few minutes is enough. I reply within 48 hours."), then one form with four fieldsets (legend numbered like the home: `01 · Le projet`, `02 · Le contexte`, `03 · Le cadre`, `04 · Vous`), a honeypot, a submit button ("Envoyer le brief" / "Send the brief") and a note linking to `/confidentialite`.
- Choice groups are native radios/checkboxes styled as rectangular chips (focus ring champagne, checked = ivory background); every control has a visible label; required fields marked in text ("obligatoire" / "required"), not only with `*`.
- `BriefForm` uses `useActionState(submitBrief, initialState, permalink)` so it works without JS; with errors, it renders an `ErrorSummary` (links to fields, focus moves to it with JS) and per-field messages bound with `aria-describedby`; input values are kept.
- `submitBrief` (server action): read IP via `await headers()`, `parseForm`, `deliver`; `ok` → `redirect` to the localized `/brief/merci`; `rate-limited` → state with a form-level message; `failed` → form-level message with the direct email address.
- `/brief/merci`: h1 `Merci, votre brief est bien arrivé.` / `Thank you, your brief arrived.`, text "Je vous réponds sous 48 heures, à l’adresse que vous avez indiquée." + links back to the home and to `/realisations`. `noindex`.
- Both pages use `pageMetadata`; `/brief/merci` metadata adds `robots: { index: false }`.

Verify manually with and without JS against the emulator (see Task 6 for the emulator command) and commit `feat(v6): project brief with progressive enhancement and thank-you page`.

---

### Task 4: `/contact` page

**Files:** `src/app/[locale]/contact/page.tsx`, `src/app/[locale]/contact/actions.ts`, `src/app/[locale]/contact/merci/page.tsx`, `src/components/forms/ContactForm.tsx`, routing `'/contact/merci': { fr: '/contact/merci', en: '/contact/thanks' }`, messages `contact.*`.

**Behaviour:** two columns on desktop: left a short intro (h1 `Écrire directement.` / `Write directly.`, email as a mailto link, LinkedIn, GitHub, Cotonou UTC+1, "Pour un projet, le brief est plus rapide" with a link to `/brief`), right the short form (name, email, message, honeypot) with the same components, action and fallbacks as the brief; success → `/contact/merci` (noindex). Commit `feat(v6): contact page and form`.

---

### Task 5: Cookieless stats and legal pages

**Files:** `src/app/api/hit/route.ts`, `src/lib/server/stats.ts`, `src/components/site/HitBeacon.tsx` (client, mounted in the layout), `tests/unit/stats.test.ts`; `content/legal/{fr,en}/{confidentialite,cgu}.md` (FR files named `confidentialite.md`, `cgu.md`; EN files the same names), `src/app/[locale]/confidentialite/page.tsx`, `src/app/[locale]/cgu/page.tsx` (render with `renderMarkdown`, reuse the case-study prose styles), messages `legal.*`.

**Stats:**
- `stats.ts`: `encodeKey(path)`, `isBot(userAgent)` (common crawlers + headless markers), `refHost(ref, siteHost)` (external host only, else null), `recordHit({ path, ref, country, date }, db)` using `FieldValue.increment(1)` with `set(..., { merge: true })`.
- `route.ts` (`POST`): parse JSON safely (bad JSON → 204), ignore when `isBot`, when `path` does not start with `/` or is longer than 300 chars, or when the request is not same-origin (`origin`/`sec-fetch-site` checks); always return `new Response(null, { status: 204 })`; errors are logged, never returned. `export const dynamic = 'force-dynamic'`.
- `HitBeacon`: on mount and on pathname change, `navigator.sendBeacon('/api/hit', JSON.stringify({ path: location.pathname, ref: document.referrer }))`; nothing when `navigator.sendBeacon` is missing or when `document.visibilityState === 'prerender'`; no state, renders `null`. Check the budget stays ≤ 160 KB.
- Tests: key encoding, bot detection, ref host, route handler returns 204 for bad JSON / bot / long path (call the exported `POST` with a `Request`).

**Legal pages (texts to write, FR then EN, from the real system; flag for owner review):**
- Confidentialité / Privacy: controller Rostel Panoumassi, Cotonou, Bénin, contact `rmissimawu@gmail.com`; data collected only through the brief and contact forms (list the fields), purpose = answering the request and following up on it; legal basis = pre-contractual steps / legitimate interest; storage in Google Cloud Firestore (Firebase project hosted by Google, region as configured) and in Rostel’s mailbox; retention 24 months after the last exchange, then deletion; no cookies, no advertising or analytics trackers; anonymous daily page counts (page path, referring site, country when provided by the network), no IP address and no identifier stored; hosting on a private server administered by Rostel Panoumassi; rights (access, rectification, erasure, objection, portability) by email, and the right to complain to the APDP (Autorité de Protection des Données à caractère Personnel, Bénin) or, for visitors in the EU, their supervisory authority; last updated date.
- CGU / Terms: publisher, purpose of the site (presentation of Rostel Panoumassi’s work), intellectual property (content and code of the site; client products shown belong to their owners and are shown with their visuals as references; explorations are unsolicited proposals and are not endorsed by the brands concerned), no warranty on availability, external links, applicable law (Bénin) and courts of Cotonou, contact, last updated date.
- Both pages: `pageMetadata`, `h1`, table of contents from `headings`, no em dash.

Commit `feat(v6): cookieless visit counter, privacy policy and terms`.

---

### Task 6: e2e with the Firestore emulator

**Files:** `playwright.config.ts` (second `webServer` entry starting the emulator: `firebase emulators:start --only firestore --project demo-rostel-portfolio`, url `http://127.0.0.1:8085`, `reuseExistingServer: false`, timeout 120 s; the app server env gets `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` and `FIREBASE_PROJECT_ID=demo-rostel-portfolio` and no SMTP vars), `tests/e2e/forms.spec.ts`, `tests/e2e/helpers/emulator.ts` (read documents through the emulator REST API `http://127.0.0.1:8085/v1/projects/demo-rostel-portfolio/databases/(default)/documents/submissions`, and clear with `DELETE http://127.0.0.1:8085/emulator/v1/projects/demo-rostel-portfolio/databases/(default)/documents`).

**Tests:** brief with JS: fill every step, submit, land on `/brief/merci`, one `submissions` document with `type: 'brief'` and the pitch; brief without JS (`javaScriptEnabled: false`): submit invalid → errors rendered and values kept; submit valid → thank-you page; honeypot filled → thank-you page and no new document; contact FR and EN → thank-you pages (`/contact/merci`, `/en/contact/thanks`) and documents; `/api/hit` POST from the page context increments `stats_daily/<today>.total`; axe on `/brief`, `/contact`, `/confidentialite`, `/cgu` (reduced motion); 360 px no overflow on those pages; canonical coverage (the Lot 3 SEO spec) now includes these routes (sitemap updated in this task to add `/brief`, `/contact`, `/confidentialite`, `/cgu`, not the thank-you pages). Run the full suite, `pnpm lint:rules`. Commit `test(v6): forms, stats and legal e2e on the Firestore emulator`.

## Lot 4 done when

All suites pass; a brief and a contact message can be sent with and without JS in e2e; the privacy and terms pages exist and are linked from the footer; the owner-rules check and the JS budget pass.
