# Où on en est

Mis à jour à la fin de chaque session de travail avec Claude (local ou cloud). Le lire en premier.

_Dernière mise à jour : 2026-10-04, session locale (Mac)._

## Branches en cours

| Branche | Session | Sujet | PR |
|---|---|---|---|
| `claude/intelligent-einstein-58bqoh` | cloud | Entretiens sans offre (techno / RH), parcours de création, choix de l'intervieweur, caméra, langue du site, couleurs, réglages IA | [#2](https://github.com/SamiraBansaccal/nextround/pull/2) (fusionnée) |
| `claude/owner-data-deploy` | local | Projets vibe-codés, « Update with my validated facts » | [#3](https://github.com/SamiraBansaccal/nextround/pull/3) (fusionnée) |
| `claude/tailored-documents` | local | CV et lettre par offre (EN/FR), ajoutés au profil ; faits validés sur place dans le CV | [#4](https://github.com/SamiraBansaccal/nextround/pull/4) (fusionnée) |

## Fait récemment

- Session locale du 2026-10-04 (PR #3 et #4, déployées, migrations `0005` et `0006` appliquées) :
  - Projets « vibe-codés » : marqués « Built with AI » dans le profil (NextRound, TrustLint, hopodoo pour la propriétaire). Ils restent dans le profil (intérêt pour l'IA, créativité, hackathons) mais ne couvrent **jamais** une exigence technique : règle unique `lib/offers/coverage.ts`, aussi appliquée aux entretiens et aux CV.
  - « Update with my validated facts » sur une offre : relie à nouveau ses exigences aux faits validés (avant, seulement à l'ajout de l'offre).
  - CV par offre au format d'un CV tech (titre, profil, tableau de compétences, projets avec technos, formations, expérience, langues), en anglais ou en français, chaque élément vérifié contre les faits validés ; lettre de motivation EN/FR. Un CV ou une lettre peut être **ajouté au profil** (bibliothèque) et servir de point de départ (« Start from »).
  - Profil : les faits proposés se valident **sur place**, sous la ligne du CV dont ils viennent (`lib/profile/place-facts.ts`) ; les projets GitHub dans la section GitHub.
  - Données de la propriétaire : 2 CV importés (`cv-fev2026.pdf`, `resume_sabansac.pdf` de collabr), 19 projets GitHub (dont hopodoo, dépôt privé), 11 offres. **Rien n'est encore validé.** Les brouillons de `collabr/anciennes-versions` (textes de modèle) n'ont pas été importés.
  - Reste à savoir de la propriétaire : « cookie » (introuvable sur GitHub) et l'app du hackathon (2e place) : nom et description.

- PR #2 (cloud) : entretiens sans offre (par technologie, regroupées en parcours, ou RH seul), nouveau parcours de création (type → offre/techno → intervieweur en pleine page → test caméra → appel), caméra vraiment éteinte (LED), palette plus chaude, bouton supprimer rouge, langue du site EN/FR (anglais par défaut, séparée de la langue de l'entretien).
- Questions sans IA : banque RH écrite à l'avance (classiques, variantes, pièges, questions illégales), banque technique, en anglais et en français corrects (pas de traduction mot à mot). L'IA ne sert plus qu'au retour sur les réponses.
- Réglages : fournisseur Anthropic (Claude, clé de l'Anthropic Console ; un abonnement Claude.ai ne marche pas pour une app). Côté propriétaire, `ANTHROPIC_API_KEY` passe avant OpenRouter s'il est défini. ElevenLabs de l'instance coupé par défaut (`INSTANCE_VOICE_ENABLED=true` pour l'activer). Avertissements de coût, retour réutilisé pour une réponse identique, audio réutilisé (mémoire du serveur + onglet).
- **Avant de déployer #2** : `npm run db:migrate` (migration `0005` : entretiens sans offre + `profile_facts.ai_assisted`).

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
- Traduire les pages Tableau de bord, Offres, Profil et Réglages (seuls la navigation et le parcours d'entretien suivent la langue du site).
- Cache audio durable (Vercel Blob ou S3) quand ElevenLabs sera activé pour de bon.
