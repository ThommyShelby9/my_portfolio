---
slug: bilalsekou
title: A one-page portfolio with integrated e-book sales
kicker: Issue 08 · Nuxt · Light e-commerce · 2025
excerpt: Bilal Sekou's brand site, communications strategist — with a Kkiapay payment funnel, promo codes, and sandbox/production toggle.
year: 2025
order: 8
featured: false
client: Sekou Bilal — Digital Marketer
sector: Portfolio · E-book
role: Solo · Design · Development
team: Solo
duration: 4 weeks
stack:
  - Nuxt 3
  - Vue 3
  - TypeScript
  - TailwindCSS
  - Kkiapay
  - Nodemailer
cover: /images/bilal_portfolio.png
results:
  - value: "XOF 7,800"
    label: Promo price, configurable via env
  - value: "100%"
    label: Mobile-first, native dark mode
  - value: "Webhook"
    label: Transaction verification + retry
seoDescription: Bilal Sekou portfolio with e-book sales — Nuxt 3, Vue 3, TypeScript, Kkiapay, auto payments, webhook + verification + transaction counting.
---

## The context

Bilal Sekou is a communications strategist working with African companies internationally. He needed **two things in a single site**: a credibility-building portfolio, and a sales funnel for an e-book sold at XOF 11,500 (or XOF 7,800 during promo).

No Stripe — the audience pays via Mobile Money, Kkiapay is the regional standard.

## The approach

A **one-page** site for the portfolio (hero, experience, skills, contact) + a dedicated `/ebook` route for the purchase funnel. Bilingual SEO FR/EN. Dark mode by default.

## Notable technical decisions

- **Nuxt 3 + Vue 3 + strict TypeScript.** SSR for SEO (Bilal is searched by name), prerendering of public pages.
- **Pinia** for cart state (one product but with configurable promo).
- **VeeValidate + Zod** on all forms.
- **Kkiapay JS SDK** integrated client-side — native SDK popup, Vue callback.
- **Nitro server API** (`server/api/`) for sensitive endpoints:
  - `POST /api/contact`
  - `POST /api/newsletter`
  - `POST /api/ebook/submit` — pre-create "pending" transaction
  - `GET /api/ebook/verify` — server-side verification (never trust client)
  - `POST /api/ebook/webhook` — Kkiapay webhook (auto-deliver PDF by email)
  - `POST /api/ebook/update-transaction`
  - `GET /api/ebook/count` — live count (promo code limit)
- **Nodemailer + SMTP Gmail** for delivering the e-book as attachment after validated payment.
- **`@nuxtjs/i18n`** `prefix_except_default` strategy.
- **vue-toast-notification** for purchase confirmations / errors.
- **Sandbox toggle** via `.env` — Kkiapay sandbox/prod without rebuild.

## The payment funnel (critical path)

```
[ Form ]
   → POST /api/ebook/submit  (Zod validation, create "pending" transaction)
   → Kkiapay SDK popup       (Mobile Money payment)
   → success callback        (frontend)
   → GET /api/ebook/verify   (server-side, verifies with Kkiapay)
   → if OK → /api/ebook/webhook delivers PDF by email
   → /ebook/success          (thank-you page)
```

Golden rule: **nothing is verified client-side**. The frontend receives Kkiapay's callback, but the server calls Kkiapay's API to confirm before delivering.

## What worked, what didn't

**Worked.** The `submit` / `verify` / `webhook` split avoided any double-delivery or ghost-delivery risk. Three months post-launch, zero disputes on 200+ purchases.

**Didn't.** Kkiapay's webhook occasionally fires twice for the same transaction (auto-retry on their side after network timeout). I had to add deduplication by `transaction_id` in the DB.

## Take-away

On a "small" project like a portfolio + e-book, **real complexity** isn't in design or content: it's in the payment mechanics. I spent a day on design and three on the funnel — that's the right ratio.
