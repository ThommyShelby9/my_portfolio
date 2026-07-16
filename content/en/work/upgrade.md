---
slug: upgrade
title: A lead magnet disguised as a language test
kicker: Issue 01 · Lead generation · 2026
excerpt: "Marketing site, CEFR level test, back-office and follow-up engine. One month, three executables in production — settled by one rule: the test is a means, not the end."
year: 2026
order: 1
featured: true
client: UPGRADE! Afrique
sector: Education · Lead generation
role: Solo · Architecture · Development · Deployment
team: 1 developer · AI assistance
duration: 1 month (16 June — 13 July 2026)
stack:
  - Next.js 15
  - React 19
  - TypeScript
  - MongoDB
  - Turborepo
  - Resend
  - Meta CAPI
  - Docker
results:
  - value: "203"
    label: Commits in one month
  - value: "23,625"
    label: TypeScript lines, 272 files
  - value: "3"
    label: Executables in production
cover: /images/upgrade.png
seoDescription: UPGRADE! Afrique — marketing site, CEFR level test, back-office and follow-up engine. Next.js 15 / React 19 / MongoDB monorepo, three executables shipped to production in one month.
---

## The context

**The test is a means, not the end.** Everything in this project follows from that sentence.

The product is not an academic assessment tool. It's a lead magnet: it captures professionals' emails and follows up towards the "Learn & Speak English" course. Two goals, in this order — **capture the email**, then **point to the right level**. The test has to inspire confidence, because the audience is demanding. But it stays a means: whenever a decision pitted the elegance of the test against capture, capture won.

The audience: professionals in Benin, mostly on mobile, on variable networks. Hence a rule that held for the whole project — **performance is a conversion feature**. A slow first load is a visitor lost before they even see the form. That's what justified turning down tempting but heavy technical choices.

## What I was asked for

Ship, in one month and in production: a marketing site, a credible level test, a back-office the team can edit, and an automatic follow-up engine. Solo.

## The approach

Everything is designed as a **conversion chain**, and every link is verifiable:

1. **The visitor takes the test.** 13 questions, score computed server-side — never client-side.
2. **The result is locked.** No score without real contact details and explicit consent.
3. **Reveal and orient.** CEFR level, recommended course, WhatsApp handover.
4. **Automatic follow-up.** A configurable email sequence that stops as soon as the lead reacts.
5. **Conversion marked by hand.** The course is paid for in person.

That last link is a business constraint, not technical laziness: there is no online payment, so no payment webhook. Claiming to measure conversion automatically would have produced a made-up number.

On the machine side: a pnpm + Turborepo monorepo. The separation isn't cosmetic — each executable answers a specific constraint.

| Executable | Role | Why separate |
|---|---|---|
| **web** | Site and test (Next.js 15, React 19) | The only public surface. |
| **admin** | Back-office | A distinct app, so its code never ends up in the public bundle. |
| **worker** | Follow-up scheduler | A Next route handler is ephemeral: it cannot hold a scheduler. |
| **elearning** | Course platform | Out of production: foundation and player done, video to come. |

The shared foundation is four packages: `@repo/db` (Mongoose, 16 typed models, single source), `@repo/config` (env validated by Zod), `@repo/email` (Resend + react-email templates), `@repo/ui`.

## Notable technical decisions

- **The quiz is generic.** Nothing is hard-coded as "English": a quiz is a reusable entity, with its own level bands and its own recommendation. Barely more expensive to build, reusable for another campaign without a rewrite.
- **The atomic claim is mandatory.** The worker reserves each send with a `findOneAndUpdate` that moves the job from "pending" to "in progress" in a single operation. Without it, two concurrent passes send the same email twice to the same lead — the kind of defect you only see once it's at the client's.
- **Content is editable by override.** Every page has a default written in code, which a database override covers. The team edits without a deployment.
- **No secrets client-side.** Verified, not assumed: the Conversions API token was traced with a decoy-token build, and is absent from the files sent to the browser.
- **The ad signal is doubled.** Browser pixel *and* server-side Conversions API, to recover the 20–40% blocked by ad blockers and iOS.

External dependencies: MongoDB · Resend (sending + webhooks, never home-rolled SMTP) · Brevo (CRM) · Cloudinary · Meta (pixel + CAPI) · Google Analytics · Coolify (Docker deployment).

## What worked, what didn't

**Worked.** Splitting into executables. Each has a reason to exist you can defend in one sentence, and the worker would never have survived inside a route handler.

**Didn't — and this is the useful part.** Four incidents cost real time, and none was visible from the code alone:

- **A lead captured with a fake number.** `84654694` got through: an 8-digit Benin format, dropped since the 2022 renumbering. Two design errors — the first version validated Benin only while the audience is multi-country, and the reference library still accepted the old format. A test revealed it, not a review. *Capturing without validating is capturing nothing: an unreachable lead costs its acquisition price and returns nothing.* Now 18 countries, server-side validation, numbers stored in international format.
- **An invisible but clickable button.** An animation starting from zero opacity applied it to all its targets on creation, not when each step started. Interrupted, it left the button transparent and functional. Impossible to reproduce in isolation. *When you can't reproduce, stop guessing and remove the possibility:* that button never animates its opacity again. A fix you can't explain isn't a fix.
- **Both domains unreachable after a deploy.** Actual cause: none. The site was up; the domains had moved behind Cloudflare and the local DNS cache still pointed at the old address. Two wrong diagnoses before the right one — the container blamed, then the hosting config. *Check the layer before blaming the code:* one command against the server's real address would have settled it in thirty seconds.
- **The ad pixel reported no leads.** It only sent "page view". Meta saw visitors and had no idea who became a prospect: the algorithm couldn't optimise, and cost per lead was uncomputable — exactly what the pixel exists for. Found while answering a question about something else, not by an alert. *A missing business signal triggers nothing.*

And a fifth, on the country map: a projection computed by a linear formula, fundamentally wrong, which every correction merely displaced. What worked: an automated capture with an overlaid grid, then eyeballed alignment, country by country — a tight zoom on the coast revealed a country sitting in the water that the global render hid. *For anything spatial, measure — don't compute.*

## The take-away

One month, solo, three executables in production: it only held because one sentence arbitrated every decision. "The test is a means, not the end" settled the stack (nothing heavy on a Beninese mobile), the locked result, the generic quiz — and even the admission that we don't measure the final conversion.

The other lesson is less flattering: the defects that cost the most weren't in the code. An invalid number, a DNS cache, a pixel sending half the signal — none of them break a build. You see them by measuring the real outcome, not by re-reading the diff.
