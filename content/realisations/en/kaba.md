---
title: Kaba
summary: "Online collection pots shared on WhatsApp and paid with Mobile Money, with payouts as donations arrive and public proof that the money goes out."
year: 2026
role: "Solo design and development"
team: "Solo"
coauthors: []
client: "Orisum Groupe"
sector: "Online fundraising, mobile payments"
stack: [Vue 3, TypeScript, Vite, Pinia, Express 5, MongoDB, Mongoose, FedaPay, Firebase, Cloudinary, Joi, Jest]
genes: [product, engineering]
status: private
featured: null
order: 11
images: []
proofs: []
seoDescription: "Kaba, a collection pot for Africa: Vue 3, Express 5, MongoDB and FedaPay. Mobile Money donations, continuous payouts, identity checks, traceability."
---

## The challenge

A wedding, a funeral, a birth, medical bills: in West Africa, people often chip in together, and the collection runs through WhatsApp and Mobile Money. What is missing is trust. Donors do not know whether the money arrives, or when.

Kaba, “la cagnotte de l’Afrique”, answers that: create an online pot, share it on WhatsApp, receive donations by Mobile Money, and show publicly that the funds are paid out. I designed and built it alone, front end and back end.

## Key features

- **The pot**: a category (wedding, birthday, funeral, birth, medical, project), a goal, photos, and updates the creator posts for donors.
- **Mobile Money donations** through FedaPay.
- **Clean WhatsApp sharing**: image, title and description generated on the server for every pot.
- **Creator verification** with an identity document, reviewed before approval.
- **Reporting** a suspicious pot, and an admin console to handle verifications and reports.
- **Notifications** and pot statistics for the creator.

## Constraints and decisions

- **Pay out as donations come in, catch the failures.** The payout to the beneficiary’s operator starts as soon as a donation is approved. A scheduled sweep runs regularly, and on every server start, to resume transfers left pending by a failed FedaPay call, a redeploy or a network cut.
- **Public traceability without amounts.** Each pot shows how many donations were confirmed, how many were already paid out, and the median payout delay. No amounts: they would let anyone work out the commission, which has no place in the donor’s view. Counts and delay are enough to build trust.
- **Keep identity documents only as long as needed.** In line with Benin’s Digital Code, supporting documents are deleted once the decision is made and the appeal window has passed. Only the record of the decision is kept.
- **Share previews rendered on the server.** WhatsApp does not run JavaScript to build a preview. So each pot’s Open Graph tags are produced by the API, and covered by tests.

## Outcome

Kaba does not have a public address yet. The product works end to end: donor journey, creator journey, admin console, and a dedicated design system called “Chaleur”. The sensitive paths (authentication, payment, payouts, verification, traceability, share previews) are covered by automated tests.
