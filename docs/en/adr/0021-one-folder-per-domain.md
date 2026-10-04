# 🗂️ ADR 0021 — One folder per domain, no loose files

> 🇫🇷 French version: [fr/adr/0021](../../fr/adr/0021-un-dossier-par-domaine.md)

- **Date:** 2026-10-04
- **Status:** ✅ accepted

## 🎯 Context

After a fast build, the repository had loose files in `lib/` (auth, env, verify, pipeline…), `components/`, `scripts/` and `tests/` (28 test files side by side), avatar sources at the root (`characters/`) and docs split between `docs/` and `docs/FR`, with broken links. It was hard to know where a new file should go.

## ✅ Decision

- `lib/`: `server/` (auth, env, crypto), `shared/` (pure helpers), then one folder per domain (`ai/`, `offers/`, `profile/`, `documents/`, `interview/`, `interviewers/`, `voice/`, `dashboard/`, `i18n/`, `data/`, `db/`). Only `types.ts` and `utils.ts` (expected by shadcn) stay at the root.
- `components/`: `ui/` (shadcn), `layout/`, `auth/`, `shared/`, then one folder per area of the app.
- `tests/`: `helpers/`, then one folder per domain, and `e2e/`.
- `scripts/`: `infra/`, `owner/`, `offers/`, `avatars/`, `test/`.
- `assets/characters/` for avatar sources (not served, excluded from deploys).
- `docs/`: `fr/` and `en/`, each with `guides/` and `adr/`; `design/` for prompts.
- The map lives in [the architecture guide](../guides/architecture.md).

## 📊 Consequences

**Good** 👍

- Every file has an obvious place; the guide says where a new one goes.
- Tests mirror the code they check.

**Bad** 👎

- Every import of a moved file changed: a branch opened before the move must merge `main` and fix any new import of a moved path.
- Old commit messages and the journal mention the old paths.
