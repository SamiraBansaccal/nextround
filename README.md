# NextRound

**Your coach to reach the next interview round — without inventing anything.**

NextRound helps people apply to tech jobs, with a focus on **interview preparation**. You build your profile once (GitHub, Codewars, CV, a short chat), save links to job offers you like, and for each offer NextRound matches it against your profile, writes a tailored CV and cover letter, shows you how to apply, and lets you **practise an HR + technical interview on that company's stack**.

Each user brings their own AI (paid or free).

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
| 1 | Stack, providers, GitHub sign-in, data isolation, first deploy | ⏳ next |
| 2 | "Bring your own AI" layer (OpenAI-compatible client, encrypted keys) | planned |
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

## Repository layout (so far)

```
.claude/skills/      Agent skills used while building (Stripe, Vercel, shadcn, ElevenLabs…)
.agents/, .cursor/   Same Stripe Projects skill for other coding agents (written by `stripe projects init`)
.projects/state.json Stripe Projects shared state: which providers/services this app uses (no secrets)
AGENTS.md, CLAUDE.md Instructions for coding agents
docs/                How everything works, phase by phase
```

## Built with Stripe Projects

Third-party services (hosting, database, auth, LLM…) are provisioned with [Stripe Projects](https://docs.stripe.com/projects) from the terminal: `stripe projects add <provider>/<service>`, then `stripe projects env --pull` writes the credentials to a local `.env` that is never committed.
