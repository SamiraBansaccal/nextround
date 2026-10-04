# 🗄️ ADR 0014 — Une seule base pour le développement local, les tests sur l'app et la production

> 🇬🇧 Version anglaise : [en/adr/0014](../../en/adr/0014-one-database.md)

- **Date :** 2026-10-03
- **Statut :** ⚠️ acceptée comme **dette**

## 🎯 Contexte

Stripe Projects a créé une seule base Neon (`db`). Lancer l'app en local (`npm run dev`), la
vérification visuelle (`npm run e2e`) et la production lisent tous `DB_CONNECTION_STRING`. Les
tests unitaires, non : ils utilisent un Postgres en mémoire (PGlite).

## ✅ Décision

Garder **une seule base** pour l'instant, et rendre **exactement réversible** toute écriture qui
n'est pas un usage réel :

- La vérification visuelle utilise un **utilisateur Clerk de test jetable** (adresse
  `+clerk_test`). Son nettoyage tourne même si les tests échouent : il supprime
  `WHERE user_id = <utilisateur de test>` dans chaque table, puis l'utilisateur Clerk (ADR
  [0016](0016-verification-visuelle-par-la-mesure.md)).
- Les vérifications de bout en bout de l'IA, lancées depuis des scripts, suppriment ensuite leurs
  compteurs d'usage.
- Les migrations sont appliquées à la main (`npm run db:migrate`) et sont, jusqu'ici, additives.

## 📊 Conséquences

**Bonnes** 👍

- Pas de seconde base à créer, à payer ni à garder synchronisée.
- Les données de test ne se mêlent jamais à celles des vrais utilisateurs : elles sont rattachées
  à un identifiant d'utilisateur qui est supprimé.

**Mauvaises** 👎

- **Un bug local peut abîmer les données de production.** Une migration destructive essayée en
  local tournerait sur la base en ligne.
- **Un nettoyage interrompu laisse des lignes de test** en production jusqu'au lancement suivant
  (qui commence par nettoyer le même utilisateur).
- La bonne correction est connue : une **branch** Neon pour le développement et les tests
  (copie à l'écriture, instantanée), avec sa propre chaîne de connexion dans un second
  environnement Stripe Projects (`stripe projects env create development --output .env.dev`). Pas
  encore fait.
