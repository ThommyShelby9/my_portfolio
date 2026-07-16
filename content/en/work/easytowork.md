---
slug: easytowork
title: A multi-brand HR platform for KPS Group
kicker: Issue 09 · Multi-brand · 2025
excerpt: Three brand sites (KPS Groupe, KPS Analytics, EasyToWork) sharing one Laravel email backend — training, applications, salary simulator.
year: 2025
order: 9
featured: false
client: KPS Group (internal)
sector: HR · Training · Showcase
role: Lead Engineering · Architecture
team: 2 devs · 1 designer
duration: 3 months
stack:
  - Laravel 12
  - Vue 3
  - TypeScript
  - Vite
  - TailwindCSS
  - jsPDF
cover: /images/easytowork.png
results:
  - value: "3"
    label: Brands on a single backend
  - value: "PDF"
    label: Client-side salary simulation export
  - value: "CORS"
    label: Handled at Nginx, no middleware
seoDescription: EasyToWork — KPS Group multi-brand platform. Laravel 12 (email API) + Vue 3 + Vite + Tailwind. Salary simulator, training, applications.
---

## The context

KPS Group operated three distinct brands: **KPS Groupe** (holding), **KPS Analytics** (data consulting), and **EasyToWork** (training and recruitment). Three separate WordPress sites, three contact forms emailing no one, three editorial teams stepping on each other.

The goal: **one email backend** consumed by all three sites, and **one modular Vue 3 frontend** serving each brand by route.

## The approach

- **Minimal Laravel 12 backend.** No heavy DB — just two models (`Contact`, `Newsletter`) in SQLite, plus a dozen `POST /send-email-*` routes that take a payload, validate it, format it, and dispatch via Nodemailer/SMTP.
- **Single Vue 3 + Vite + TailwindCSS frontend**, with a per-brand theme system (palette, logo, typography) switching by subdomain or path.
- **Client-side PDF generation** (`jsPDF`) for the salary simulator — no server round-trip for a simulation users want to keep.

## Notable technical decisions

- **CORS at Nginx level**, not in Laravel middleware. One `add_header Access-Control-Allow-*` per `location` block, no duplicated header risk.
- **Typed API routes by destination**:
  - `POST /send-email-kpsgroupe`
  - `POST /send-email-kpsanalytics`
  - `POST /send-email-ewt`
  - `POST /send-email-postulation` (CV attachment)
  - `POST /simulateur`
  - `POST /contact`
  - `POST /newsletter/subscribe` + `unsubscribe`
- **Pinia 3** for global state, **axios** for API calls.
- **lucide-vue-next** for icons.
- **No SSR.** Static Vite build, Nginx + Cloudflare hosting. SEO covered by manual prerendering of strategic pages.

## The salary simulator

The only real business module — converting gross to net using Benin's social-security and IRPP schedules, with PDF export.

100% client-side logic:
1. User input (gross salary, status, dependents)
2. Compute `formula(gross, params)` — yearly-versioned parameters in a static JSON
3. Display breakdown (contributions, taxes, net to pay)
4. `jsPDF.save()` — user keeps the simulation

If saving for commercial follow-up, an opt-in triggers `POST /simulateur` storing the context.

## What worked, what didn't

**Worked.** The ultra-minimal backend. 200 useful lines of code, two-week mission, deployed on a small VPS shared with other KPS apps. Near-zero maintenance since.

**Didn't.** The per-brand theme system stayed more rigid than wanted — adding a 4th brand means touching 4 places in code. Fine for three stable brands, wouldn't be for white-label.

## Take-away

For a showcase site, **the first question** isn't "which framework" but "what should the backend do". If the answer is "send emails and count three things", a minimal Laravel beats a Nuxt full-stack or Next.js with API routes. Less code, fewer bugs, less maintenance.
