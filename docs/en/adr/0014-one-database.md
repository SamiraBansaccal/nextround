# 🗄️ ADR 0014 — One database for local development, tests against the app and production

> 🇫🇷 French version: [fr/adr/0014](../../fr/adr/0014-une-seule-base.md)

- **Date:** 2026-10-03
- **Status:** ⚠️ accepted as **debt**

## 🎯 Context

Stripe Projects provisioned one Neon database (`db`). Running the app locally (`npm run dev`), the
visual check (`npm run e2e`) and production all read `DB_CONNECTION_STRING`. Unit tests do not:
they use an in-memory Postgres (PGlite).

## ✅ Decision

Keep **one database** for now, and make every write that is not real usage **exactly
reversible**:

- The visual check uses a **disposable Clerk test user** (`+clerk_test` address). Its cleanup runs
  even when the tests fail and deletes `WHERE user_id = <test user>` in every table, then the Clerk
  user (ADR [0016](0016-visual-check-by-measurement.md)).
- The end-to-end AI checks run from scripts delete their usage counters afterwards.
- Migrations are applied by hand (`npm run db:migrate`) and are additive so far.

## 📊 Consequences

**Good** 👍

- No second database to provision, pay for, or keep in sync.
- The test data never mixes with real users' data: it is keyed by a user id that is deleted.

**Bad** 👎

- **A local bug can damage production data.** A destructive migration tried locally would run
  against the live database.
- **A crashed cleanup leaves test rows** in production until the next run (which starts by
  cleaning the same user).
- The right fix is known: a Neon **branch** for development and tests (copy-on-write, instant),
  with its own connection string in a second Stripe Projects environment
  (`stripe projects env create development --output .env.dev`). Not done yet.
