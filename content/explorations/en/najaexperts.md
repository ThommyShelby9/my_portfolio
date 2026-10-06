---
title: Najayna Experts
summary: "An audit of an Abidjan real estate agency’s website, followed by three visual proposals carrying the same content, the same pitch and the same properties."
year: 2026
role: "Solo audit, design and development"
team: "Solo"
coauthors: []
sector: "Real estate"
stack: [Next.js 16, HTML, CSS, JavaScript, Docker, Nginx]
genes: [product, innovation]
status: concept
featured: null
order: 3
images:
  - { src: /work/najaexperts/01.webp, alt: "Proposal A, home page", kind: public }
  - { src: /work/najaexperts/02.webp, alt: "Proposal B, home page", kind: public }
  - { src: /work/najaexperts/03.webp, alt: "Proposal C, home page", kind: public }
proofs: []
proposal: pitched
seoDescription: "Redesign proposal for Najayna Experts, a real estate agency in Abidjan: a detailed audit of the current site and three visual directions."
---

Redesign proposal, started on Rostel’s own initiative and then presented to the agency.

## The challenge

Najayna Experts is an Abidjan agency with many trades: letting and sales, property management, furnished residences, construction, interior design, cleaning. Its visitors mostly arrive on a phone, from WhatsApp, social media or Google, and decide within seconds whether a property is worth a call.

The [current site](https://najaynaexperts.ci) does not let them decide. Before drawing anything, I wrote an external audit: 44 findings, each with its evidence, grouped under content credibility, catalogue, conversion and technical issues. The picture is a site that shows properties poorly, displays no prices and cannot turn a visitor into a lead.

## Key features

- **Three visual directions**, each argued in writing with what it brings and what it costs: A, the key board; B, the house; C, brushed steel.
- **The same content in all three**: the same seventeen properties and the same pitch, so the comparison is about form alone.
- **A catalogue you can decide from**: price, floor area, availability and photographs on every property.
- **Direct contact**: a pre-filled WhatsApp conversation about the property being viewed.
- **An art direction picker**: eight options applied to the same real screen, to settle the direction quickly.

## Constraints and decisions

- **Audit before mockup.** Every choice in the redesign answers a documented finding. The proposal does not say “this looks better”; it says what is broken and how each screen fixes it.
- **Colours taken from the logo.** The black, brass and steel greys are sampled from the agency’s vector file. The redesign extends an existing identity instead of imposing a new one.
- **Nothing loaded from third parties.** Fonts ship with the site. The current site requests its fonts over HTTP from an HTTPS page, so the browser blocks the request and the font never arrives.
- **Phone first, and real kept apart from sample.** All three proposals are designed for mobile. A banner on every page states that prices, areas and availability are sample values; photographs, property names and contact details are real. A separate document lists what the agency would need to supply before going live.

## Outcome

The audit and the three directions were delivered to the agency, served side by side by a Next.js app. The agency chose direction C, brushed steel. The work shows a method as much as a look: observe, prove, then propose.
