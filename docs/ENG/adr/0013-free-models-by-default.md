# 🆓 ADR 0013 — Free models by default: quality depends on the model, safety does not

> 🇫🇷 French version: [FR/adr/0013](../../FR/adr/0013-modeles-gratuits-par-defaut.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

The instance must work at zero cost, and users must be able to bring free models. Free models
are smaller, sometimes saturated, and worse at following a JSON format.

## ✅ Decision

- **Instance model**: `qwen/qwen3.8-27b:free` with `nvidia/nemotron-3-super-120b-a12b:free` as an
  OpenRouter fallback (`models` field). Chosen on 2026-10-03 among 17 free models by testing three:
  Gemma 4 31B answered **429** (saturated upstream), Qwen gave valid JSON in 1.0 s, Nemotron in
  0.6 s. Both can be changed without code (`INSTANCE_LLM_MODEL`, `INSTANCE_LLM_FALLBACK_MODELS`).
- **Robust JSON** (`lib/ai/json.ts`): ask for JSON only, extract it even if wrapped in prose or
  code fences, validate with zod, **retry once** with the exact validation error, otherwise
  "This model could not return valid output — try another model."
- **Safety comes from [ADR 0003](0003-ai-proposes-code-verifies.md)**, not from the model.

## 📊 Consequences

**Good** 👍

- Measured end to end with the free model: offer scan 7 s, ten questions 19 s, CV and letter 27 s,
  every output valid on the first try.
- A weak model degrades **quality** (fewer, vaguer questions; more dropped items), never **truth**.

**Bad** 👎

- **Free models disappear and saturate.** The list changes month to month; the default needs
  re-checking (`GET https://openrouter.ai/api/v1/models`).
- Latency is high for an interactive feature (up to a minute announced in the UI).
- The retry doubles the cost of a bad answer, and counts twice against the instance quota.
