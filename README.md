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
| ⏱️ Setup | 5 minutes: get invited, sign in, paste an AI key | 1 to 2 hours the first time: a few accounts to create and keys to copy |
| 💶 Cost | Free (free AI models are enough) | Free on the free plans; nothing is charged unless you upgrade a service yourself |
| 👤 Accounts you need | GitHub (or Google) and an AI provider (OpenRouter) | The same, plus **Vercel**, **Neon** and **Clerk** accounts (ElevenLabs, Firecrawl and Resend optional) |
| 🔄 Updates | **Automatic**: new features appear as soon as the owner deploys them | **None by default**: your copy only changes when you pull the owner's changes and redeploy (see [updating](#-update-your-copy-later)) |
| 🗄️ Your data | In the **owner's** database: the owner administers it and could technically read it, and may **delete or reset it** at any time (it is a personal project, with no guarantee) | In **your** database: you are the only administrator |
| 🚦 Limits | Your AI key's own limits; the free hosting and database quotas are **shared** by everyone on the app | Every free quota is yours |
| 🧯 Stability | The app can change, break or be reset without notice | It only changes when you decide |
| 👍 Best for | Trying it, practising for an interview next week | Learning how a real web app is built and hosted, full control |

## 🅰️ Option A — use the app online

### 1. Get invited

Sign-up is **invite-only**. On the home page, click **No invitation yet? Request access** and give the **email address of the GitHub account** (or Google account) you will sign in with. The owner is told by email and answers in her Settings; when she allows you, Clerk emails you an invitation. Until then, Clerk refuses the sign-up with "Access not allowed".

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

### 🧭 Why no more Stripe Projects

NextRound was born during a Stripe hackathon, where we discovered **Stripe Projects**: from a single Stripe account, it created the accounts at every provider (Vercel, Neon, Clerk…) and kept their keys. We dropped it in October 2026. It already required handing your identity to Stripe; after an update of its plugin, a new account could no longer switch to live mode without activating payments, which means giving a bank account, for a project that sells nothing. A day lost going back and forth between the terminal and the browser, and terms that can change overnight: no basis for a reliable install. Your copy is now set up directly with each service.

### 🧰 What you need

