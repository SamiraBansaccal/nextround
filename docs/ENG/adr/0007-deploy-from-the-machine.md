# 🚚 ADR 0007 — Deploy from the machine with the Vercel CLI, not from GitHub

> 🇫🇷 French version: [FR/adr/0007](../../FR/adr/0007-deployer-depuis-la-machine.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted — **amended on 2026-10-04**: the script now renews an expired token itself

## 🎯 Context

The Vercel project created by Stripe Projects is **not linked to the GitHub repository**. Linking
it needs the Vercel GitHub app to be installed on the author's GitHub account — a browser step.
Stripe Projects does provide a Vercel token, the team id and the project id in `.env`.

## ✅ Decision

- **`node scripts/infra/deploy.mjs`** deploys to production with `vercel deploy --prod`. The token is
  passed to the CLI through an **environment variable only**, never as a command-line argument
  (which would show it in the process list).
- **`.vercelignore`** lists what is never uploaded: `.env`, `.env.*`, `.projects/`, agent folders,
  docs, tests, screenshots. Checked on 2026-10-03 through the Vercel API: the excluded folders
  arrive as **empty** directories (0 files), against 9 files for `app/` and 8 for `lib/`.
- **`node scripts/infra/push-env-to-vercel.mjs`** copies an explicit list of runtime variables to Vercel
  (production and preview), never the Vercel token itself.

**Amendment (2026-10-04).** The token issued by Stripe Projects **expires** (twice in two days).
`deploy.mjs` now checks it against `GET /v2/user`; if refused, it runs
`stripe projects rotate <vercel project>` then `stripe projects env --pull` — the documented fix for
stale credentials — and continues. Observed: "The Vercel token expired: rotating the credentials…
Fresh Vercel token in .env." then a successful deployment.

## 📊 Consequences

**Good** 👍

- One command deploys, whatever the state of the token.
- No browser step was needed to deploy.

**Bad** 👎

- **No automatic deployment on push**, no preview per branch. A commit pushed to GitHub is not
  live until someone runs the script. Linking the repository (`vercel git connect`) would fix it.
- What is deployed is **the working directory**, not a commit: uncommitted changes can go live.
  The habit (and the scripts' order) is to commit first, then deploy — a habit, not a guarantee.
- `env --pull` rewrites `.env` during the rotation (the app's own variables come back from Stripe
  Projects, so nothing is lost, but local hand edits to `.env` would be).
