---
title: Upgrade Afrique
summary: "An English placement test built as a lead magnet: website, test, back office and automated follow-ups, in production within a month."
year: 2026
duration: "1 month to production"
role: "Solo, from architecture to deployment"
team: "1 developer, AI-assisted"
coauthors: []
client: "Upgrade Afrique"
sector: "Education, lead generation"
stack: [Next.js 15, React 19, TypeScript, MongoDB, Mongoose, Turborepo, Resend, Meta Conversions API, Docker]
status: live
liveUrl: https://upgrade-afrique.com
featured: null
order: 12
images:
  - { src: /work/upgrade/01.webp, alt: "Upgrade Afrique website", kind: public }
  - { src: /work/upgrade/02.webp, alt: "Live home page", kind: public }
proofs: []
seoDescription: "Upgrade Afrique: website, English placement test, back office and follow-up engine. A Next.js 15, React 19 and MongoDB monorepo, shipped in a month."
---

## The challenge

One sentence settled every decision on this project: the test is a means, not an end.

The product is not an academic assessment tool. It captures the email addresses of working professionals and steers them toward the “Learn & Speak English” course. Two goals, in this order: capture the contact, then recommend the right level. The test has to earn trust, because the audience is demanding; but when the elegance of the test and lead capture pull apart, lead capture wins.

The audience is professionals in Benin, mostly on mobile, on patchy networks. Hence a rule held to the end: performance is part of conversion. A slow first load is a visitor lost before they ever see the form.

## Key features

- **The test**: 13 questions, scored on the server, never in the browser.
- **A locked result**: no score without real contact details and explicit consent, then a CEFR level, a recommended course and a WhatsApp contact.
- **Automated follow-ups**: a configurable email sequence that stops as soon as the lead responds.
- **The back office**: leads, content editable without a deployment, and conversions marked by hand (the course is paid in person, so there is no payment signal to measure).
- **Ad tracking**: a browser pixel plus the server-side Conversions API, so leads actually reach the campaigns.

## Constraints and decisions

- **Three executables, each with a reason to exist.** A pnpm and Turborepo monorepo: `web` for the site and the test, the only public surface; `admin` for the back office, a separate app so its code never lands in the public bundle; `worker` for the follow-up scheduler, because a Next.js route handler is short-lived and cannot host a scheduler. The shared base is a handful of packages: typed Mongoose models, Zod-validated configuration, email templates.
- **A generic quiz.** Nothing is hard-coded as “English”: a quiz is a reusable entity with its own levels and recommendation. Barely more expensive to build, and reusable for another campaign without a rewrite.
- **Atomic claiming of sends.** The worker claims each email with a single operation that moves it from “pending” to “in progress”. Without it, two overlapping runs send the same email twice to the same lead, the kind of bug that only shows up in front of the client.
- **No secret in the browser, checked.** The Conversions API token was searched for in a build seeded with a decoy token: it appears in none of the files sent to the browser.

## Outcome

The website, the test, the back office and the follow-up engine have been in production at upgrade-afrique.com since the first month. The most expensive defects were not in the code. A lead came in with a phone number in Benin’s old format, retired since the 2022 renumbering: validation now covers 18 countries on the server, and numbers are stored in international format. The ad pixel only reported page views, not leads, which made campaign optimisation impossible. None of these break a build; you find them by measuring real outcomes, not by rereading the diff.
