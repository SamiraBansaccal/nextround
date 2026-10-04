# 🌍 ADR 0019 — Three independent languages: the site, each interview, each document

> 🇫🇷 French version: [fr/adr/0019](../../fr/adr/0019-trois-langues.md)

- **Date:** 2026-10-04
- **Status:** ✅ accepted

## 🎯 Context

The owner asked for an EN/FR toggle for the site, English by default, **separate from the interview's language**. CVs and cover letters are also written in English or French, whatever the site shows. Mixing these would, for example, put French headings on an English CV because the site is in French.

## ✅ Decision

| Language | Chosen | Copy |
|---|---|---|
| **Site** (menus, pages, messages) | EN/FR toggle in the header, stored in the `nextround-ui-lang` cookie | `lib/i18n/*` (`ui`, `offers`, `profile`, `documents`, `dashboard`, `settings`) |
| **Interview** | On the interview setup screen | `lib/interview/copy.ts`, the question banks |
| **CV / cover letter** | On the offer's CV page | `lib/documents/render.ts` (`DOC_HEADINGS`) |

- Server pages and actions read the site language with `getUiLang()`; components receive their copy (`t`) as props.
- Server-action messages and AI errors follow the site language.
- A test (`tests/ui/ui-copy.test.ts`) checks that English and French have the same keys, no empty text and the same `{placeholders}`.

## 📊 Consequences

**Good** 👍

- An English CV stays English on a French site, and vice versa.
- A missing translation fails a test instead of showing up on screen.

**Bad** 👎

- Every displayed text needs two versions, and components take one more prop.
- The public landing page and sign-in stay in English (no toggle outside the app).
