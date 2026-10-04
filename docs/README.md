# Documentation de NextRound

Cette documentation explique **comment** et **pourquoi** chaque partie du projet fonctionne, phase par phase. Elle est écrite pour quelqu'un qui apprend : chaque page part de ce qu'on a fait, montre les fichiers concernés, puis explique les choix.

## Pages

| Page | Contenu |
|---|---|
| [00-setup.md](00-setup.md) | Phase 0 : Stripe CLI, Stripe Projects, skills des agents, git, ce qui est (ou non) versionné |
| [01-stack-auth-deploy.md](01-stack-auth-deploy.md) | Phase 1 : stack, fournisseurs, connexion GitHub, base de données, isolation des données et son test, déploiement |
| [02-bring-your-own-ai.md](02-bring-your-own-ai.md) | Phase 2 : le client d'IA unique, qui paie, les clés chiffrées, la protection SSRF, la relance JSON, les limites, l'auto-hébergement |
| [EN-COURS.md](EN-COURS.md) | Où on en est : fait, en cours, ensuite (mis à jour à chaque session) |
| [FR/local-et-cloud.md](FR/local-et-cloud.md) | Passer d'une session Claude locale au cloud et inversement : code, secrets, fichiers perso, scripts propriétaire |
| [FR/ajouter-un-personnage.md](FR/ajouter-un-personnage.md) | Ajouter un intervieweur : fiche, répliques, catégorie, avatar (procédure suivie par Claude) |
| [lovable-prompt.md](lovable-prompt.md) | Le prompt donné à Lovable pour le prototype d'interface |
| [slides-prompt.md](slides-prompt.md) | Le prompt pour les slides du pitch |

Une page sera ajoutée à chaque phase.

## Glossaire

| Terme | Explication |
|---|---|
| **Stripe CLI** | Programme en ligne de commande (`stripe …`) pour piloter son compte Stripe depuis le terminal. |
| **Stripe Projects** | Plugin de la Stripe CLI (`stripe projects …`) qui crée des comptes chez des fournisseurs (hébergement, base de données, authentification, IA…) et récupère leurs clés à notre place. |
| **Fournisseur (provider)** | Une entreprise qui fournit un service : Vercel, Neon, Supabase, Clerk, OpenRouter… |
| **Service** | Ce qu'un fournisseur propose : une base Postgres, un hébergement, etc. Noté `fournisseur/service` (ex. `neon/postgres`). |
| **Ressource** | Une instance concrète d'un service pour notre projet (ex. *notre* base de données), avec ses identifiants. |
| **Variable d'environnement** | Une valeur (souvent secrète : mot de passe, clé d'API) donnée à l'application au démarrage, hors du code. En local elles vivent dans `.env`. |
| **Mode live / sandbox** | Stripe a un mode réel (*live*) et des copies de test (*sandbox*). Stripe Projects exige le mode live, car il gère de vrais comptes chez les fournisseurs. |
| **Skill** | Un dossier d'instructions (`SKILL.md`) qu'un agent de code comme Claude Code lit pour savoir utiliser un outil correctement. |
| **Migration** | Un fichier SQL qui crée ou modifie les tables. Généré à partir du schéma, versionné, appliqué à la base. |
| **Proxy (Next.js 16)** | Code qui s'exécute avant chaque requête (anciennement « middleware ») : ici, il renvoie vers la connexion. |
| **OAuth** | Le protocole derrière « Continuer avec GitHub » : GitHub confirme qui vous êtes, sans donner votre mot de passe à l'application. |
| **Isolation des données** | Garantie qu'un utilisateur ne peut ni lire ni modifier les données d'un autre, même en changeant un identifiant dans une requête. |
| **SSRF** | Attaque où l'on fait appeler par le serveur une adresse interne qu'on ne devrait pas pouvoir atteindre. D'où l'interdiction des URL personnalisées sur l'instance publique. |
| **AES-256-GCM** | Algorithme de chiffrement standard ; « GCM » ajoute une signature qui détecte toute modification de la donnée chiffrée. |
| **Server action** | Fonction serveur que l'interface appelle directement (Next.js) ; elle revérifie la session et valide ses entrées. |
| **Remote (git)** | Le dépôt distant (ici sur GitHub) vers lequel on pousse (`git push`) les commits locaux. |
