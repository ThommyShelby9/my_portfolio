---
slug: whatspay
title: Influencer marketing through WhatsApp
kicker: Issue 05 · MarTech · Africa · 2025
excerpt: A platform where advertisers pay micro-influencers to relay tracked links via WhatsApp. The whole orchestra rides on RabbitMQ.
year: 2025
order: 5
featured: false
client: WhatsPay
sector: MarTech · Influence
role: Architect · Backend Lead
team: 2 devs · 1 PO
duration: 5 months
stack:
  - Laravel 12
  - PHP 8.2
  - MySQL
  - RabbitMQ
  - WaSender API
  - PayPlus
results:
  - value: "2FA"
    label: Multi-role security from day one
  - value: "RabbitMQ"
    label: Async broadcast at scale
  - value: "PayPlus"
    label: Africa-native payments integrated
cover: /images/whatspay.png
seoDescription: WhatsPay — WhatsApp influencer marketing platform. Laravel 12, RabbitMQ, WaSender API, PayPlus. Click tracking, wallets, commissions.
---

## The context

In West Africa, WhatsApp **is not a channel** — it is the internet. 256-person groups push more commercial content than Instagram and Facebook combined in the region. WhatsPay wanted to formalise that: let an advertiser pay 100 micro-influencers to relay a tracked link, and pay each cleanly based on generated clicks.

## What I was asked

Design the architecture, secure payments (advertiser inbound, influencer outbound), trace each click without leaking personal data, and handle broadcast load — 100 WhatsApp messages sent in parallel is 100 connections a monolithic Laravel cannot hold synchronously.

## The approach

Three pillars:

1. **Anything WhatsApp-related is async.** A campaign (`Task`) is created by the advertiser, validated by admin, assigned to influencers (`Assignment`) — each assignment becomes a RabbitMQ job calling the WaSender API.
2. **The tracked link is short and anonymous.** `/track/{id}` redirects to the target and inserts a `Linkcall` with IP, user-agent, timestamp — no cookie, no fingerprint. The influencer sees how many people clicked, not who.
3. **The wallet is the source of truth.** Every click credits an amount into the influencer's `Wallet`, every withdrawal debits. Any inconsistency triggers an audit log and blocks withdrawals until manual resolution.

## Notable technical decisions

- **Laravel 12 + Sanctum + JWT (firebase/php-jwt).** Sanctum for web sessions (back-office), JWT for the mobile API.
- **TOTP 2FA** at signup, mandatory for advertisers (who load money) and admins; optional for influencers.
- **RabbitMQ + php-amqplib.** Dedicated `whatsapp-send` queue with dedicated workers, `tracking` queue for clicks. No Redis on the queue — RabbitMQ gives fine control over acks, retries, dead-letter.
- **WaSender API** for WhatsApp broadcast — no temptation to code an unofficial integration (which would have got all accounts banned).
- **PayPlus** (`config/payplus.php`) for Africa payments — Mobile Money payouts (MTN, Moov), CFA-native.
- **textalk/websocket** for real-time admin notifications.
- **Tests Pest + PHPUnit 11** on campaign state transitions and commission calculations — the two places where errors cost real money.

## The public routing + tracking

```
/track/{id}  →  records the click, redirects to target
```

Only endpoint that can be DDoS-flooded. Three protections:

- **Per-IP throttling** (60/min) at middleware level
- **Local bloomfilter** on valid `id`s — invalid `id`s return 404 without hitting the DB
- **Async wallet credit** — redirect is immediate, credit is queued with `(id, ip, day)` deduplication

## What worked, what didn't

**Worked.** The async architecture held a broadcast peak of 800 messages in under 4 minutes with no advertiser-side timeout — they see "broadcast in progress", the queue swallows, WaSender drains at its own pace.

**Didn't.** PayPlus withdrawal has a 24-to-48h delay undocumented in the API — we had to build a "payment pending" UI and a manual-retry system when it exceeds 72h. Happened three times in the first four months.

## Take-away

In a product where **money flows both ways**, the wallet is not a feature — it is the architecture. Everything must converge to it or leave it with an immutable trace. I kept this principle on Freelance Club afterwards — it makes financial audits trivial.
