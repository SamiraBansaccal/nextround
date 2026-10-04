# 🎯 ADR 0011 — Une seule série de questions par entretien ; le *focus* la filtre

> 🇬🇧 Version anglaise : [ENG/adr/0011](../../ENG/adr/0011-one-question-set.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée

## 🎯 Contexte

La spec demande une dizaine de questions dans la langue de l'offre : 4 RH, 4 techniques sur la
stack de l'offre, 2 sur les lacunes. L'auteur du projet a ensuite demandé que l'appel ressemble à
un rendez-vous en tête-à-tête (Teams, Slack) **avec l'option de se concentrer sur les questions RH
générales, techniques, ou les deux**.

## ✅ Décision

- **Un seul appel d'IA génère toute la série** au démarrage de l'entretien
  (`lib/interview/generate.ts`), vérifiée comme toute réponse (sources reconstruites depuis les
  alias `S#`/`R#`, réponses suggérées gardées seulement pour les phrases appuyées sur des faits
  validés).
- Le sélecteur de *focus* (**General HR / Technical / Both**) **filtre** cette série côté client.
  Les questions de lacune comptent comme techniques. Des compteurs indiquent combien de questions
  contient chaque *focus*.
- Si l'offre n'a aucune lacune, les deux questions de lacune sont remplacées par des questions
  techniques (les limites de `verifyQuestions` le permettent).

## 📊 Conséquences

**Bonnes** 👍

- Changer de *focus* est instantané et gratuit : aucun appel d'IA en plus, aucun quota consommé.
- Le même entretien garde ses réponses quel que soit le *focus*.

**Mauvaises** 👎

- Se concentrer sur « Technical » donne au plus six questions ; il n'y a pas de mode « donne-moi
  dix questions techniques ».
- Un modèle qui ignore la répartition 4/4/2 produit une série déséquilibrée ; le code coupe les
  groupes au-delà de leur limite mais ne peut pas ajouter les questions manquantes.
