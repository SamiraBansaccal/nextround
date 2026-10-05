# 📚 Documentation NextRound

> 🇬🇧 English readers: jump to [🇬🇧 English](#-english). Les docs françaises gardent les mots techniques en anglais (*commit*, *deploy*, *API key*…) : c'est le vocabulaire qu'on retrouve dans le code et les outils.

## 🧭 Sommaire

- [🚀 Par où commencer](#-par-où-commencer)
- [🗂️ Comment la doc est rangée](#️-comment-la-doc-est-rangée)
- [🇫🇷 Les pages en français](#-les-pages-en-français)
- [🇬🇧 English](#-english)
- [📖 Glossaire](#-glossaire)

## 🚀 Par où commencer

| Tu veux… | Lis |
|---|---|
| 🙋 Utiliser l'app (en ligne, sur invitation) ou installer ta propre copie, sans rien connaître au départ | [README.fr.md](../README.fr.md) (🇬🇧 [README.md](../README.md)) |
| 🔄 Reprendre le travail là où une autre session s'est arrêtée | [EN-COURS.md](EN-COURS.md) — **toujours en premier** |
| 🏗️ Comprendre où se trouve quoi dans le repo | [fr/guides/architecture.md](fr/guides/architecture.md) |
| ☁️ Passer d'une session Claude locale au cloud (et inversement) | [fr/guides/local-et-cloud.md](fr/guides/local-et-cloud.md) |
| 🎭 Ajouter un intervieweur | [fr/guides/ajouter-un-personnage.md](fr/guides/ajouter-un-personnage.md) |
| 🤔 Savoir *pourquoi* une décision a été prise | [fr/adr/](fr/adr/README.md) |
| 📜 Revivre la construction du projet, phase par phase | [fr/journal/](#-journal-de-construction) |
| 🔍 Voir le dernier audit (sécurité, code) | [fr/audits/2026-10-04-audit.md](fr/audits/2026-10-04-audit.md) |

## 🗂️ Comment la doc est rangée

```
docs/
├── README.md          📚 ce fichier : index + glossaire
├── EN-COURS.md        🔄 où on en est (mis à jour à chaque session)
├── fr/                🇫🇷 français
│   ├── guides/        🛠️ comment faire (architecture, local/cloud, personnages)
│   ├── adr/           🤔 décisions d'architecture (traduction des ADR anglais)
│   ├── audits/        🔍 audits de sécurité et de code
│   └── journal/       📜 récit des premières phases
├── en/                🇬🇧 English
│   ├── guides/        🛠️ how-to (architecture)
│   └── adr/           🤔 architecture decisions (written in English first)
└── design/            🎨 prompts donnés à Lovable et pour les slides
```

📌 **Règles :**

- Un **ADR** s'écrit d'abord en anglais (`en/adr/`), puis se traduit (`fr/adr/`). Les deux index sont mis à jour ensemble.
- Un **guide** dit *comment faire* ; un **ADR** dit *pourquoi* ; le **journal** raconte *ce qui s'est passé* (il n'est plus mis à jour, c'est un historique).
- Chaque page longue commence par un 🧭 **sommaire**.

## 🇫🇷 Les pages en français

### 🛠️ Guides

| Page | Contenu |
|---|---|
| 🏗️ [architecture.md](fr/guides/architecture.md) | L'arborescence du repo, ce que contient chaque dossier, où ranger un nouveau fichier |
| ☁️ [local-et-cloud.md](fr/guides/local-et-cloud.md) | Code, secrets, fichiers perso et scripts *owner* entre le Mac et le cloud ; travailler à plusieurs sessions |
| 🎭 [ajouter-un-personnage.md](fr/guides/ajouter-un-personnage.md) | Ajouter un intervieweur : fiche, répliques, catégorie, avatar |

### 🤔 Décisions (ADR)

L'index complet, avec les questions auxquelles chaque ADR répond : [fr/adr/README.md](fr/adr/README.md).

### 🔍 Audits

| Page | Contenu |
|---|---|
| [2026-10-04-audit.md](fr/audits/2026-10-04-audit.md) | Sécurité, isolation, dépendances, *code review* : ce qui tient, ce qui a été corrigé, ce qui reste ouvert |

### 📜 Journal de construction

| Page | Phase |
|---|---|
| [00-mise-en-place.md](fr/journal/00-mise-en-place.md) | 0️⃣ Stripe CLI, Stripe Projects, *skills* des agents, git, ce qui est (ou non) versionné |
| [01-stack-connexion-deploiement.md](fr/journal/01-stack-connexion-deploiement.md) | 1️⃣ *Stack*, *providers*, connexion GitHub, base de données, isolation des données, *deploy* |
| [02-bring-your-own-ai.md](fr/journal/02-bring-your-own-ai.md) | 2️⃣ Le client d'IA unique, qui paie, les *API keys* chiffrées, SSRF, *rate limits* |

### 🎨 Design

| Page | Contenu |
|---|---|
| [lovable-prompt.md](design/lovable-prompt.md) | Le *prompt* donné à Lovable pour le prototype d'interface |
| [slides-prompt.md](design/slides-prompt.md) | Le *prompt* pour les slides du pitch |

## 🇬🇧 English

| Page | Content |
|---|---|
| 🏗️ [en/guides/architecture.md](en/guides/architecture.md) | Repository layout, what each folder holds, where a new file goes |
| 🤔 [en/adr/](en/adr/README.md) | Architecture decision records (the source of the French translations) |
| 🔄 [EN-COURS.md](EN-COURS.md) | Current status, in French (shared notes between Claude sessions) |

## 📖 Glossaire

| Terme | En clair |
|---|---|
| **ADR** (*Architecture Decision Record*) | Une page qui garde une décision, son contexte et ses conséquences, bonnes et mauvaises. Jamais effacée : on la marque « remplacée » ou « amendée ». |
| **AES-256-GCM** | Algorithme de chiffrement standard ; « GCM » détecte toute modification de la donnée chiffrée. Sert aux *API keys* des utilisateurs. |
| **Allowlist** | La liste d'autorisation de Clerk : seules ces adresses peuvent créer un compte. Activée tant qu'on est en dev (`npm run clerk:signup -- status / close / open / probe`). |
| **App Router** | La façon dont Next.js range les pages : un dossier par URL dans `app/`. |
| **Branch / PR** | Chaque session Claude travaille sur sa propre *branch* et ouvre une *pull request* (PR) pour la fusionner dans `main`. |
| **Deploy** | Mettre une version en ligne (ici sur Vercel). |
| **e2e** (*end-to-end*) | Tests qui ouvrent un vrai navigateur sur l'app (Playwright) ; ils ont besoin des secrets. |
| **Env vars** (*environment variables*) | Valeurs données à l'app au démarrage, hors du code (souvent secrètes). En local dans `.env`, jamais *commité*. |
| **Fact** (fait validé) | Une phrase sur toi (expérience, projet, compétence…) que tu as acceptée. Tout ce que NextRound écrit doit s'appuyer sur des *facts* validés. |
| **Migration** | Un fichier SQL qui crée ou modifie les tables, généré depuis `lib/db/schema.ts` et appliqué avec `npm run db:migrate`. |
| **OAuth** | Le protocole derrière « Continue with GitHub » : GitHub confirme qui tu es sans donner ton mot de passe à l'app. |
| **Owner** | La propriétaire de l'instance, reconnue par son identifiant GitHub numérique (`OWNER_GITHUB_ID`) : seul son compte utilise les clés de l'instance ([ADR 0023](fr/adr/0023-cles-de-l-instance-pour-la-proprietaire.md)). |
| **Provider** | Une entreprise qui fournit un service : Vercel (*hosting*), Neon (Postgres), Clerk (*auth*), OpenRouter / Anthropic (IA), ElevenLabs (voix)… |
| **Proxy** (Next.js 16) | Code exécuté avant chaque requête (l'ancien *middleware*) : il renvoie vers la connexion. |
| **Server action** | Fonction serveur appelée directement par l'interface ; elle revérifie la session et valide ses entrées avec zod. |
| **Skill** | Un dossier d'instructions (`SKILL.md`) qu'un agent comme Claude Code lit pour bien utiliser un outil ou suivre une procédure du projet. |
| **SSRF** | Attaque où l'on fait appeler par le serveur une adresse interne. D'où l'interdiction des *base URLs* personnalisées sur l'instance publique. |
| **Stripe Projects** | Plugin de la Stripe CLI qui crée les comptes chez les *providers* et récupère leurs clés (`stripe projects env --pull`) sur une machine connectée à ton compte Stripe. |
| **Vibe coding** | Un projet fait avec l'IA : il reste dans le profil, mais ne compte jamais comme maîtrise de sa *stack*. |
