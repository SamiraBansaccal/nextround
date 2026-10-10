# 🔐 ADR 0027 — Clerk is created with its own CLI, not from the Vercel Marketplace

> 🇫🇷 French version: [fr/adr/0027](../../fr/adr/0027-clerk-par-sa-cli-pas-par-la-marketplace.md)

- **Date:** 2026-10-10
- **Status:** ✅ accepted
- **Follows:** [ADR 0002](0002-neon-and-clerk.md) (GitHub sign-in switched on with `clerk config patch`), [ADR 0023](0023-instance-keys-for-the-owner-only.md) (invite-only, development instance)

## 🎯 Context

After leaving Stripe Projects, Neon and Clerk were installed from the **Vercel Marketplace**: one command each, and their keys land on the Vercel project by themselves.

A Clerk application created by the Marketplace lives in a workspace **managed by Vercel**. The owner's role there is `managed_owner`, and Clerk gives that role **no access to its Platform API**, which the Clerk CLI uses for settings:

- `clerk apps list` and `clerk config patch --app …` answer `403 Workspace role has no Platform API access`. Clerk's own message: *"This workspace is managed by a partner integration, so its roles cannot be changed. Use an API key with the scopes you need."*
- With only the application's secret key, the CLI covers a few settings and refuses `connection_oauth_github`.
- Clerk's Backend API has no endpoint for sign-in methods, and the Vercel CLI only takes plan options for the Clerk integration.

So switching GitHub sign-in on, which ADR 0002 did with one command, became a click in the Clerk dashboard, and so would every later setting. A developer copes. But NextRound wants to be deployable by people who are not: someone with no coding background, or a junior who knows algorithms but gets lost as soon as code has to leave their computer. And the deployment we offer others must be the one we run ourselves.

Clerk's documentation adds that an existing Clerk application **cannot be moved under the Vercel integration later**.

## 🔍 Options considered

| Option | Verdict |
|---|---|
| Keep the Marketplace Clerk and click in its dashboard | Works, but every setting is a dashboard visit: nothing can be scripted |
| Keep it with a Platform API key (`ak_…` in `CLERK_PLATFORM_API_KEY`, read by the Clerk CLI) | Clerk's documented way out, but the key itself is created by hand in the dashboard; not tried |
| Another sign-in service: Neon Auth or Better Auth | Neon Auth lends development credentials for Google only, and documents neither GitHub nor invite-only sign-up; with Better Auth, every person who deploys must create GitHub and Google OAuth apps, even to try. Both mean rewriting sign-in |
| **Clerk created with its CLI** | ✅ every setting by command, as before |

## ✅ Decision

- **Clerk is created with its CLI**, with the deployer's own Clerk account: `clerk auth login` (one sign-in in the browser), `clerk apps create`, `clerk config patch` (GitHub on, invite-only list), `clerk env pull` for the two keys.
- **The keys go to Vercel with the Vercel CLI**: the publishable key for production and development, the secret key as *sensitive* in production (nobody can read it back) and encrypted for development. They never go through git.
- **Neon stays on the Marketplace**: none of these limits showed up (tables, keys and region all worked).
- The owner's own instance was redone this way on 2026-10-10: Marketplace resource and integration removed, new application, data moved to the new account, production redeployed.

## 📊 Consequences

**Good** 👍
- Every Clerk setting is a command again: ADR 0002 works as written.
- A deployment script can do it all after one sign-in, with the deployer's own accounts and nothing personal in the code.
- The owner and anyone deploying a copy follow the same steps.
- GitHub and Google sign-in work without creating OAuth apps, thanks to the development instance's shared credentials.

**Bad** 👎
- One more account to open (Clerk, in the deployer's name); the Marketplace made it implicit.
- Vercel does not keep the keys in sync: the script pushes them, and must run again after a key rotation.
- Billing is not in Vercel (irrelevant while everything is free).
- A Clerk application created this way can never be moved under the Vercel integration (Clerk's documentation).
