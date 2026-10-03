# 🐘 ADR 0002 — Neon (Postgres) + Clerk (sign-in) rather than Supabase

> 🇫🇷 French version: [FR/adr/0002](../../FR/adr/0002-neon-et-clerk.md)

- **Date:** 2026-10-03
- **Status:** ✅ accepted

## 🎯 Context

The spec asked for Postgres on Neon or Supabase, and sign-in with Clerk — or Supabase Auth if
Supabase were the database. Sign-in with **GitHub is required** (the profile import starts from the
GitHub username) and Google is optional. The app had to be demonstrable to a jury after the
hackathon, possibly days later.

## ⚖️ The options

| | Supabase (database + auth) | Neon + Clerk |
|---|---|---|
| Free tier pauses? | **Yes**: a free project is paused after a week without activity | No: Neon only suspends compute, which wakes in a fraction of a second |
| GitHub sign-in in development | Needs a GitHub OAuth App created by hand, pasted in the dashboard | Clerk development instances provide shared OAuth credentials |
| Providers | One | Two |

## ✅ Decision

**Neon for Postgres, Clerk for sign-in.** Clerk runs as a *development instance*; GitHub was
switched on with the Clerk CLI (`clerk config patch … connection_oauth_github.enabled=true`).

## 📊 Consequences

**Good** 👍

- The demo cannot be found asleep by a jury.
- GitHub sign-in worked without creating any OAuth App.
- The GitHub username comes from the verified OAuth account, which is what decides who the
  instance owner is (`OWNER_GITHUB_LOGIN`).

**Bad** 👎

- **Two providers instead of one** — two dashboards, two sets of credentials.
- **The Clerk instance is a development instance**: a "Development mode" badge, shared OAuth
  credentials and Clerk's development usage limits. Moving to production needs a domain of one's
  own and own OAuth credentials (`npx clerk deploy` guides it). Not done.
- Clerk's API changed in Core 3 (March 2026): the new `signIn.sso()` flow has no exported callback
  component for Next.js yet, so the app uses the well-documented `authenticateWithRedirect` +
  `AuthenticateWithRedirectCallback` pair.
