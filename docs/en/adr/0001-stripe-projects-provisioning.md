# 🧰 ADR 0001 — Every service is provisioned with Stripe Projects; self-hosting means re-provisioning on your own accounts

> 🇫🇷 French version: [FR/adr/0001](../../fr/adr/0001-provisionnement-stripe-projects.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

NextRound needs six external services: hosting (Vercel), Postgres (Neon), sign-in (Clerk), an AI
for the instance (OpenRouter), page reading (Firecrawl) and voice (ElevenLabs). The usual path is
six sign-ups, six dashboards, six API keys copied by hand — and as many chances to paste a key in
the wrong place. The project was also built for the Stripe Community hackathon, whose sponsor
product is Stripe Projects.

Two requirements came from the author: anyone must be able to **take the project over with their
own accounts** ("it must above all not be mine"), and no secret may ever be committed.

## ✅ Decision

1. **All six services are added with `stripe projects add <provider>/<service>`**, on free tiers,
   and credentials reach the app only through `stripe projects env --pull` (written to `.env`,
   git-ignored) and Stripe Projects *project variables* for the app's own values
   (`scripts/infra/setup-env.mjs`).
2. **Nothing in the repository identifies the author's accounts.** The committed
   `.projects/state.json` holds service names only; `state.local.json` (account and project ids)
   is git-ignored.
3. **Self-hosting is re-provisioning**, not sharing: `npm run bootstrap -- --owner <github-login>`
   (`scripts/infra/bootstrap.mjs`) runs `stripe projects init`, the eleven `add` commands with the same
   resource names, `env --pull`, `setup-env`, the database migration, the GitHub sign-in switch on
   Clerk and the deployment — on the accounts of whoever runs it.

## 📊 Consequences

**Good** 👍

- No API key was ever copied by hand while building the app; a secret scan runs before each
  commit and has never matched.
- One place shows the cost: `stripe projects spend` — "No charges found" at every check.
- The resource names are part of the contract (the Neon resource `db` produces
  `DB_CONNECTION_STRING`), so the bootstrap reproduces exactly the same variable names.

**Bad** 👎

- **Stripe Projects requires a live-mode Stripe account**, which means identity verification
  (KYC). The first attempt with a sandbox failed (`PROJECTS_CONTEXT_MISMATCH`). A self-hoster has
  to go through the same step.
- **Production environment variables are not synchronised by Stripe Projects** (the docs say so).
  `scripts/infra/push-env-to-vercel.mjs` fills that gap.
- **The Vercel token it issues expires.** See [ADR 0007](0007-deploy-from-the-machine.md).
- The bootstrap was verified in `--dry-run` mode on a fresh clone (all eleven services listed as
  to create) and on the reference project (all skipped). **A full run on a second set of accounts
  has not been done yet** — it would create duplicate resources on a Stripe account.
- Accepting each provider's terms shares the Stripe account's name, email, country and phone with
  that provider. The bootstrap therefore runs interactively by default, so that the person accepts
  the terms themselves; `--accept-tos` skips the prompts.
