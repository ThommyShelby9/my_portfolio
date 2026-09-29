---
title: Bénin Bouge
summary: "A redesign proposal for a Beninese digital media outlet: an immersive editorial experience, an interactive map of the departments and a proper preview for every shared article."
year: 2026
role: "Solo front-end design and development"
team: "Solo"
coauthors: []
sector: "Digital media"
stack: [Vue 3, TypeScript, Vite, vite-ssg, Pinia, GSAP, Tailwind CSS, Vitest, Docker, Nginx]
status: concept
featured: null
order: 1
images:
  - { src: /work/beninbouge/01.webp, alt: "Article page of the Bénin Bouge proposal", kind: public }
  - { src: /work/beninbouge/02.webp, alt: "News grid on the home page", kind: public }
  - { src: /work/beninbouge/03.webp, alt: "Interactive map of Benin departments", kind: public }
proofs: []
seoDescription: "Unsolicited redesign proposal for the Bénin Bouge media outlet: Vue 3, per-page static prerendering, interactive department map, GSAP motion."
---

Unsolicited redesign proposal, made to show what Bénin Bouge could become.

## The challenge

Bénin Bouge covers the Benin that is moving forward: technology, culture, business, sport, society. Its [current site](https://beninbouge.com) runs on a generic WordPress theme that gives the subject neither the scale nor the pace it deserves.

The proposal had two goals: reading that feels like a magazine rather than a blog, and articles that look right when shared, because WhatsApp and LinkedIn are where they travel.

## Key features

- **An editorial home page**: a lead story, trending stories, a news ticker, a newsletter sign-up.
- **An interactive map of the departments**, with a side panel showing each area’s projects and events.
- **A timeline by category**: technology, culture, business, sport, society.
- **The article page**, with a reading progress bar and related stories.
- **Pages by section, by region and by talent**, and in-browser search.
- **An animated opening** on load, built with GSAP.

## Constraints and decisions

- **Static prerendering for every page.** WhatsApp, LinkedIn and Slack crawlers do not run JavaScript: a single-page app shows them an empty shell. With vite-ssg, every article is generated as complete HTML, with its own title, description and share image.
- **Metadata as tested logic.** Titles, canonical links, Open Graph tags and JSON-LD structured data come from dedicated functions covered by unit tests, instead of being scattered across components.
- **Images and server tuned for mobile.** Scripts optimise images and generate the sitemap and share images; Nginx compresses and caches.
- **Fictional content, stated as such.** Articles, talents and regions come from demo data: the proposal shows a form, not an editorial line.

## Outcome

A complete working prototype, built solo, that shows the newsroom what the outlet could become: magazine-grade reading, a map that invites you to explore the country, and articles that share cleanly.
