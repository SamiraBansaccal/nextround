# 🎯 NextRound

**Your coach to reach the next interview round — without inventing anything.**

NextRound helps people apply to tech jobs, with a focus on **interview practice**. Build your profile once (CVs, GitHub, Codewars, a short chat), save the job offers you like, and NextRound matches each one against your profile, writes a tailored CV and cover letter, and lets you **practise a video interview** with the interviewer of your choice: on the offer's stack, on a technology, or on HR questions.

🌐 **Live app:** https://nextround-gamma.vercel.app · 🧾 **Stack:** [Stripe Projects share link](https://projects.dev/s#v1:Neon~postgres,ElevenLabs~tts,Firecrawl~api,Vercel~project,Clerk~auth,OpenRouter~api) · 📚 **Docs:** [docs/](docs/README.md) (French and English)

## 🧭 Contents

- [🤝 The core promise](#-the-core-promise)
- [✨ Features](#-features)
- [🧱 Stack](#-stack)
- [🗂️ Repository layout](#️-repository-layout)
- [🚀 Getting started](#-getting-started)
- [🤖 Bring your own AI](#-bring-your-own-ai)
- [🔒 Security](#-security)
- [⚠️ Known limitations](#️-known-limitations)

## 🤝 The core promise

**The AI never invents anything.**

- Every sentence of a CV, a letter or a suggested answer must trace back to a **validated profile fact**.
- Every item read from an offer (requirements, stack, contacts) must **quote the offer word for word**.
- Anything unsupported is **flagged**, never silently kept.

The checks are done by code, not by the AI ([ADR 0003](docs/en/adr/0003-ai-proposes-code-verifies.md)). That is what makes weaker or free models safe to use: whatever they invent gets caught.

## ✨ Features

| | Feature |
|---|---|
| 👤 | **Profile** (the home page): import CVs (PDF, read in the browser), GitHub repositories, Codewars, a 5-question chat; review proposed facts in place, under the CV line they come from; mark projects built with AI (they never count as mastery of their stack) |
| 💼 | **Offers**: add by link or pasted text; each requirement highlighted green (covered by a validated fact) or red (gap); how to apply, with contacts found in the offer only; offers grouped by career track, each card with its stage (Saved → Applied → Interview → Offer / Rejected) and follow-up reminder |
| 📄 | **Tailored CV and cover letter**, in English or French, every line backed by facts; keep one in your profile and start the next one from it |
| 🎙️ | **Interview practice**: choose an offer, a technology (42, grouped in tracks) or HR questions; pick one of 110 interviewers; camera and mic check; questions written in advance in real English and French, with model answers; AI feedback on your own answers only |
| 🌍 | **Site in English or French**, independent from each interview's and each document's language |

## 🧱 Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 + shadcn/ui · Drizzle ORM on Neon Postgres · Clerk (GitHub and Google sign-in) · zod · Vitest + PGlite · Playwright. Services provisioned with [Stripe Projects](https://docs.stripe.com/projects), on free tiers: Vercel, Neon, Clerk, OpenRouter, Firecrawl, ElevenLabs.

## 🗂️ Repository layout

```
app/          🖥️  pages and routes; (app)/ is the signed-in area
components/   🧩  UI only, one folder per area (offers, profile, interview…)
lib/          🧠  logic: server/, data/, ai/, offers/, profile/, documents/, interview/, i18n/…
tests/        🧪  Vitest, one folder per domain; e2e/ for Playwright
scripts/      ⚙️  infra/, owner/, offers/, avatars/, test/
drizzle/      🗄️  SQL migrations
assets/       🎨  avatar production sources (not served)
docs/         📚  guides, architecture decisions (ADR), journal
```

Full tour: [docs/en/guides/architecture.md](docs/en/guides/architecture.md).

## 🚀 Getting started

```bash
npm install
npm run dev          # http://localhost:3000 (needs a .env, see below)
npm test             # unit tests, no secrets needed
npm run e2e          # every screen in a real browser (needs the Clerk and Neon keys)
npm run db:migrate   # apply new migrations before deploying
```

### 🏠 Self-host it with your own accounts

Nothing is tied to the author's accounts. One command provisions **your** stack with Stripe Projects and deploys it:

```bash
# Node 20+, the Stripe CLI and its Projects plugin, a Stripe account in live mode
brew install stripe/stripe-cli/stripe && stripe plugin install projects

git clone https://github.com/SamiraBansaccal/nextround.git && cd nextround
npm install
npm run bootstrap -- --owner <your-github-login> --dry-run   # preview
npm run bootstrap -- --owner <your-github-login>             # run
```

`scripts/infra/bootstrap.mjs` creates the providers, pulls their keys to `.env` (never committed), migrates the database, pushes the env vars to Vercel and deploys ([ADR 0001](docs/en/adr/0001-stripe-projects-provisioning.md)).

## 🤖 Bring your own AI

In **Settings**: Anthropic (Claude, through its official SDK), OpenRouter (free models welcome), OpenAI, Mistral or Groq. Keys are encrypted (AES-256-GCM), never sent back to the browser (only the last 4 characters) and never logged. The instance owner (recognised by her numeric GitHub id, `OWNER_GITHUB_ID`) falls back to the instance key (Anthropic if set, else OpenRouter) with a rate limit and a daily cap; the instance's other keys (Firecrawl for offer pages, ElevenLabs) serve her account only too. Every other account brings its own keys. Sign-up is closed while the Clerk instance is in development: `npm run clerk:signup -- status | close | open | probe` ([ADR 0023](docs/en/adr/0023-instance-keys-for-the-owner-only.md)).

The AI is only used for feedback on your answers and for reading offers and CVs: questions and model answers are written in advance. A paid voice (ElevenLabs) is opt-in, and a sentence already read is never paid twice.

## 🔒 Security

| | Measure |
|---|---|
| 🔑 | Secrets in env vars only (`.env` git-ignored, Vercel env vars) |
| 🧱 | Every table has a `user_id`; every query filters by the session's user; tested on an in-memory Postgres ([ADR 0012](docs/en/adr/0012-data-isolation.md)) |
| 🔐 | User API keys encrypted, masked, never logged |
| 🌐 | URL fetching: public http(s) only, DNS checked against private ranges on every redirect; custom AI base URLs off on the public instance |
| 🧾 | zod validation and length limits on every server action |
| 🚦 | Rate limits on instance keys, counted in Postgres |
| 🤖 | Offers, CVs and answers are untrusted data in prompts; every AI output is verified by code and rendered as plain text |

## ⚠️ Known limitations

- Voice answers use the browser's speech recognition (Chrome, Edge).
- Offers come by link or pasted text; Indeed blocks robots, so its offers are pasted.
- Clerk runs as a development instance (shared OAuth credentials, "Development mode" badge).
- One database serves local development and production ([ADR 0014](docs/en/adr/0014-one-database.md)).
- Free models can be saturated; a fallback model is configured.
