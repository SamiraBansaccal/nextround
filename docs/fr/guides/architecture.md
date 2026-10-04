# 🏗️ Architecture du repo

> 🇬🇧 English version: [en/guides/architecture.md](../../en/guides/architecture.md)

Où se trouve quoi, et où ranger un nouveau fichier. Si tu hésites entre deux dossiers, la règle d'or est en bas : [📏 Les règles de rangement](#-les-règles-de-rangement).

## 🧭 Sommaire

- [🌳 Vue d'ensemble](#-vue-densemble)
- [🖥️ `app/` : les pages et les routes](#️-app--les-pages-et-les-routes)
- [🧩 `components/` : l'interface](#-components--linterface)
- [🧠 `lib/` : la logique](#-lib--la-logique)
- [🧪 `tests/` : les tests](#-tests--les-tests)
- [⚙️ `scripts/` : les outils en ligne de commande](#️-scripts--les-outils-en-ligne-de-commande)
- [🎨 `assets/` et `public/`](#-assets-et-public)
- [🔧 Les fichiers à la racine](#-les-fichiers-à-la-racine)
- [📏 Les règles de rangement](#-les-règles-de-rangement)

## 🌳 Vue d'ensemble

```
nextround/
├── app/            🖥️  pages et routes (Next.js App Router)
├── components/     🧩  interface : reçoit des données en props, ne fait pas de logique
├── lib/            🧠  logique métier, IA, accès aux données, textes de l'interface
├── tests/          🧪  Vitest (un dossier par domaine) + Playwright (e2e)
├── scripts/        ⚙️  outils CLI : infra, owner, offres, avatars, e2e
├── drizzle/        🗄️  migrations SQL générées depuis lib/db/schema.ts
├── assets/         🎨  sources des avatars (références, plans de clips) — pas servi
├── public/         🌐  fichiers servis tels quels (logo, vignettes des intervieweurs)
├── docs/           📚  la doc (voir docs/README.md)
└── .claude/ .agents/ .cursor/ .projects/   🤖 config des outils (skills, hooks, Stripe Projects)
```

Le chemin d'import `@/` part de la racine : `@/lib/ai/client`, `@/components/ui/button`, `@/tests/helpers/test-db`.

## 🖥️ `app/` : les pages et les routes

```
app/
├── page.tsx                  🏠 page d'accueil publique
├── sign-in/ sign-up/ sso-callback/   🔑 connexion (Clerk)
├── (app)/                    🔒 zone connectée (le dossier entre parenthèses n'apparaît pas dans l'URL)
│   ├── layout.tsx            menu, bouton de langue EN/FR, thème
│   ├── ui-actions.ts         server action : changer la langue du site
│   ├── dashboard/            📊 tableau de bord
│   ├── offers/               💼 offres, une offre (/offers/[id]), CV et lettre (/offers/[id]/cv)
│   ├── interview/            🎙️ liste, nouvel entretien (/new), l'appel (/[id]), le résumé (/[id]/summary)
│   ├── profile/              👤 CV, faits, imports
│   └── settings/             ⚙️ IA et voix
└── api/tts/                  🔊 lecture des questions à voix haute
```

- Chaque page est un *server component* : elle lit la session (`requireUserId()`), charge les données et les passe au composant.
- Les **server actions** sont dans un `actions.ts` à côté de la page qui les utilise.
- `proxy.ts` (à la racine) protège tout sauf l'accueil et la connexion ; le code serveur revérifie quand même la session.

## 🧩 `components/` : l'interface

Un dossier par **zone de l'app**, plus trois dossiers communs.

| Dossier | Contenu |
|---|---|
| `ui/` | Composants shadcn (button, card, input…). Générés par `shadcn add`, retouchés à la marge. |
| `layout/` | La coquille de l'app (`app-shell`), le logo, les titres de page, le thème clair/sombre |
| `auth/` | Les boutons « Continue with GitHub / Google » |
| `shared/` | Petits composants utilisés partout (ex. `with-code` : du texte avec du `code`) |
| `dashboard/` | Premiers pas, suivi des candidatures |
| `offers/` | Formulaire d'ajout, carte, page d'offre, badges (statut, site, couvert/lacune) |
| `documents/` | Page CV et lettre, rendu des documents écrits pour une offre |
| `profile/` | Bibliothèque de CV, CV mis en page, relecture des faits |
| `interview/` | Création d'entretien, choix de l'intervieweur, l'appel ; `media/` (caméra, micro) et `voice/` (lecture et dictée) |
| `settings/` | Formulaires IA et voix, carte « AI in use » |

📌 Un composant **ne fait pas d'appel réseau ni de logique métier** : il reçoit ses données et ses actions en props, et ses textes (`t`) déjà traduits.

## 🧠 `lib/` : la logique

| Dossier | Rôle | Fichiers clés |
|---|---|---|
| `server/` | 🔐 Socle serveur | `auth.ts` (session, `requireUserId`), `env.ts` (*env vars* validées), `crypto.ts` (chiffrement des clés) |
| `shared/` | 🧰 Utilitaires purs, client et serveur | `dates.ts`, `ids.ts`, `text.ts` |
| `db/` | 🗄️ Schéma et connexion | `schema.ts` (chaque table a un `user_id`), `index.ts` |
| `data/` | 📦 Accès aux données, **toujours filtré par `userId`** | `offers.ts`, `facts.ts`, `interviews.ts`, `documents.ts`… |
| `ai/` | 🤖 Le client d'IA et la vérification | `client.ts` (OpenAI-compatible), `anthropic.ts` (Claude via son SDK), `config.ts` (qui paie), `verify.ts` (citations mot pour mot), `prompt-facts.ts` |
| `offers/` | 💼 Offres | `extract.ts` (lecture par l'IA), `coverage.ts` (couvert ou lacune), `match.ts`, `pipeline.ts` (cartes du suivi), `fetch-page.ts` |
| `profile/` | 👤 Profil | `extract-facts.ts`, `cv-document.ts`, `cv-edit.ts`, `dedupe-facts.ts`, `github.ts`, `codewars.ts`, `leetcode.ts` |
| `documents/` | 📄 CV et lettre par offre | `tailored-cv.ts`, `cover-letter.ts`, `render.ts` (titres dans la langue du document) |
| `interview/` | 🎙️ Entretiens | `generate.ts` (questions sans IA), `bank/` (questions techniques), `hr-bank/` (questions RH), `feedback.ts` (le seul appel à l'IA), `tracks.ts`, `copy.ts` |
| `interviewers/` | 🎭 Les personnages | `catalog/` (une fiche par personnage), `flavor/` (leurs répliques), `categories.ts` |
| `voice/` | 🔊 Voix | `elevenlabs.ts`, `text-to-speech.ts`, `audio-cache.ts` |
| `dashboard/` | 📊 Tableau de bord | `greeting.ts` |
| `i18n/` | 🌍 Textes de l'interface en EN et FR | `ui.ts`, `offers.ts`, `profile.ts`, `documents.ts`, `dashboard.ts`, `settings.ts`, `server.ts` (lit la langue dans le cookie) |

À la racine de `lib/` il ne reste que `types.ts` (types partagés) et `utils.ts` (le `cn()` de shadcn, dont shadcn attend ce chemin).

### 🌍 Trois langues indépendantes

| Langue | Où on la choisit | Où sont les textes |
|---|---|---|
| Langue **du site** | Bouton EN/FR en haut (cookie `nextround-ui-lang`) | `lib/i18n/*` |
| Langue **de l'entretien** | Écran de préparation de l'entretien | `lib/interview/copy.ts`, banques de questions |
| Langue **d'un CV / d'une lettre** | Page CV de l'offre | `lib/documents/render.ts` (`DOC_HEADINGS`) |

## 🧪 `tests/` : les tests

```
tests/
├── helpers/     test-db.ts (Postgres en mémoire, PGlite), server-only-stub.ts
├── ai/          config des providers, JSON, vérification des citations
├── data/        🧱 isolation des données entre utilisateurs, chiffrement
├── interview/   banques de questions, répliques, intervieweurs, résumé
├── offers/      couverture, lecture de page, suivi, projets vibe-codés
├── profile/     CV, faits, Codewars
├── documents/   CV et lettre par offre
├── ui/          textes EN/FR (même clés, mêmes {variables}), dates, tableau de bord
├── voice/       voix, cache audio
└── e2e/         Playwright : chaque écran, avec un utilisateur de test jetable
```

- `npm test` lance Vitest (rapide, sans secret).
- `npm run e2e` lance Playwright via `scripts/test/e2e.mjs` (a besoin des secrets Clerk et Neon).

## ⚙️ `scripts/` : les outils en ligne de commande

| Dossier | Scripts | Lancés par |
|---|---|---|
| `infra/` | `bootstrap.mjs` (tout créer avec Stripe Projects), `setup-env.mjs`, `push-env-to-vercel.mjs`, `deploy.mjs` | `npm run bootstrap`, `npm run setup:env`, `node scripts/infra/deploy.mjs` |
| `owner/` | Importer les CV et offres de la propriétaire, `whoami` | `npm run owner:*` |
| `offers/` | Chercher et récupérer des offres Actiris | `npm run offers:actiris` |
| `avatars/` | Références, vignettes, plans de clips, ElevenLabs ; `interviewer-pictures.mjs` (liste des vignettes, lancé avant `dev` et `build`) | `npm run avatars:*`, `python3 scripts/avatars/…` |
| `test/` | `e2e.mjs` : crée un utilisateur de test, lance Playwright, nettoie | `npm run e2e` |

## 🎨 `assets/` et `public/`

- `assets/characters/<id>/` : tout ce qui sert à **produire** l'avatar d'un intervieweur (sources, références, tenue, plan des 33 clips). Jamais servi au navigateur, exclu du *deploy* (`.vercelignore`). Les images candidates lourdes sont ignorées par git.
- `public/` : ce que le navigateur télécharge tel quel (`/brand/…`, `/interviewers/<id>.webp`).

## 🔧 Les fichiers à la racine

Ils sont à la racine parce que leurs outils les y cherchent : `package.json`, `tsconfig.json`, `next.config.ts`, `proxy.ts` (Next.js), `drizzle.config.ts`, `vitest.config.mts`, `playwright.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` (shadcn), `skills-lock.json` (skills), `AGENTS.md` / `CLAUDE.md` (règles des agents).

Les dossiers cachés : `.claude/` (skills et hooks de Claude Code), `.agents/` et `.cursor/` (skills Stripe Projects), `.projects/` (manifeste Stripe Projects, sans secret), `.preview/` (aperçu d'écrans sans secrets), `.local/` (tes fichiers perso, jamais *commités*).

## 📏 Les règles de rangement

1. **Pas de fichier en vrac** dans `lib/`, `components/`, `scripts/` ou `tests/` : chaque fichier va dans le dossier de son domaine.
2. **UI et logique séparées** : la logique, l'IA et la vérification vont dans `lib/` ; un composant ne fait qu'afficher.
3. **Toute requête filtre par `userId`** de la session serveur (`requireUserId()`), jamais par un id venu du navigateur.
4. **Un nouveau domaine** = un dossier dans `lib/`, un dans `components/` si besoin, un dans `tests/`.
5. **Un texte affiché** va dans `lib/i18n/` (EN + FR), pas en dur dans un composant.
6. **Un test** va dans `tests/<domaine>/`, et importe ses aides depuis `@/tests/helpers/`.
7. **Un choix structurant** (nouveau *provider*, nouvelle règle) mérite un [ADR](../adr/README.md).
