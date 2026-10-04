# Où on en est

Mis à jour à la fin de chaque session de travail avec Claude (local ou cloud). Le lire en premier.

_Dernière mise à jour : 2026-10-04, session cloud._

## Fait récemment

- Banque de questions techniques (42 technologies, réponses types EN/FR) et répliques des intervieweurs (`c4ec9fc`). Migration `0004` déjà appliquée à Neon.
- Import de CV plus tolérant aux réponses imparfaites de l'IA ; avatars pris automatiquement dans `public/interviewers/<id>.webp` (PR #1).
- Scripts propriétaire `npm run owner:whoami | owner:import-cv | owner:import-offers`, hook de démarrage cloud, guide [local et cloud](FR/local-et-cloud.md).

## En cours

- 25 offres Actiris (Bruxelles, informatique, accessibles à un junior) récupérées dans `.local/offers/` sur la session cloud du 2026-10-04 : à importer avec `npm run owner:import-offers -- .local/offers/*.txt` dès que les secrets sont dans l'environnement cloud. Si ce dossier n'existe plus (nouveau conteneur) : `npm run offers:actiris -- search`, puis `npm run offers:actiris -- fetch <ref:type> …` (refs retenues : 5953957 5965434 5949141 5952000 5952031 5951701:Select 5947174:Select 5947193 5949293:DirectOnline 5945294 5936584 5947954 5907687 5962926 5959174:DirectOnline 5966908 5964627 5966116 5969827 5934580 5887917 5843176 5905968:Select 5869183 5869129).
- Indeed bloque les robots (Cloudflare, 403) et l'interdit : on ne le contourne pas. Offres Indeed : lien ou texte collé dans l'app, ou liens envoyés à Claude.
- Importer les CV : les joindre au chat, Claude lance `owner:import-cv`.

## Ensuite (idées validées)

- Avatars : images à fournir (liste générée depuis le catalogue). Animation pendant l'entretien : plus tard (pistes : boucles vidéo, ElevenLabs Avatars, synchro labiale en temps réel).
- Relier Vercel à GitHub pour déployer sans le Mac.
