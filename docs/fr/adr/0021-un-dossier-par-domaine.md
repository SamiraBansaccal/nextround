# 🗂️ ADR 0021 — Un dossier par domaine, aucun fichier en vrac

> 🇬🇧 English version: [en/adr/0021](../../en/adr/0021-one-folder-per-domain.md)

- **Date :** 2026-10-04
- **Statut :** ✅ acceptée

## 🎯 Contexte

Après une construction rapide, le repo avait des fichiers en vrac dans `lib/` (auth, env, verify, pipeline…), `components/`, `scripts/` et `tests/` (28 fichiers de test côte à côte), les sources des avatars à la racine (`characters/`) et une doc partagée entre `docs/` et `docs/FR`, avec des liens cassés. Difficile de savoir où ranger un nouveau fichier.

## ✅ Décision

- `lib/` : `server/` (auth, env, crypto), `shared/` (utilitaires purs), puis un dossier par domaine (`ai/`, `offers/`, `profile/`, `documents/`, `interview/`, `interviewers/`, `voice/`, `dashboard/`, `i18n/`, `data/`, `db/`). Seuls `types.ts` et `utils.ts` (attendu par shadcn) restent à la racine.
- `components/` : `ui/` (shadcn), `layout/`, `auth/`, `shared/`, puis un dossier par zone de l'app.
- `tests/` : `helpers/`, puis un dossier par domaine, et `e2e/`.
- `scripts/` : `infra/`, `owner/`, `offers/`, `avatars/`, `test/`.
- `assets/characters/` pour les sources des avatars (pas servi, exclu du *deploy*).
- `docs/` : `fr/` et `en/`, chacun avec `guides/` et `adr/` ; `design/` pour les *prompts*.
- La carte est dans [le guide d'architecture](../guides/architecture.md).

## 📊 Conséquences

**Bonnes** 👍

- Chaque fichier a une place évidente ; le guide dit où ranger le suivant.
- Les tests suivent le rangement du code qu'ils vérifient.

**Mauvaises** 👎

- Tous les imports des fichiers déplacés ont changé : une *branch* ouverte avant doit fusionner `main` et corriger ses nouveaux imports d'un chemin déplacé.
- Les anciens messages de *commit* et le journal citent les anciens chemins.
