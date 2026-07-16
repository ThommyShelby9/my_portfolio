---
slug: planus
title: The corporate site of a pan-African IT consultancy
kicker: Issue 11 · Corporate · 2025
excerpt: Showcase + full back-office for Planus Analytics — content, recruitment, articles, resources, applications, users with 2FA.
year: 2025
order: 11
featured: false
client: Planus Analytics
sector: Corporate · IT Consulting
role: Full-stack · Front lead
team: 2 devs
duration: 6 weeks
stack:
  - Vue 3
  - Vite
  - Pinia
  - Bootstrap 5
  - TailwindCSS
  - Chart.js
cover: /images/planus.png
results:
  - value: "2FA"
    label: Admin auth with second factor
  - value: "11"
    label: Business admin views
  - value: "Map"
    label: Africa coverage zone with jsvectormap
seoDescription: Planus Analytics — corporate site + back-office Vue 3 + Bootstrap 5 + TailwindCSS. Recruitment, blog, resources, partners, applications.
---

## The context

Planus Analytics is a **pan-African IT consultancy** for integration and digital transformation. Before the rebuild: a WordPress showcase that no longer reflected the firm's maturity, and a recruitment pipeline tracked in a shared Trello. The mandate: a corporate site that sets the tone, **and an integrated admin back-office** to stop depending on external tools for recruitment.

## The approach

A single Vue 3 SPA holding the public site **and** the protected admin. No backend/frontend split for now — data lives in an existing shared Laravel backend, the frontend app consumes that API.

On UI, I assumed a **Bootstrap 5 + TailwindCSS mix** — Bootstrap for dense admin components (tables, modals, forms) that ship fast, Tailwind for the showcase where brand identity matters.

## Notable technical decisions

- **Vue 3.5 + Vue Router 4.5** on a Vite build (`rolldown-vite` variant) — significantly faster dev on this project.
- **Pinia 3** for state, **axios + JWT** in stores for auth.
- **TOTP 2FA** at admin via `TwoFactorVerification.vue` — admin never logs in without a second factor.
- **Chart.js 4 + jsvectormap** for the admin dashboard — applications per month + clickable Africa coverage map.
- **VeeValidate + Yup** on forms.
- **AOS** for scroll animations on the showcase.
- **dayjs** everywhere instead of moment — when 200 KB of savings matters.
- **Dual Oxlint + ESLint** — Oxlint fast for hot-reload, ESLint complete on pre-commit.
- **TypeScript ~5.8 + vue-tsc 3** strict.
- **Nixpacks deploy** on Coolify — no Dockerfile to maintain.

## The admin back-office

The client wanted to do everything from admin, without calling us. I shipped 11 business views: Dashboard, Articles (CRUD), Jobs (CRUD), Applications + Details, Resources, Partners, Users, Profile, Auth (Login, ForgotPassword, ResetPassword, TwoFactorVerification).

Every view follows the same skeleton: table, create/edit modal, soft-delete, audit.

## What worked, what didn't

**Worked.** The Bootstrap + Tailwind mix in the same project. Counter-intuitive on paper, complementary in practice: Bootstrap handles admin forms with zero CSS written, Tailwind gives the freedom the showcase needs.

**Didn't.** Express as prod dependency (for `vite preview` server) destabilised Nixpacks on first build. Three reverts later, we switched to `vite build` + managed Nginx.

## Take-away

For a consulting firm, **the admin back-office IS the internal product**. The showcase doesn't sell — what changes daily life is how efficiently the team processes applications and publishes content.

I spent 70% of the time on admin and 30% on showcase. The client confirmed the ratio at end-of-mission interview.
