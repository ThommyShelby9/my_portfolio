---
title: Gounou
summary: "A website proposal for a chocolate brand made in Benin: a scroll-driven story where the cacao pod opens and becomes a bar, from the Beninese bean to ordering on WhatsApp."
year: 2026
role: "Solo design, art direction of the visuals and development"
team: "Solo"
coauthors: []
sector: "Food, chocolate"
stack: [JavaScript, Vite, GSAP, ScrollTrigger, Lenis, Canvas, Three.js, Docker, Nginx]
genes: [product, innovation]
status: concept
featured: null
order: 0
images:
  - { src: /work/gounou/01.webp, alt: "Gounou proposal home: the cacao pod and the headline “Benin has cacao”", kind: public }
  - { src: /work/gounou/02.webp, alt: "The chocolate bar snapping as the page scrolls", kind: public }
  - { src: /work/gounou/03.webp, alt: "The range: dark bar, cacao and cashew spread, snack bar and gift box", kind: public }
proofs: []
seoDescription: "Unsolicited website proposal for Gounou, chocolate made in Benin: a scroll-driven story, a canvas image sequence driven by scroll, GSAP and Lenis."
---

Unsolicited website proposal, made to show what Gounou could become.

[See the demo](https://gounou.rostelmissimawu.com)

## The challenge

Gounou makes chocolate in Benin, from bean to bar, up to a dark bar sold in Europe and a cacao and cashew spread. Its former website no longer responds, so a brand that wants to export has no shop window.

The idea fits in one image: as the visitor scrolls, the cacao pod opens, the beans fly out, the bar takes shape and snaps. The product tells its story before a single paragraph.

## Key features

- **A scroll-driven sequence**: a short video cut into frames and replayed on a canvas as the page scrolls, with headlines timed to the key moments (the opening, the beans, the snap).
- **From bean to bar**: the pod, sun drying, roasting and the workshop, in sections that “develop” as they appear.
- **The range** as cards, in a carousel driven by scroll.
- **An isometric map of Cotonou** with sales points, and ordering on WhatsApp.

## Constraints and decisions

- **Illustrative visuals, stated as such.** The photographs and the hero video are AI-generated for the demo; the real site would use the brand's own photos. A note in the footer says so.
- **A sequence that stays light.** Around a hundred WebP frames, preloaded progressively: the first ones first, the rest in the background, with a still fallback on slow connections and when the user asks for reduced motion.
- **No layout shift.** Every image declares its dimensions, ships in several sizes and loads lazily.

## Outcome

A live demo in French and English, built solo in a day from the brand's public story, to show it a shop window that matches its product. The real site would need a product photo shoot and the actual list of sales points.
