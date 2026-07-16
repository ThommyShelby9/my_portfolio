---
slug: leconsultant
title: A B2B tender platform
kicker: Issue 07 · Laravel · B2B · 2023–2024
excerpt: Centralising Benin's public tenders, adding subscriptions, category-based alerts, and a training module.
year: 2024
order: 7
featured: false
client: LeConsultant
sector: B2B · Public procurement
role: Full-stack Developer
team: 2 devs · 1 PO
duration: 17 months (Aug 2023 — Dec 2024)
stack:
  - Laravel 8
  - PHP 8.2
  - Livewire 2
  - MySQL
  - Kkiapay
  - PayPlus
cover: /images/leconsultant.png
results:
  - value: "PP / Kkiapay"
    label: Two payment gateways integrated
  - value: "13"
    label: Business modules shipped
  - value: "PDF + QR"
    label: Signed subscription receipts
seoDescription: LeConsultant — Benin tender platform. Laravel 8 + Livewire, paid subscriptions, category alerts, Kkiapay & PayPlus integrations.
---

## The context

Benin's public tenders are published in official PDFs, hard to parse, scattered across three institutional sites with inconsistent naming. A B2B consultant who misses a tender by three days loses a month of revenue.

LeConsultant wanted to be the **single feed** of tenders for SMEs in Benin and West Africa, with a monthly subscription and category-based alerts.

## What I was asked

Maintain and grow the existing platform (Laravel 8 + Livewire), add paid subscriptions, integrate two payment gateways (Kkiapay and PayPlus), and industrialise the alert system.

## The approach

- **Keep Laravel 8.** No framework migration — the platform runs, bugs are rare, upgrading to 11 would have cost a month for zero visible feature.
- **Livewire 2 for the back-office.** Admin forms with server-side validation, no JavaScript. Non-dev editors update tenders without touching the front.
- **Two payment gateways in parallel.** Kkiapay is mature in CFA but doesn't cover all countries; PayPlus completes coverage. Every transaction goes through a unified `PaymentCallback`, the integration boils down to two drivers implementing the same interface.

## Notable technical decisions

- **Laravel Fortify + Sanctum** — Fortify for auth mechanics, Sanctum for mobile API tokens.
- **Webpack Mix + TailwindCSS** for assets. No Vite (Laravel 8 doesn't ship it natively), Mix is enough.
- **Barryvdh DomPDF** for subscription receipts, with QR verification (`simplesoftwareio/simple-qrcode`). Client scans, we validate authenticity server-side.
- **jcobhams/newsapi + serpapi** to auto-enrich service pages with contextual news.
- **fruitcake/laravel-cors** for the mobile API without exposing admin.
- **Alerts**: nightly scheduled task scanning new tenders, matching by category/type/region with subscriber preferences, triggering Blade-templated emails.
- **laravel-lang/lang** for FR/EN bilingual.
- **Ticket support module** to handle subscriber questions in-platform.

## What worked, what didn't

**Worked.** Dual Kkiapay + PayPlus payment. A subscriber whose Kkiapay payment fails (MTN Mobile Money flakes often) falls through to PayPlus in the same session — zero cart abandonment in 6 months.

**Didn't.** Tender-to-subscriber matching is regex on title + description, which misses naming variations ("CNHB" vs "Centre National des Œuvres Universitaires" for university markets). Documented as debt for a v2 with Elasticsearch — not implemented in mission.

## Take-away

On a mature Laravel, **Livewire is the best productivity compromise**: no JavaScript to write, consistent server-side validation, complex forms in two files. For a B2B product where the back-office is 60% of the code, it's unbeatable.

A Vue/React frontend only makes sense on the end-user side — not on admin.
