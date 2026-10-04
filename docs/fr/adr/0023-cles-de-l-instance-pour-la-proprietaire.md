# 🔐 ADR 0023 — Les clés de l'instance ne servent qu'à la propriétaire ; inscription fermée pendant le dev

> 🇬🇧 English version: [en/adr/0023](../../en/adr/0023-instance-keys-for-the-owner-only.md)

- **Date :** 2026-10-05
- **Statut :** ✅ acceptée
- **Amende :** [ADR 0002](0002-neon-et-clerk.md) (comment la propriétaire est reconnue)

## 🎯 Contexte

La propriétaire a demandé si un inconnu qui trouve l'adresse Vercel et s'inscrit consomme ses requêtes. La lecture du code a montré trois trous :

- les clés d'IA et de voix de l'instance ne servaient déjà qu'à son compte, mais la clé **Firecrawl** (lecture des pages d'offres) servait à tout compte connecté, jusqu'à 30 pages par jour chacun ;
- **l'inscription était ouverte** : instance Clerk de développement, *allowlist* vide. Un inconnu pouvait aussi prendre de la place dans la base gratuite et faire tourner des fonctions serveur ;
- la propriétaire était reconnue par son **pseudo** GitHub. Un pseudo peut changer, puis être repris par quelqu'un d'autre, qui obtiendrait les clés de l'instance.

## ✅ Décision

- **Toutes les clés de l'instance ne servent qu'à la propriétaire** : IA (OpenRouter, Anthropic), voix (ElevenLabs, coupée par défaut de toute façon : [ADR 0020](0020-voix-payante-sur-demande.md)) et maintenant pages d'offres (Firecrawl). Un *resolver* par service dans `lib/ai/config.ts` : `resolveLlmConfig`, `resolveVoiceConfig`, `resolvePageReader`. Tout autre compte apporte ses propres clés dans les Réglages : une clé Firecrawl peut maintenant y être enregistrée, chiffrée comme les autres. Sans clé, la page d'une offre est lue par le lecteur intégré (gratuit, `lib/offers/fetch-page.ts`), ou la candidate colle le texte.
- **La propriétaire est reconnue par son identifiant GitHub numérique** (`OWNER_GITHUB_ID`, l'`id` renvoyé par `api.github.com/users/<pseudo>`), comparé au compte GitHub que Clerk a relié par OAuth (`providerUserId`). Variable absente = personne n'est propriétaire (*fail closed*). `OWNER_GITHUB_LOGIN` ne sert plus.
- **L'inscription est fermée tant que l'instance Clerk est en développement** : *allowlist* activée, avec la seule adresse vérifiée de la propriétaire (`npm run clerk:signup -- close`, script `scripts/infra/clerk-signup.mts`). Les comptes existants se connectent toujours. Clerk applique aussi l'*allowlist* aux comptes créés par la *Backend API* : les tests e2e n'autorisent donc leur adresse de test que pendant qu'ils tournent (le *seed* l'ajoute, le *cleanup* la retire).

## ⚖️ Conséquences

- 👍 Un inconnu qui a l'URL ne peut plus créer de compte (mesuré : `npm run clerk:signup -- probe` reçoit `403 not_allowed_access`), ni dépenser les crédits de la propriétaire.
- 👍 Changer de pseudo GitHub ne compte plus, et le même id marchera avec une future instance Clerk de production.
- 👎 L'*allowlist* n'est gratuite que sur une instance de **développement** : en production, c'est une fonction payante de Clerk. Passer en production demandera une autre barrière (une liste vérifiée par l'app elle-même, par exemple) ou le plan payant.
- 👎 Une variable de plus à mettre partout : `.env` du Mac (variable Stripe Projects `owner-github-id`), Vercel, sessions cloud. Une session cloud sans `OWNER_GITHUB_ID` tourne, mais sans propriétaire, donc sans les clés de l'instance.
- 👎 Pour les autres comptes, les offres des sites qui bloquent les robots demandent leur propre clé Firecrawl, ou un copier-coller.
- 💡 Payer via Stripe au lieu d'apporter ses clés pourrait un jour être une option pour les autres utilisateurs : idée de la propriétaire, pas décidée.