- 🐙 A **GitHub** account.
- ▲ Free accounts at **Vercel** (hosting), **Neon** (database), **Clerk** (sign-in) and **OpenRouter** (AI). ElevenLabs, Firecrawl and Resend are optional.
- 🟢 **Node.js** 20 or newer (https://nodejs.org, the "LTS" version) and **Git** (https://git-scm.com).

### 🚀 Step by step

⚠️ This path has not been run again end to end on brand-new accounts yet.

1. **Fork** the repository on GitHub (the **Fork** button, top right of https://github.com/SamiraBansaccal/nextround): you get your own copy, which can receive the owner's updates later.
2. **Clone your fork** and install the dependencies:
   ```bash
   git clone https://github.com/<your-github-login>/nextround.git
   cd nextround
   npm install
   ```
3. **Create your services**, each on its free plan:
   - **Neon**: a project, then copy its connection string (`postgresql://…`);
   - **Clerk**: with its command line, not from the Vercel Marketplace ([why](docs/en/adr/0027-clerk-from-its-cli-not-the-marketplace.md)): `npx clerk auth login`, then `npx clerk apps create NextRound`; turn on the **GitHub** sign-in with `npx clerk config patch --app <app_id> --instance dev --json '{"connection_oauth_github":{"enabled":true}}'`; `npx clerk env pull --app <app_id>` writes its two keys to `.env.local`;
   - **OpenRouter**: an API key (see [option A, step 3](#3-connect-your-ai-needed-for-feedback-offers-and-cvs)).
4. **Fill in your `.env`**: copy [`.env.example`](.env.example) to `.env` and fill each line; the file explains where each value comes from. For the encryption key: `openssl rand -base64 32`. For your numeric GitHub id: the `id` field of `https://api.github.com/users/<your-github-login>`.
5. **Create the database tables**: `npm run db:migrate`.
6. **Go online**: `npx vercel` creates your Vercel project. Add the same variables in the project's **Settings → Environment Variables**, then run `npx vercel --prod`. At the end you get your address: `https://<name>.vercel.app`.
7. **Open your app** and sign in with your GitHub account: you are the owner, so the OpenRouter key in your `.env` works for your account without anything to paste.
8. **Decide who can sign up.** By default anyone can create an account (they will need their own AI key). To make your app invite-only:
   ```bash
   npm run clerk:signup -- close             # only you
   npm run clerk:signup -- allow friend@example.com
   npm run clerk:signup -- status            # who is allowed
   ```
   (This guest list is free on Clerk's development setup; on a production Clerk setup it is a paid feature.) People can also ask from your home page: their requests appear in **Settings → Access requests**, where you allow or decline them, and you get an email for each one if a Resend key is set.

### 🔄 Update your copy later

Your copy never changes by itself. To get the owner's new features:

1. On GitHub, open your fork and click **Sync fork** → **Update branch**.
2. On your computer:
   ```bash
   git pull
   npm install
   npm run db:migrate   # applies the new database migrations first
   npx vercel --prod    # then deploys
   ```

If you changed the code yourself, the sync may ask you to resolve conflicts first.

### 📏 The free plans, in numbers

| Service | Free plan |
|---|---|
| ▲ Vercel (Hobby) | Personal, non-commercial use; 1,000,000 function calls, 4 hours of active CPU and 360 GB-hours of memory a month; over that, the feature pauses until the 30-day window resets |
| 🐘 Neon | 1 GB of storage per project, 100 compute-hours a month, sleeps after 5 minutes of quiet |
| 🔐 Clerk | Up to 50,000 retained users per application |
| 🤖 OpenRouter | Free models: 20 requests a minute and 50 a day per account (1,000 a day after buying $10 of credits once) |
| 🎧 ElevenLabs | 10,000 credits a month, non-commercial |
| 🕷️ Firecrawl | 1,000 pages a month |
| ✉️ Resend | 3,000 emails a month; without a domain of your own, it only sends to your account's address (enough to tell you about access requests) |

Figures checked on the providers' pricing pages on 2026-10-05: they can change.

## 🔑 API keys, simply

- 🎫 An **API key** is a password for programs. Whoever holds it **acts as the account that owns it**: their requests are counted and billed to that account. So a key is never shared, never written in the code, never sent to the browser.
- 🗂️ **Where NextRound keeps them:**
  - the keys of the owner's services: on the owner's computer in `.env` (ignored by git), and online in Vercel's environment variables (encrypted);
  - the keys users save in **Settings**: encrypted in the database (AES-256-GCM), never sent back to the browser;
  - in the code: **none**. Every file and the whole git history were scanned on 2026-10-05 (OpenRouter, Anthropic, OpenAI, Stripe, Clerk, ElevenLabs, Firecrawl and GitHub keys, tokens, database passwords): only placeholders in examples, and no `.env` file was ever committed.
- 🧯 **If a key leaks:** delete it on the provider's website, create a new one and replace it in your `.env` and on Vercel.

## 🤖 AI limits, explained

- 🧭 **OpenRouter is a broker**: one account and one key give access to hundreds of models from different companies (Qwen by Alibaba, Llama by Meta, Mistral…). A model is not tied to anyone; **the key is**: every call made with a key counts against the account that owns it.
- 🆓 **Free models** (their id ends with `:free`): OpenRouter allows each **account** 20 requests a minute and 50 a day, all free models together (1,000 a day once you have bought $10 of credits). Creating more keys or accounts does not add capacity.
- 🚦 **NextRound's own caps**: on the owner's instance key, NextRound adds 8 calls a minute and 40 a day, under OpenRouter's 50, so that a burst never empties the owner's day. They apply to the owner's account only, since no other account can use that key.
- 🙋 **Your own key = your own limits.** The owner's usage and yours never mix.
- 💡 **Is free enough?** Yes. Free models are slower and sometimes busy (a backup model is tried), but NextRound checks every AI output by code, so a weaker model cannot slip in invented facts. A paid model is faster and writes better.
- 🧮 **What uses a call:** one per answer feedback, one per offer read, one per CV read, one per CV or letter written. Interview questions use none.

## 🛠️ For developers

### 💻 Run the code on your computer (to change it)

> Only if you want to **modify NextRound's code**. To simply use your copy, you never need this: it runs on Vercel.

**Why run it on your computer?** To change the code and see the result in a second, without putting anything online. It is the usual way to develop: you edit a file, save it, and the page reloads by itself.

**What runs where.** Only the code moves to your computer. The database and the sign-in stay in the cloud: there is no database on your computer. Your `.env` file, filled in during the install, tells the app where to find them, and it gives the same addresses as your online copy uses ([ADR 0014](docs/en/adr/0014-one-database.md)):

```
Online        your browser → Vercel runs the code         → Neon (data) + Clerk (sign-in) + OpenRouter (AI)
npm run dev   your browser → your computer runs the code  → the same Neon + Clerk + OpenRouter
```

**What it means for you:**

- 🗄️ It is your **real data**: a fact you add on http://localhost:3000 is also in your online app, and what you delete there is deleted online too.
- 🤖 The AI calls you make while testing count on your real AI quota.
- 🔐 You sign in with the same account as online.
- 🚀 Your code changes stay on your computer until you deploy them (see [update your copy](#-update-your-copy-later)).

**How:**

```bash
npm run dev     # then open http://localhost:3000; Ctrl+C in the terminal to stop
```

It needs the `.env` file you filled in during the install: without it, the pages show an error that names the missing variables.

### 🧱 Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 + shadcn/ui · Drizzle ORM on Neon Postgres · Clerk (GitHub and Google sign-in) · zod · Vitest + PGlite · Playwright.

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
