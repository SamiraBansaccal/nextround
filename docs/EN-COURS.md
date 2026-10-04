# Où on en est

Mis à jour à la fin de chaque session de travail avec Claude (local ou cloud). Le lire en premier.

_Dernière mise à jour : 2026-10-04, session locale (Mac)._

## Branches en cours

- `claude/owner-data-deploy` (session locale, Mac) : projets « vibecodés » (marqués « Built with AI » dans le profil : ils montrent l'intérêt pour l'IA, la créativité, les hackathons, mais ne prouvent **jamais** la maîtrise de leur stack), règle unique de couverture `lib/offers/coverage.ts`, bouton « Update with my validated facts » sur une offre (`lib/offers/match.ts`). **Attend la PR #2** : sa migration `0005` crée `profile_facts.ai_assisted`. Ensuite : fusionner `main`, `npm run db:migrate` depuis le Mac, écarter les faits vibecodés dans `buildQuestions` et le `covered` des entretiens, e2e, déploiement.
- `claude/intelligent-einstein-58bqoh` (session cloud, PR #2) : entretiens sans offre, nouveau parcours, langue de l'interface, réglages IA, appels OpenRouter sans raisonnement.

## Fait récemment

- Session locale du 2026-10-04 : CV `cv-fev2026.pdf` importé (15 faits proposés, mis en page), 6 dépôts GitHub de plus (18 projets), 10 offres Actiris importées (5953957 C++, 5843176 Java, 5965434 et 5949141 et 5952000 DevOps, 5905968 admin système, 5947174, 5947193, 5959174, 5964627 junior). Rien n'est encore validé : à faire dans Profil. Production déployée (`1ea6f1a`, banque de questions et avatars visibles).
- Les modèles gratuits d'OpenRouter sont des modèles « à raisonnement » : 90 s ou plus par appel, réponse parfois vide (d'où « This model could not return valid output »). Avec `reasoning: { enabled: false }` : 10 s. Corrigé dans la PR #2 ; d'ici là, les imports du Mac passent par un lanceur local qui ajoute cette option.

- Banque de questions techniques (42 technologies, réponses types EN/FR) et répliques des intervieweurs (`c4ec9fc`). Migration `0004` déjà appliquée à Neon.
- Import de CV plus tolérant aux réponses imparfaites de l'IA ; avatars pris automatiquement dans `public/interviewers/<id>.webp` (PR #1).
- Scripts propriétaire `npm run owner:whoami | owner:import-cv | owner:import-offers`, hook de démarrage cloud, guide [local et cloud](FR/local-et-cloud.md).

- Choix de l'intervieweur : bouton « masquer » sur chaque personnage (temporaire, ce navigateur seulement, réversible). Changer d'intervieweur pendant l'entretien (les répliques des questions non répondues suivent). Supprimer un entretien non terminé depuis la liste.
- Nouveaux intervieweurs : Kratos (nouvelle catégorie « Jeux vidéo », répliques EN/FR) et Chuck Norris (personne réelle, cinéma). Procédure : skill `add-interviewer`.
- Vignettes statiques des 53 personnages animés dans `public/interviewers/` (références choisies à la main).

## En cours

- 25 offres Actiris (Bruxelles, informatique, accessibles à un junior) récupérées dans `.local/offers/` sur la session cloud du 2026-10-04 : à importer avec `npm run owner:import-offers -- .local/offers/*.txt` dès que les secrets sont dans l'environnement cloud. Si ce dossier n'existe plus (nouveau conteneur) : `npm run offers:actiris -- search`, puis `npm run offers:actiris -- fetch <ref:type> …` (refs retenues : 5953957 5965434 5949141 5952000 5952031 5951701:Select 5947174:Select 5947193 5949293:DirectOnline 5945294 5936584 5947954 5907687 5962926 5959174:DirectOnline 5966908 5964627 5966116 5969827 5934580 5887917 5843176 5905968:Select 5869183 5869129).
- Indeed bloque les robots (Cloudflare, 403) et l'interdit : on ne le contourne pas. Offres Indeed : lien ou texte collé dans l'app, ou liens envoyés à Claude.
- Importer les CV : les joindre au chat, Claude lance `owner:import-cv`.

## Avatars animés (en cours)

- `characters/` : par personnage, `sources.json` (wiki Fandom de la franchise), `candidates/` (images trouvées + `contact-sheet.jpg`), `selection.json` (choix motivé), `master_reference.png` et `references/`, `performance.json` (décor, tenue, tics), `clip-plan.json` (33 clips : idle, écoute, réactions, transitions, parole).
- Scripts : `python3 scripts/avatars/collect-references.py [id…]`, `python3 scripts/avatars/prepare-references.py <id>`, `npm run avatars:plan`, `npm run avatars:el -- test <id>` (ElevenLabs : plateau fixe, voix, 4 clips). `DRY_RUN=1` pour tout vérifier sans crédit.
- Périmètre : personnages animés + Dark Vador et Yoda (53). Pas de vidéo de personnes réelles ni de personnages joués par des acteurs (visage réel). Les 12 originaux et archétypes seront dessinés plus tard.
- Images en pause (demande du 2026-10-04). Kratos : notes de jeu et plan prêts, références pas encore collectées.
- Test : M. Burns, références prêtes. Bloqué sur `ELEVENLABS_API_KEY` dans l'environnement cloud (plan Pro minimum pour l'API Image & Video).

## Ensuite (idées validées)

- Avatars : images à fournir (liste générée depuis le catalogue). Animation pendant l'entretien : plus tard (pistes : boucles vidéo, ElevenLabs Avatars, synchro labiale en temps réel).
- Relier Vercel à GitHub pour déployer sans le Mac.
