# 🔐 ADR 0023 — The instance's keys serve the owner only; sign-up closed during development

> 🇫🇷 French version: [fr/adr/0023](../../fr/adr/0023-cles-de-l-instance-pour-la-proprietaire.md)

- **Date:** 2026-10-05
- **Status:** ✅ accepted
- **Amends:** [ADR 0002](0002-neon-and-clerk.md) (how the owner is recognised)

## 🎯 Context

The owner asked whether a stranger who finds the Vercel address and signs up uses up her requests. Reading the code showed three gaps:

- the instance's AI and voice keys already served her account only, but the **Firecrawl** key (reading offer pages) served every signed-in account, up to 30 pages a day each;
- **sign-up was open**: Clerk development instance, empty allowlist. A stranger could also take room in the free database and run server functions;
- the owner was recognised by her GitHub **username**. A username can be changed, then registered again by someone else, who would get the instance keys.

## ✅ Decision

- **Every instance key serves the owner only**: AI (OpenRouter, Anthropic), voice (ElevenLabs, off by default anyway: [ADR 0020](0020-paid-voice-is-opt-in.md)) and now offer pages (Firecrawl). One resolver per service in `lib/ai/config.ts`: `resolveLlmConfig`, `resolveVoiceConfig`, `resolvePageReader`. Every other account brings its own keys in Settings: a Firecrawl key can now be saved there, encrypted like the others. Without one, an offer page is read by the built-in reader (free, `lib/offers/fetch-page.ts`), or the candidate pastes the text.
- **The owner is recognised by her numeric GitHub id** (`OWNER_GITHUB_ID`, the `id` returned by `api.github.com/users/<login>`), compared with the GitHub account that Clerk linked through OAuth (`providerUserId`). Missing variable = nobody is the owner (fail closed). `OWNER_GITHUB_LOGIN` is no longer used.
- **Sign-up is closed while the Clerk instance is in development**: allowlist on, holding the owner's verified address only (`npm run clerk:signup -- close`, script `scripts/infra/clerk-signup.mts`). Existing accounts keep signing in. Clerk applies the allowlist to accounts created through the Backend API too, so the e2e tests allow their test address only while they run: the seed adds it, the cleanup removes it.

## ⚖️ Consequences

- 👍 A stranger with the URL can no longer create an account (measured: `npm run clerk:signup -- probe` gets `403 not_allowed_access`) nor spend any of the owner's credits.
- 👍 Changing her GitHub username no longer matters, and the same id will work with a future production Clerk instance.
- 👎 The allowlist is free on a **development** instance only: on a production instance it is a paid Clerk feature. Going to production will need another gate (an allowlist checked by the app itself, for example) or the paid plan.
- 👎 One more variable to set everywhere: Mac `.env` (Stripe Projects variable `owner-github-id`), Vercel, cloud sessions. A cloud session without `OWNER_GITHUB_ID` still runs, but with no owner, so without the instance keys.
- 👎 For other accounts, offers on sites that block robots need their own Firecrawl key, or a paste.
- 💡 Paying through Stripe instead of bringing keys could one day be an option for other users: the owner's idea, not decided.
