---
title: WhatsPay
summary: "A platform where advertisers pay people to share their campaigns on WhatsApp, with tracked links, wallets and Mobile Money payouts."
year: 2025
duration: "5 months"
role: "Architecture and back end"
coauthors: []
client: WhatsPay
sector: "Influencer marketing, West Africa"
stack: [Laravel 12, PHP 8.2, PostgreSQL, Redis, RabbitMQ, WaSender API, PayPlus]
status: live
liveUrl: https://whatspay.africa
featured: null
order: 10
images:
  - { src: /work/whatspay/01.webp, alt: "WhatsPay website", kind: public }
  - { src: /work/whatspay/02.webp, alt: "Live home page", kind: public }
proofs: []
seoDescription: "WhatsPay, WhatsApp influencer marketing: Laravel 12, RabbitMQ, WaSender API and PayPlus. Tracked links, wallets, commissions, payouts."
---

## The challenge

In West Africa, WhatsApp is not one channel among many: it is where much of the commercial content actually travels. WhatsPay turns that into a product. An advertiser creates a campaign, sharers post it in their statuses and groups, and each of them is paid for the clicks they bring in.

Three requirements pulled against each other: keeping money safe in both directions (advertiser deposits, sharer payouts), counting every click without collecting personal data, and sending many messages at once, which a Laravel app cannot absorb synchronously. My part: architecture and back end.

## Key features

- **Three spaces**: advertiser, sharer and admin, with campaigns approved by an admin before they go out.
- **WhatsApp delivery** through a provider’s official API (WaSender), never through an unofficial integration that would get accounts banned.
- **The tracked link**: each sharer gets a short link; a click is recorded, then redirected to the target.
- **The wallet**: each click credits the sharer, each payout debits them, with a full transaction history.
- **Payments** in Mobile Money through PayPlus, in CFA francs.
- **TOTP two-factor authentication**, mandatory for advertisers (who load money) and admins.
- **Excel exports** of clicks, payments and commissions for the admin team.

## Constraints and decisions

- **Everything that touches WhatsApp is asynchronous.** Each assignment of a campaign to a sharer becomes a message on a RabbitMQ queue, handled by dedicated workers. RabbitMQ rather than Redis for the queue: it gives fine control over acknowledgements, retries and dead-letter queues. The advertiser sees “sending in progress”, the queue absorbs the load, and the provider takes it at its own pace.
- **An anonymous link by design.** The tracked link uses no cookie and no browser fingerprint. A sharer knows how many people clicked, not who.
- **Protecting the one exposed endpoint.** The tracking route is the obvious target for abuse. It rate-limits by IP, rejects unknown ids without touching the database, and credits the wallet in the background, deduplicated by link, address and day. The redirect stays instant.
- **The wallet as the source of truth.** Every money movement goes through it and leaves a trace. Any inconsistency writes an audit entry and freezes payouts until someone checks by hand. Tests (Pest, PHPUnit) focus first on campaign status transitions and commission maths, where a bug costs real money.

## Outcome

The platform is live at whatspay.africa. One point took more work than planned: PayPlus payouts take 24 to 48 hours, a delay the API documentation did not mention. We had to add a “payment pending” status visible to the sharer and a manual follow-up procedure past 72 hours.
