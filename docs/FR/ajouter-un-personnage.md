# Ajouter un personnage intervieweur

Un intervieweur est **une fiche de données**, pas du code d'interface. Il suffit de demander à Claude, en local ou dans le cloud :

> Ajoute Kratos de God of War comme intervieweur.

Claude suit alors le skill du projet [`.claude/skills/add-interviewer/SKILL.md`](../../.claude/skills/add-interviewer/SKILL.md), qui couvre tout :

| Étape | Où | Ce que ça apporte |
|---|---|---|
| Fiche | `lib/interviewers/catalog/<catégorie>.ts` | Nom, style, description (EN/FR), personnalité, style d'entretien, vocabulaire, relances, **10 traits de 1 à 5**, style de voix |
| Catégorie (si nouvelle, ex. « Jeux vidéo ») | `lib/interviewers/categories.ts` + un fichier de catalogue | Le choix dans l'écran « Ready to join? » |
| Répliques | `lib/interviewers/flavor/packs.ts` | Salutation, interjection, transition, phrase de fin, en EN et FR, vouvoiement ou tutoiement selon le personnage |
| Avatar | `characters/<id>/` | Références canoniques, décor fixe, tenue, tics, plan des 33 clips de comportement |
| Vignette | `public/interviewers/<id>.webp` | La photo dans les listes |

Les **traits** pilotent tout le reste : longueur des questions, interruptions, et l'ampleur des réactions de l'avatar (un sourcil levé pour un personnage froid, un fou rire pour un personnage expansif).

Les tests (`tests/interviewers.test.ts`, `tests/flavor.test.ts`) vérifient que la fiche est complète, que chaque réplique existe dans les deux langues et qu'aucune réplique n'est mise dans la bouche d'une personne réelle.
