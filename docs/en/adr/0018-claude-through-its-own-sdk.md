# 🧠 ADR 0018 — Claude through Anthropic's own SDK, the one exception to the single client

> 🇫🇷 French version: [fr/adr/0018](../../fr/adr/0018-claude-via-son-propre-sdk.md)

- **Date:** 2026-10-04
- **Status:** ✅ accepted — **amends** [ADR 0004](0004-one-openai-compatible-client.md)

## 🎯 Context

The owner wanted the app to use Claude. Anthropic's Messages API is not the OpenAI chat-completions format, and Anthropic's guidance is to call Claude through its official SDK rather than an OpenAI-compatible shim. A Claude.ai subscription (Pro, Max) cannot be used by an app: API usage needs a key from the Anthropic Console, billed per call.

## ✅ Decision

- **Anthropic** is a preset in Settings like the others. `chatCompletion` (`lib/ai/client.ts`) keeps one entry point and hands Anthropic calls to `lib/ai/anthropic.ts`, which uses `@anthropic-ai/sdk`.
- Default model `claude-opus-5-5`, with **low effort** (feedback on one answer does not need more) and no `temperature` (recent models reject it).
- For the owner, `ANTHROPIC_API_KEY` (and optionally `INSTANCE_ANTHROPIC_MODEL`) is preferred over the OpenRouter instance key when set.
- Errors map to the same `AiError` codes, so the UI does not know which provider failed.

## 📊 Consequences

**Good** 👍

- One more good model, without changing any caller.
- The settings page explains the subscription vs API key difference.

**Bad** 👎

- Two code paths in the client: a change to request options must be made in both.
- Claude is paid: every feedback costs API credits (the notices in the app say so).
