# 1️⃣ Phase 1 : stack, providers, connexion, isolation des données, deploy

> 📜 **Journal historique** : il raconte la phase telle qu'elle s'est passée et n'est plus mis à jour. Les chemins de fichiers ont pu changer depuis (voir le [guide d'architecture](../guides/architecture.md)).

## 🧭 Sommaire

- [1. La stack](#1-la-stack)
- [2. Les providers (créés avec Stripe Projects, tous en offre gratuite)](#2-les-providers-créés-avec-stripe-projects-tous-en-offre-gratuite)
- [3. Comment les clés arrivent jusqu'à l'application](#3-comment-les-clés-arrivent-jusquà-lapplication)
- [4. La connexion (Clerk)](#4-la-connexion-clerk)
- [5. La database](#5-la-database)
- [6. L'isolation des données](#6-lisolation-des-données)
- [7. Interface et logique séparées](#7-interface-et-logique-séparées)
- [8. Le deploy](#8-le-deploy)
- [9. Sécurité : points vérifiés dans cette phase](#9-sécurité--points-vérifiés-dans-cette-phase)
- [10. Commandes utiles](#10-commandes-utiles)


**But de la phase :** une vraie application en ligne, où l'on se connecte avec GitHub (ou Google), avec une database prête pour toutes les phases suivantes, et la garantie qu'un utilisateur ne peut jamais toucher aux données d'un autre.

**Résultat :** https://nextround-gamma.vercel.app

## 1. La stack

| Brique | Choix | Rôle |
|---|---|---|
| Framework | **Next.js 16** (App Router) + TypeScript | Pages, code serveur et API dans un seul projet |
| Style | **Tailwind CSS 4** + **shadcn/ui** (base Radix) | Composants d'interface ; même base que le prototype Lovable |
| Validation | **zod** | Vérifie toute donnée qui entre : formulaires, env vars, et plus tard les réponses de l'IA |
| Database | **Postgres** sur Neon, via **Drizzle ORM** | Drizzle décrit les tables en TypeScript et génère le SQL |
| Connexion | **Clerk** | Connexion GitHub et Google, sessions |
| Tests | **Vitest** + **PGlite** | PGlite est un vrai Postgres qui tourne en mémoire, pour les tests |

> **Next.js 16 a changé des choses.** Le fichier qui s'exécute avant chaque request s'appelle désormais `proxy.ts` (l'ancien `middleware.ts`). La documentation exacte de la version installée se trouve dans `node_modules/next/dist/docs/`, et `AGENTS.md` demande aux agents de la lire avant d'écrire du code.

## 2. Les providers (créés avec Stripe Projects, tous en offre gratuite)

| Provider | Service | Variables dans `.env` | Rôle |
|---|---|---|---|
| Vercel | `hobby` + `project` | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`… | Hébergement |
| Neon | `free` + `postgres` (ressource `db`) | `DB_CONNECTION_STRING`… | Base Postgres |
| Clerk | `hobby` + `auth` (application « NextRound ») | `CLERK_ENVIRONMENTS`, `CLERK_APPLICATION_ID`… | Connexion |
| OpenRouter | `free` + `api` | `OPENROUTER_API_API_KEY` | IA de l'instance (Phase 2) |
| Firecrawl | `free` + `api` | `FIRECRAWL_API_API_KEY` | Lecture des pages d'offres (Phase 4) |
| ElevenLabs | `tts` | `ELEVENLABS_API_KEY` | Voix (Phase 5) |

**Pourquoi Neon plutôt que Supabase ?** Le plan gratuit de Supabase met le projet en pause après une semaine sans activité : le jury pourrait tomber sur une démo éteinte. Neon met seulement en veille le calcul, qui se réveille en une fraction de seconde à la première request.

**Pourquoi Clerk ?** En mode développement, Clerk fournit ses propres identifiants OAuth GitHub et Google. Pas besoin de créer une « OAuth App » GitHub à la main.

**Limites des offres gratuites à connaître :**
- OpenRouter, modèles gratuits : 20 requests par minute et 50 par jour (1 000 par jour si le compte a acheté au moins 10 $ de crédits). Vérifié dans la doc OpenRouter.
- Firecrawl : quota limité.
- Coût actuel : `stripe projects spend` affiche « No charges found ».

En acceptant les conditions de chaque provider (`--accept-tos`), Stripe a transmis au provider le nom, l'email, le pays et le téléphone du compte Stripe, pour créer le compte chez lui.

## 3. Comment les clés arrivent jusqu'à l'application

```
Stripe Projects ──(stripe projects env --pull)──▶ .env (local, jamais commité)
                                                     │
            scripts/infra/setup-env.mjs ───────────────────┤  ajoute les variables « maison »
                                                     │
            scripts/infra/push-env-to-vercel.mjs ──────────┴──▶ variables d'environnement Vercel (production)
```

### `scripts/infra/setup-env.mjs` : les variables « maison »

Lancé une fois avec `npm run setup:env -- --owner <ton-login-github>`. Il crée des **project variables** Stripe Projects : la valeur est stockée dans le coffre Stripe, puis écrite dans `.env`.

| Variable | D'où elle vient | Pourquoi |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `CLERK_ENVIRONMENTS.development.publishable_key` | Clerk livre ses clés dans un JSON, mais le SDK Next.js attend ces deux noms précis |
| `CLERK_SECRET_KEY` | `CLERK_ENVIRONMENTS.development.secret_key` | idem |
| `APP_ENCRYPTION_KEY` | 32 octets aléatoires | Chiffrera les clés d'IA des utilisateurs (Phase 2). Créée **seulement si absente** : la changer rendrait illisibles les clés déjà enregistrées |
| `OWNER_GITHUB_LOGIN` | argument `--owner` | Le propriétaire de l'instance peut utiliser les clés d'IA de l'instance |

Le script ne peut jamais afficher une valeur secrète. Il passe les valeurs à la CLI Stripe sans passer par un shell, donc rien ne reste dans l'historique. En cas d'erreur, il n'affiche pas la ligne de commande, qui contiendrait la valeur.

### `scripts/infra/push-env-to-vercel.mjs` : vers la production

Stripe Projects écrit les clés **en local seulement** (la doc le précise). Ce script envoie à Vercel, via son API, la liste **exacte** des variables utiles à l'app (pas le token Vercel lui-même), pour les environnements production et preview.

### `lib/server/env.ts` : lecture côté serveur

Toutes les variables sont validées par un schéma zod au premier usage. S'il en manque une, l'erreur donne les **noms** manquants, jamais les valeurs. Le fichier commence par `import "server-only"` : si un composant côté navigateur l'importait par erreur, le build échouerait.

## 4. La connexion (Clerk)

| Fichier | Rôle |
|---|---|
| `proxy.ts` | S'exécute avant chaque request. Tout est protégé sauf `/`, `/sign-in`, `/sign-up` et `/sso-callback`. Un navigateur non connecté est redirigé vers la connexion ; un robot reçoit une 404 |
| `app/page.tsx` | Page d'accueil : le nom, la phrase d'accroche et les deux boutons. Un utilisateur déjà connecté est envoyé vers `/dashboard` |
| `components/auth/sign-in-buttons.tsx` | Les boutons « Continue with GitHub / Google » : `signIn.authenticateWithRedirect()` envoie chez GitHub ou Google |
| `app/sso-callback/page.tsx` | Point de retour : `<AuthenticateWithRedirectCallback />` termine la connexion, ou crée le compte à la première connexion |
| `app/sign-in`, `app/sign-up` | Pages de secours avec les composants Clerk tout faits, si une étape supplémentaire est nécessaire |
| `lib/server/auth.ts` | `requireUserId()` : **la seule** façon d'obtenir l'identifiant de l'utilisateur côté serveur. `getAccount()` : nom, identifiant GitHub, et si c'est le propriétaire |

**Pourquoi `proxy.ts` ne suffit pas :** la doc Next.js le dit, le proxy est un premier filtre « optimiste ». Chaque accès aux données revérifie la session avec `requireUserId()`.

**Clerk v7 (« Core 3 ») a changé son API** en mars 2026. Par exemple, `<SignedIn>` est devenu `<Show when="signed-in">`, et le nouveau `signIn.sso()` n'a pas encore de composant de retour exporté pour Next.js. On utilise donc la méthode éprouvée, `authenticateWithRedirect`, avec `AuthenticateWithRedirectCallback`. Les types installés dans `node_modules/@clerk/` ont servi de référence.

**Activation de GitHub :** au départ, seul Google était activé. GitHub a été activé avec la CLI Clerk (`npx clerk auth login`, puis un clic d'autorisation dans le navigateur), puis :

```bash
npx clerk config patch --app <CLERK_APPLICATION_ID> --instance dev \
  --json '{"connection_oauth_github":{"enabled":true,"authenticatable":true}}' --dry-run   # test à blanc
# puis la même commande avec --yes
```

On vérifie dans la configuration publique de l'instance (`https://<instance>.clerk.accounts.dev/v1/environment`) : `oauth_github` et `oauth_google` sont activés.

**Le propriétaire :** `getAccount()` lit le compte GitHub relié par OAuth (fourni par Clerk, donc vérifié par GitHub) et le compare à `OWNER_GITHUB_LOGIN`. Se connecter avec Google ne donne jamais ce statut.

**Limite connue :** l'instance Clerk est en mode **développement** : petit badge « Development mode », et identifiants OAuth partagés par Clerk. Passer en production demande un nom de domaine à soi et ses propres identifiants OAuth (`npx clerk deploy` guide les étapes).

## 5. La database

- `lib/db/schema.ts` décrit **toutes les tables des phases 1 à 6** : `profile_facts`, `sources`, `offers`, `requirements`, `offer_contacts`, `interviews`, `questions`, `answers`, `documents`, `ai_settings` et `usage_counters`.
- `drizzle/0000_init.sql` est le SQL généré à partir de ce schéma (`npm run db:generate`), appliqué à Neon avec `npm run db:migrate`. Ce fichier est versionné : n'importe qui peut recréer exactement la même base.
- `lib/db/index.ts` crée la connexion **à la demande** (`getDb()`), avec le driver HTTP de Neon : une request HTTPS par request SQL, adapté aux fonctions serverless de Vercel. Rien n'est ouvert au moment du build.

> Une seule base sert au développement local et à la production. C'est un choix simple pour le hackathon ; Neon permet de créer une « branch » de base séparée plus tard.

## 6. L'isolation des données

**La règle :** chaque table a une colonne `user_id`, y compris les tables « enfants » comme `requirements` ou `answers`. Chaque request filtre dessus, avec l'identifiant tiré de la **session côté serveur**, jamais d'un formulaire, d'une URL ou d'un corps de request.

Le modèle à suivre est `lib/data/facts.ts` :

```ts
export async function updateFact(userId: string, id: string, patch: FactPatch) {
  if (!isUuid(id)) return null;                        // id venu du client : on refuse tout ce qui n'est pas un UUID
  const [row] = await getDb()
    .update(profileFacts)
    .set(patch)                                         // FactPatch ne permet pas de changer user_id
    .where(and(eq(profileFacts.id, id), eq(profileFacts.userId, userId)))   // id ET propriétaire
    .returning();
  return row ?? null;                                   // null = « n'existe pas pour CET utilisateur »
}
```

Même avec l'identifiant exact d'une ligne d'un autre utilisateur, la condition `user_id = <moi>` ne correspond à rien : la lecture renvoie `null`, la modification et la suppression ne touchent aucune ligne.

### Le test : `tests/data/isolation.test.ts`

```bash
npm test
```

Il crée une base Postgres **en mémoire** (PGlite) avec la vraie migration, remplace `getDb()` par cette base, puis vérifie :

| Test | Ce qu'il prouve |
|---|---|
| A lit son propre fait | Le cas normal fonctionne |
| B ne peut pas lire le fait de A par son id | Lecture isolée |
| La liste de B ne contient pas le fait de A | Listes isolées |
| B ne peut pas modifier le fait de A, qui reste intact | Modification isolée |
| B ne peut pas supprimer le fait de A, qui existe toujours | Suppression isolée |
| Un id malformé (`1 OR 1=1`, `../../etc`) est rejeté | Pas de request avec un id douteux |
| A peut toujours modifier et supprimer son fait | Le filtre ne bloque pas le propriétaire |

Résultat : **7 tests sur 7 passent.** Chaque nouveau module de `lib/data/` recevra le même type de test dans les phases suivantes.

## 7. Interface et logique séparées

- `lib/` contient la logique : database, authentification, environnement, plus tard l'IA et les vérifications.
- `components/` contient l'affichage : un composant reçoit des données en props et ne va rien chercher lui-même. Exemple : `components/dashboard/welcome.tsx` reçoit `account` ; c'est la page `app/(app)/dashboard/page.tsx` qui appelle `getAccount()`.
- `lib/types.ts` reprend **exactement** les types donnés à Lovable (`docs/lovable-prompt.md`) : les écrans du prototype pourront se brancher sur cette logique.

## 8. Le deploy

```bash
node scripts/infra/push-env-to-vercel.mjs   # si des variables ont changé
node scripts/infra/deploy.mjs               # déploie en production
```

- **Depuis le Mac, pas depuis GitHub :** le projet Vercel créé par Stripe Projects n'est pas relié au repo GitHub (le relier demanderait d'installer l'application Vercel sur GitHub). On déploie donc depuis la machine avec la CLI Vercel. Le token vient de `.env` et passe par une **env var**, jamais en argument de commande, où il serait visible dans la liste des processus.
- **`.vercelignore` :** un deploy envoie le dossier à Vercel. Ce fichier exclut `.env`, `.projects/` (coffre de clés), les dossiers d'agents, les docs et les tests.
- **Vérification :** l'API Vercel liste les fichiers reçus. `.env` est absent ; `.projects/`, `.claude/` et `.agents/` n'apparaissent que comme dossiers **vides** (0 fichier, contre 9 pour `app/` et 8 pour `lib/`).
- **Protection Vercel :** le deploy est en « Standard Protection ». Les URL internes de chaque deploy demandent une connexion Vercel ; l'adresse de production, elle, est publique (vérifié : 200).

## 9. Sécurité : points vérifiés dans cette phase

- Aucun secret dans le repo : recherche de motifs de clés avant chaque commit, et `.env` ignoré (vérifié avec `git check-ignore`).
- Aucune valeur secrète affichée pendant la mise en place : seuls les **noms** des variables apparaissent.
- Le lien de connexion au tableau de bord Clerk, qui connecte directement au compte, a été ouvert dans le navigateur sans être affiché.
- `npm audit` signale 5 vulnérabilités « high » qui viennent toutes d'une seule dépendance (`braces`), utilisée seulement par l'outil de lint `eslint`. Aucune version corrigée n'existe encore ; elle n'est pas dans l'application déployée.

## 10. Commandes utiles

| Commande | Effet |
|---|---|
| `npm run dev` | Lance l'app en local sur http://localhost:3000 |
| `npm test` | Tests (dont l'isolation) |
| `npm run typecheck` | Génère les types de routes Next.js puis vérifie tous les types |
| `npm run lint` | Vérifie le style du code |
| `npm run db:generate` | Génère une migration SQL après un changement de `lib/db/schema.ts` |
| `npm run db:migrate` | Applique les migrations à la base Neon |
| `npm run setup:env -- --owner <github>` | Crée les variables « maison » |
| `node scripts/infra/push-env-to-vercel.mjs` | Envoie les variables à Vercel |
| `node scripts/infra/deploy.mjs` | Déploie en production |
| `stripe projects spend` | Affiche ce que coûtent les services |
