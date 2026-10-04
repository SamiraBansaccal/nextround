# 🧰 ADR 0001 — Tous les services sont créés avec Stripe Projects ; s'auto-héberger, c'est tout recréer sur ses propres comptes

> 🇬🇧 Version anglaise : [en/adr/0001](../../en/adr/0001-stripe-projects-provisioning.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée

## 🎯 Contexte

NextRound a besoin de six services externes : l'hébergement (Vercel), Postgres (Neon), la connexion
(Clerk), une IA pour l'instance (OpenRouter), la lecture des pages (Firecrawl) et la voix
(ElevenLabs). Le chemin habituel, c'est six inscriptions, six tableaux de bord, six API keys
copiées à la main — et autant d'occasions de coller une clé au mauvais endroit. Le projet a aussi
été construit pour le hackathon de la communauté Stripe, dont le produit sponsor est Stripe
Projects.

Deux exigences venaient de l'auteur du projet : n'importe qui doit pouvoir **reprendre le projet
avec ses propres comptes** (« ça doit surtout pas être les miens »), et aucun secret ne doit jamais
être commité.

## ✅ Décision

1. **Les six services sont ajoutés avec `stripe projects add <fournisseur>/<service>`**, en offre
   gratuite. Les identifiants n'arrivent dans l'app que par `stripe projects env --pull` (écrits
   dans `.env`, ignoré par git) et par les *project variables* de Stripe Projects pour les valeurs
   propres à l'app (`scripts/infra/setup-env.mjs`).
2. **Rien dans le repo n'identifie les comptes de l'auteur.** Le `.projects/state.json` commité ne
   contient que des noms de services ; `state.local.json` (identifiants du compte et du projet) est
   ignoré par git.
3. **S'auto-héberger, c'est tout recréer**, pas partager : `npm run bootstrap -- --owner
   <login-github>` (`scripts/infra/bootstrap.mjs`) lance `stripe projects init`, les onze commandes `add`
   avec les mêmes noms de ressources, `env --pull`, `setup-env`, la migration de la base,
   l'activation de GitHub chez Clerk et le deploy — sur les comptes de la personne qui le
   lance.

## 📊 Conséquences

**Bonnes** 👍

- Aucune API key n'a été copiée à la main pendant la construction ; une recherche de secrets
  tourne avant chaque commit et n'a jamais rien trouvé.
- Un seul endroit montre le coût : `stripe projects spend` — « No charges found » à chaque
  vérification.
- Les noms de ressources font partie du contrat (la ressource Neon `db` produit
  `DB_CONNECTION_STRING`) : le bootstrap reproduit exactement les mêmes noms de variables.

**Mauvaises** 👎

- **Stripe Projects exige un compte Stripe en mode *live***, donc une vérification d'identité. Le
  premier essai avec un *sandbox* a échoué (`PROJECTS_CONTEXT_MISMATCH`). Toute personne qui
  s'auto-héberge passe par la même étape.
- **Les variables de production ne sont pas synchronisées par Stripe Projects** (la doc le dit).
  `scripts/infra/push-env-to-vercel.mjs` comble ce manque.
- **Le token Vercel qu'il fournit expire.** Voir l'[ADR 0007](0007-deployer-depuis-la-machine.md).
- Le bootstrap a été vérifié en mode `--dry-run` sur un clone neuf (les onze services listés comme
  à créer) et sur le projet de référence (tous sautés). **Une exécution complète sur un second jeu
  de comptes n'a pas encore été faite** : elle créerait des ressources en double sur un compte
  Stripe.
- Accepter les conditions de chaque provider lui transmet le nom, l'email, le pays et le
  téléphone du compte Stripe. Le bootstrap est donc interactif par défaut, pour que la personne
  accepte elle-même ; `--accept-tos` saute les questions.
