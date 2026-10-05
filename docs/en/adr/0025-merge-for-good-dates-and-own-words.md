# 🔁 ADR 0025 — Duplicates merged for good, one way to write CV dates, the candidate's own sentences join the base

> 🇫🇷 French version: [fr/adr/0025](../../fr/adr/0025-fusion-dates-et-phrases-de-la-candidate.md)

- **Date:** 2026-10-05
- **Status:** ✅ accepted
- **Amends:** [ADR 0022](0022-profile-is-the-base.md)

## 🎯 Context

Three things were left open by ADR 0022:

- near-duplicate facts were only **folded at display**. Worse, editing a folded fact deleted its other wordings **without** moving what cited them: an offer requirement covered by one of them became a gap, and a CV sentence lost its proof mark;
- CV dates came in every shape: "janvier 2025 - Juin 2025", "2023 à aujourd'hui", "January – June 2025", "03/2024". The owner's one rule: **never invent a date**;
- a CV or letter added to the profile kept the sentences the candidate had corrected by hand outside the base, so matching with offers ignored them.

## ✅ Decision

- **Merging for good** (`mergeFacts`, `lib/data/facts.ts`): every reference to a merged-away wording is pointed to the wording kept, in offer requirements, CV and letter sentences, model answers and feedback claims (`lib/profile/merge-facts.ts`). Only then are the other wordings deleted. It is used by:
  - a "Merge" link on each folded fact;
  - a "Merge the duplicates (N)" button on the base;
  - the pencil, when the fact being edited holds folded wordings.

  The groups are computed again on the server, as on the page.
- **One way to write CV dates**, applied when a CV is shown; what is stored stays as read (`lib/profile/cv-dates.ts`). Months are spelled out (lowercase in French), with an en dash between two dates and "aujourd'hui" / "present" for an ongoing period. **Nothing is added**:
  - a year stays a year;
  - a year shared by two months stays shared ("January – June 2025", because "December – January 2025" may start the year before);
  - "03/2024" only becomes "mars 2024";
  - a period that cannot be read with certainty is left exactly as written ("Bruxelles, 2019", "depuis 2023", "été 2022");
  - so is a CV in another language than French or English.
- **The candidate's own words join the base**:
  - a sentence edited with the pencil is marked `edited`;
  - when its document is in the profile (added, or edited while in it), each such sentence becomes a validated fact (`lib/documents/hand-written.ts`, source "added by hand");
  - its type comes from where it sits: a bullet keeps the title of its entry; summary and letter sentences become achievements.

  Sentences written by the AI do not join the base: they only reword facts already there. A letter's sentences about the company do not join it either.

## ⚖️ Consequences

- 👍 An offer, a document or an answer never loses its proof when duplicates are merged (tested on an in-memory Postgres, and end to end).
- 👍 One date style per CV, with no precision added.
- 👍 What the candidate writes in a document counts in the matching with offers.
- 👎 A merge cannot be undone, and it drops the provenance of the wordings merged away (which other CV said it). If the similarity rule ever folds two different facts, "Merge the duplicates" deletes one; the confirmation lists what will be merged for each single merge, but not for the global one.
- 👎 Facts that come from a document are never removed automatically, even if the document leaves the profile or the sentence is edited again (an edited sentence can then appear twice, folded together, mergeable).
- 👎 Summary and letter sentences land under "Achievements", even when they talk about an experience.
