# 👤 ADR 0022 — The profile is the base: everything validated, merged, editable

> 🇫🇷 French version: [fr/adr/0022](../../fr/adr/0022-le-profil-est-la-base.md)

- **Date:** 2026-10-04
- **Status:** ✅ accepted, amended by [ADR 0025](0025-merge-for-good-dates-and-own-words.md) (duplicates merged for good, CV dates, the candidate's own sentences)

## 🎯 Context

The profile asked the candidate to approve every fact found in their CVs, under each line. But everything comes from their own CVs and accounts: approving it was busywork. With several CVs (old and new, tech or not), the same experience showed up several times, and a typo or an odd date could only be fixed by importing again.

## ✅ Decision

- Every import (CV, GitHub, Codewars, LeetCode, chat, by hand) creates **validated** facts. Facts from before this rule are validated when the profile opens.
- Near-duplicates (same type, same words) are folded **at display**: the most complete wording is shown with "also in N other sources". Editing or deleting it applies to every wording.
- Every line of a CV, of the base, and every sentence of a CV or letter written for an offer has a small pencil. A document sentence edited by hand keeps the facts it cites and stays in the same version.
- AI output is still untrusted: documents written for an offer are still checked fact by fact (ADR 0003).

## ⚖️ Consequences

- No more "to review" section; the AI-built toggle stays on projects.
- A fact wrongly read from a CV is visible in the base and fixed or removed with the pencil or the bin.
