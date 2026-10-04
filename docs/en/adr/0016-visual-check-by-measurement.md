# 📏 ADR 0016 — Screens are checked by measurement, with a disposable test user

> 🇫🇷 French version: [FR/adr/0016](../../fr/adr/0016-verification-visuelle-par-la-mesure.md)

- **Date:** 2026-10-04
- **Status:** ✅ accepted

## 🎯 Context

Every screen sits behind sign-in, so a plain screenshot tool sees only the landing page. Looking
at the app by hand misses what the eye cannot see (a page that scrolls sideways by 3 px, a claim
printed on a card that is not true). The author's previous project set the rule: **measure rather
than look**.

## ✅ Decision

`npm run e2e` (`scripts/test/e2e.mjs`) does three things, the last one always:

1. **Seed** — `tests/e2e/fixtures.mts` creates a Clerk **test user** (`+clerk_test` address of the
   development instance) and fictional sample data for it through the real `lib/data` functions.
2. **Capture and measure** — Playwright starts the dev server, signs in with Clerk's testing
   helper (a sign-in token created server-side, no password), opens every screen on desktop
   (1440×900) and mobile (Pixel 7), in light and dark for the richest ones, and **fails** on:
   horizontal overflow, a missing page title, console errors. Screenshots go to `e2e-screens/`
   (git-ignored) to be reviewed.
3. **Clean up** — deletes the test user's rows in every table, then the Clerk user — even when the
   tests failed.

Playwright starts and stops the server and the browser itself: no orphan process.

## 📊 Consequences

**Good** 👍

- The first run found **eight display defects and one false claim** that looking at the code had
  missed: a stretched site badge, a stretched banner, an invisible "answered" tick, an unreadable
  caption, the self view colliding with the call controls on mobile, doubled borders, dates shown
  in UTC — and a document card stating "every sentence linked to a validated fact" above a letter
  that had an unsupported sentence. All fixed, then confirmed by a second run.

**Bad** 👎

- It writes to the **production database** (see [ADR 0014](0014-one-database.md)), reversibly.
- The screenshots are reviewed by a person (or an agent); only overflow, titles and console errors
  are asserted automatically. There is no pixel comparison.
- About 1–2 minutes per run, plus a Chromium download (≈ 94 MB) the first time.
