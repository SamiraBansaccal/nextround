# 🧱 ADR 0012 — Un `user_id` sur chaque table, imposé dans `lib/data`, testé sur un Postgres en mémoire

> 🇬🇧 Version anglaise : [en/adr/0012](../../en/adr/0012-data-isolation.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée

## 🎯 Contexte

La spec : « chaque table a un user_id ; chaque request serveur filtre sur l'identifiant de
l'utilisateur tiré de la session côté serveur, jamais du client ; ajouter une vérification que
l'utilisateur A ne peut pas lire ou modifier les données de B en changeant un identifiant ».

## ✅ Décision

- **Chaque table porte `user_id`**, y compris les tables enfants (`requirements`,
  `offer_contacts`, `questions`, `answers`), pour qu'aucune request n'ait besoin de passer par un
  parent pour connaître le propriétaire.
- **L'identifiant de l'utilisateur vient d'un seul endroit** : `requireUserId()` / `getAccount()`
  dans `lib/server/auth.ts`, qui lisent la session Clerk côté serveur. Les *server actions* ne prennent
  jamais un identifiant d'utilisateur en entrée.
- **Chaque fonction de `lib/data/` prend `userId` en premier et le met dans chaque `WHERE`** —
  lectures, modifications et suppressions. Les identifiants venus du client sont vérifiés comme
  UUID avant toute request.
- **Les tests tournent sur PGlite**, un vrai Postgres en mémoire, migré avec les mêmes fichiers SQL
  que la production : l'utilisateur B, qui connaît les identifiants des lignes de A, ne peut ni les
  lire, ni les lister, ni les modifier, ni les supprimer, ni les déplacer
  (`tests/data/isolation.test.ts`, `tests/data/isolation-all.test.ts`).
- `proxy.ts` (le *middleware* renommé de Next.js 16) refuse tôt les requests non connectées, mais
  ce n'est qu'un premier filtre ; la garantie, c'est la couche de données.

## 📊 Conséquences

**Bonnes** 👍

- L'isolation est vérifiée par des tests sur chaque table, pas supposée.
- Nettoyer les données d'un utilisateur est exact : le nettoyage de l'e2e supprime
  `WHERE user_id = …` dans chaque table.

**Mauvaises** 👎

- **Ça repose sur la discipline** : une nouvelle request écrite sans la condition `user_id`
  fuiterait. Le *row-level security* de Postgres l'imposerait au niveau de la base ; pas mis en
  place (le driver HTTP de Neon se connecte avec un seul rôle).
- Le `user_id` redondant des tables enfants doit rester cohérent avec celui du parent ; rien dans
  le schéma ne l'impose (pas de clé étrangère composite).
