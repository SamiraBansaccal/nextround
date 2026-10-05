# 📨 ADR 0026 — Access requests: Clerk's waitlist, an email to the owner, an answer in Settings

> 🇫🇷 French version: [fr/adr/0026](../../fr/adr/0026-demandes-d-acces.md)

- **Date:** 2026-10-05
- **Status:** ✅ accepted
- **Follows:** [ADR 0023](0023-instance-keys-for-the-owner-only.md) (sign-up closed during development)

## 🎯 Context

Sign-up is by invitation (ADR 0023). The owner's friends want to use the app: they need a way to ask, and the owner wants an **email** for each request. Neither her address nor her id may be written in the code: the email goes to whoever owns the deployment.

## ✅ Decision

- **A "Request access" form** on the home page and the sign-up page (public, in English like those pages): email address, optional name and message.
- **The request is kept in Clerk's waitlist** (`waitlistEntries.create`, email address only, `notify: false`: Clerk emails nothing to an address typed by a stranger). No new table.
- **The owner is found at run time**: the Clerk account linked to the GitHub account `OWNER_GITHUB_ID`, and its verified email (`lib/server/owner.ts`), the same rule as the owner check.
- **The email is sent with Resend** (free plan, through Stripe Projects) when `RESEND_API_KEY` is set; the sender is Resend's test address unless `ACCESS_MAIL_FROM` names a verified one. Plain text, since the name and the message come from a stranger. Without a key, nothing is emailed and requests still wait in Settings.
- **Limits**: 3 requests a day per visitor (hashed IP address), 20 emails a day to the owner, and a hidden field that robots fill in.
- **The owner answers in Settings** (card "Access requests", owner only): **Allow** adds the address to the allowlist and invites the waitlist entry, so Clerk emails the person an invitation; **Decline** rejects it; the guest list shows who may sign up, with **Remove**.

## ⚖️ Consequences

- 👍 Friends can ask without knowing the owner's address; the owner gets an email and answers in one click; Clerk sends the invitation.
- 👍 Nothing about the owner is in the code: another deployment notifies its own owner.
- 👎 The name and the message only travel in the email: Clerk's waitlist keeps the address only.
- 👎 Resend without a verified domain only delivers to the address of the Resend account: the owner's Clerk address must be the one Stripe Projects used for that account (true here), or a domain must be verified.
- 👎 Someone declined cannot ask again from the form: Clerk keeps the rejected entry.
- 👎 The limit per IP address is shared by people behind the same network (a school, an office).
- 👎 A public form is a new door for spam; the limits and the hidden field reduce it, they do not remove it.
