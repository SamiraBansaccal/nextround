# 🎨 ADR 0008 — Lovable est la source du design, reporté à la main, dans un seul sens

> 🇬🇧 Version anglaise : [en/adr/0008](../../en/adr/0008-lovable-design-source.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée — **étendue le 2026-10-04** : tous les écrans suivent maintenant le prototype

## 🎯 Contexte

L'auteur du projet dessine l'interface dans Lovable, dans un repo privé séparé
(`SamiraBansaccal/nextround-39ef068d`) : un prototype React + TanStack Router avec des **données
fictives**. NextRound est une app Next.js avec de vraies données, des *server actions* et de la
vérification. La spec demandait de **séparer l'interface de la logique**, pour que le design puisse
être retravaillé dans un autre outil sans toucher à la logique.

## ✅ Décision

1. **Des types partagés.** Le prompt donné à Lovable (`docs/fr/lovable-prompt.md`) imposait les
   types exacts de `lib/types.ts`. Les composants du prototype prennent les mêmes *props* que ceux
   de l'app.
2. **Reporter, pas synchroniser.** Le design est repris à la main : les *design tokens* (toute la
   palette `:root` et `.dark` du `styles.css` du prototype), les polices (Lora, Nunito Sans), le
   logo et les images (`public/brand/`), et la mise en page de chaque écran, reconstruite autour des
   vraies données.
3. **Un seul sens : Lovable → ici.** Rien ne repart : la logique, les données et la vérification de
   l'app n'ont aucun sens pour le prototype.
4. **Ce qui n'est pas repris :** le *router*, les données fictives (`mock-data.ts`), le sélecteur
   d'états de démo, le bouton caméra de l'entretien (NextRound n'utilise jamais la webcam), la
   gestion du thème par `localStorage` du prototype (remplacée par `next-themes`).
5. La source est le prototype construit à partir du [prompt Lovable](../../design/lovable-prompt.md). *(Le fichier de provenance annoncé ici n'a jamais été écrit ; c'est le prompt qui fait référence.)*

## 📊 Conséquences

**Bonnes** 👍

- L'app en ligne ressemble, écran par écran, au design travaillé par l'auteur.
- La logique n'a jamais dépendu du design : `lib/` n'a pas changé pendant le report.
- Reprendre un écran reste possible à tout moment depuis le dernier commit du prototype.

**Mauvaises** 👎

- **Deux copies du design existent** et peuvent diverger. Rien ne le détecte ; ça repose sur la
  discipline (récupérer le prototype, comparer, reporter).
- Le report est un **travail manuel** à chaque évolution importante du prototype.
- Le prototype avait retiré le statut d'offre `interview` que la spec exige ; l'app le garde et le
  prototype devrait le retrouver.
- La provenance des images, c'est « créées dans le projet Lovable de l'auteur » ; leur licence est
  celle que cet outil accorde, pas vérifiée plus loin.
