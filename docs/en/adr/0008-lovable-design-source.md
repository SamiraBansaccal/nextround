# 🎨 ADR 0008 — Lovable is the design source, ported by hand, one way

> 🇫🇷 French version: [FR/adr/0008](../../fr/adr/0008-lovable-source-du-design.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted — **extended on 2026-10-04**: every screen now follows the prototype

## 🎯 Context

The author designs the interface in Lovable, in a separate private repository
(`SamiraBansaccal/nextround-39ef068d`): a React + TanStack Router prototype with **mock data**.
NextRound is a Next.js app with real data, server actions and verification. The spec asked to
**keep UI and logic separate**, so that the design can be reworked in another tool without
touching the logic.

## ✅ Decision

1. **Shared types.** The prompt given to Lovable (`docs/fr/lovable-prompt.md`) imposed the exact
   types of `lib/types.ts`. The prototype's components take the same props as the app's.
2. **Port, don't sync.** The design is carried over by hand: design tokens (the whole `:root` and
   `.dark` palette of the prototype's `styles.css`), fonts (Lora, Nunito Sans), the logo and
   images (`public/brand/`), and the layout of each screen, rebuilt around real data.
3. **One way only: Lovable → here.** Nothing goes back: the app's logic, data and verification mean
   nothing to the prototype.
4. **What is not carried over:** the router, the mock data (`mock-data.ts`), the demo-state switch,
   the camera toggle of the interview (NextRound never uses the webcam), the prototype's
   `localStorage` theme handling (replaced by `next-themes`).
5. The source is the prototype built from [the Lovable prompt](../../design/lovable-prompt.md). *(The provenance file this step first referred to was never written; the prompt is the reference.)*

## 📊 Consequences

**Good** 👍

- The live app looks like the design the author worked on, screen by screen.
- The logic never depended on the design: `lib/` did not change during the port.
- Re-porting a screen is possible at any time from the prototype's latest commit.

**Bad** 👎

- **Two copies of the design exist** and can drift. Nothing detects it; it relies on discipline
  (pull the prototype, compare, port).
- The port is **manual work** each time the prototype changes significantly.
- The prototype had removed the `interview` offer status that the spec requires; the app keeps it
  and the prototype should get it back.
- Image provenance is "made in the author's Lovable project"; their licence is whatever that tool
  grants, not checked further.
