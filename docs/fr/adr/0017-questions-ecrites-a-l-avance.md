# ✍️ ADR 0017 — Les questions d'entretien sont écrites à l'avance ; l'IA ne fait que relire les réponses

> 🇬🇧 English version: [en/adr/0017](../../en/adr/0017-questions-written-in-advance.md)

- **Date :** 2026-10-04
- **Statut :** ✅ acceptée — **remplace** l'[ADR 0011](0011-une-seule-serie-de-questions.md) (la série de questions n'est plus générée par l'IA)

## 🎯 Contexte

Les questions étaient générées par un appel à l'IA par entretien ([ADR 0011](0011-une-seule-serie-de-questions.md)). Avec les modèles gratuits, c'était lent (jusqu'à 90 s), ça échouait parfois, et le français sonnait comme une traduction mot à mot. Un détecteur de langue essayait d'attraper les questions dans la mauvaise langue et se trompait. La propriétaire a demandé une grosse banque de **questions RH typiques, leurs variantes et les questions éthiquement douteuses ou illégales**, écrites une fois par un bon modèle, et une IA utilisée seulement là où elle apporte quelque chose : relire les réponses du candidat.

## ✅ Décision

- Les questions viennent de **banques écrites à l'avance**, en vrai anglais et en vrai français, chacune avec sa **réponse type** :
  - `lib/interview/hr-bank/` : questions RH par type (présentation, motivation, qualités, conflit, salaire… et questions inappropriées), avec des variantes de formulation et le vouvoiement ou le tutoiement (`{vous|tu}`) ;
  - `lib/interview/bank/` : questions techniques pour 42 technologies, regroupées en parcours (`lib/interview/tracks.ts`).
- `buildQuestions` (`lib/interview/generate.ts`) les choisit **par le code** : un plan de *slots* par *focus*, la *stack* vérifiée de l'offre ou le sujet d'entraînement, les *facts* du candidat, les lacunes, et les questions pas encore posées.
- L'IA n'est appelée **que pour le *feedback*** sur une réponse (`lib/interview/feedback.ts`), avec la réponse type comme référence. Une même réponse à une même question réutilise le *feedback* déjà enregistré.
- Le détecteur de langue est supprimé.

## 📊 Conséquences

**Bonnes** 👍

- Démarrer un entretien est instantané, gratuit, et n'échoue jamais.
- Les questions et réponses types se lisent naturellement dans les deux langues, et se relisent comme n'importe quel texte.
- Les entretiens sans offre (une technologie, RH seul) viennent gratuitement.

**Mauvaises** 👎

- La variété dépend des banques : ajouter une technologie, c'est écrire ses questions et ses réponses.
- Les questions ne sont plus taillées mot à mot pour une offre ; elles suivent sa *stack* et ses lacunes.
