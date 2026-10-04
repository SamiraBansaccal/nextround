# 🧮 ADR 0015 — Le résumé d'entretien est calculé par le code, pas écrit par l'IA

> 🇬🇧 Version anglaise : [ENG/adr/0015](../../ENG/adr/0015-summary-computed-by-code.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée

## 🎯 Contexte

La spec demande un résumé de fin d'entretien : les points forts, les 3 choses à travailler, les
questions à refaire. Chaque réponse a déjà un retour vérifié (notes, commentaires, affirmations).

## ✅ Décision

`lib/interview/summary.ts` **calcule** le résumé à partir du dernier retour de chaque question —
sans appel d'IA :

- **Points forts** : les critères notés « good » au moins aussi souvent que « to improve », avec
  leurs comptes (« …(2 of 2) »).
- **Top 3 à travailler** : les critères le plus souvent notés « to improve », avec le premier
  commentaire donné par le retour.
- **Affirmations que le profil ne prouve pas** : chaque citation des réponses que la vérification a
  laissée sans fait.
- **Questions à refaire** : celles sans réponse, et celles où un critère est à améliorer. Refaire
  une question montre la réponse précédente à côté de la nouvelle.

## 📊 Conséquences

**Bonnes** 👍

- Le résumé **ne peut rien inventer de nouveau** : chaque ligne vient d'un retour vérifié.
- Instantané et gratuit : aucun quota consommé, rien à vérifier.

**Mauvaises** 👎

- La formulation est fixe, moins personnelle qu'un résumé écrit par l'IA.
- Il ne vaut que ce que valent les retours par réponse qu'il agrège.
