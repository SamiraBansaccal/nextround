# 🧭 ADR 0024 — No dashboard: the profile is the home page

> 🇫🇷 French version: [fr/adr/0024](../../fr/adr/0024-pas-de-tableau-de-bord.md)

- **Date:** 2026-10-05
- **Status:** ✅ accepted

## 🎯 Context

The dashboard (`/dashboard`) was the page after sign-in. With use, the owner found it added nothing: every block repeated another page.

| Dashboard block | Already on |
|---|---|
| Offer cards by career track, stage picked on the card | Offers |
| "Add an offer" band | Offers (same form) |
| Number of validated facts, link to the profile | Profile |
| AI and voice in use | Settings (the "What's connected" banner) |
| "Start here" (import from GitHub or CVs) | Profile (the import blocks) |
| Greeting ("Good morning, …") and the count of applications in progress | nowhere: decoration |

## ✅ Decision

- The dashboard is removed. The menu follows the order of the work: **Profile → Offers → Interviews → Settings**.
- The profile, the base everything is written from ([ADR 0022](0022-profile-is-the-base.md)), is the home page: after sign-in, from the landing page when signed in, and from the logo.
- `/dashboard` redirects to `/profile` (`next.config.ts`), so old links and bookmarks still work.
- The offer cards component moves to `components/offers/opportunities.tsx`; its copy joins `lib/i18n/offers.ts`. The greeting (`lib/dashboard/`), the "start here" block, the "AI in use" card and the dashboard copy file are deleted.

## ⚖️ Consequences

- 👍 One less page to maintain and translate; nothing is shown twice.
- 👍 A new account lands where it starts: importing its CVs and GitHub.
- 👎 No overview page any more: the count of applications in progress and the greeting are gone. If an overview is needed one day, it should show something no other page shows (deadlines, follow-ups due this week…).
