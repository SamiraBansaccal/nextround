# 🔐 ADR 0005 — User API keys are encrypted at rest with one application key

> 🇫🇷 French version: [FR/adr/0005](../../FR/adr/0005-cles-chiffrees.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

Users paste AI and ElevenLabs API keys in Settings. Those keys can cost them money. They must be
usable by the server, never visible again in the browser, and useless to someone who reads the
database.

## ✅ Decision

- **AES-256-GCM** (`lib/crypto.ts`) with a 32-byte key, `APP_ENCRYPTION_KEY`, created once by
  `scripts/setup-env.mjs` and stored as a Stripe Projects variable. Format:
  `v1:` + base64(IV 12 bytes | auth tag 16 bytes | ciphertext). A fresh random IV per encryption;
  the GCM tag makes any tampering fail.
- **The browser only ever receives `PublicAiSettings`**: provider, model, "has a key" and the
  **last 4 characters** (`••••a3F9`). The decrypted key exists only inside the server function that
  makes the call.
- Changing provider without giving a new key **drops** the old key: it belonged to another provider.
- `setup-env.mjs` creates the encryption key **only if it is missing**.

## 📊 Consequences

**Good** 👍

- A database dump alone reveals no key. Tested: the plaintext never appears in the stored value,
  two encryptions differ, a flipped byte or another key fails (`tests/crypto.test.ts`).
- Keys never travel back to the browser, by construction of the types.

**Bad** 👎

- **One key for all users.** Whoever has both the database and `APP_ENCRYPTION_KEY` reads every
  key. Per-user keys or a KMS would be stronger; out of scope.
- **The key cannot be rotated as things stand**: changing `APP_ENCRYPTION_KEY` makes every stored
  key unreadable. The `v1:` prefix leaves room for a rotation scheme, which does not exist yet.
- The ElevenLabs key is not checked when saved (no API call); a wrong key is discovered when the
  interview tries to read a question aloud (and then falls back to the browser voice).
