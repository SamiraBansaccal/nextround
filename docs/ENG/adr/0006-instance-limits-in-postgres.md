# 🚦 ADR 0006 — Instance-key limits are counted in Postgres

> 🇫🇷 French version: [FR/adr/0006](../../FR/adr/0006-limites-dans-postgres.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

The instance owner falls back to the instance's own keys (OpenRouter, ElevenLabs, Firecrawl).
OpenRouter's free models allow **50 requests per day** to an account that never bought credits,
1,000 with at least 10 dollars of credits (checked in OpenRouter's documentation). The spec asks
for a rate limit and a daily cap **only on calls made with instance keys**. Vercel runs the app as
serverless functions: several instances can run at once, and none keeps memory between requests.

## ✅ Decision

- Counters live in the `usage_counters` table — per user, per UTC day, per kind (`llm`, `tts`,
  `scrape`) — incremented atomically with `INSERT … ON CONFLICT DO UPDATE … RETURNING count`.
- A per-minute bucket uses the same table (`llm:minute:HH:MM`).
- Defaults (`lib/ai/usage.ts`): AI 8 per minute and **40 per day** (under OpenRouter's 50, which
  also counts retries), voice 10/60, page reading 5/30.
- Only calls made with **instance** keys are counted — every attempt, retries included. Users
  with their own key are limited by their own provider only.

## 📊 Consequences

**Good** 👍

- The limits hold across serverless instances, without adding a Redis service.
- Tested on an in-memory Postgres: the minute limit, the daily cap and the reset on the next day
  (`tests/ai-config.test.ts`).

**Bad** 👎

- **One extra database round trip per AI call** on the instance path.
- Minute buckets accumulate rows (a few per active minute); nothing purges them yet. Harmless at
  this scale, to clean up eventually.
- The daily window is the UTC day, not Brussels time: the counter resets at 02:00 in summer
  (01:00 in winter), Belgian time.
- 40 per day is little for the owner's demo: a full interview with feedback on every answer can
  use 15 to 25 calls.
