---
title: Bilal Sékou
summary: "A communication strategist’s website that sells an e-book paid in Mobile Money and delivered by email automatically once the server has verified the payment."
year: 2025
duration: "4 weeks"
role: "Solo design and development"
team: "Solo"
coauthors: []
client: "Bilal Sékou, communication strategist"
sector: "Personal website, e-book sales"
stack: [Nuxt 3, Vue 3, TypeScript, Tailwind CSS, Pinia, Zod, Kkiapay, Nodemailer]
status: private
featured: null
order: 16
images:
  - { src: /work/bilalsekou/01.webp, alt: "Bilal Sékou’s portfolio", kind: public }
proofs: []
seoDescription: "Bilal Sékou’s website with e-book sales: Nuxt 3, TypeScript and Kkiapay. Mobile Money payment, server-side verification, automatic email delivery."
---

## The challenge

Bilal Sékou is a communication strategist who works with African companies going international. He needed two things in one site: a showcase that makes his expertise credible, and a sales flow for the e-book he sells, with a promotional price he can switch on.

No Stripe: his customers pay with Mobile Money, and Kkiapay is the regional standard.

## Key features

- **A one-page showcase**: introduction, experience, skills, contact.
- **A dedicated e-book page**, with the checkout and a thank-you page.
- **Mobile Money payment** in Kkiapay’s native SDK window.
- **Automatic delivery** of the PDF by email once payment is confirmed.
- **Promo codes** with a capped number of uses.
- **A bilingual site**, French at the root and English under `/en/`, dark theme by default.

## Constraints and decisions

- **Nothing is trusted on the client.** The browser receives Kkiapay’s callback, but the server calls the Kkiapay API to confirm the transaction before anything is delivered. A forged payment callback in the browser delivers nothing.
- **Three separate steps: submit, verify, deliver.** The transaction is created as pending and validated with Zod, then verified on the server, then the webhook delivers the PDF. That split rules out both double delivery and delivery without payment.
- **Deduplicated webhooks.** Kkiapay sometimes resends the same webhook when its first call times out. I added deduplication by transaction id: a buyer gets the e-book once, not twice.
- **Server rendering to be found.** People search for Bilal by name: Nuxt 3 with server rendering and prerendered public pages gives Google a complete page.

## Outcome

The site shipped in four weeks. How the effort split says it all: one day on design, three days on the checkout. On a project that looks small, the real complexity lives in the payment mechanics.
