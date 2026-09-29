---
title: EasyToWork
summary: "Three KPS Groupe brands served by one Vue 3 front end and a minimal Laravel back end, with a salary simulator that builds its PDF in the browser."
year: 2025
duration: "3 months"
role: "Lead engineer, architecture"
team: "2 developers, 1 designer"
coauthors: []
client: "KPS Groupe (in-house)"
sector: "HR, training, company websites"
stack: [Laravel 12, Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, jsPDF, Nginx]
status: live
liveUrl: https://easytowork.fr
featured: null
order: 13
images:
  - { src: /work/easytowork/01.webp, alt: "Easy To Work website", kind: public }
  - { src: /work/easytowork/02.webp, alt: "Live home page", kind: public }
proofs: []
seoDescription: "EasyToWork, the KPS Groupe multi-brand platform: Laravel 12 back end and Vue 3 front end, training, job applications and a salary simulator."
---

## The challenge

KPS Groupe runs three brands: KPS Groupe, KPS Analytics and EasyToWork. They had three separate sites, three contact forms whose messages reached nobody, and three editorial teams stepping on each other.

The goal: one email back end used by all three sites, and one Vue 3 front end that serves each brand depending on the address.

## Key features

- **One theme per brand** (palette, logo, typefaces), picked from the subdomain or the path.
- **Forms that actually arrive**: contact per brand, job applications with a CV attached, newsletter sign-up and unsubscribe.
- **A salary simulator**: gross-to-net conversion under Benin’s CNSS contributions and income tax, a breakdown of every deduction, then a PDF download.
- **Optional saving** of a simulation, with consent, for a sales follow-up.

## Constraints and decisions

- **A back end cut down to what is needed.** Two models (contacts and newsletter), about ten API routes typed by destination that validate, format and send. No heavy database, no business logic for its own sake: little to maintain, so little to break.
- **Salary maths in the browser.** The rate tables are versioned by year in a static file, and both the calculation and the PDF (jsPDF) run on the client. Users leave with their simulation without a round trip to the server.
- **CORS handled by Nginx.** Headers are set once, in the server configuration, not in application middleware. No duplicated headers, no routes answering differently from each other.
- **No server rendering.** A static Vite build served by Nginx behind Cloudflare, with the key pages prerendered for search engines.

## Outcome

The site is live at easytowork.fr, and the back end has needed very little maintenance since launch. One known limit: the theming system is rigid. Adding a fourth brand means touching several places in the code, which is fine for three stable brands but would not be for a white-label product.
