# NextRound

**Your coach to reach the next interview round — without inventing anything.**

NextRound helps people apply to tech jobs, with a focus on **interview preparation**. You build your profile once (GitHub, Codewars, CV, a short chat), save links to job offers you like, and for each offer NextRound matches it against your profile, writes a tailored CV and cover letter, shows you how to apply, and lets you **practise an HR + technical interview on that company's stack**.

Each user brings their own AI (paid or free).

**Live app:** https://nextround-gamma.vercel.app

## The core promise: the AI never invents anything

- Every generated sentence, and every claim in a practice answer, must trace back to a **validated profile fact**.
- Every item extracted from an offer (requirements, stack, contact details) must **quote the offer verbatim**.
- Anything unsupported is **flagged**, never silently kept.

The checks are done by code, not by the AI. That is also what makes weaker or free models safe to use: whatever they invent gets caught.

## Project status

Built in one day for the Stripe Community hackathon, phase by phase.

| Phase | Content | Status |
|---|---|---|
| 0 | Setup: Stripe CLI, Stripe Projects, agent skills, git | ✅ done |
| 1 | Stack, providers, GitHub sign-in, data isolation, first deploy | ✅ done |
| 2 | "Bring your own AI" layer (OpenAI-compatible client, encrypted keys) | ✅ done |
| 3 | Profile: GitHub / Codewars / CV import, fact validation | ⏳ next |
| 4 | Saved offers: scan by URL, verified quotes, match score | planned |
| 5 | Interview simulation on the offer's stack (main feature) | planned |
| 6 | Tailored CV and cover letter with a sentence-level verifier | planned |
| 7 | Dashboard (application pipeline) | planned |
| 8 | Hardening, final README, submission | planned |

## Documentation

Detailed documentation, written to explain *how and why* everything works, lives in [`docs/`](docs/README.md) (in French):

- [docs/README.md](docs/README.md): index and glossary
- [docs/00-setup.md](docs/00-setup.md): Stripe CLI, Stripe Projects, agent skills, git, and what is (not) committed
- [docs/01-stack-auth-deploy.md](docs/01-stack-auth-deploy.md): stack, providers, GitHub sign-in, database, data isolation and its test, deployment
- [docs/02-bring-your-own-ai.md](docs/02-bring-your-own-ai.md): one OpenAI-compatible client, who pays, encrypted keys, SSRF protection, JSON retry, instance limits

## Repository layout

```
app/                 Pages (Next.js App Router). (app)/ = signed-in area
components/          UI only: components receive data as props
lib/                 Logic: auth, env, database, data access (lib/data/), shared types
lib/db/schema.ts     Database schema; every table has a user_id
drizzle/             SQL migrations generated from the schema
proxy.ts             Runs before every request: everything but the landing page requires sign-in
tests/               Vitest tests, including the data isolation check (in-memory Postgres)
scripts/             setup-env, push-env-to-vercel, deploy
docs/                How everything works, phase by phase (French)
.projects/state.json Stripe Projects: which providers/services the app uses (no secrets)
```

## Bring your own AI

Settings accepts any OpenAI-compatible provider: **OpenRouter** (free models welcome), **OpenAI**, **Mistral** and **Groq**. Keys are encrypted (AES-256-GCM), never sent back to the browser (only `••••` + last 4 characters) and never logged. The instance owner (`OWNER_GITHUB_LOGIN`) falls back to the instance key, with a rate limit and a daily cap; other users bring their own key. A custom base URL (e.g. a local model with Ollama) is disabled on the public instance and enabled for self-hosting with `ALLOW_CUSTOM_LLM_BASE_URL=true`.

## Self-host it with your own accounts

Nothing in this repository is tied to the author's accounts: everything comes from environment variables. One command provisions **your** stack with Stripe Projects (your Stripe account, your provider accounts, free tiers) and deploys it:

```bash
# Requirements: Node 20+, the Stripe CLI and its Projects plugin, a Stripe account in live mode
brew install stripe/stripe-cli/stripe && stripe plugin install projects

git clone https://github.com/SamiraBansaccal/nextround.git && cd nextround
npm install
npm run bootstrap -- --owner <your-github-login> --dry-run   # preview the commands
npm run bootstrap -- --owner <your-github-login>             # run them
```

`scripts/bootstrap.mjs` runs `stripe projects init`, adds Vercel, Neon, Clerk, OpenRouter, Firecrawl and ElevenLabs, pulls the credentials to `.env` (never committed), creates the app variables, migrates the database, enables GitHub sign-in on your Clerk application, pushes the env vars to Vercel and deploys. Each provider shows you its terms of service; completed steps are skipped on re-runs.

## Run it locally

```bash
npm run dev    # http://localhost:3000
npm test       # 29 tests: data isolation, encryption, AI JSON retry, who pays, SSRF, rate limits
```

## Built with Stripe Projects

Hosting (Vercel), Postgres (Neon), sign-in (Clerk), the instance AI (OpenRouter), page reading (Firecrawl) and voice (ElevenLabs) are provisioned, on free tiers, with [Stripe Projects](https://docs.stripe.com/projects) from the terminal: `stripe projects add <provider>/<service>`, then `stripe projects env --pull` writes the credentials to a local `.env` that is never committed.
