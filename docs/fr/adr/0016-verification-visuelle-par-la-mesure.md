# 📏 ADR 0016 — Les écrans sont vérifiés par la mesure, avec un utilisateur de test jetable

> 🇬🇧 Version anglaise : [en/adr/0016](../../en/adr/0016-visual-check-by-measurement.md)

- **Date :** 2026-10-04
- **Statut :** ✅ acceptée

## 🎯 Contexte

Tous les écrans sont derrière la connexion : un simple outil de capture ne voit que la page
d'accueil. Regarder l'app à la main rate ce que l'œil ne voit pas (une page qui défile de 3 px sur
le côté, une affirmation imprimée sur une carte et qui n'est pas vraie). Le projet précédent de
l'auteur a posé la règle : **mesurer plutôt que regarder**.

## ✅ Décision

`npm run e2e` (`scripts/test/e2e.mjs`) fait trois choses, la dernière toujours :

1. **Préparer** — `tests/e2e/fixtures.mts` crée un **utilisateur de test** Clerk (adresse
   `+clerk_test` de l'instance de développement) et des données d'exemple fictives pour lui, avec
   les vraies fonctions de `lib/data`.
2. **Capturer et mesurer** — Playwright démarre le serveur de développement, se connecte avec
   l'outil de test de Clerk (un *sign-in token* créé côté serveur, sans mot de passe), ouvre chaque
   écran sur ordinateur (1440×900) et mobile (Pixel 7), en clair et en sombre pour les plus riches,
   et **échoue** sur : un débordement horizontal, un titre de page absent, une erreur dans la
   console. Les captures vont dans `e2e-screens/` (ignoré par git) pour être relues.
3. **Nettoyer** — supprime les lignes de l'utilisateur de test dans chaque table, puis l'utilisateur
   Clerk — même si les tests ont échoué.

Playwright démarre et arrête lui-même le serveur et le navigateur : aucun processus orphelin.

## 📊 Conséquences

**Bonnes** 👍

- Le premier passage a trouvé **huit défauts d'affichage et une affirmation fausse** que la lecture
  du code avait ratés : un badge de site étiré, un bandeau étiré, une coche « répondu » invisible, un
  sous-titre illisible, la vignette « You » qui chevauchait les boutons de l'appel sur mobile, des
  bordures doublées, des dates en UTC — et une carte de document qui affirmait « every sentence
  linked to a validated fact » au-dessus d'une lettre qui contenait une phrase non prouvée. Tout est
  corrigé, puis confirmé par un second passage.

**Mauvaises** 👎

- Il écrit dans la **base de production** (voir l'[ADR 0014](0014-une-seule-base.md)), de façon
  réversible.
- Les captures sont relues par une personne (ou un agent) ; seuls le débordement, les titres et les
  erreurs de console sont vérifiés automatiquement. Il n'y a pas de comparaison au pixel.
- Environ 1 à 2 minutes par passage, plus le téléchargement de Chromium (≈ 94 Mo) la première fois.
