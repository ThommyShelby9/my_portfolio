---
title: "Payment and Mobile Money integration"
metaTitle: "Mobile Money integration (FedaPay, Kkiapay, PayPlus): developer · Rostel Panoumassi"
seoDescription: "I integrate Mobile Money payments into your sites and apps: FedaPay, Kkiapay, PayPlus, subscriptions, wallets, payouts, with server-side verification."
summary: "Collecting Mobile Money, running subscriptions, paying your users: I integrate FedaPay, Kkiapay or PayPlus securely, with every payment verified on the server."
order: 4
related: [kaba, whatspay, leconsultant, bilalsekou]
faq:
  - q: "Which aggregator should I choose: FedaPay, Kkiapay or PayPlus?"
    a: "I have integrated all three. The choice depends on your target countries and operators, the fees, the payout delays and the features you need, such as payouts to users. I help you compare before writing code."
  - q: "How do you make sure a payment really happened?"
    a: "I never trust the browser: every payment is confirmed by a signed webhook and checked on the server with the aggregator before anything is delivered."
  - q: "Can users be paid out?"
    a: "Yes. On WhatsPay, promoters have a wallet and withdraw their earnings to Mobile Money; on Kaba, payouts follow the donations as they come in."
  - q: "Do you handle subscriptions?"
    a: "Yes: LeConsultant ran on subscriptions paid with Mobile Money, with access to tenders depending on the chosen plan."
---

In West Africa, a product that does not accept Mobile Money misses most of its customers. I treat payments as a critical part of the product: every transaction is verified and traced, and users always know where their money is.

## What I deliver

- **Collection**: Mobile Money and card payments through FedaPay, Kkiapay or PayPlus, on web and mobile.
- **Server-side verification**: signed webhooks, every transaction checked with the aggregator, protection against double payments.
- **Subscriptions** and the access that depends on them.
- **Wallets and payouts**: user balances, withdrawal requests, Mobile Money payouts.
- **Automatic delivery**: a digital product emailed as soon as the payment is confirmed.
- **Tracking**: a transaction dashboard, reconciliation, exports for accounting.

## Payments already integrated

**Kaba**: online fundraising pots shared on WhatsApp and paid with Mobile Money through FedaPay, with payouts as donations come in and public proof that the money goes out.

**WhatsPay**: advertisers pay promoters who relay their campaigns on WhatsApp, with tracked links, wallets and Mobile Money withdrawals through PayPlus.

**LeConsultant**: a subscription platform for Benin public tenders, paid with Kkiapay and PayPlus.

**Bilal Sékou**: an e-book sold with Kkiapay and delivered automatically by email after server-side verification.

## Technologies

FedaPay, Kkiapay, PayPlus, signed webhooks, Laravel, Node.js and Express, Nuxt, Vue 3, Redis and RabbitMQ queues.
