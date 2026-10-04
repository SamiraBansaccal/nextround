# Travailler avec Claude en local et dans le cloud

Le but : passer d'une session Claude Code sur le Mac à une session cloud (claude.ai/code, l'app Claude), puis revenir, **sans rien perdre**. Une session cloud démarre dans un conteneur neuf, cloné depuis GitHub. Elle ne voit donc que ce qui est sur GitHub et ce que l'environnement cloud lui donne.

## Ce qui passe d'un côté à l'autre, et comment

| Quoi | Où ça vit | Comment le retrouver de l'autre côté |
|---|---|---|
| Le code | Git | **Toujours commiter et pousser** avant de changer de côté (`git push`), puis `git pull` en revenant. |
| Où on en est, la suite | [`docs/EN-COURS.md`](../EN-COURS.md) (versionné) | Claude le met à jour à la fin de chaque session et le lit au début de la suivante (règle dans `AGENTS.md`). |
| Les dépendances (`node_modules`) | Installées sur place | Mac : `npm install`. Cloud : automatique au démarrage (`.claude/hooks/session-start.sh`). |
| Les secrets (`.env`) | Mac : `.env`, jamais commité | Cloud : les **variables d'environnement** de l'environnement cloud (voir plus bas). |
| Tes fichiers perso (CV en PDF, offres…) | Mac : `.local/`, jamais commité | Cloud : les joindre au message. Claude les importe avec les scripts propriétaire. |
| Les scripts d'import | `scripts/owner/`, `scripts/offers/` (versionnés, sans donnée perso) | Identiques des deux côtés : `npm run owner:…`. |
| L'historique de conversation | Dans chaque session | Il ne se transfère pas tout seul : c'est le rôle de `docs/EN-COURS.md`. |

## Secrets dans l'environnement cloud (une seule fois)

Dans l'app Claude : menu de l'environnement cloud dans la barre de titre de la session, puis **Edit**, puis variables d'environnement. Ajouter les mêmes noms que dans ton `.env` (les valeurs : `stripe projects env --pull` sur le Mac, puis copier depuis `.env`) :

- obligatoires pour les scripts propriétaire : `DB_CONNECTION_STRING`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `APP_ENCRYPTION_KEY`, `OWNER_GITHUB_LOGIN` ;
- pour l'IA et les services : `OPENROUTER_API_API_KEY`, `FIRECRAWL_API_API_KEY`, `ELEVENLABS_API_KEY` (et `INSTANCE_LLM_MODEL` si tu l'as changé) ;
- optionnel : `OWNER_USER_ID` (ton id Clerk, donné par `npm run owner:whoami`) évite une recherche à chaque script.

Une **nouvelle** session cloud les voit. Ne jamais coller une clé dans le chat.

## Ce que Claude peut faire pour toi (Mac ou cloud)

```bash
npm run owner:whoami                          # comptes, et nombre de faits, CV, offres, entretiens
npm run owner:import-cv -- cv.pdf autre.pdf   # comme le bouton « Import a CV »
npm run owner:import-offers -- offre.txt …    # comme « Add an offer » avec le texte collé
npm run offers:actiris -- search              # offres informatiques à Bruxelles sur Actiris
npm run offers:actiris -- fetch 5949141:Hrxml # enregistre le texte dans .local/offers/
```

Les boutons de l'app restent disponibles : les scripts appellent exactement le même code.

## Changer de côté

- **Mac vers cloud** : `git push`, puis ouvrir une session cloud sur le dépôt (claude.ai/code ou l'app). Le hook installe les dépendances.
- **Cloud vers Mac** : la session cloud pousse sa branche et ouvre une PR. Sur le Mac : `git pull` (ou fusionner la PR puis `git pull` sur `main`), `npm install`.
- Documentation officielle : https://code.claude.com/docs/en/claude-code-on-the-web

## Déployer

`node scripts/deploy.mjs` depuis le Mac (il a besoin de la CLI Stripe pour renouveler le jeton Vercel). Pour ne plus en dépendre : relier le projet Vercel au dépôt GitHub, et chaque fusion sur `main` se déploie seule.
