<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "nextround".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->

## NextRound rules

- Never spend money: every provider stays on its free plan. Never run `stripe projects add`, `upgrade` or any command that provisions or switches to a paid service, and keep paid APIs (ElevenLabs instance voice, Anthropic) off unless the owner turns them on.
- Files go in the folder of their domain, never loose in `lib/`, `components/`, `scripts/` or `tests/`: see `docs/en/guides/architecture.md`. Displayed text goes in `lib/i18n/` (EN + FR).
- UI and logic stay separate: business logic, AI calls and verification live in `lib/` and server code; components only render data passed as props.
- Every server query filters by the user id from the server-side session (`requireUserId()`), never from the client.
- AI output is untrusted: validate it with zod and verify quotes and fact ids in code before showing it.
- Continuity between local and cloud sessions: read `docs/EN-COURS.md` first; before ending a session, update it (done, in progress, next) and commit it with the work. See `docs/fr/guides/local-et-cloud.md`.
- Several Claude sessions (local and cloud) may work at the same time: each works on its OWN branch (never on `main`), opens a pull request when done, and lists its branch, scope and PR under "Branches en cours" in `docs/EN-COURS.md` (add the line when starting, update it when the PR is opened or merged). Before starting, `git pull` and read that list to avoid editing the same files as another session.
