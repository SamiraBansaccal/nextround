# 🔄 Où on en est

Mis à jour à la fin de chaque session Claude (locale ou cloud). **À lire en premier.**

_Dernière mise à jour : 2026-10-05, session locale (Mac)._

## 🧭 Sommaire

- [🌿 Branches en cours](#-branches-en-cours)
- [✅ Fait récemment](#-fait-récemment)
- [🚧 En cours](#-en-cours)
- [🎬 Avatars animés](#-avatars-animés)
- [🔜 Ensuite](#-ensuite)

## 🌿 Branches en cours

Règle : chaque session a sa *branch*, s'inscrit ici, ouvre une PR, et met la ligne à jour quand la PR est fusionnée (voir [guide local et cloud](fr/guides/local-et-cloud.md#-plusieurs-sessions-en-même-temps)).

| *Branch* | Session | Sujet | PR |
|---|---|---|---|
| `claude/local-access-requests` | local | 📨 Demandes d'accès : formulaire public, liste d'attente Clerk, e-mail à la propriétaire (Resend, à brancher), réponse dans les Réglages ; README « Stripe Projects en clair ». Fichiers : `lib/access/**`, `lib/server/owner.ts`, `app/actions.ts`, `app/page.tsx`, `app/sign-up/**`, `components/{auth,settings}/**`, `app/(app)/settings/**`, `lib/ai/usage.ts`, `README*.md` | PR à venir |

<details>
<summary>📦 Branches déjà fusionnées</summary>

| *Branch* | Session | Sujet | PR |
|---|---|---|---|
| `claude/local-readme-friends` | local | 🙋 README pour débutants en FR et EN (app en ligne sur invitation ou copie à soi), `.env.example`, invitations `npm run clerk:signup -- allow / disallow`, lignes vides du `.env` = non définies. Fichiers : `README.md`, `README.fr.md`, `.env.example`, `scripts/infra/clerk-signup.mts`, `lib/server/env.ts`, `docs/README.md` | [#27](https://github.com/SamiraBansaccal/nextround/pull/27) |
| `claude/local-bank-gaps` | local | 🎙️ Banque technique : architecture logicielle, IA et LLM, Windows Server et AD ; alias pour les noms vus dans les offres. Fichiers : `lib/interview/bank/**`, `lib/interview/{tracks,tech-logos}.ts`, `components/interview/tech-logo.tsx`, `tests/interview/question-bank.test.ts` | [#26](https://github.com/SamiraBansaccal/nextround/pull/26) |
| `claude/local-csp-live` | local | 📝 EN-COURS : CSP en ligne et vérifiée | [#25](https://github.com/SamiraBansaccal/nextround/pull/25) |
| `claude/local-csp` | local | 🛡️ CSP stricte (nonce par requête, construite par Clerk), e2e sur le *build* de production (`E2E_PROD=1`), liens de « Nouvel entretien » sans *prefetch*. Fichiers : `proxy.ts`, `app/layout.tsx`, `next.config.ts`, `app/(app)/interview/new/page.tsx`, `playwright.config.ts`, `tests/e2e/**` | [#24](https://github.com/SamiraBansaccal/nextround/pull/24) |
| `claude/local-deployed` | local | 📝 EN-COURS : *deploy* fait et vérifié | [#23](https://github.com/SamiraBansaccal/nextround/pull/23) |
| `claude/local-private-repos` | local | 📝 EN-COURS : « cookie » et l'app du hackathon sont privés, pour plus tard | [#22](https://github.com/SamiraBansaccal/nextround/pull/22) |
| `claude/local-handover` | local | 📝 EN-COURS à jour (offres importées, état du *deploy*), logo du Forem net. Fichiers : `docs/EN-COURS.md`, `public/sites/forem.png` | [#21](https://github.com/SamiraBansaccal/nextround/pull/21) |
| `claude/local-audit-followups` | local | 🔍 Points ouverts de l'audit : DNS rebinding (agent undici qui vérifie l'adresse à la connexion), `shadcn` en *devDependencies*, purge des compteurs par minute. Fichiers : `lib/offers/fetch-page.ts`, `lib/ai/usage.ts`, `package.json`, `docs/fr/audits/` | [#20](https://github.com/SamiraBansaccal/nextround/pull/20) |
| `claude/local-profile-followups` | local | 🔁 Profil, suite : doublons fusionnés pour de bon (références recâblées), dates des CV écrites d'une seule façon sans rien inventer, phrases corrigées à la main d'un document du profil ajoutées à la base. Fichiers : `lib/profile/{merge-facts,cv-dates,dedupe-facts}.ts`, `lib/documents/{edit,hand-written}.ts`, `lib/data/facts.ts`, `components/profile/profile-library.tsx`, `app/(app)/profile/**`, `app/(app)/offers/[id]/cv/actions.ts` | [#19](https://github.com/SamiraBansaccal/nextround/pull/19) |
| `claude/local-no-dashboard` | local | 🧭 Plus de tableau de bord : menu Profil → Offres → Entretiens → Réglages, le profil devient la page d'accueil, `/dashboard` renvoie vers `/profile`. Fichiers : `app/(app)/dashboard/` (supprimé), `components/{dashboard,layout,offers}/**`, `lib/i18n/{offers,ui}.ts`, `next.config.ts`, `tests/e2e/screens.spec.ts` | [#18](https://github.com/SamiraBansaccal/nextround/pull/18) |
| `claude/local-owner-only` | local | 🔐 Toutes les clés de l'instance pour la propriétaire seule (Firecrawl compris ; clé Firecrawl perso dans les Réglages), propriétaire reconnue par son id GitHub numérique, inscription Clerk fermée. Migration `0008`. Fichiers : `lib/ai/config.ts`, `lib/server/{auth,env}.ts`, `lib/data/ai-settings.ts`, `components/settings/**`, `app/(app)/settings/**`, `app/(app)/offers/actions.ts`, `scripts/{infra,owner}/**`, `tests/e2e/fixtures.mts` | [#17](https://github.com/SamiraBansaccal/nextround/pull/17) |
| `claude/local-settings` | local | ⚙️ Page Réglages (pleine largeur, encart « ce qui est branché », IA et voix côte à côte), bouton EN/FR aux couleurs de la DA, écrans e2e en français | [#16](https://github.com/SamiraBansaccal/nextround/pull/16) |
| `claude/intelligent-einstein-58bqoh` | cloud | Entretiens sans offre, parcours de création, caméra, langue du site, couleurs, réglages IA | [#2](https://github.com/SamiraBansaccal/nextround/pull/2) |
| `claude/owner-data-deploy` | local | Projets vibe-codés, « Update with my validated facts » | [#3](https://github.com/SamiraBansaccal/nextround/pull/3) |
| `claude/tailored-documents` | local | CV et lettre par offre (EN/FR), ajoutés au profil ; faits validés sur place | [#4](https://github.com/SamiraBansaccal/nextround/pull/4) |
| `claude/intelligent-einstein-58bqoh` | cloud | Réorganisation des dossiers, doc revue en profondeur, nouveaux ADR | [#9](https://github.com/SamiraBansaccal/nextround/pull/9) |
| `claude/intelligent-einstein-58bqoh` | cloud | Audit sécurité et code, corrections | [#10](https://github.com/SamiraBansaccal/nextround/pull/10) |
| `claude/remove-interviewers` | local | Retrait des 38 intervieweurs masqués par la propriétaire | [#7](https://github.com/SamiraBansaccal/nextround/pull/7) |
| `claude/intelligent-einstein-58bqoh` | cloud | 🎨 Tour des pages : cartes d'offres (logos, stack, tri par parcours), profil (catégories de CV, imports), réglages ; *deploy* qui migre. Fichiers : `components/{offers,dashboard,profile,settings,layout}/**`, `app/(app)/{dashboard,offers,profile,settings}/**`, `lib/offers/**`, `lib/i18n/**`, `scripts/infra/deploy.mjs` | PR #15 |
| `claude/intelligent-einstein-58bqoh` | cloud | 👤 Profil = une base unique (CV fusionnés sans doublons, tout validé, crayon sur chaque ligne, LeetCode), CV et lettre modifiables phrase par phrase, cartes d'offres alignées. Migration `0007` | [#13](https://github.com/SamiraBansaccal/nextround/pull/13) — ⚠️ `npm run db:migrate` (0007) à lancer depuis le Mac |
| `claude/intelligent-einstein-58bqoh` | cloud | 🎭 Répliques des personnages, banques de questions enrichies, Stripe dans le cloud | [#12](https://github.com/SamiraBansaccal/nextround/pull/12) |
| `claude/intelligent-einstein-58bqoh` | cloud | Traduction EN/FR de tout le site | [#6](https://github.com/SamiraBansaccal/nextround/pull/6), [#8](https://github.com/SamiraBansaccal/nextround/pull/8) |

</details>

## ✅ Fait récemment

### 📨 Demandes d'accès (local, 2026-10-05)

Décision : [ADR 0026](fr/adr/0026-demandes-d-acces.md).

- Vérifié : sur la version en ligne, l'inscription demande bien une invitation (`npm run clerk:signup -- probe` → `403 not_allowed_access` ; liste : l'adresse de la propriétaire seulement).
- **« No invitation yet? Request access »** sur l'accueil et la page d'inscription : adresse, nom et message facultatifs. La demande va dans la **liste d'attente de Clerk** (pas de nouvelle table), et un **e-mail part vers la propriétaire**, retrouvée à l'exécution par `OWNER_GITHUB_ID` (rien d'écrit en dur). Limites : 3 demandes par jour et par visiteur, 20 e-mails par jour, un champ piège pour les robots.
- **Réglages → Demandes d'accès** (propriétaire seulement) : Autoriser (liste d'autorisation + invitation envoyée par Clerk), Refuser, et la liste des adresses invitées avec Retirer.
- ⏳ **L'e-mail attend Resend** (`stripe projects add resend/free` puis `resend/email`, offre gratuite de 3 000 e-mails par mois) : à lancer avec l'accord de la propriétaire. Sans Resend, les demandes arrivent quand même dans ses Réglages.
- README : « Stripe Projects en clair » (qui crée les comptes, le coffre à secrets, s'abonner, ajouter un service après coup), et le lien « Request access » dans l'option A.

### 🙋 Partager l'app avec des amis (local, 2026-10-05)

- **README pour débutants**, en anglais ([README.md](../README.md)) et en français ([README.fr.md](../README.fr.md)) : les deux façons d'utiliser NextRound (l'app de la propriétaire, sur invitation, ou sa propre copie) avec leurs pour et contre (mises à jour, données, limites, stabilité), chaque service expliqué (Vercel, Neon, Clerk, Stripe Projects, OpenRouter, ElevenLabs, Firecrawl, *serverless*), les clés d'API, les limites de l'IA, les chiffres des offres gratuites vérifiés le 2026-10-05.
- **Clés** : tout le code et tout l'historique git passés au crible (OpenRouter, Anthropic, OpenAI, Stripe, Clerk, ElevenLabs, Firecrawl, GitHub, *tokens*, mots de passe de base) : rien que des exemples factices, aucun `.env` jamais commité. Les clés de l'instance ne servent qu'au compte de la propriétaire (ADR 0023) : les amis apportent leurs propres clés, donc leurs propres limites.
- **Inviter un ami** : `npm run clerk:signup -- allow <email>` (l'e-mail de son compte GitHub ou Google) ; `disallow` le retire. L'inscription reste fermée aux autres.
- **`.env.example`** : toutes les variables, sans valeur, avec d'où vient chacune ; une ligne vide (`NOM=`) compte maintenant comme non définie (`lib/server/env.ts`).

### 🎙️ Banque technique, trous comblés (local, 2026-10-05)

- Mesuré sur les 21 offres de la propriétaire : quelles technologies de leur *stack* n'avaient aucune question. Ajouté 3 technologies (**45** en tout, **497** questions, chacune avec sa réponse modèle EN/FR et le vous/tu de l'intervieweur) :
  - **Architecture logicielle** (parcours Fondamentaux) : monolithe ou microservices, architecture hexagonale, CQRS, event sourcing, cohérence à terme, timeouts entre services, données partagées, versions d'API, et une question d'expérience ;
  - **IA et LLM** (Fondamentaux) : ce qu'un LLM sait faire ou non, assistant de code sans livrer ce qu'on ne comprend pas, RAG, embeddings et bases vectorielles, hallucinations, clés et données, modèle hébergé ou local, tokens, et « un projet fait avec l'IA : qu'as-tu vérifié toi-même ? » (utile pour les projets vibe-codés) ;
  - **Windows Server et AD** (DevOps et cloud) : Active Directory, GPO, session qui ne s'ouvre pas, PowerShell, dossier partagé inaccessible, mises à jour en vagues, Hyper-V et points de contrôle.
- Alias pour les noms vus dans ses offres : Express → Node.js, Oracle → SQL, Hudson → CI/CD, OpenSearch/Graphite/Mimir → supervision, Fortigate → réseaux, Zero Trust/Vault/ISO 27001 → sécurité, MFC → C++, WinForms/WPF → C#, Vaadin → Java. Les mots courants (« Cursor », « Windows », « Express ») ne comptent que comme valeur entière : « SQL cursors » reste du SQL.
- Restent sans questions, une offre chacune : Ruby, SOAP, Nomad, Machine Learning (et des outils qui ne sont pas des sujets d'entretien : Confluence, IntelliJ, ISO 9001, ticketing).

### 🛡️ CSP complète (local, 2026-10-05)

- **Content-Security-Policy stricte** sur chaque page : un *nonce* neuf par requête et `'strict-dynamic'`, construite par Clerk dans le *proxy* (`proxy.ts`, avec ses propres domaines), plus `media-src blob:` (questions lues à voix haute), `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`. `<ClerkProvider dynamic>` et le thème reçoivent le *nonce* ; Next.js le met sur ses scripts. C'était le dernier point ouvert de l'audit.
- **e2e sur le *build* de production** : `npm run build && E2E_PROD=1 npm run e2e` (en dev, la CSP autorise `'unsafe-eval'` et Next.js ne précharge rien). Les e2e vérifient aussi l'en-tête CSP, la lecture d'un CV PDF dans le navigateur (`tests/e2e/cv-sample.pdf`, fictif) et le départ de la connexion GitHub. 4/4 en dev et en production.
- 🚀 En ligne (même jour) et vérifié sur le vrai site dans un navigateur : `/` et `/sign-in` ont la CSP stricte avec *nonce* (sans `'unsafe-eval'`), aucune erreur ni violation dans la console, « Continue with GitHub » mène bien à GitHub.
- 🐛 Trouvé grâce à ce mode : en production, les liens de « Nouvel entretien » préchargeaient la même page avec d'autres paramètres, et ces préchargements restaient ouverts sans fin (invisible pour l'utilisatrice, mais des requêtes pendantes). Ces liens ne sont plus préchargés ; un clic affiche l'étape suivante en moins d'une demi-seconde.

### 🚀 En ligne (local, 2026-10-05)

- *Token* Vercel renouvelé (`stripe projects rotate nextround`, à la demande de la propriétaire), `OWNER_GITHUB_ID` envoyé à Vercel, puis `main` (PR #17 à #22) déployé avec `node scripts/infra/deploy.mjs`.
- Vérifié en production : `/` et `/sign-in` en 200, `/dashboard` renvoie vers `/profile`, les pages protégées passent par la connexion Clerk (un `curl` sans en-têtes de navigateur reçoit un 404 de Clerk : normal), *security headers* présents, inscription refusée à un inconnu (`npm run clerk:signup -- probe`).

### 🔍 Audit, suite (local, 2026-10-05)

- 🛡️ **DNS rebinding** : la lecture des pages d'offres passe par un agent undici dont la résolution DNS refuse toute adresse privée **au moment où la connexion s'ouvre** (`publicLookup`), plus seulement avant. Vérifié : `localtest.me` (qui pointe vers 127.0.0.1) refusé, une vraie page lue.
- 📦 `shadcn` en *devDependencies* : `npm audit --omit=dev` ne trouve plus rien.
- 🧹 Le premier appel du jour efface les compteurs par minute des jours d'avant (les totaux par jour restent).
- Reste ouvert : une CSP complète (*nonces*), à tester avec la connexion Clerk dans un vrai navigateur. Rapport : [audit](fr/audits/2026-10-04-audit.md).

### 🔁 Profil, suite (local, 2026-10-05)

Décision : [ADR 0025](fr/adr/0025-fusion-dates-et-phrases-de-la-candidate.md).

- **Doublons fusionnés pour de bon** : lien « Fusionner » sur chaque fait replié, bouton « Fusionner les doublons (N) » sur la base. Tout ce qui citait une formulation fusionnée (exigences d'offres, phrases de CV et lettres, réponses types, retours) pointe vers la formulation gardée avant la suppression.
- 🐛 **Bug corrigé** : corriger au crayon un fait replié supprimait ses autres formulations sans recâbler leurs références (une offre pouvait perdre sa couverture, une phrase de CV sa preuve). Le crayon fusionne maintenant de la même façon.
- 📅 **Dates des CV** écrites d'une seule façon à l'affichage (« février 2025 – juin 2025 », « 2023 – aujourd’hui »), **sans jamais rien inventer** : une année reste une année, « January – June 2025 » garde son année commune, ce qui ne se lit pas avec certitude reste tel quel. Le CV stocké ne change pas.
- ✍️ Les phrases qu'on **corrige à la main** dans un CV ou une lettre du profil rejoignent la base (puce avec le titre de son entrée ; résumé et lettre sous « Réalisations »). Les phrases de l'IA et celles sur l'entreprise, non.
- Vérifié : 210 tests unitaires (fusion testée sur un Postgres en mémoire), e2e 4/4 dont un clic réel sur « Fusionner ».

### 🧭 Plus de tableau de bord (local, 2026-10-05)

Décision : [ADR 0024](fr/adr/0024-pas-de-tableau-de-bord.md).

- Menu dans l'ordre du travail : **Profil → Offres → Entretiens → Réglages**. Le profil est la page d'accueil (après la connexion, depuis l'accueil public, depuis le logo) ; `/dashboard` renvoie vers `/profile`.
- Les cartes d'offres (`components/offers/opportunities.tsx`) ne vivent plus que sur la page Offres. Supprimés : salutation, bloc « Pour commencer », carte « IA utilisée », `lib/i18n/dashboard.ts`.
- Vérifié : 197 tests unitaires, e2e 4/4 (qui vérifie aussi les deux redirections).

### 🔐 Clés de l'instance pour la propriétaire seule, inscription fermée (local, 2026-10-05)

Décision : [ADR 0023](fr/adr/0023-cles-de-l-instance-pour-la-proprietaire.md).

- **Toutes** les clés de l'instance ne servent qu'au compte de la propriétaire, Firecrawl compris (avant : tout compte connecté, 30 pages par jour). Les autres comptes mettent leurs propres clés dans les Réglages : nouvelle carte « Pages d'offres » avec une clé Firecrawl facultative (chiffrée, migration `0008_firecrawl_key`, appliquée à Neon). Sans clé : le lecteur intégré, gratuit, ou le texte collé.
- La propriétaire est reconnue par son **identifiant GitHub numérique** (`OWNER_GITHUB_ID` = 96707268, variable Stripe Projects `owner-github-id`), plus par son pseudo. Sans la variable, personne n'est propriétaire.
- **Inscription fermée** (instance Clerk de dev) : *allowlist* avec la seule adresse de la propriétaire. `npm run clerk:signup -- status | close | open | probe` ; `probe` joue un inconnu et reçoit `403 not_allowed_access`. L'adresse e2e n'est autorisée que pendant les tests (le *seed* l'ajoute, le *cleanup* la retire).
- Réglages : carte voix et carte pages d'offres faites du même composant (`components/settings/service-key-form.tsx`) ; troisième case « Pages d'offres » dans l'encart du haut.
- Vérifié : 202 tests unitaires, e2e 4/4 (écrans FR compris).

### ⚙️ Réglages et reprise de la to-do du cloud (local, 2026-10-05)

- Migration `0007` appliquée à Neon ; e2e 4/4 sur le Mac, **écrans en français compris** (nouveaux écrans `fr-*` dans `tests/e2e/screens.spec.ts`), les *security headers* ne gênent pas Clerk ; production déployée (`node scripts/infra/deploy.mjs`).
- Page Réglages : pleine largeur ; bandeau brun « ce qui est branché » (IA, modèle, source de la clé, voix, appels du jour avec la clé de l'instance) avec une explication d'OpenRouter et des limites de la clé de l'instance (`DEFAULT_LIMITS`) ; IA à gauche, voix à droite, chacune avec « où elle travaille » dans le site (`components/settings/connection-banner.tsx`, `getTodayUsage` dans `lib/ai/usage.ts`).
- Bouton EN/FR et fournisseur choisi en terracotta (plus de bleu hors DA).
- Question de la propriétaire (inscription ouverte) : les clés d'IA et de voix de l'instance ne servent qu'à son compte ; **mais l'inscription Clerk est ouverte** (instance de développement, pas de liste d'autorisation) et la clé **Firecrawl** sert à tout compte connecté (30 lectures de page par jour et par compte). Propositions en attente de sa réponse : réserver Firecrawl à la propriétaire, fermer l'inscription (liste d'autorisation Clerk : son e-mail + l'adresse e2e), reconnaître la propriétaire par un identifiant stable plutôt que par son pseudo GitHub (point de l'audit).

### 🎨 Tour des pages (cloud, PR #15)

- `deploy.mjs` lance d'abord `npm run db:migrate` et s'arrête s'il échoue.
- Cartes d'offres : bande de couleur du parcours, logos de la stack (Simple Icons), logo de la plateforme (`public/sites/`, Indeed via Simple Icons), étape choisie sur la carte. Offres triées par **parcours** (mêmes parcours que les questions techniques : `lib/offers/track.ts`), sur le tableau de bord et la page Offres.
- Profil : onglets de catégories au-dessus des CV (Tous, Général, DevOps, Web, Java…), imports l'un sous l'autre sur toute la largeur sous « Compléter ta base », GitHub affiche « Fait le … : N projets » et « Mettre à jour ».

### 👤 Profil (cloud)

- Le profil est **la base** : tous les CV (anciens, récents, tech ou non) y sont fusionnés. Un même fait écrit un peu différemment dans deux CV n'apparaît qu'une fois, dans sa formulation la plus complète, avec « aussi dans N autres sources » (`lib/profile/dedupe-facts.ts`, à l'affichage : rien n'est supprimé).
- **Tout est validé d'office** (CV, GitHub, Codewars, LeetCode, chat, ajout à la main) : plus de section « à valider ». Chaque ligne du CV et de la base a un petit crayon pour corriger un mot, une majuscule ou une date (`components/shared/editable-line.tsx`, `lib/profile/cv-edit.ts`).
- Projets : interrupteur « fait avec l'IA » à côté de chaque projet.
- Codewars et **LeetCode** (API GraphQL publique, gratuite) dans un bloc compact. Migration `0007_leetcode_source` (valeur `leetcode` de l'enum `fact_source`).
- Page plus compacte (bibliothèque en lignes, imports sur deux colonnes).
- CV et lettre par offre : chaque phrase se modifie au crayon **sans réécrire le document** (même version, les faits cités restent) ; pareil pour un document ajouté au profil (`lib/documents/edit.ts`).
- Cartes d'offres : bouton « S'entraîner » et ligne match/entraînements alignés en bas.

### 🎭 Contenu (cloud)

- **Répliques** : les 58 personnages fictifs ont un vrai jeu de répliques EN/FR (salutations, tics, transitions, conclusions) et des répliques qui **réagissent au sujet de la question** (Homer avant le salaire, Yoda avant les points faibles…) : `lib/interviewers/flavor/lines/`. Les 52 personnes réelles n'en ont toujours aucune.
- **Questions** : 100 questions RH (60 avant), dont 14 inappropriées avec la façon d'y répondre ; 467 questions techniques (416 avant), au moins 8 par technologie.
- **Stripe dans le cloud** : la Stripe CLI se connecte par `stripe login` (lien à valider dans le navigateur), puis `stripe projects pull` dans un dossier à part et `env add` des variables du projet. Tous les services restent gratuits (`stripe projects spend` : aucune facturation).
- **e2e dans le cloud** : `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm run e2e`. L'accueil passe ; les écrans connectés bloquent encore sur la connexion de test Clerk derrière le proxy.

### 🔍 Audit (cloud, PR #10)

- Sécurité et *code review* : 7 corrections (*security headers*, lecture des pages limitée en *stream*, réutilisation du *feedback* seulement si ses *facts* tiennent et pour la même offre, voix après changement d'intervieweur, nouvelle version de CV affichée, relance après réponse vide). Rapport et 5 points ouverts : [audit du 2026-10-04](fr/audits/2026-10-04-audit.md).

### 🗂️ Rangement (cloud, PR #9)

- Plus aucun fichier en vrac : `lib/server/` (auth, env, crypto), `lib/shared/` (dates, ids, text), `components/layout/`, `tests/<domaine>/`, `scripts/infra/`, `assets/characters/` (ex-`characters/`). Détails : [architecture](fr/guides/architecture.md).
- Doc : `docs/fr/` et `docs/en/`, chacun avec `guides/` et `adr/` ; sommaires, emojis, mots techniques gardés en anglais.

### 🌍 Langue du site (cloud, PR #6 et #8)

- Tout le site connecté suit le bouton EN/FR, messages des *server actions* compris. Textes dans `lib/i18n/*` ; un test vérifie que l'anglais et le français ont les mêmes textes et les mêmes `{variables}`.
- Un CV, une lettre et un entretien gardent **leur propre langue**.
- Restent en anglais : l'accueil public et la connexion (pas de bouton de langue hors de l'app).

### 📄 Documents et profil (local, PR #3, #4, #7 — déployées, migrations `0005` et `0006` appliquées)

- Projets **vibe-codés** marqués « Built with AI » : gardés dans le profil, mais ne couvrent **jamais** une exigence technique (règle unique dans `lib/offers/coverage.ts`).
- « Update with my validated facts » sur une offre.
- CV par offre au format CV tech, EN ou FR, chaque élément vérifié ; lettre EN/FR ; un document peut être **ajouté au profil** et servir de point de départ.
- Les faits proposés se valident **sur place**, sous la ligne du CV d'où ils viennent.
- 110 intervieweurs dans 10 catégories après le retrait des 38 masqués.
- Données de la propriétaire : 2 CV, 19 projets GitHub, 11 offres importés ; leurs faits sont validés d'office depuis la refonte du profil. À demander : « cookie » (introuvable sur GitHub) et l'app du hackathon (2e place).

### 🎙️ Entretiens (cloud, PR #2)

- Entretiens sans offre : par technologie (42, regroupées en parcours) ou RH seul.
- Parcours : type → offre ou techno → intervieweur en pleine page → test caméra → appel. Caméra vraiment coupée (LED éteinte).
- **Questions écrites à l'avance, sans IA** : banque RH (classiques, variantes, pièges, questions illégales) et banque technique, en vrai anglais et vrai français. L'IA ne sert qu'au retour sur les réponses.
- Réglages : *provider* Anthropic (Claude) ; `ANTHROPIC_API_KEY` passe avant OpenRouter pour la propriétaire. ElevenLabs de l'instance coupé par défaut (`INSTANCE_VOICE_ENABLED=true`). Avertissements de coût ; un retour et un audio déjà produits sont réutilisés.

## 🚧 En cours

- 🔑 **Secrets absents du cloud** : sans eux, ni l'app ni les e2e ne tournent dans une session cloud. Liste : [guide local et cloud](fr/guides/local-et-cloud.md#-les-secrets-dans-le-cloud).
- 💼 25 offres Actiris (Bruxelles, IT, accessibles à un junior) choisies le 2026-10-04 : **20 importées** sur le compte de la propriétaire (10 de plus le 2026-10-05, pour 19 appels d'IA : le modèle gratuit relance parfois). **Restent 5**, textes prêts dans `.local/offers/` : `npm run owner:import-offers -- .local/offers/{5945294,5962926,5966908,5869183,5869129}.txt` (environ 9 appels ; à lancer un jour où le quota de 40 n'est pas entamé). Si `.local/offers/` n'existe plus : `npm run offers:actiris -- fetch 5945294 5962926 5966908 5869183 5869129`.
- 🚫 Indeed bloque les robots (Cloudflare, 403) et l'interdit : on ne le contourne pas. Offres Indeed : lien ou texte collé dans l'app.
- 📄 Importer des CV : les joindre au chat, Claude lance `owner:import-cv`.

## 🎬 Avatars animés

- ⏸️ **En pause** (demande du 2026-10-04).
- `assets/characters/<id>/` : `sources.json`, `candidates/` (+ `contact-sheet.jpg`), `selection.json`, `master_reference.png` et `references/`, `performance.json` (décor, tenue, tics), `clip-plan.json` (33 clips).
- Scripts : voir [ajouter un personnage](fr/guides/ajouter-un-personnage.md#️-lavatar). `DRY_RUN=1` pour tout vérifier sans crédit.
- Périmètre : personnages animés + Dark Vador et Yoda. Pas de vidéo de personnes réelles ni de personnages joués par des acteurs.
- Test prévu : M. Burns (références prêtes), bloqué sur `ELEVENLABS_API_KEY` dans le cloud (plan Pro minimum pour l'API Image & Video).

## 🔜 Ensuite

- 🔒 « cookie » et l'app du hackathon (2e place) sont des dépôts **privés** : on les ajoutera plus tard aux projets faits avec l'IA, quand la propriétaire le dira (réponse du 2026-10-05). Ne plus lui demander leurs noms.
- 💼 Les 15 offres Actiris restantes (voir « En cours »).
- 💬 Le chat de 5 questions du profil : à retravailler (demande du 2026-10-04).
- 🔍 Audit du 2026-10-04 : tous les points sont fermés. Le refaire de temps en temps (`npm audit --omit=dev`, `/security-review`).
- 🚀 Relier Vercel à GitHub pour *deploy* sans le Mac : le compte Vercel (créé par Stripe Projects) ne voit **aucun** compte GitHub (`/v1/integrations/git-namespaces` vide). Il faut que la propriétaire connecte GitHub une fois dans Vercel (un clic, OAuth) ; ensuite, relier le projet par l'API et ne lancer les migrations qu'au *build* de **production** (`VERCEL_ENV=production`), jamais sur une *preview* (une seule base, ADR 0014).
- 🖼️ Logo Actiris : toujours le favicon de 16 px (le site n'a pas d'icône plus grande ; le logo complet est horizontal). Le Forem a maintenant son icône officielle en 64 px.
- 🔐 Avant une instance Clerk de **production** : l'*allowlist* y est payante ; prévoir une barrière dans l'app, ou le plan payant (ADR 0023). Idée de la propriétaire, pas décidée : faire payer les autres utilisateurs via Stripe au lieu de leur demander leurs clés.
- 🔊 Cache audio durable (Vercel Blob ou S3) quand ElevenLabs sera activé pour de bon.
- 🎬 Avatars : en pause.
