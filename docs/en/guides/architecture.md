# 🏗️ Repository architecture

> 🇫🇷 Version française : [fr/guides/architecture.md](../../fr/guides/architecture.md)

What lives where, and where a new file goes. When in doubt between two folders, see [📏 Filing rules](#-filing-rules).

## 🧭 Contents

- [🌳 Overview](#-overview)
- [🖥️ `app/`: pages and routes](#️-app-pages-and-routes)
- [🧩 `components/`: the interface](#-components-the-interface)
- [🧠 `lib/`: the logic](#-lib-the-logic)
- [🧪 `tests/`](#-tests)
- [⚙️ `scripts/`](#️-scripts)
- [🎨 `assets/` and `public/`](#-assets-and-public)
- [📏 Filing rules](#-filing-rules)

## 🌳 Overview

```
nextround/
├── app/            🖥️  pages and routes (Next.js App Router)
├── components/     🧩  UI: receives data as props, no business logic
├── lib/            🧠  business logic, AI, data access, interface copy
├── tests/          🧪  Vitest (one folder per domain) + Playwright (e2e)
├── scripts/        ⚙️  CLI tools: infra, owner, offers, avatars, e2e
├── drizzle/        🗄️  SQL migrations generated from lib/db/schema.ts
├── assets/         🎨  avatar sources (references, clip plans) — not served
├── public/         🌐  static files (logo, interviewer thumbnails)
├── docs/           📚  documentation (see docs/README.md)
└── .claude/ .agents/ .cursor/ .projects/   🤖 tool config (skills, hooks, Stripe Projects)
```

The `@/` import alias is the repository root: `@/lib/ai/client`, `@/components/ui/button`, `@/tests/helpers/test-db`.

## 🖥️ `app/`: pages and routes

| Route | Folder |
|---|---|
| 🏠 Landing page, sign-in | `page.tsx`, `sign-in/`, `sign-up/`, `sso-callback/` |
| 🔒 Signed-in area (`(app)/` is not part of the URL) | `layout.tsx` (menu, EN/FR toggle), `ui-actions.ts` |
| 👤 Profile (home page) · 💼 Offers · 🎙️ Interviews · ⚙️ Settings | `profile/`, `offers/` (+ `[id]/`, `[id]/cv/`), `interview/` (+ `new/`, `[id]/`, `[id]/summary/`), `settings/`; `/dashboard` redirects to `/profile` (`next.config.ts`, [ADR 0024](../adr/0024-no-dashboard.md)) |
| 🔊 Text-to-speech | `api/tts/` |

Pages are server components: they read the session (`requireUserId()`), load data and hand it to a component. Server actions live in an `actions.ts` next to their page. `proxy.ts` guards every route except the landing and sign-in pages; server code still re-checks the session.

## 🧩 `components/`: the interface

| Folder | Content |
|---|---|
| `ui/` | shadcn components |
| `layout/` | App shell, logo, page headings, theme |
| `auth/` | Sign-in buttons |
| `shared/` | Small shared pieces (`with-code`) |
| `offers/`, `documents/`, `profile/`, `interview/`, `settings/` | One folder per area of the app; `interview/media/` (camera, mic) and `interview/voice/` (speech) |

Components make no network calls and hold no business logic: data, actions and translated copy (`t`) come in as props.

## 🧠 `lib/`: the logic

| Folder | Role |
|---|---|
| `server/` | 🔐 `auth.ts` (session), `env.ts` (validated env vars), `crypto.ts` (key encryption) |
| `shared/` | 🧰 Pure helpers: `dates.ts`, `ids.ts`, `text.ts` |
| `db/` | 🗄️ Schema (`user_id` on every table) and connection |
| `data/` | 📦 Data access, **always filtered by `userId`** |
| `ai/` | 🤖 AI client (`client.ts`, `anthropic.ts`), who pays (`config.ts`), verification (`verify.ts`, `prompt-facts.ts`) |
| `offers/` | 💼 Extraction, coverage, matching, pipeline cards, page fetching |
| `profile/` | 👤 Facts from CVs and chat, CV layout, GitHub, Codewars |
| `documents/` | 📄 Tailored CV and cover letter, rendering in the document's own language |
| `interview/` | 🎙️ Questions built without AI (`generate.ts`, `bank/`, `hr-bank/`), feedback (the one AI call), tracks |
| `interviewers/` | 🎭 Character catalog and their lines |
| `voice/` | 🔊 ElevenLabs, text-to-speech, audio cache |
| `i18n/` | 🌍 Interface copy in EN and FR, and the cookie that holds the site language |

Only `types.ts` and `utils.ts` (shadcn's `cn()`, a path shadcn expects) stay at the root of `lib/`.

**Three independent languages:** the site (EN/FR toggle, `lib/i18n/`), each interview (`lib/interview/copy.ts`), each CV or letter (`lib/documents/render.ts`).

## 🧪 `tests/`

`helpers/` (in-memory Postgres, server-only stub), then one folder per domain: `ai/`, `data/` (🧱 isolation between users), `interview/`, `offers/`, `profile/`, `documents/`, `ui/` (EN/FR copy parity), `voice/`, and `e2e/` (Playwright). `npm test` needs no secrets; `npm run e2e` needs the Clerk and Neon ones.

## ⚙️ `scripts/`

| Folder | Scripts |
|---|---|
| `infra/` | `bootstrap.mjs`, `setup-env.mjs`, `push-env-to-vercel.mjs`, `deploy.mjs` |
| `owner/` | Owner imports (CVs, offers), `whoami` |
| `offers/` | Actiris search and fetch |
| `avatars/` | Avatar production; `interviewer-pictures.mjs` runs before `dev` and `build` |
| `test/` | `e2e.mjs` |

## 🎨 `assets/` and `public/`

`assets/characters/<id>/` holds what is needed to **produce** an interviewer's avatar; it is never served and excluded from deploys. `public/` is served as is.

## 📏 Filing rules

1. **No loose files** in `lib/`, `components/`, `scripts/` or `tests/`.
2. **UI and logic stay separate.**
3. **Every query filters by the session's `userId`**, never by an id from the browser.
4. **A new domain** gets a folder in `lib/`, `components/` if needed, and `tests/`.
5. **Displayed text** goes in `lib/i18n/` (EN + FR).
6. **Tests** go in `tests/<domain>/` and import helpers from `@/tests/helpers/`.
7. **A structural choice** deserves an [ADR](../adr/README.md).
