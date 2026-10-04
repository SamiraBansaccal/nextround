# 🧱 ADR 0012 — A `user_id` on every table, enforced in `lib/data`, tested on an in-memory Postgres

> 🇫🇷 French version: [fr/adr/0012](../../fr/adr/0012-isolation-des-donnees.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

The spec: "every table has a user_id; every server query filters by the user id from the
server-side session, never from the client; add a check that user A cannot read or modify user
B's data by changing an id."

## ✅ Decision

- **Every table carries `user_id`**, including child tables (`requirements`, `offer_contacts`,
  `questions`, `answers`), so that no query has to go through a parent to know the owner.
- **The user id comes from one place**: `requireUserId()` / `getAccount()` in `lib/server/auth.ts`, which
  read the Clerk session on the server. Server actions never take a user id as input.
- **Every function in `lib/data/` takes `userId` first and puts it in every `WHERE`** — reads,
  updates and deletes alike. Ids coming from the client are checked to be UUIDs before any query.
- **Tests run on PGlite**, a real Postgres in memory, migrated with the same SQL files as
  production: user B, knowing the ids of user A's rows, can neither read, list, modify, delete nor
  move them (`tests/data/isolation.test.ts`, `tests/data/isolation-all.test.ts`).
- `proxy.ts` (Next.js 16's renamed middleware) refuses unauthenticated requests early, but it is
  only a first filter; the data layer is the guarantee.

## 📊 Consequences

**Good** 👍

- Isolation is checked by tests on every table, not assumed.
- Cleaning one user's data is exact: the e2e cleanup deletes `WHERE user_id = …` in each table.

**Bad** 👎

- **It relies on discipline**: a new query written without the `user_id` condition would leak.
  Postgres row-level security would enforce it at the database level; not set up (the Neon HTTP
  driver connects with one role).
- The redundant `user_id` on child tables must be kept consistent with the parent's; nothing in
  the schema enforces it (no composite foreign key).
