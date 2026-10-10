# 🔑 ADR 0028 — La connexion avec Neon Auth, la base à Londres

> 🇬🇧 English version: [en/adr/0028](../../en/adr/0028-neon-auth-and-a-london-database.md)

- **Date :** 2026-10-10
- **Statut :** ✅ acceptée (bascule en cours)
- **Remplace :** [ADR 0027](0027-clerk-par-sa-cli-pas-par-la-marketplace.md) (Clerk par sa CLI). **Modifie :** [ADR 0002](0002-neon-et-clerk.md) (Neon + Clerk).

## 🎯 Contexte

La personne propriétaire veut le moins de services possible, chaque réglage fait par commande, et un projet que des gens qui ne sont pas dev peuvent déployer (toute personne qui récupère le projet a au moins un compte GitHub).

**Neon Auth** (le Better Auth géré par Neon) vit dans le projet Neon :

- les comptes sont rangés dans notre propre base (schéma `neon_auth`) ;
- la CLI Neon règle tout : fournisseurs, e-mail et mot de passe coupés, domaines autorisés, utilisateurs (`neon neon-auth …`) ;
- le produit Neon de la Marketplace Vercel a une **option « Auth »**, activée par défaut à l'installation : aucun compte de plus à ouvrir.

Testé le 2026-10-10 avec une mini-app jetable hors du repo (Next 16, `@neondatabase/auth` 0.5.0-beta, le proxy du SDK pour la session) :

- **Francfort (`aws-eu-central-1`) : la connexion casse chez Neon.** Le service d'authentification d'un serveur en zone `c-7` ou `c-8` répond `ok`, mais `sign-in/social` renvoie une adresse en zone `c-6` (`<serveur>.neonauth.c-6.eu-central-1.aws.neon.tech/…/sign-in/social/init`). Le serveur n'y existe pas : `{"error":"Upstream control-plane error","code":404,"cause":{"error":"endpoint not found","cpStatus":404}}`. Reproduit sur deux branches du projet existant et sur une ressource neuve de la Marketplace avec Auth activé dès le départ, avec les codes Google partagés de Neon comme avec des codes « standard ». Désactiver puis réactiver Neon Auth sur une branche est ensuite refusé (« Neon Auth is not enabled for this branch »).
- **Londres (`aws-eu-west-2`) : ça marche de bout en bout.** L'adresse de connexion reste dans la zone du serveur (`c-2`), la connexion Google aboutit, et le compte arrive dans `neon_auth.user` et `neon_auth.account`.

## ✅ Décision

- **La connexion passe à Neon Auth.** Clerk est retiré une fois le code de l'app basculé.
- **La base déménage à Londres** (`aws-eu-west-2`), créée depuis la Marketplace Vercel avec Auth activé, et les fonctions suivent (`lhr1`). On reste en Europe : le Royaume-Uni bénéficie d'une décision d'adéquation de l'UE pour les données personnelles.
- **Google et GitHub seulement** : e-mail et mot de passe sont coupés par commande. GitHub demande les propres codes OAuth de la personne qui déploie, car Neon ne prête des codes partagés que pour Google, et seulement en développement.
- **L'inscription sur invitation et les demandes d'accès passent dans l'app** (nos propres tables) : Neon Auth n'a pas de liste d'autorisation.
- Revenir à Francfort pourra se reconsidérer quand Neon aura corrigé le bug de zone, à leur signaler.

## 📊 Conséquences

**Bien** 👍
- Un service de moins : plus de compte Clerk à ouvrir ni à régler.
- Les comptes vivent dans notre propre base : lisibles en SQL, sauvegardés avec le reste des données.
- Tout se règle par commande, et l'option « Auth » de la Marketplace prépare un bouton Deploy.

**Moins bien** 👎
- Le SDK est en bêta (`0.5.0-beta`) : une version mineure peut casser des choses.
- La connexion GitHub demande une app OAuth par déploiement (une création en un clic reste à construire et à tester).
- Les codes Google partagés de Neon sont réservés au développement et affichent le nom et le logo de Neon sur l'écran de Google.
- L'inscription sur invitation et les demandes d'accès sont à refaire dans l'app.
- Un déménagement de données de plus (Francfort → Londres), et le retour à Francfort dépend d'un correctif de Neon.
