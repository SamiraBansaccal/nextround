# 🔄 Où on en est

Mis à jour à la fin de chaque session Claude (locale ou cloud). **À lire en premier.**

_Dernière mise à jour : 2026-10-04, session cloud._

## 🧭 Sommaire

- [🌿 Branches en cours](#-branches-en-cours)
- [✅ Fait récemment](#-fait-récemment)
- [🚧 En cours](#-en-cours)
- [🎬 Avatars animés](#-avatars-animés)
- [🔜 Ensuite](#-ensuite)

## 🌿 Branches en cours

Règle : chaque session a sa *branch*, s'inscrit ici, ouvre une PR, et met la ligne à jour quand la PR est fusionnée (voir [guide local et cloud](fr/guides/local-et-cloud.md#-plusieurs-sessions-en-même-temps)).

| *Branch* | Session | Sujet | PR |
|---|---|---|---|
| `claude/intelligent-einstein-58bqoh` | cloud | 🔍 Audit sécurité et code, corrections | [#10](https://github.com/SamiraBansaccal/nextround/pull/10) (fusionnée) |

<details>
<summary>📦 Branches déjà fusionnées</summary>

| *Branch* | Session | Sujet | PR |
|---|---|---|---|
| `claude/intelligent-einstein-58bqoh` | cloud | Entretiens sans offre, parcours de création, caméra, langue du site, couleurs, réglages IA | [#2](https://github.com/SamiraBansaccal/nextround/pull/2) |
| `claude/owner-data-deploy` | local | Projets vibe-codés, « Update with my validated facts » | [#3](https://github.com/SamiraBansaccal/nextround/pull/3) |
| `claude/tailored-documents` | local | CV et lettre par offre (EN/FR), ajoutés au profil ; faits validés sur place | [#4](https://github.com/SamiraBansaccal/nextround/pull/4) |
| `claude/intelligent-einstein-58bqoh` | cloud | Réorganisation des dossiers, doc revue en profondeur, nouveaux ADR | [#9](https://github.com/SamiraBansaccal/nextround/pull/9) |
| `claude/remove-interviewers` | local | Retrait des 38 intervieweurs masqués par la propriétaire | [#7](https://github.com/SamiraBansaccal/nextround/pull/7) |
| `claude/intelligent-einstein-58bqoh` | cloud | Traduction EN/FR de tout le site | [#6](https://github.com/SamiraBansaccal/nextround/pull/6), [#8](https://github.com/SamiraBansaccal/nextround/pull/8) |

</details>

## ✅ Fait récemment

### 🔍 Audit (cloud, PR #10)

- Sécurité et *code review* : 7 corrections (*security headers*, lecture des pages limitée en *stream*, réutilisation du *feedback* seulement si ses *facts* tiennent et pour la même offre, voix après changement d'intervieweur, nouvelle version de CV affichée, relance après réponse vide). Rapport et 5 points ouverts : [audit du 2026-10-04](fr/audits/2026-10-04-audit.md).

### 🗂️ Rangement (cloud, PR #9)

- Plus aucun fichier en vrac : `lib/server/` (auth, env, crypto), `lib/shared/` (dates, ids, text), `components/layout/`, `tests/<domaine>/`, `scripts/infra/`, `assets/characters/` (ex-`characters/`). Détails : [architecture](fr/guides/architecture.md).
- Doc : `docs/fr/` et `docs/en/`, chacun avec `guides/` et `adr/` ; sommaires, emojis, mots techniques gardés en anglais.

### 🌍 Langue du site (cloud, PR #6 et #8)

- Tout le site connecté suit le bouton EN/FR, messages des *server actions* compris. Textes dans `lib/i18n/*` ; un test vérifie que l'anglais et le français ont les mêmes textes et les mêmes `{variables}`.
- Un CV, une lettre et un entretien gardent **leur propre langue**.
- Restent en anglais : l'accueil public et la connexion (pas de bouton de langue hors de l'app).

### 📄 Documents et profil (local, PR #3, #4, #7 — déployées, migrations `0005` et `0006` appliquées)

- Projets **vibe-codés** marqués « Built with AI » : gardés dans le profil, mais ne couvrent **jamais** une exigence technique (règle unique dans `lib/offers/coverage.ts`).
- « Update with my validated facts » sur une offre.
- CV par offre au format CV tech, EN ou FR, chaque élément vérifié ; lettre EN/FR ; un document peut être **ajouté au profil** et servir de point de départ.
- Les faits proposés se valident **sur place**, sous la ligne du CV d'où ils viennent.
- 110 intervieweurs dans 10 catégories après le retrait des 38 masqués.
- Données de la propriétaire : 2 CV, 19 projets GitHub, 11 offres importés ; **rien n'est encore validé**. À demander : « cookie » (introuvable sur GitHub) et l'app du hackathon (2e place).

### 🎙️ Entretiens (cloud, PR #2)

- Entretiens sans offre : par technologie (42, regroupées en parcours) ou RH seul.
- Parcours : type → offre ou techno → intervieweur en pleine page → test caméra → appel. Caméra vraiment coupée (LED éteinte).
- **Questions écrites à l'avance, sans IA** : banque RH (classiques, variantes, pièges, questions illégales) et banque technique, en vrai anglais et vrai français. L'IA ne sert qu'au retour sur les réponses.
- Réglages : *provider* Anthropic (Claude) ; `ANTHROPIC_API_KEY` passe avant OpenRouter pour la propriétaire. ElevenLabs de l'instance coupé par défaut (`INSTANCE_VOICE_ENABLED=true`). Avertissements de coût ; un retour et un audio déjà produits sont réutilisés.

## 🚧 En cours

- 🔑 **Secrets absents du cloud** : sans eux, ni l'app ni les e2e ne tournent dans une session cloud. Liste : [guide local et cloud](fr/guides/local-et-cloud.md#-les-secrets-dans-le-cloud).
- 💼 25 offres Actiris (Bruxelles, IT, accessibles à un junior) choisies le 2026-10-04 : à importer avec `npm run owner:import-offers -- .local/offers/*.txt` une fois les secrets en place. Si `.local/offers/` n'existe plus : `npm run offers:actiris -- search`, puis `npm run offers:actiris -- fetch <ref:type> …` (refs : 5953957 5965434 5949141 5952000 5952031 5951701:Select 5947174:Select 5947193 5949293:DirectOnline 5945294 5936584 5947954 5907687 5962926 5959174:DirectOnline 5966908 5964627 5966116 5969827 5934580 5887917 5843176 5905968:Select 5869183 5869129).
- 🚫 Indeed bloque les robots (Cloudflare, 403) et l'interdit : on ne le contourne pas. Offres Indeed : lien ou texte collé dans l'app.
- 📄 Importer des CV : les joindre au chat, Claude lance `owner:import-cv`.

## 🎬 Avatars animés

- ⏸️ **En pause** (demande du 2026-10-04).
- `assets/characters/<id>/` : `sources.json`, `candidates/` (+ `contact-sheet.jpg`), `selection.json`, `master_reference.png` et `references/`, `performance.json` (décor, tenue, tics), `clip-plan.json` (33 clips).
- Scripts : voir [ajouter un personnage](fr/guides/ajouter-un-personnage.md#️-lavatar). `DRY_RUN=1` pour tout vérifier sans crédit.
- Périmètre : personnages animés + Dark Vador et Yoda. Pas de vidéo de personnes réelles ni de personnages joués par des acteurs.
- Test prévu : M. Burns (références prêtes), bloqué sur `ELEVENLABS_API_KEY` dans le cloud (plan Pro minimum pour l'API Image & Video).

## 🔜 Ensuite

- 🧪 Lancer les e2e et regarder quelques écrans en français (cookie `nextround-ui-lang=fr`) ; vérifier que les *security headers* ne gênent pas Clerk.
- 🔍 Points ouverts de l'audit : DNS rebinding, *owner* par id GitHub, CSP complète, `shadcn` en *devDependencies*, purge des compteurs.
- 🚀 Relier Vercel à GitHub pour *deploy* sans le Mac.
- 🔊 Cache audio durable (Vercel Blob ou S3) quand ElevenLabs sera activé pour de bon.
- 🎬 Avatars : animation pendant l'entretien (boucles vidéo, ElevenLabs Avatars, *lip sync* en temps réel).
