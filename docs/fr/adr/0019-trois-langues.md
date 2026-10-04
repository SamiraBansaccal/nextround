# 🌍 ADR 0019 — Trois langues indépendantes : le site, chaque entretien, chaque document

> 🇬🇧 English version: [en/adr/0019](../../en/adr/0019-three-languages.md)

- **Date :** 2026-10-04
- **Statut :** ✅ acceptée

## 🎯 Contexte

La propriétaire a demandé un bouton EN/FR pour le site, en anglais par défaut, **séparé de la langue de l'entretien**. Les CV et lettres sont aussi écrits en anglais ou en français, quelle que soit la langue du site. Tout mélanger mettrait par exemple des titres français sur un CV anglais parce que le site est en français.

## ✅ Décision

| Langue | Où on la choisit | Les textes |
|---|---|---|
| **Site** (menus, pages, messages) | Bouton EN/FR en haut, gardé dans le cookie `nextround-ui-lang` | `lib/i18n/*` (`ui`, `offers`, `profile`, `documents`, `dashboard`, `settings`) |
| **Entretien** | Écran de préparation de l'entretien | `lib/interview/copy.ts`, les banques de questions |
| **CV / lettre** | Page CV de l'offre | `lib/documents/render.ts` (`DOC_HEADINGS`) |

- Les pages et *server actions* lisent la langue du site avec `getUiLang()` ; les composants reçoivent leurs textes (`t`) en *props*.
- Les messages des *server actions* et les erreurs d'IA suivent la langue du site.
- Un test (`tests/ui/ui-copy.test.ts`) vérifie que l'anglais et le français ont les mêmes clés, aucun texte vide et les mêmes `{variables}`.

## 📊 Conséquences

**Bonnes** 👍

- Un CV anglais reste anglais sur un site en français, et inversement.
- Une traduction oubliée fait échouer un test au lieu d'apparaître à l'écran.

**Mauvaises** 👎

- Chaque texte affiché existe en deux versions, et les composants prennent une *prop* de plus.
- L'accueil public et la connexion restent en anglais (pas de bouton hors de l'app).
