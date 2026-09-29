---
title: LeConsultant
summary: "A subscription platform that gathers Benin’s public tenders in one place, with category alerts, training courses and Mobile Money payments."
year: 2024
duration: "17 months"
role: "Full-stack developer"
team: "2 developers, 1 product owner"
coauthors: []
client: LeConsultant
sector: "B2B, public procurement"
stack: [Laravel 8, PHP 8.2, Livewire 2, MySQL, Fortify, DomPDF, Kkiapay, PayPlus]
status: archived
featured: null
order: 8
images:
  - { src: /work/leconsultant/01.webp, alt: "Le Consultant website", kind: public }
proofs: []
seoDescription: "LeConsultant, public tenders in Benin: Laravel 8 and Livewire, paid subscriptions, category alerts, Kkiapay and PayPlus payments."
---

## The challenge

In Benin, public tenders come out as official PDFs, spread across several institutional websites that do not name things the same way. For a consulting firm or a small business, spotting a tender three days late means losing the contract.

LeConsultant aims to be the single entry point: one feed of tenders (reference, contracting authority, publication, opening and closing dates), a subscription, and alerts on the categories each subscriber cares about. I maintained and extended the existing platform for 17 months.

## Key features

- **The tender catalogue**, sorted by category, type, contracting authority and area.
- **Paid subscriptions** with several plans, access control and automatic expiry.
- **Alerts**: a nightly job matches new tenders against each subscriber’s preferences and sends an email.
- **Subscription receipts as PDFs**, with a QR code that lets the server confirm they are genuine.
- **Training courses**, with registration and tickets.
- **Ticket-based support** so subscribers get answers without leaving the platform.
- **A bilingual site**, in French and English.

## Constraints and decisions

- **Stay on Laravel 8.** The platform worked and bugs were rare. Jumping to a newer major version would have cost weeks without a single feature subscribers could see. The time went into payments and alerts instead.
- **Livewire for the back office.** Admin forms are validated on the server with no JavaScript to write. Editors, who are not developers, publish tenders without the team touching the front end.
- **One payment interface, two drivers.** Every transaction ends at a single callback; Kkiapay and PayPlus are two implementations of the same interface. Adding or replacing a gateway becomes a local change, not a rewrite of the subscription flow.

## Outcome

The platform served its subscribers with real Mobile Money payments. One limit stayed on record as known debt: matching tenders to subscribers relies on regular expressions over the title and description, which miss the different ways the same body gets spelled. The plan for a later version was a dedicated search index; it was not built during my assignment. The platform is no longer online; it is shown through its screenshots.
