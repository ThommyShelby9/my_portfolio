---
title: MonCarnet
summary: "A family health record that talks, linked to the health centre: appointments, pregnancy follow-up, danger alerts and offline rounds for community health workers."
year: 2026
duration: "2 days"
role: "Solo design and development"
team: "Solo"
coauthors: []
sector: "Digital health, maternal and child health"
stack: [Next.js 16, React 19, PostgreSQL, Drizzle ORM, Zod, Tailwind CSS 4, Vitest, PWA]
status: live
liveUrl: https://moncarnet.kheios.com
featured: null
order: 7
images:
  - { src: /work/moncarnet/01.webp, alt: "MonCarnet home page", kind: public }
  - { src: /work/moncarnet/02.webp, alt: "Caregiver dashboard with an alert, fictional data", kind: interior }
  - { src: /work/moncarnet/03.webp, alt: "Mobile home of an expecting mother, fictional data", kind: interior }
  - { src: /work/moncarnet/04.webp, alt: "Vaccination and blood pressure record on mobile, fictional data", kind: interior }
  - { src: /work/moncarnet/05.webp, alt: "National oversight view, fictional data", kind: interior }
proofs: []
seoDescription: "MonCarnet, a family health record for the Challenge e-Santé Bénin: Next.js 16, PostgreSQL and Drizzle, an installable app that works offline."
---

## The challenge

MonCarnet is a patient follow-up platform built for the Challenge e-Santé Bénin. Three facts shaped every screen: one phone often serves a whole family, not everyone reads, and the network is not always there.

The product connects both sides of care. For families, a record on the phone that says one thing at a time and can be listened to. For the health centre, a view of the day that puts what cannot wait at the top.

## Key features

- **The family record**: every family member’s record on one phone, vaccines and visits stamped as on the paper booklet, a blood pressure chart, today’s medicines.
- **Four-step appointment booking**, with remaining slots, a waiting list when a day is full, and a waiting-room ticket taken from the phone.
- **Pregnancy follow-up**, birth preparation, then the birth declared by the midwife: the baby’s record then appears in the family.
- **Danger-sign alerts**: sent by the patient, they show at the top of the caregiver’s screen with a 15-minute countdown, and only one caregiver can take charge.
- **Cascading reminders**: WhatsApp, then SMS, then a voice call, then the community health worker, depending on what each person has and agrees to.
- **Pharmacy**: prescriptions dispensed from a code, stock shortages tracked.
- **Community health worker rounds** and area-level oversight, with exports.

## Constraints and decisions

- **Offline first.** Community health workers operate where the network drops: their entries wait on the device in a sync queue. An alert sent without network says so plainly, shows the centre’s phone number, then goes out on its own when the connection returns, with no duplicate. The app installs as a PWA.
- **A record that talks.** Everything can be listened to in one’s own language, and the home screen shows one action at a time (“Tonight, 1 tablet”). That is what makes the record usable by people who do not read.
- **Neutral reminder content.** A reminder gives the date, the place and “vaccine” or “appointment”, never the illness: phones get shared. A person with hearing loss is never called; they get a written message, then a visit from the health worker.
- **An honest demo.** Reminder channels are simulated (a mock phone shows what each person would receive), risk thresholds are labelled as indicative, and every piece of data on screen is fictional.

## Outcome

MonCarnet is live at moncarnet.kheios.com, with an end-to-end walkthrough and one-click demo accounts. I built it alone in two days, from research on local usage and existing platforms through to deployment, along with a presentation file for the jury.
