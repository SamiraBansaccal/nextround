# 🎯 NextRound

> 🇫🇷 Version française : [README.fr.md](README.fr.md)

**Your coach to reach the next interview round — without inventing anything.**

NextRound helps people apply to tech jobs, with a focus on **interview practice**. Build your profile once (CVs, GitHub, Codewars, LeetCode), save the job offers you like, and NextRound matches each one against your profile, writes a tailored CV and cover letter, and lets you **practise a video interview** with the interviewer of your choice: on the offer's stack, on a technology, or on HR questions.

🌐 **Live app:** https://nextround-gamma.vercel.app (invite-only, see [option A](#️-option-a--use-the-app-online)) · 📚 **Docs:** [docs/](docs/README.md)

## 🧭 Contents

- [🤝 The core promise](#-the-core-promise)
- [✨ What it does](#-what-it-does)
- [🚪 Two ways to use NextRound](#-two-ways-to-use-nextround)
- [🅰️ Option A — use the app online](#️-option-a--use-the-app-online)
- [🅱️ Option B — run your own copy](#️-option-b--run-your-own-copy)
- [🔑 API keys, simply](#-api-keys-simply)
- [🤖 AI limits, explained](#-ai-limits-explained)
- [🛠️ For developers](#️-for-developers)

## 🤝 The core promise

**The AI never invents anything.**

- Every sentence of a CV, a letter or a suggested answer must trace back to a **fact of your profile**.
- Every item read from an offer (requirements, stack, contacts) must **quote the offer word for word**.
- Anything unsupported is **flagged**, never silently kept.

The checks are done by code, not by the AI ([ADR 0003](docs/en/adr/0003-ai-proposes-code-verifies.md)). That is what makes free AI models safe to use: whatever they invent gets caught.

## ✨ What it does

| | Feature |
|---|---|
| 👤 | **Profile** (the home page): import CVs (PDF, read in your browser), GitHub repositories, Codewars, LeetCode; everything merged into one base, duplicates folded; projects built with AI marked as such (they never count as mastery of their stack) |
| 💼 | **Offers**: add by link or pasted text; each requirement green (covered by your profile) or red (gap); offers grouped by career track, with their stage (Saved → Applied → Interview → Offer / Rejected) |
| 📄 | **Tailored CV and cover letter**, in English or French, every line backed by your facts; keep one in your profile and start the next one from it |
| 🎙️ | **Interview practice**: an offer, a technology (45, grouped in tracks) or HR questions; 110 interviewers; camera and mic check; questions written in advance in real English and French, with model answers; AI feedback on your own answers |
| 🌍 | **English or French** site, independent from each interview's and each document's language |

## 🚪 Two ways to use NextRound

NextRound is a website. It does not run on your computer: it runs **in the cloud**, on several free services (hosting, database, sign-in), and the AI comes from an AI provider. So there are two ways to use it:

- 🅰️ **Use the owner's app**, already online: get invited, sign in, add your own AI key. Five minutes.
- 🅱️ **Run your own copy**: the same code, on **your own** accounts (your hosting, your database, your keys). An hour or two the first time.

| | 🅰️ The owner's app | 🅱️ Your own copy |
|---|---|---|
| ⏱️ Setup | 5 minutes: get invited, sign in, paste an AI key | 1 to 2 hours the first time: accounts, tools, one command |
| 💶 Cost | Free (free AI models are enough) | Free on the free plans; nothing is charged unless you upgrade a service yourself |
| 👤 Accounts you need | GitHub (or Google) and an AI provider (OpenRouter) | The same, plus a **verified Stripe account**; Stripe Projects then creates or links the Vercel, Neon, Clerk and OpenRouter accounts for you (ElevenLabs and Firecrawl optional) |
| 🔄 Updates | **Automatic**: new features appear as soon as the owner deploys them | **None by default**: your copy only changes when you pull the owner's changes and redeploy (see [updating](#-update-your-copy-later)) |
| 🗄️ Your data | In the **owner's** database: the owner administers it and could technically read it, and may **delete or reset it** at any time (it is a personal project, with no guarantee) | In **your** database: you are the only administrator |
| 🚦 Limits | Your AI key's own limits; the free hosting and database quotas are **shared** by everyone on the app | Every free quota is yours |
| 🧯 Stability | The app can change, break or be reset without notice | It only changes when you decide |
| 👍 Best for | Trying it, practising for an interview next week | Learning how a real web app is built and hosted, full control |

## 🅰️ Option A — use the app online

### 1. Get invited

Sign-up is **invite-only**: send the owner the **email address of the GitHub account** (or Google account) you will sign in with. She adds it to the guest list; until then, Clerk refuses the sign-up with "Access not allowed".

### 2. Sign in

Open https://nextround-gamma.vercel.app and click **Continue with GitHub** (recommended) or **Continue with Google**.

- 🐙 **GitHub is recommended**: the profile can import your public GitHub projects automatically, from the account you signed in with. With Google, that import button stays disabled (you can still add CVs).
- 🔐 NextRound never sees your password: GitHub or Google confirms who you are (that is called **OAuth**), and **Clerk**, the sign-in service, keeps your session.
- 🧪 The sign-in screens may show **"Development mode"**: the app uses Clerk's free development setup. Nothing is wrong.

### 3. Connect your AI (needed for feedback, offers and CVs)

The AI reads offers and CVs, matches requirements with your profile, writes CVs and letters, and gives feedback on your answers. **Interview questions and model answers are written in advance: they work without AI.**

The owner's AI key only serves the owner's account. **You bring your own**, so your usage and hers never mix ([ADR 0023](docs/en/adr/0023-instance-keys-for-the-owner-only.md)). The simplest free option is **OpenRouter**:

1. Create an account on https://openrouter.ai (free, no card needed for free models).
2. Open https://openrouter.ai/keys and click **Create key**. Give it a name ("NextRound") and, for peace of mind, a small **credit limit** (free models cost nothing). Copy the key: it starts with `sk-or-`.
3. In NextRound, open **Settings** → **AI provider** → **OpenRouter**, paste the key, keep a free model (its id ends with `:free`, a free Qwen model is suggested), **Save**, then **Test connection**.

Other providers work the same way: Groq and Mistral have free tiers with their own limits; OpenAI and Anthropic are paid per call. See [AI limits, explained](#-ai-limits-explained) for what "free" allows.

### 4. Voice (optional)

- 🗣️ By default the interviewer reads the questions with **your browser's voice**: free, nothing to set up. Answering out loud uses the browser's speech recognition (Chrome or Edge).
- 🎧 For nicer voices, add an **ElevenLabs** key in **Settings** → **Voice**: create an account on https://elevenlabs.io, then an API key in the API keys section of your account. The free plan gives 10,000 credits a month (roughly ten minutes of speech) for personal, non-commercial use. A sentence already read is never paid twice.

### 5. Offer pages (optional)

When you add an offer by its link, NextRound reads the page itself, for free. Some sites block that: paste the offer's text instead, or add a **Firecrawl** key in **Settings** → **Offer pages** (https://www.firecrawl.dev, free plan: 1,000 pages a month).

### 6. What happens to your data

- 🧱 Each account only ever sees its own data: every database query is filtered by your account's id, and this is tested.
- 🔐 The keys you save are **encrypted** (AES-256-GCM) and never shown again, not even to you (only their last 4 characters). But they live on the owner's server, which holds the encryption key: **you trust the owner**. Use a key made for NextRound, with a credit limit, and delete it at the provider's site whenever you want.
- 🧹 This is a personal project: the database can be reset. Keep your CV files, and download the CVs and letters you want to keep (**Download** or **Print / PDF** buttons).

## 🅱️ Option B — run your own copy

### 🧩 The big picture

Once deployed, your copy is made of a few services that talk to each other over the internet:

```
 Your browser
     │  https://<your-app>.vercel.app
     ▼
 Vercel ─────── hosting: runs the Next.js app, page by page, request by request
   ├── Clerk ........ sign-in with GitHub or Google, sessions
   ├── Neon ......... the Postgres database (profiles, offers, interviews)
   ├── OpenRouter ... the AI (your key, for your account)
   ├── ElevenLabs ... voices (optional)
   └── Firecrawl .... reading offer pages (optional)
```

### 📖 Words to know

| Word | What it means here |
|---|---|
| **Repository (repo)** | The project's folder of code, on GitHub. **Fork** = your own copy of it on GitHub; **clone** = download it to your computer. |
| **Hosting** | A company that runs your website on its computers, so it is online all the time. Here: **Vercel**. |
| **Serverless** | You never rent or manage a server. Vercel starts your code for each request and stops it after; Neon wakes the database when needed and puts it to sleep after 5 minutes of quiet (the first click after a pause is a bit slower). |
| **Database** | Where the data is kept. Here: **Postgres**, run by **Neon** in the cloud. |
| **Auth** | Signing in: who are you? Here: **Clerk**, with GitHub or Google. |
| **API** | A door a service opens for programs (not for people with a browser). NextRound calls OpenRouter's API to talk to an AI model. |
| **API key** | The badge that opens that door: it says which account is calling, so the service can count and bill it. See [API keys, simply](#-api-keys-simply). |
| **Environment variables (`.env`)** | Settings given to the app when it starts, outside the code: keys, database address… On your computer they sit in a `.env` file that git ignores; on Vercel, in the project's settings. |
| **CLI** | A program you use by typing commands in a terminal. |
| **Deploy** | Put a new version of the app online. |
| **Migration** | A file that creates or changes the database tables. It must run before the code that needs it goes online. |
| **Free tier** | The free plan of a service, with limits (storage, requests per day…). |

### 🧾 What Stripe Projects does

NextRound uses six services. Normally that means six sign-ups, six dashboards and six API keys copied by hand. **Stripe Projects** (a plugin of the Stripe command-line tool) does it for you:

1. You sign in to **your** Stripe account in the terminal.
2. `stripe projects add vercel/project` (and the same for Neon, Clerk, OpenRouter…) creates the account at that provider for you, or links the one you already have, and creates the resource (a Vercel project, a Neon database, a Clerk application) on its **free plan**.
3. The provider hands the credentials to Stripe, which keeps them encrypted in its **secret store**.
4. `stripe projects env --pull` writes them into the `.env` file on your computer. **You never copy a key by hand.**
5. Stripe Projects does not send them to Vercel: NextRound's script `scripts/infra/push-env-to-vercel.mjs` does it, and Vercel stores them encrypted.

Good to know, before you start:

- ✅ Stripe Projects needs a **Stripe account in live mode**, which means **identity verification**, as for any payment account. You do not sell anything, and the free plans cost nothing; `stripe projects spend` shows what you spend (it should say no charges).
- ✅ Accepting each provider's terms shares your Stripe account's name, email, country and phone with that provider. The script asks you each time.
- ⚠️ The one-command install below was checked in **dry run** (it lists every step without doing anything); a full run on brand-new accounts has not been done yet. If a step fails, fix it and run the command again: finished steps are skipped.

### 🧰 What you need

- 🐙 A **GitHub** account.
- 💳 A **Stripe** account in live mode (https://dashboard.stripe.com/register).
- 🟢 **Node.js** 20 or newer (https://nodejs.org, the "LTS" version) and **Git** (https://git-scm.com).
- 🧾 The **Stripe CLI** and its Projects plugin. On macOS: `brew install stripe/stripe-cli/stripe`, then `stripe plugin install projects`. Other systems: https://docs.stripe.com/stripe-cli/install.

### 🚀 Step by step

1. **Fork** the repository on GitHub (the **Fork** button, top right of https://github.com/SamiraBansaccal/nextround): you get your own copy, which can receive the owner's updates later.
2. **Clone your fork** and install the dependencies:
   ```bash
   git clone https://github.com/<your-github-login>/nextround.git
   cd nextround
   npm install
   ```
3. **Sign in to Stripe** in the terminal: `stripe login` (a browser page asks you to confirm).
4. **Preview** what will happen, without doing anything:
   ```bash
   npm run bootstrap -- --owner <your-github-login> --dry-run
   ```
5. **Run it for real**:
   ```bash
   npm run bootstrap -- --owner <your-github-login>
   ```
   It goes through seven steps, and asks you to approve things in the browser along the way:
   1. creates your Stripe project;
   2. adds the free plans: Vercel, Neon, Clerk, OpenRouter, Firecrawl, ElevenLabs;
   3. writes the credentials to `.env`;
   4. creates the app's own values: the Clerk keys, an encryption key, and **you as the owner** (your numeric GitHub id);
   5. creates the database tables;
   6. turns on the GitHub sign-in in your Clerk application;
   7. sends the variables to Vercel and deploys. At the end you get your address: `https://<name>.vercel.app`.
6. **Open your app** and sign in with the GitHub account you gave as `--owner`: you are the owner, so the instance keys (the OpenRouter key created for you) work for your account without anything to paste.
7. **Decide who can sign up.** By default anyone can create an account (they will need their own AI key). To make your app invite-only:
   ```bash
   npm run clerk:signup -- close             # only you
   npm run clerk:signup -- allow friend@example.com
   npm run clerk:signup -- status            # who is allowed
   ```
   (This guest list is free on Clerk's development setup, which the install uses; on a production Clerk setup it is a paid feature.)
8. **Check your costs** whenever you want: `stripe projects spend`.

### 🔄 Update your copy later

Your copy never changes by itself. To get the owner's new features:

1. On GitHub, open your fork and click **Sync fork** → **Update branch**.
2. On your computer:
   ```bash
   git pull
   npm install
   node scripts/infra/deploy.mjs   # applies the new database migrations first, then deploys
   ```

If you changed the code yourself, the sync may ask you to resolve conflicts first.

### 💻 Try it on your computer

`npm run dev` starts the app at http://localhost:3000. It is still **not "local"**: it uses the **same** Neon database and the same Clerk application as your online copy, over the internet. What you do on localhost shows up online ([ADR 0014](docs/en/adr/0014-one-database.md)).

### 📏 The free plans, in numbers

| Service | Free plan |
|---|---|
| ▲ Vercel (Hobby) | Personal, non-commercial use; 1,000,000 function calls, 4 hours of active CPU and 360 GB-hours of memory a month; over that, the feature pauses until the 30-day window resets |
| 🐘 Neon | 1 GB of storage per project, 100 compute-hours a month, sleeps after 5 minutes of quiet |
| 🔐 Clerk | Up to 50,000 retained users per application |
| 🤖 OpenRouter | Free models: 20 requests a minute and 50 a day per account (1,000 a day after buying $10 of credits once) |
| 🎧 ElevenLabs | 10,000 credits a month, non-commercial |
| 🕷️ Firecrawl | 1,000 pages a month |

Figures checked on the providers' pricing pages on 2026-10-05: they can change.

### 🧑‍🔧 Without Stripe Projects (advanced)

Possible, but by hand: create the accounts yourself (Vercel, Neon, Clerk, OpenRouter), copy [`.env.example`](.env.example) to `.env` and fill each value from the provider's website (the file explains every line), run `npm run db:migrate`, then deploy with `npx vercel` and add the same variables in the Vercel project's **Settings → Environment Variables**. This path has not been tested end to end.

## 🔑 API keys, simply

- 🎫 An **API key** is a password for programs. Whoever holds it **acts as the account that owns it**: their requests are counted and billed to that account. So a key is never shared, never written in the code, never sent to the browser.
- 🗂️ **Where NextRound keeps them:**
  - the keys of the owner's services: in Stripe's secret store, on the owner's computer in `.env` (ignored by git), and online in Vercel's environment variables (encrypted);
  - the keys users save in **Settings**: encrypted in the database (AES-256-GCM), never sent back to the browser;
  - in the code: **none**. Every file and the whole git history were scanned on 2026-10-05 (OpenRouter, Anthropic, OpenAI, Stripe, Clerk, ElevenLabs, Firecrawl and GitHub keys, tokens, database passwords): only placeholders in examples, and no `.env` file was ever committed.
- 🧯 **If a key leaks:** delete it on the provider's website and create a new one (with Stripe Projects: `stripe projects rotate <resource>`).

## 🤖 AI limits, explained

- 🧭 **OpenRouter is a broker**: one account and one key give access to hundreds of models from different companies (Qwen by Alibaba, Llama by Meta, Mistral…). A model is not tied to anyone; **the key is**: every call made with a key counts against the account that owns it.
- 🆓 **Free models** (their id ends with `:free`): OpenRouter allows each **account** 20 requests a minute and 50 a day, all free models together (1,000 a day once you have bought $10 of credits). Creating more keys or accounts does not add capacity.
- 🚦 **NextRound's own caps**: on the owner's instance key, NextRound adds 8 calls a minute and 40 a day, under OpenRouter's 50, so that a burst never empties the owner's day. They apply to the owner's account only, since no other account can use that key.
- 🙋 **Your own key = your own limits.** The owner's usage and yours never mix.
- 💡 **Is free enough?** Yes. Free models are slower and sometimes busy (a backup model is tried), but NextRound checks every AI output by code, so a weaker model cannot slip in invented facts. A paid model is faster and writes better.
- 🧮 **What uses a call:** one per answer feedback, one per offer read, one per CV read, one per CV or letter written. Interview questions use none.

## 🛠️ For developers

### 🧱 Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 + shadcn/ui · Drizzle ORM on Neon Postgres · Clerk (GitHub and Google sign-in) · zod · Vitest + PGlite · Playwright. Services provisioned with [Stripe Projects](https://docs.stripe.com/projects) ([ADR 0001](docs/en/adr/0001-stripe-projects-provisioning.md)).

### 🗂️ Repository layout

```
app/          🖥️  pages and routes; (app)/ is the signed-in area
components/   🧩  UI only, one folder per area (offers, profile, interview…)
lib/          🧠  logic: server/, data/, ai/, offers/, profile/, documents/, interview/, i18n/…
tests/        🧪  Vitest, one folder per domain; e2e/ for Playwright
scripts/      ⚙️  infra/, owner/, offers/, avatars/, test/
drizzle/      🗄️  SQL migrations
docs/         📚  guides, architecture decisions (ADR), journal
```

Full tour: [docs/en/guides/architecture.md](docs/en/guides/architecture.md).

### 🧪 Commands

```bash
npm run dev          # http://localhost:3000 (needs a .env)
npm test             # unit tests, no secrets needed
npm run e2e          # every screen in a real browser (needs the Clerk and Neon keys)
npm run build && E2E_PROD=1 npm run e2e   # the same screens on the production build (stricter CSP)
npm run db:migrate   # apply new migrations before deploying
npm run clerk:signup -- status | close | open | allow <email> | disallow <email>
```

### 🔒 Security

| | Measure |
|---|---|
| 🔑 | Secrets in environment variables only (`.env` git-ignored, Vercel env vars); repository and history scanned |
| 👑 | The instance keys (AI, voice, offer pages) serve the owner's account only, recognised by her numeric GitHub id ([ADR 0023](docs/en/adr/0023-instance-keys-for-the-owner-only.md)) |
| 🧱 | Every table has a `user_id`; every query filters by the session's user; tested on an in-memory Postgres ([ADR 0012](docs/en/adr/0012-data-isolation.md)) |
| 🔐 | User API keys encrypted, masked, never logged |
| 🛡️ | Strict Content-Security-Policy with a nonce per request; no framing |
| 🌐 | Offer pages: public http(s) addresses only, checked again when the connection opens (no DNS rebinding) |
| 🧾 | zod validation and length limits on every server action |
| 🤖 | Offers, CVs and answers are untrusted data in prompts; every AI output is verified by code and shown as plain text |

### ⚠️ Known limitations

- Voice answers use the browser's speech recognition (Chrome, Edge).
- Offers come by link or pasted text; Indeed blocks robots, so its offers are pasted.
- Clerk runs as a development instance ("Development mode" badge, shared GitHub/Google credentials).
- One database serves local development and production ([ADR 0014](docs/en/adr/0014-one-database.md)).
- Free models can be saturated; a backup model is configured.
