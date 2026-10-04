# 🧮 ADR 0015 — The interview summary is computed by code, not written by the AI

> 🇫🇷 French version: [fr/adr/0015](../../fr/adr/0015-resume-calcule-par-le-code.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

The spec asks for an end-of-interview summary: strengths, the top 3 things to work on, the
questions to retry. Each answer already has a verified feedback (ratings, comments, claims).

## ✅ Decision

`lib/interview/summary.ts` **computes** the summary from the latest feedback of each question —
no AI call:

- **Strengths**: criteria rated "good" at least as often as "to improve", with their counts
  ("…(2 of 2)").
- **Top 3 to work on**: criteria most often rated "to improve", with the first comment the
  feedback gave.
- **Claims your profile does not back up**: every quote of the answers that the verification left
  without a fact.
- **Questions to retry**: unanswered ones, and those with any criterion to improve. Retrying shows
  the previous answer next to the new one.

## 📊 Consequences

**Good** 👍

- The summary **cannot invent anything new**: every line comes from verified feedback.
- Instant and free: no quota used, nothing to verify.

**Bad** 👎

- The wording is fixed, less personal than an AI summary.
- It is only as good as the per-answer feedback it aggregates.
