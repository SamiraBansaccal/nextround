# 🎭 Ajouter un personnage intervieweur

Un intervieweur est **une fiche de données**, pas du code d'interface. Il suffit de demander à Claude, en local ou dans le cloud :

> Ajoute Kratos de God of War comme intervieweur.

Claude suit alors le *skill* du projet [`.claude/skills/add-interviewer/SKILL.md`](../../../.claude/skills/add-interviewer/SKILL.md).

## 🧭 Sommaire

- [🧩 Ce qu'un personnage contient](#-ce-quun-personnage-contient)
- [🎚️ Les traits](#️-les-traits)
- [🖼️ L'avatar](#️-lavatar)
- [✅ Les tests](#-les-tests)
- [🚫 Les limites](#-les-limites)

## 🧩 Ce qu'un personnage contient

| Étape | Où | Ce que ça apporte |
|---|---|---|
| 📇 Fiche | `lib/interviewers/catalog/<catégorie>.ts` | Nom, style, description (EN/FR), personnalité, style d'entretien, vocabulaire, relances, **10 traits de 1 à 5**, style de voix |
| 🗂️ Catégorie (si nouvelle, ex. « Jeux vidéo ») | `lib/interviewers/categories.ts` + un fichier de catalogue | Le filtre dans l'écran de choix de l'intervieweur |
| 💬 Répliques | `lib/interviewers/flavor/packs.ts` | Salutation, interjection, transition, phrase de fin, en EN et FR, vouvoiement ou tutoiement selon le personnage |
| 🎨 Sources de l'avatar | `assets/characters/<id>/` | Références canoniques, décor fixe, tenue, tics, plan des 33 clips de comportement |
| 🖼️ Vignette | `public/interviewers/<id>.webp` | La photo dans les listes (la liste est régénérée par `scripts/avatars/interviewer-pictures.mjs`) |

## 🎚️ Les traits

Les **traits** pilotent tout le reste : longueur des questions, interruptions, et l'ampleur des réactions de l'avatar (un sourcil levé pour un personnage froid, un fou rire pour un personnage expansif).

## 🖼️ L'avatar

```bash
python3 scripts/avatars/collect-references.py <id>   # images candidates + planche contact
python3 scripts/avatars/prepare-references.py <id>   # master_reference.png + references/
npm run avatars:plan                                  # plan des 33 clips (sans crédit)
DRY_RUN=1 npm run avatars:el -- test <id>             # vérifier sans dépenser de crédit ElevenLabs
```

## ✅ Les tests

`tests/interview/interviewers.test.ts` et `tests/interview/flavor.test.ts` vérifient que la fiche est complète, que chaque réplique existe dans les deux langues et qu'aucune réplique n'est mise dans la bouche d'une personne réelle.

## 🚫 Les limites

- **Pas de vidéo** (*deepfake*) de personnes réelles ni de personnages joués par des acteurs (visage réel).
- Les personnes réelles ont une fiche et une voix de style, jamais de citation inventée.
