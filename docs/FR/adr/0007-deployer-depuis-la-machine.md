# 🚚 ADR 0007 — On déploie depuis la machine avec la CLI Vercel, pas depuis GitHub

> 🇬🇧 Version anglaise : [ENG/adr/0007](../../ENG/adr/0007-deploy-from-the-machine.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée — **amendée le 2026-10-04** : le script renouvelle lui-même un token expiré

## 🎯 Contexte

Le projet Vercel créé par Stripe Projects **n'est pas relié au dépôt GitHub**. Le relier demande
d'installer l'application Vercel sur le compte GitHub de l'auteur — une étape dans le navigateur.
Stripe Projects fournit en revanche un token Vercel, l'identifiant de l'équipe et celui du projet
dans `.env`.

## ✅ Décision

- **`node scripts/deploy.mjs`** déploie en production avec `vercel deploy --prod`. Le token est
  passé à la CLI **uniquement par une variable d'environnement**, jamais en argument de commande
  (où il apparaîtrait dans la liste des processus).
- **`.vercelignore`** liste ce qui n'est jamais envoyé : `.env`, `.env.*`, `.projects/`, les
  dossiers d'agents, la doc, les tests, les captures. Vérifié le 2026-10-03 par l'API Vercel : les
  dossiers exclus arrivent **vides** (0 fichier), contre 9 fichiers pour `app/` et 8 pour `lib/`.
- **`node scripts/push-env-to-vercel.mjs`** copie une liste explicite de variables vers Vercel
  (production et preview), jamais le token Vercel lui-même.

**Amendement (2026-10-04).** Le token fourni par Stripe Projects **expire** (deux fois en deux
jours). `deploy.mjs` le teste maintenant sur `GET /v2/user` ; s'il est refusé, il lance
`stripe projects rotate <projet vercel>` puis `stripe projects env --pull` — la correction
documentée pour des identifiants périmés — et continue. Observé : « The Vercel token expired:
rotating the credentials… Fresh Vercel token in .env. », puis un déploiement réussi.

## 📊 Conséquences

**Bonnes** 👍

- Une seule commande déploie, quel que soit l'état du token.
- Aucune étape dans le navigateur n'a été nécessaire pour déployer.

**Mauvaises** 👎

- **Pas de déploiement automatique au push**, pas de preview par branche. Un commit poussé sur
  GitHub n'est pas en ligne tant que personne ne lance le script. Relier le dépôt
  (`vercel git connect`) réglerait ça.
- Ce qui est déployé, c'est **le dossier de travail**, pas un commit : des modifications non
  commitées peuvent partir en ligne. L'habitude (et l'ordre des scripts) est de commiter d'abord,
  puis de déployer — une habitude, pas une garantie.
- `env --pull` réécrit `.env` pendant la rotation (les variables propres à l'app reviennent de
  Stripe Projects, donc rien n'est perdu, mais une modification faite à la main dans `.env` le
  serait).
