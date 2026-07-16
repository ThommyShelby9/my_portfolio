---
slug: ccns
title: An institutional website for a network of health centres
kicker: Issue 05 · Institutional · Healthcare · 2025
excerpt: Full rebuild of the CCNS website — content, accessibility, performance — for the Catholic Health Centres Network of Benin.
year: 2025
order: 5
featured: true
client: Conférence des Centres de Santé (CCNS)
sector: Healthcare · Institutional
role: Full-stack · Architecture · Content
team: 1 dev · 1 PO
duration: 8 weeks
stack:
  - Vue 3
  - Vite
  - TailwindCSS
  - Strapi
cover: /images/ccns.png
results:
  - value: "+240%"
    label: Organic traffic in 6 months
  - value: "8 / 8"
    label: Centres documented
  - value: "100%"
    label: SEO Lighthouse score
seoDescription: CCNS Benin rebuild — Vue 3 + Vite + Strapi, accessibility-first, SEO-optimised, 100/100 Lighthouse. Live at ccnsbenin.vercel.app.
---

## The context

The CCNS represents the network of eight Catholic health centres in Benin. Their previous site was a 2015 splash page with a PDF brochure and three email addresses — invisible on Google, unreadable on mobile, with no way for a patient to find the nearest centre.

The mandate: rebuild, and make sure a patient searching "centre de santé Cotonou" lands on the right centre in position one.

## The approach

Three priorities, in order:

1. **Accessibility before aesthetics.** WCAG 2 AA from the first iteration, contrasts verified, full keyboard navigation, visible focus everywhere.
2. **Performance as SEO proxy.** The 100/100 Lighthouse target wasn't vanity — Google rewards speed, and a patient on 3G in a rural area won't come back if the homepage takes 8 seconds.
3. **Content written with health-centre staff**, not by me. I ran two writing workshops with centre directors — they tell their story better than any copywriter.

## Notable technical decisions

- **Vue 3 + Vite** on the front. No SSR (Nuxt would have been overkill) — content rarely changes, so we statically build via `vite build` and deploy to Vercel.
- **TailwindCSS** strict — no third-party UI kit, minimal hand-rolled design system to keep the bundle tiny.
- **Strapi headless** on a small VPS — the PO can edit each of the eight centre pages, add news, manage media without calling us.
- **Images optimised at build** — every centre photo goes through sharp into `.avif` + `.webp` + `.jpg` fallback, full `srcset`. 70% weight reduction.
- **Schema.org `MedicalOrganization`** on every centre page — what got CCNS into Google's knowledge panel in under 3 months.
- **Leaflet interactive map** with clickable markers to each centre — the main usage of the site according to post-launch analytics.
- **Dynamic sitemap + robots.txt** served directly by Vite (`vite-plugin-sitemap`).

## What worked, what didn't

**Worked.** Accessibility-first forced a readable typography, solid contrasts, a clear hierarchy — which paradoxically made the design **more** polished than if we'd started from a mockup. Bonus: the site is usable on the old Android KaiOS phones that some rural staff carry.

**Didn't.** The first Strapi deploy on the client's VPS crashed three times in 48h — out of memory. We migrated Strapi to a managed Railway (€24/month) and kept the VPS for the media library only.

## Take-away

For a low-traffic, high-reputation institutional site, **perceived speed** matters more than any feature. A patient opening a centre page from WhatsApp must see the phone number and address in under a second — everything else is secondary.

We optimised for that moment, and the rest followed.
