# 🔊 ADR 0020 — Paid voice is opt-in, and a sentence is never paid twice

> 🇫🇷 French version: [fr/adr/0020](../../fr/adr/0020-voix-payante-sur-demande.md)

- **Date:** 2026-10-04
- **Status:** ✅ accepted — **amends** [ADR 0010](0010-voice.md)

## 🎯 Context

The owner has an ElevenLabs Creator plan and did not want its credits spent on tests. Under [ADR 0010](0010-voice.md), the owner fell back to the instance ElevenLabs key automatically. Questions are now fixed texts ([ADR 0017](0017-questions-written-in-advance.md)), so the same sentence in the same voice can be reused.

## ✅ Decision

- The instance ElevenLabs key is used **only** when `INSTANCE_VOICE_ENABLED=true`. Otherwise the owner gets the browser's free voice, like everyone without a key.
- Text-to-speech requests are marked `static` (fixed text), so their audio is cached by provider, voice, settings, language and text (`lib/voice/audio-cache.ts`), and the tab keeps the audio it already played.
- The app shows where credits are spent: the voice label, the Settings cards, under the "Submit answer" button.

## 📊 Consequences

**Good** 👍

- No credit is spent by accident; replaying a question is free.

**Bad** 👎

- The cache lives in the server's memory (bounded, least recently used out first): a restart or another serverless instance forgets it. A durable store (Vercel Blob, S3) is still to do.
