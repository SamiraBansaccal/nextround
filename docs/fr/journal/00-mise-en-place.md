# 0️⃣ Phase 0 : mise en place

> 📜 **Journal historique** : il raconte la phase telle qu'elle s'est passée et n'est plus mis à jour. Les chemins de fichiers ont pu changer depuis (voir le [guide d'architecture](../guides/architecture.md)).

## 🧭 Sommaire

- [1. La Stripe CLI et le plugin Projects](#1-la-stripe-cli-et-le-plugin-projects)
- [2. Les fichiers créés par `stripe projects init`](#2-les-fichiers-créés-par-stripe-projects-init)
- [3. Les skills de l'agent de code](#3-les-skills-de-lagent-de-code)
- [4. Git et GitHub](#4-git-et-github)


**But de la phase :** préparer les outils avant d'écrire la moindre ligne de l'application. À la fin, on a un dossier de projet relié à Stripe Projects, des instructions pour l'agent de code, et un repo GitHub public.

## 1. La Stripe CLI et le plugin Projects

```bash
brew install stripe/stripe-cli/stripe   # la Stripe CLI (version 1.53.0)
stripe plugin install projects           # le plugin Projects (version 0.46.0)
stripe projects --help                   # vérification : liste des commandes
```

**Pourquoi Stripe Projects ?** Normalement, pour une application il faut créer un compte chez chaque provider (hébergeur, database, authentification, IA…), aller dans chaque tableau de bord, copier les clés à la main, et payer chacun séparément. Stripe Projects fait tout ça depuis le terminal :

```bash
stripe projects add <fournisseur>/<service>   # crée la ressource chez le fournisseur
stripe projects env --pull                    # écrit les clés dans .env
```

La facturation passe par le compte Stripe, et les clés ne sont jamais copiées à la main (donc jamais collées par erreur dans le code).

### La connexion au compte Stripe (ce qui s'est passé)

1. `stripe login` ouvre une page Stripe avec un code à vérifier. En validant, on autorise la CLI à agir sur le compte.
2. La première connexion s'est faite sur un **sandbox** (une copie de test créée automatiquement avec le compte). Stripe Projects l'a refusé (`PROJECTS_CONTEXT_MISMATCH`) : **il exige le mode live**, parce qu'il crée de vrais comptes chez de vrais providers.
3. On a donc lancé `stripe projects switch-account` (dans un vrai terminal, car la commande est interactive), choisi le compte **NextRound**, et complété l'activation de Projects dans le navigateur. Stripe demande alors une **vérification d'identité** : c'est une obligation légale pour un compte live.
4. Ensuite seulement, la vérification préalable passe :

```bash
stripe projects init nextround --preflight --json   # vérifie tout sans rien créer
stripe projects init nextround                       # crée le projet
```

> Être en mode live **ne veut pas dire payer** : on choisit des offres gratuites, et toute commande qui pourrait coûter de l'argent est montrée avant d'être lancée. `stripe projects spend` affiche les dépenses.

## 2. Les fichiers créés par `stripe projects init`

| Fichier | Rôle | Versionné ? |
|---|---|---|
| `.projects/state.json` | État **partagé** du projet : quels providers, services et ressources l'app utilise, noms des environnements. | Oui |
| `.projects/state.local.json` | État **de cette machine** : identifiant du compte Stripe (`acct_…`), identifiant du projet, liens vers nos comptes providers. | **Non** (voir plus bas) |
| `.projects/vault/` | Copie **chiffrée** des identifiants des providers. | Non (ignoré automatiquement) |
| `.projects/cache/` | Cache technique de la CLI. | Non |
| `.env`, `.env.*` | Les identifiants **en clair** pour faire tourner l'app en local, écrits par `stripe projects env --pull`. | **Jamais** |
| `.gitignore` | Liste des fichiers que git doit ignorer. Stripe l'a créé ; on l'a complété. | Oui |
| `AGENTS.md`, `CLAUDE.md` | Instructions pour les agents de code (Claude Code, Cursor…) : « ce repo utilise Stripe Projects ». | Oui |
| `.claude/skills/stripe-projects-cli/` (et copies dans `.agents/`, `.cursor/`) | La skill qui documente toutes les commandes Projects pour l'agent. | Oui |
| `.claude/settings.json` | Liste des commandes que l'agent peut lancer sans demander (voir « Sécurité » plus bas). | Oui |

### `state.json` contient-il quelque chose de sensible ?

**Non.** Aujourd'hui il est vide (`{"version":1,"providers":{},"resources":{}}`). Quand on ajoutera des services, il contiendra des **noms** (providers, services, ressources, noms des env vars), jamais de **valeurs** secrètes : celles-ci vont dans le coffre chiffré (`vault/`) et dans `.env`. On le revérifiera après l'ajout des providers en Phase 1.

### Pourquoi ignorer `state.local.json` ?

Il contient l'identifiant du compte Stripe et du projet, et les liens vers nos comptes personnels chez les providers. Ce ne sont pas des mots de passe (on ne peut pas se connecter avec), mais ce sont des identifiants personnels, et le repo est **public**.

La doc Stripe conseille de le versionner **pour travailler en équipe** sur le même projet. Ici, quelqu'un qui récupère le code et veut héberger sa propre instance crée de toute façon **son propre** projet Stripe (`stripe projects init`), donc il n'en a pas besoin.

### Le `.gitignore`

```gitignore
.projects/cache
.projects/vault
.projects/state.test.json
.projects/state.local.test.json
.env
.env.*
!.env.example                # exception : un modèle SANS valeurs pourra être versionné
.projects/state.local.json   # ajouté par nous
.DS_Store                    # fichiers système macOS
```

Vérification faite avec `git check-ignore -v` : `.env`, `.env.local`, `.projects/state.local.json` et `.projects/vault/` sont bien ignorés.

## 3. Les skills de l'agent de code

Une **skill** est un dossier avec un fichier `SKILL.md` : des instructions et des références que l'agent (Claude Code) lit pour utiliser un outil correctement, au lieu de deviner. Elles sont installées avec l'outil `skills` :

```bash
npx skills add https://docs.stripe.com -s stripe-projects -s stripe-docs -s stripe-best-practices -a claude-code
```

Seules des skills **publiées par les éditeurs officiels** ont été installées : une skill s'exécute avec les mêmes droits que l'agent, donc une source inconnue est un risque.

| Skill | Éditeur | Utilité dans NextRound |
|---|---|---|
| `stripe-projects` | Stripe | Créer les services (base, hébergement, auth, IA) |
| `stripe-projects-cli` | Stripe (installée par `init`) | Référence complète des commandes Projects |
| `stripe-docs` | Stripe | Lire la doc Stripe depuis le terminal (`stripe docs /projects`) |
| `stripe-best-practices` | Stripe | Bonnes pratiques de sécurité (gestion des clés) |
| `vercel-react-best-practices` | Vercel | Performance React / Next.js |
| `vercel-composition-patterns` | Vercel | Organisation des composants, utile pour séparer l'interface de la logique |
| `web-design-guidelines` | Vercel | Accessibilité et qualité de l'interface |
| `shadcn` | shadcn | Bibliothèque de composants d'interface |
| `frontend-design` | Anthropic | Design soigné de l'interface |
| `text-to-speech`, `speech-to-text` | ElevenLabs | Mode vocal de la simulation d'entretien (Phase 5) |

Les 7 autres skills Stripe (paiements, Connect, facturation à l'usage…) n'ont pas été installées : NextRound n'encaisse pas d'argent. Les skills de database et d'authentification seront ajoutées une fois les providers choisis (Phase 1).

`skills-lock.json` garde la source et l'empreinte (*hash*) de chaque skill installée : on sait d'où elle vient et si elle a changé.

### Sécurité : deux corrections après une revue automatique

Une revue de sécurité du premier commit a relevé deux problèmes, corrigés dans le commit suivant :

1. **La skill `deploy-to-vercel` a été retirée.** Elle contenait des scripts de deploy « sans compte » qui envoient tout le dossier du projet à un serveur Vercel public. Ils excluent `.env`, mais pas `.projects/` (coffre de clés chiffré, identifiants du compte). On déploie autrement (Stripe Projects + Vercel relié au repo GitHub), donc on n'en a pas besoin.
2. **`.claude/settings.json` a été restreint.** `stripe projects init` avait écrit `Bash(stripe:*)`, qui autorise l'agent à lancer **n'importe quelle** commande Stripe sans confirmation, y compris l'ajout d'un service payant. Il n'autorise plus que des commandes de lecture (`status`, `catalog`, `search`, `spend`, `docs`…). Tout ce qui crée, modifie ou peut coûter de l'argent demande une confirmation.

Leçon : une skill ou un fichier de configuration généré automatiquement se **relit** avant d'être versionné, surtout sur un repo public.

## 4. Git et GitHub

```bash
git init -b main
git config user.name  "Samira Bansaccal"
git config user.email "96707268+SamiraBansaccal@users.noreply.github.com"
gh repo create SamiraBansaccal/nextround --public
git remote add origin https://github.com/SamiraBansaccal/nextround.git
```

- **Repo public :** https://github.com/SamiraBansaccal/nextround
- **Email masqué :** sur un repo public, l'email de chaque commit est visible par tout le monde. L'adresse `…@users.noreply.github.com` relie quand même les commits au profil GitHub, sans exposer l'email personnel.
- **Règle :** jamais de secret dans un commit. Les secrets vivent dans `.env` (ignoré) et, en production, dans les env vars de l'hébergeur.
