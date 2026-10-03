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
| 2 | "Bring your own AI" layer (OpenAI-compatible client, encrypted keys) | ⏳ next |
| 3 | Profile: GitHub / Codewars / CV import, fact validation | planned |
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

## Run it locally

```bash
npm install
stripe projects env --pull                       # credentials -> .env (never committed)
npm run setup:env -- --owner <your-github-login>  # Clerk keys, encryption key, owner
npm run db:migrate                                # create the tables
npm run dev                                       # http://localhost:3000
npm test                                          # includes the data isolation test
```

## Built with Stripe Projects

Hosting (Vercel), Postgres (Neon), sign-in (Clerk), the instance AI (OpenRouter), page reading (Firecrawl) and voice (ElevenLabs) are provisioned, on free tiers, with [Stripe Projects](https://docs.stripe.com/projects) from the terminal: `stripe projects add <provider>/<service>`, then `stripe projects env --pull` writes the credentials to a local `.env` that is never committed.
