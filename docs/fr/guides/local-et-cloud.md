# ☁️ Travailler avec Claude en local et dans le cloud

Le but : passer d'une session Claude Code sur le Mac à une session cloud (claude.ai/code, l'app Claude), puis revenir, **sans rien perdre** — et faire travailler plusieurs sessions en même temps sans qu'elles se marchent dessus.

## 🧭 Sommaire

- [📦 Ce qui passe d'un côté à l'autre](#-ce-qui-passe-dun-côté-à-lautre)
- [🔑 Les secrets dans le cloud](#-les-secrets-dans-le-cloud)
- [🧾 Et Stripe Projects, il ne connecte pas tout seul ?](#-et-stripe-projects-il-ne-connecte-pas-tout-seul-)
- [🤖 Ce que Claude peut faire pour toi](#-ce-que-claude-peut-faire-pour-toi)
- [🔀 Changer de côté](#-changer-de-côté)
- [👥 Plusieurs sessions en même temps](#-plusieurs-sessions-en-même-temps)
- [🚀 Deploy](#-deploy)

## 📦 Ce qui passe d'un côté à l'autre

Une session cloud démarre dans un conteneur neuf, cloné depuis GitHub. Elle ne voit que ce qui est sur GitHub et ce que l'environnement cloud lui donne.

| Quoi | Où ça vit | Comment le retrouver de l'autre côté |
|---|---|---|
| 💻 Le code | Git | **Toujours *commit* et *push*** avant de changer de côté, puis `git pull` en revenant. |
| 🔄 Où on en est | [`docs/EN-COURS.md`](../../EN-COURS.md) (versionné) | Claude le lit au début de chaque session et le met à jour à la fin (règle dans `AGENTS.md`). |
| 📦 Les dépendances (`node_modules`) | Installées sur place | Mac : `npm install`. Cloud : automatique au démarrage (`.claude/hooks/session-start.sh`). |
| 🔑 Les secrets (`.env`) | Mac : `.env`, jamais *commité* | Cloud : les *env vars* de l'environnement cloud (voir plus bas). |
| 📄 Tes fichiers perso (CV, offres…) | Mac : `.local/`, jamais *commité* | Cloud : les joindre au message ; Claude les importe avec les scripts *owner*. |
| 🛠️ Les scripts d'import | `scripts/owner/`, `scripts/offers/` | Identiques des deux côtés : `npm run owner:…`. |
| 💬 L'historique de conversation | Dans chaque session | Il ne se transfère pas : c'est le rôle de `docs/EN-COURS.md`. |

## 🔑 Les secrets dans le cloud

Dans l'app Claude : menu de l'environnement cloud dans la barre de titre de la session → **Edit** → *environment variables*. Mettre **les mêmes noms** que dans ton `.env` sur le Mac, avec les mêmes valeurs.

| Pour… | *Env vars* |
|---|---|
| 🧱 Lancer l'app, les tests e2e, les scripts *owner* | `DB_CONNECTION_STRING`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `APP_ENCRYPTION_KEY`, `OWNER_GITHUB_LOGIN` |
| 🤖 L'IA de l'instance (une des deux) | `OPENROUTER_API_API_KEY` (modèles gratuits) ou `ANTHROPIC_API_KEY` (Claude, payant ; passe avant OpenRouter) |
| 🌐 Lire les pages d'offres | `FIRECRAWL_API_API_KEY` (facultatif) |
| 🔊 La voix ElevenLabs | `ELEVENLABS_API_KEY` **et** `INSTANCE_VOICE_ENABLED=true` — sans ce second, l'app ne dépense jamais de crédits ElevenLabs |
| ⚡ Aller plus vite | `OWNER_USER_ID` (ton id Clerk, donné par `npm run owner:whoami`) |

⚠️ Seule une **nouvelle** session cloud voit les *env vars* ajoutées. **Ne jamais coller une clé dans le chat.**

## 🧾 Et Stripe Projects, il ne connecte pas tout seul ?

Si, mais **depuis une machine connectée à ton compte Stripe**. Stripe Projects a créé les comptes chez les *providers* (Vercel, Neon, Clerk, OpenRouter, Firecrawl, ElevenLabs) et garde leurs clés dans son coffre. `stripe projects env --pull` les écrit dans `.env` ; `scripts/infra/push-env-to-vercel.mjs` les envoie à Vercel. C'est pour ça que la production marche sans rien faire.

Le conteneur cloud, lui, n'a **ni la Stripe CLI ni ta session Stripe** : le repo ne contient que le manifeste `.projects/state.json` (quels services, aucune clé). Deux options :

- ✅ **Simple :** copier les valeurs de `.env` dans les *env vars* de l'environnement cloud (tableau ci-dessus).
- 🔧 **Plus tard :** installer la Stripe CLI dans le conteneur et lui donner un accès au compte Stripe — plus fragile, et ça met un accès à ton compte Stripe dans le cloud.

## 🤖 Ce que Claude peut faire pour toi

```bash
npm run owner:whoami                          # comptes, nombre de faits, CV, offres, entretiens
npm run owner:import-cv -- cv.pdf autre.pdf   # comme le bouton « Add CVs »
npm run owner:import-offers -- offre.txt …    # comme « Add an offer » avec le texte collé
npm run offers:actiris -- search              # offres IT à Bruxelles sur Actiris
npm run offers:actiris -- fetch 5949141:Hrxml # enregistre le texte dans .local/offers/
```

Les boutons de l'app restent disponibles : les scripts appellent exactement le même code.

## 🔀 Changer de côté

- **Mac → cloud :** `git push`, puis ouvrir une session cloud sur le repo. Le *hook* installe les dépendances.
- **Cloud → Mac :** la session cloud *push* sa *branch* et ouvre une PR. Sur le Mac : fusionner la PR, `git pull` sur `main`, `npm install`.
- 📖 Doc officielle : https://code.claude.com/docs/en/claude-code-on-the-web

## 👥 Plusieurs sessions en même temps

1. Chaque session travaille sur **sa propre *branch***, jamais sur `main`.
2. Elle s'inscrit dans le tableau « Branches en cours » de [`EN-COURS.md`](../../EN-COURS.md) (*branch*, sujet, fichiers touchés, PR).
3. Avant de commencer : `git pull` et lire ce tableau, pour ne pas toucher les mêmes fichiers.
4. Les sessions se préviennent entre elles (*cross-session messages*) quand une PR est fusionnée, quand une **migration** doit être appliquée (`npm run db:migrate`) ou quand des fichiers sont déplacés.
5. Les numéros de migration se réservent : celle qui en crée une l'annonce.

## 🚀 Deploy

`node scripts/infra/deploy.mjs` depuis le Mac (il a besoin de la Stripe CLI pour renouveler le *token* Vercel). Avant un *deploy* qui contient une migration : `npm run db:migrate`. Pour ne plus dépendre du Mac : relier le projet Vercel au repo GitHub, et chaque fusion sur `main` se déploie seule.
