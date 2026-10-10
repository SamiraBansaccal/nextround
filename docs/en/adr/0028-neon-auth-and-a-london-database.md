# 🔑 ADR 0028 — Sign-in with Neon Auth, the database in London

> 🇫🇷 French version: [fr/adr/0028](../../fr/adr/0028-neon-auth-et-une-base-a-londres.md)

- **Date:** 2026-10-10
- **Status:** ✅ accepted (switch in progress)
- **Supersedes:** [ADR 0027](0027-clerk-from-its-cli-not-the-marketplace.md) (Clerk from its CLI). **Amends:** [ADR 0002](0002-neon-and-clerk.md) (Neon + Clerk).

## 🎯 Context

The owner wants as few services as possible, every setting done by command, and a project that people who are not developers can deploy (anyone who gets the project has at least a GitHub account).

**Neon Auth** (Neon's managed Better Auth) lives inside the Neon project:

- accounts are stored in our own database (`neon_auth` schema);
- the Neon CLI sets everything: providers, email and password off, trusted domains, users (`neon neon-auth …`);
- the Neon product of the Vercel Marketplace has an **"Auth" option**, on by default at install: no extra account to open.

Tested on 2026-10-10 with a throwaway app outside the repo (Next 16, `@neondatabase/auth` 0.5.0-beta, the SDK's proxy for the session):

- **Frankfurt (`aws-eu-central-1`): sign-in is broken on Neon's side.** The auth service of an endpoint in zone `c-7` or `c-8` answers `ok`, but `sign-in/social` returns a URL on zone `c-6` (`<endpoint>.neonauth.c-6.eu-central-1.aws.neon.tech/…/sign-in/social/init`). The endpoint does not exist there: `{"error":"Upstream control-plane error","code":404,"cause":{"error":"endpoint not found","cpStatus":404}}`. Reproduced on two branches of the existing project and on a fresh Marketplace resource with Auth on from the start, with Neon's shared Google keys and with custom ("standard") keys. Disabling then re-enabling Neon Auth on a branch is then refused ("Neon Auth is not enabled for this branch").
- **London (`aws-eu-west-2`): it works end to end.** The sign-in URL stays on the endpoint's own zone (`c-2`), Google sign-in completes, and the account lands in `neon_auth.user` and `neon_auth.account`.

## ✅ Decision

- **Sign-in moves to Neon Auth.** Clerk is removed once the app's code has switched.
- **The database moves to London** (`aws-eu-west-2`), created from the Vercel Marketplace with Auth on, and the functions follow (`lhr1`). It stays in Europe: the United Kingdom has an EU adequacy decision for personal data.
- **Google and GitHub only**: email and password are turned off by command. GitHub needs the deployer's own OAuth credentials, because Neon lends shared keys for Google only, and only for development.
- **Invite-only sign-up and access requests move into the app** (our own tables): Neon Auth has no allowlist.
- Going back to Frankfurt can be reconsidered once Neon fixes the zone bug, which is to be reported to them.

## 📊 Consequences

**Good** 👍
- One service fewer: no Clerk account to open or to configure.
- Accounts live in our own database: readable with SQL, backed up with the rest of the data.
- Everything is set by command, and the Marketplace "Auth" option prepares a Deploy button.

**Bad** 👎
- The SDK is in beta (`0.5.0-beta`): minor versions may break things.
- GitHub sign-in needs an OAuth app per deployment (a one-click creation is still to build and test).
- Neon's shared Google keys are for development only and show Neon's name and logo on Google's screen.
- Invite-only sign-up and access requests have to be rebuilt in the app.
- One more data move (Frankfurt → London), and going back to Frankfurt depends on a fix from Neon.
