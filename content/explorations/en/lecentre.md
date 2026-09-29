---
title: Le Centre
summary: "A redesign proposal for a cultural venue in Benin, grounded in a measured audit of the current site: one unified calendar, a readable collection and a site that stays light on mobile."
year: 2026
role: "Solo audit, design and development"
team: "Solo"
coauthors: []
sector: "Culture, museum"
stack: [Vue 3, TypeScript, Vite, WebGL, Docker, Nginx]
status: concept
featured: null
order: 2
images:
  - { src: /work/lecentre/01.webp, alt: "Le Centre proposal home page", kind: public }
  - { src: /work/lecentre/02.webp, alt: "Collection page of the Le Centre proposal", kind: public }
proofs: []
seoDescription: "Unsolicited redesign proposal for the Espace Culturel Le Centre: an audit of the current site, a unified calendar, an indexable collection, Vue 3 and WebGL."
---

Unsolicited redesign proposal, made to show what Le Centre could become.

## The challenge

The Espace Culturel Le Centre, in Lobozounkpa (Abomey-Calavi), houses a museum devoted to the récade, the carved sceptre of the Dahomey kings, runs film nights, talks and live arts, and hosts artist residencies. Its [current site](https://lecentre-benin.com) does not do the place justice.

I started with an audit, observed and measured. Photographs are served uncompressed and unresized, so one visit to the home page takes a real bite out of a mobile data plan. The HTML holds two complete copies of the site, one for desktop and one for mobile, and the browser downloads both. Zoom is blocked on mobile. The programme is split across nine sections with no calendar. The collection notes are locked inside a lightbox, invisible to Google and to screen readers. And there is no English version, although the venue hosts international residencies.

The prototype reuses the real content of the current site (texts, notes, programme, photographs) to show what it becomes with a different treatment.

## Key features

- **One unified calendar**: the nine sections become filters over a single feed, grouped by month, with upcoming and past events. A residency lasting several weeks is marked “ongoing” instead of being treated like a dated event.
- **One page per récade**, titled with its name in Fon, with the French translation and a structured record: origin, materials, workshop, dimensions, dating.
- **A walk through the museum** in five stations, where photographs dissolve into one another.
- **An animated logo** and page transitions, turned off when the visitor asks for reduced motion.

## Constraints and decisions

- **The same photographs, at the right weight.** Every image is recompressed and resized to its real display size, lazy-loaded, with declared dimensions to avoid layout shifts. Only the hero image loads with priority.
- **No animation library.** One shared intersection observer and a few CSS animations do what a library would do at a much larger weight. The default state is visible: if JavaScript does not run, nothing disappears.
- **Hand-written WebGL for the museum walk.** A single fragment shader handles the dissolve between two photographs, the transition edge, the light sweep and the grain. The module is only downloaded when you enter the museum, so it costs other visitors nothing.
- **The collection as content.** Taking the notes out of the lightbox makes them indexable, readable by screen readers and shareable, piece by piece.

## Outcome

A working prototype, built solo from the existing content, that shows the venue’s team a lighter, clearer site that is truer to its collection. A full catalogue would need a photography campaign and work on the notes with the collections manager.
