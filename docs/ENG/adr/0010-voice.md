# 🔊 ADR 0010 — ElevenLabs reads only the user's own questions; dictation stays in the browser

> 🇫🇷 French version: [FR/adr/0010](../../FR/adr/0010-la-voix.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

Voice mode: the question is read aloud, the answer is spoken and transcribed. Same "who pays"
logic as the AI: the user's ElevenLabs key, else the instance key for the owner, else the
browser's free voice. Stripe Projects only offers ElevenLabs **text-to-speech** (`elevenlabs/tts`).

## ✅ Decision

- **`POST /api/tts` takes a question id, not a text.** It checks that the question belongs to the
  signed-in user, then synthesises **that question's text** (voice "Sarah", model
  `eleven_flash_v2_5`, both taken from the official ElevenLabs skill). It cannot be used to read
  arbitrary text with our key.
- **204 means "use the browser's voice"**: no key, quota reached or provider error. The client then
  falls back to `speechSynthesis` in the offer's language.
- **Dictation uses the browser's speech recognition** (Web Speech API, Chrome and Edge), in the
  offer's language. The transcript is appended to the answer box and **stays editable** before
  sending.
- The instance key is counted like the AI (10 per minute, 60 per day).

## 📊 Consequences

**Good** 👍

- A real recruiter-like voice with the instance key, free voice otherwise; the feature never
  breaks for lack of a key.
- The voice key cannot be abused through our endpoint.

**Bad** 👎

- **Dictation does not work in Firefox or Safari** (no `SpeechRecognition`); the user types instead.
- **ElevenLabs speech-to-text is not wired**: the provisioned key is a TTS service, and its STT
  permission was not verified. Browser recognition quality varies with the accent and the mic.
- In Chrome, browser speech recognition sends the audio to Google's servers. That is the
  browser's behaviour, not NextRound's — it should be said to users.
