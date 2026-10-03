# 🎯 ADR 0011 — One question set per interview; the focus selector filters it

> 🇫🇷 French version: [FR/adr/0011](../../FR/adr/0011-une-seule-serie-de-questions.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

The spec asks for about ten questions in the offer's language: 4 HR, 4 technical on the offer's
stack, 2 on the gaps. The author then asked for the call to look like a one-to-one meeting
(Teams, Slack) **with the option to focus on general HR questions, technical ones, or both**.

## ✅ Decision

- **One AI call generates the whole set** when the interview starts (`lib/interview/generate.ts`),
  verified like every output (sources rebuilt from `S#`/`R#` aliases, suggested answers kept only
  for sentences backed by validated facts).
- The focus selector (**General HR / Technical / Both**) **filters** that set on the client. Gap
  questions count as technical. Counters show how many questions each focus holds.
- If the offer has no gap, the two gap questions are replaced by technical ones (the limits in
  `verifyQuestions` allow it).

## 📊 Consequences

**Good** 👍

- Switching focus is instant and free: no extra AI call, no quota used.
- The same interview keeps its answers whatever the focus.

**Bad** 👎

- Focusing on "Technical" gives at most six questions; there is no "give me ten technical
  questions" mode.
- A model that ignores the 4/4/2 split produces a lopsided set; the code trims groups above their
  limit but cannot add missing questions.
