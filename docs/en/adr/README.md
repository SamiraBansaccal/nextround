# 📐 Architecture decisions (ADR)

> 🇫🇷 **French version: [docs/fr/adr/](../../fr/adr/)** — a translation of these records.

## 🧭 Contents

- [📋 The list](#-the-list)

An ADR records **a decision, its context and its consequences** — including the bad ones. We
write one when a choice would otherwise be invisible in the code, or when someone could undo it
without knowing why it was made.

## 📋 The list

| # | Decision | Status |
|---|---|---|
| 🧰 [0001](0001-stripe-projects-provisioning.md) | Every service is provisioned with Stripe Projects; self-hosting means re-provisioning on your own accounts | ✅ accepted |
| 🐘 [0002](0002-neon-and-clerk.md) | Neon (Postgres) + Clerk (sign-in) rather than Supabase | ✅ accepted |
| 🔎 [0003](0003-ai-proposes-code-verifies.md) | The AI proposes, the code verifies: verbatim quotes, validated fact ids, short aliases | ✅ accepted |
| 🔌 [0004](0004-one-openai-compatible-client.md) | One OpenAI-compatible client; only presets on the public instance | ✅ accepted — **amended** by 0018 |
| 🔐 [0005](0005-encrypted-user-keys.md) | User API keys are encrypted at rest with one application key | ✅ accepted |
| 🚦 [0006](0006-instance-limits-in-postgres.md) | Instance-key limits are counted in Postgres | ✅ accepted |
| 🚚 [0007](0007-deploy-from-the-machine.md) | Deploy from the machine with the Vercel CLI, not from GitHub | ✅ accepted — **amended** on 2026-10-04 (token rotation) |
| 🎨 [0008](0008-lovable-design-source.md) | Lovable is the design source, ported by hand, one way | ✅ accepted — **extended** on 2026-10-04 (full port) |
| 📄 [0009](0009-pdfs-read-in-the-browser.md) | CV PDFs are read in the browser; only their text reaches the server | ✅ accepted |
| 🔊 [0010](0010-voice.md) | ElevenLabs reads only the user's own questions; dictation stays in the browser | ✅ accepted — **amended** by 0020 |
| 🎯 [0011](0011-one-question-set.md) | One question set per interview; the focus selector filters it | 🔁 superseded by 0017 |
| 🧱 [0012](0012-data-isolation.md) | A `user_id` on every table, enforced in `lib/data`, tested on an in-memory Postgres | ✅ accepted |
| 🆓 [0013](0013-free-models-by-default.md) | Free models by default: quality depends on the model, safety does not | ✅ accepted |
| 🗄️ [0014](0014-one-database.md) | One database for local development, tests against the app and production | ⚠️ accepted as **debt** |
| 🧮 [0015](0015-summary-computed-by-code.md) | The interview summary is computed by code, not written by the AI | ✅ accepted |
| 📏 [0016](0016-visual-check-by-measurement.md) | Screens are checked by measurement, with a disposable test user | ✅ accepted |
| ✍️ [0017](0017-questions-written-in-advance.md) | Interview questions are written in advance; the AI only reviews answers | ✅ accepted |
| 🧠 [0018](0018-claude-through-its-own-sdk.md) | Claude through Anthropic's own SDK, the one exception to the single client | ✅ accepted |
| 🌍 [0019](0019-three-languages.md) | Three independent languages: the site, each interview, each document | ✅ accepted |
| 🔊 [0020](0020-paid-voice-is-opt-in.md) | Paid voice is opt-in, and a sentence is never paid twice | ✅ accepted |
| 🗂️ [0021](0021-one-folder-per-domain.md) | One folder per domain, no loose files | ✅ accepted |
| 👤 [0022](0022-profile-is-the-base.md) | The profile is the base: everything validated, merged, editable | ✅ accepted |
| 🔐 [0023](0023-instance-keys-for-the-owner-only.md) | The instance's keys serve the owner only; sign-up closed during development | ✅ accepted |
| 🧭 [0024](0024-no-dashboard.md) | No dashboard: the profile is the home page | ✅ accepted |
| 🔁 [0025](0025-merge-for-good-dates-and-own-words.md) | Duplicates merged for good, one way to write CV dates, the candidate's own sentences join the base | ✅ accepted |
| 📨 [0026](0026-access-requests.md) | Access requests: Clerk's waitlist, an email to the owner, an answer in Settings | ✅ accepted |
| 🔐 [0027](0027-clerk-from-its-cli-not-the-marketplace.md) | Clerk is created with its own CLI, not from the Vercel Marketplace | ⛔ superseded by 0028 |
| 🔑 [0028](0028-neon-auth-and-a-london-database.md) | Sign-in with Neon Auth, the database in London | ✅ accepted |

> 📌 **Read the statuses.** An ADR is never deleted: when a decision changes, the old record stays
> and says where the next step is. That is how one understands *why* a decision changed, and not
> only what it became.

## 🧭 The questions these ADRs answer most often

**"Is it really impossible for the AI to invent something?"** → 0003 (how), 0013 (why it holds
even with a weak model), 0015 (the one screen with no AI at all).

**"Can I run my own NextRound?"** → 0001 (one command, your accounts), 0004 (local models),
0007 (deploying), 0014 (what to change for a serious deployment).

**"Where do my data and keys go?"** → 0005 (keys), 0009 (CVs), 0010 (voice), 0012 (isolation).

## ✍️ Writing a new one

Copy the shape of the existing ones: date, status, context, decision, consequences — **good and
bad**. An ADR with only good consequences was not written honestly.

**Write the English first**, here, then translate in `docs/fr/adr/`. Name the files
`NNNN-english-title.md` and `NNNN-titre-francais.md`, and add the line to **both** tables.
