---
title: Orinsu
summary: "A booking and access-card platform for events, restaurants and tourist packages, with on-site QR code validation that keeps working offline."
year: 2025
role: "Engineering contribution"
coauthors: []
sector: "Events, restaurants, tourism"
stack: [Node.js, Express 5, TypeScript, MongoDB, Mongoose, Redis, Cloudinary, Swagger, Jest, Vue 3, Pinia, Tailwind CSS, React Native]
genes: [engineering, product]
status: private
featured: null
order: 5
images: []
proofs: []
seoDescription: "Orinsu: bookings, access cards and QR code validation for events, restaurants and tourism. Express 5 and MongoDB API, Vue 3, React Native."
---

## The challenge

Orinsu brings together three worlds that all sell access: events, restaurants and tourist packages. Customers book, pay and receive a ticket, an order or a card; on site, staff have to check that access quickly, including when the network is weak.

Around that core sit promoters, who publish their offers under a subscription, and validation teams attached to each venue.

## Key features

- **The catalogue**: events, restaurants, tourist packages.
- **Bookings and access cards**, with subscriptions.
- **Payments** by card (Stripe) and by Mobile Money.
- **A promoter space**, with its own subscription.
- **On-site validation** by QR code, from a mobile app for staff, with an offline queue.
- **Push notifications**, communications and activity reports.
- **A bilingual interface**, in French and English.

## Constraints and decisions

- **One API for customers and staff.** The Vue 3 site and the React Native validation app consume the same Express API, split into modules (events, restaurants, tourism, bookings, cards, payments, promoters, validation, subscriptions, reports) and documented with Swagger.
- **Validation that does not depend on the network.** Checks made offline are stored on the device, then synced. Entry control keeps going when the network drops.
- **Redis and a scheduler for work that should not block a request**, and Cloudinary for media, so the API stays light.

## Outcome

The product is not publicly accessible. This page describes what it does and how it is built.
