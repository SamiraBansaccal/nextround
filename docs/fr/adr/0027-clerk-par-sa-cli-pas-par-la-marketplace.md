# 🔐 ADR 0027 — Clerk se crée avec sa propre CLI, pas depuis la Marketplace Vercel

> 🇬🇧 English version: [en/adr/0027](../../en/adr/0027-clerk-from-its-cli-not-the-marketplace.md)

- **Date :** 2026-10-10
- **Statut :** ⛔ remplacée par l'[ADR 0028](0028-neon-auth-et-une-base-a-londres.md) (connexion avec Neon Auth)
- **Fait suite à :** [ADR 0002](0002-neon-et-clerk.md) (connexion GitHub activée avec `clerk config patch`), [ADR 0023](0023-cles-de-l-instance-pour-la-proprietaire.md) (inscription sur invitation, instance de développement)

## 🎯 Contexte

Après Stripe Projects, Neon et Clerk ont été installés depuis la **Marketplace Vercel** : une commande chacun, et leurs clés arrivent toutes seules sur le projet Vercel.

Une application Clerk créée par la Marketplace vit dans un espace **géré par Vercel**. Le rôle de la personne propriétaire y est `managed_owner`, et Clerk ne donne à ce rôle **aucun accès à sa Platform API**, celle que la CLI Clerk utilise pour les réglages :

- `clerk apps list` et `clerk config patch --app …` répondent `403 Workspace role has no Platform API access`. Le message de Clerk : *« This workspace is managed by a partner integration, so its roles cannot be changed. Use an API key with the scopes you need. »*
- Avec seulement la clé secrète de l'application, la CLI couvre quelques réglages et refuse `connection_oauth_github`.
- L'API Backend de Clerk n'a aucune route pour les méthodes de connexion, et la CLI Vercel ne prend que des options d'offre pour l'intégration Clerk.

Activer la connexion GitHub, que l'ADR 0002 faisait en une commande, devenait donc un clic dans le tableau de bord de Clerk, comme chaque réglage suivant. Un dev s'en sort. Mais NextRound veut pouvoir être déployé par des gens qui ne le sont pas : quelqu'un sans formation en code, ou une personne junior à l'aise avec les algorithmes mais perdue dès que le code doit quitter son ordinateur. Et le déploiement qu'on propose aux autres doit être celui qu'on fait nous-mêmes.

La documentation de Clerk ajoute qu'une application Clerk existante **ne peut pas passer plus tard sous l'intégration Vercel**.

## 🔍 Options étudiées

| Option | Verdict |
|---|---|
| Garder le Clerk de la Marketplace et cliquer dans son tableau de bord | Marche, mais chaque réglage passe par le tableau de bord : rien ne peut être scripté |
| Le garder avec une clé Platform API (`ak_…` dans `CLERK_PLATFORM_API_KEY`, lue par la CLI Clerk) | La sortie documentée par Clerk, mais la clé elle-même se crée à la main dans le tableau de bord ; pas essayé |
| Un autre service de connexion : Neon Auth ou Better Auth | Neon Auth prête des identifiants de développement pour Google seulement, et ne documente ni GitHub ni l'inscription sur invitation ; avec Better Auth, chaque personne qui déploie doit créer des apps OAuth GitHub et Google, même pour essayer. Les deux obligent à réécrire la connexion |
| **Clerk créé avec sa CLI** | ✅ chaque réglage par commande, comme avant |

## ✅ Décision

- **Clerk se crée avec sa CLI**, avec le propre compte Clerk de la personne qui déploie : `clerk auth login` (une connexion dans le navigateur), `clerk apps create`, `clerk config patch` (GitHub activé, liste d'invitation), `clerk env pull` pour les deux clés.
- **Les clés partent sur Vercel avec la CLI Vercel** : la clé publique en production et en développement, la clé secrète en *sensible* en production (personne ne peut la relire) et chiffrée en développement. Elles ne passent jamais par git.
- **Neon reste sur la Marketplace** : aucune de ces limites n'est apparue (tables, clés et région ont marché).
- L'instance de la personne propriétaire a été refaite ainsi le 2026-10-10 : ressource et intégration de la Marketplace retirées, nouvelle application, données rattachées au nouveau compte, production redéployée.

## 📊 Conséquences

**Bien** 👍
- Chaque réglage de Clerk redevient une commande : l'ADR 0002 marche tel qu'il est écrit.
- Un script de déploiement peut tout faire après une seule connexion, avec les comptes de la personne qui déploie et rien de personnel dans le code.
- La personne propriétaire et toute personne qui déploie une copie suivent les mêmes étapes.
- Les connexions GitHub et Google marchent sans créer d'apps OAuth, grâce aux identifiants partagés de l'instance de développement.

**Moins bien** 👎
- Un compte de plus à ouvrir (Clerk, au nom de la personne qui déploie) ; la Marketplace le rendait implicite.
- Vercel ne synchronise pas les clés : le script les envoie, et doit être relancé après un changement de clé.
- La facturation n'est pas dans Vercel (sans importance tant que tout est gratuit).
- Une application Clerk créée ainsi ne pourra jamais passer sous l'intégration Vercel (documentation de Clerk).
