---
title: CCNS Bénin
summary: "The website of a Catholic network of health centres in Benin, rebuilt so a patient finds the right centre, its address and phone number, even on 3G."
year: 2024
duration: "8 weeks"
role: "Full-stack, architecture and content"
coauthors: []
client: "Commission Catholique Nationale pour la Santé (CCNS)"
sector: "Healthcare, institutional"
stack: [Vue 3, TypeScript, Vite, Tailwind CSS]
status: live
liveUrl: https://ccnsbenin.vercel.app
featured: null
order: 15
images:
  - { src: /work/ccns/01.webp, alt: "CCNS website", kind: public }
  - { src: /work/ccns/02.webp, alt: "Live home page", kind: public }
proofs:
  - { text: "+240% organic traffic in six months", source: "confirmé par Rostel (spec v6, section 6.3)" }
  - { text: "Lighthouse SEO score of 100", source: "confirmé par Rostel (spec v6, section 6.3)" }
seoDescription: "Rebuild of the CCNS Benin website in Vue 3 and Vite: accessibility first, fast pages on mobile, structured data for every health centre."
---

## The challenge

The CCNS brings together the Catholic health centres of Benin. Its old website was a splash page, a PDF brochure and a few email addresses: invisible on Google, unreadable on a phone, and with no way for a patient to find the nearest centre.

The brief was easy to state: a patient searching for a health centre in Cotonou should land on the right one, at the top of the results, and immediately see how to get there and who to call.

## Key features

- **One page per centre**, with address, phone number and description, for the network’s eight centres.
- **An interactive map** whose markers lead to each centre.
- **News and figures** from the network, and a contact page.
- **Images served at the right format and size**, in AVIF and WebP with a JPEG fallback.

## Constraints and decisions

- **Accessibility before looks.** WCAG 2 level AA from the first iteration: checked contrast, full keyboard navigation, visible focus everywhere. That constraint forced readable type and a clear hierarchy, and the design came out more polished than if we had started from a mockup.
- **Performance as a search lever.** A patient on 3G in a rural area will not come back if the page takes eight seconds, and Google rewards speed. No server rendering: the content rarely changes, so the site is built statically and deployed on Vercel. No third-party UI kit either; a small hand-written design system keeps the JavaScript light.
- **Structured data for every centre.** Each centre page carries Schema.org MedicalOrganization markup. That is what helps Google understand it is a health facility with an address and a phone number, and show it as one.
- **Content written with the staff.** I ran two writing workshops with the centre directors. They describe their centres better than any outside copywriter could.

## Outcome

Organic traffic grew by +240% in six months, and the site scores 100 for SEO in Lighthouse. It still works on the modest phones some rural staff carry. The lesson fits in one sentence: for an institutional site, a patient opening a centre’s page from WhatsApp must see the phone number and address in under a second. Everything else follows from that.
