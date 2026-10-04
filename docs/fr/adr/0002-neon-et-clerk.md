# 🐘 ADR 0002 — Neon (Postgres) + Clerk (connexion) plutôt que Supabase

> 🇬🇧 Version anglaise : [en/adr/0002](../../en/adr/0002-neon-and-clerk.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée, amendée par l'[ADR 0023](0023-cles-de-l-instance-pour-la-proprietaire.md) (la propriétaire est reconnue par son identifiant GitHub numérique ; inscription fermée pendant le dev)

## 🎯 Contexte

La spec demandait Postgres sur Neon ou Supabase, et la connexion avec Clerk — ou Supabase Auth si
Supabase était la base. La connexion **GitHub est obligatoire** (l'import du profil part du login
GitHub), Google est facultatif. L'app devait rester démontrable devant un jury après le hackathon,
éventuellement des jours plus tard.

## ⚖️ Les options

| | Supabase (base + auth) | Neon + Clerk |
|---|---|---|
| Le plan gratuit se met en pause ? | **Oui** : un projet gratuit est mis en pause après une semaine sans activité | Non : Neon ne suspend que le calcul, qui se réveille en une fraction de seconde |
| Connexion GitHub en développement | Demande une *OAuth App* GitHub créée à la main, recopiée dans le tableau de bord | Les instances de développement Clerk fournissent des identifiants OAuth partagés |
| Providers | Un | Deux |

## ✅ Décision

**Neon pour Postgres, Clerk pour la connexion.** Clerk tourne en *instance de développement* ;
GitHub a été activé avec la CLI Clerk (`clerk config patch … connection_oauth_github.enabled=true`).

## 📊 Conséquences

**Bonnes** 👍

- Un jury ne peut pas tomber sur une démo endormie.
- La connexion GitHub a marché sans créer aucune *OAuth App*.
- Le login GitHub vient du compte OAuth vérifié : c'est lui qui décide qui est le propriétaire de
  l'instance (`OWNER_GITHUB_LOGIN`).

**Mauvaises** 👎

- **Deux providers au lieu d'un** — deux tableaux de bord, deux jeux d'identifiants.
- **L'instance Clerk est une instance de développement** : un badge « Development mode », des
  identifiants OAuth partagés et les limites d'usage du développement. Passer en production demande
  un nom de domaine à soi et ses propres identifiants OAuth (`npx clerk deploy` guide les étapes).
  Pas fait.
- L'API de Clerk a changé avec Core 3 (mars 2026) : le nouveau flux `signIn.sso()` n'a pas encore
  de composant de retour exporté pour Next.js. L'app utilise donc la paire bien documentée
  `authenticateWithRedirect` + `AuthenticateWithRedirectCallback`.
