# 🔌 ADR 0004 — One OpenAI-compatible client; only presets on the public instance

> 🇫🇷 French version: [FR/adr/0004](../../fr/adr/0004-un-client-compatible-openai.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

Each user brings their own AI, paid or free. Providers differ, but most of them speak the
**OpenAI chat completions** format: `POST {base_url}/chat/completions` with a key and a model name.
The spec also asked for a "Custom base URL" option — useful to self-host with a local model
(Ollama), dangerous on a public server.

## ✅ Decision

1. **One client**, `lib/ai/client.ts`, for every provider: base URL + API key + model.
2. **Four presets** whose base URLs were checked in each provider's documentation:
   OpenRouter `https://openrouter.ai/api/v1`, OpenAI `https://api.openai.com/v1` (from the official
   `openai-node` SDK — the web docs refuse automated access), Mistral `https://api.mistral.ai/v1`,
   Groq `https://api.groq.com/openai/v1`. All four expose `GET /models`, used by "Load models".
3. **A custom base URL is refused unless `ALLOW_CUSTOM_LLM_BASE_URL=true`.** Otherwise any user
   could make our server call any host (SSRF), for example a cloud metadata endpoint. The check is
   made **twice**: when settings are saved (the server decides the URL from the provider name and
   ignores the one sent by the browser) and at every call (`assertAllowedBaseUrl`).
4. **Provider errors are mapped to generic messages** (`lib/ai/errors.ts`). Raw provider bodies
   are never shown or logged: some providers echo part of the API key in their error messages.

## 📊 Consequences

**Good** 👍

- Adding a provider is one entry in `lib/ai/providers.ts`.
- The public instance cannot be turned into a proxy towards internal addresses.
- Self-hosters keep the local-model option with one environment variable.

**Bad** 👎

- **Provider-specific features are out of reach** (OpenAI structured outputs, Anthropic's native
  API, tool calling). Everything goes through plain chat completions plus our own JSON validation.
- With a custom URL, the API key field is still required: an Ollama user types any text.
- The preset list is hard-coded; a provider changing its base URL needs a code change.
