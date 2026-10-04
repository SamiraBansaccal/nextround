# 🧠 ADR 0018 — Claude via le SDK d'Anthropic, la seule exception au client unique

> 🇬🇧 English version: [en/adr/0018](../../en/adr/0018-claude-through-its-own-sdk.md)

- **Date :** 2026-10-04
- **Statut :** ✅ acceptée — **amende** l'[ADR 0004](0004-un-client-compatible-openai.md)

## 🎯 Contexte

La propriétaire voulait que l'app utilise Claude. La Messages API d'Anthropic n'est pas au format *chat completions* d'OpenAI, et Anthropic recommande d'appeler Claude avec son SDK officiel plutôt qu'avec une couche compatible OpenAI. Un abonnement Claude.ai (Pro, Max) ne peut pas servir à une app : il faut une *API key* de l'Anthropic Console, facturée à l'appel.

## ✅ Décision

- **Anthropic** est un *preset* dans les réglages, comme les autres. `chatCompletion` (`lib/ai/client.ts`) garde un seul point d'entrée et confie les appels Anthropic à `lib/ai/anthropic.ts`, qui utilise `@anthropic-ai/sdk`.
- Modèle par défaut `claude-opus-5-5`, avec un **effort bas** (un *feedback* sur une réponse n'a pas besoin de plus) et sans `temperature` (les modèles récents la refusent).
- Pour la propriétaire, `ANTHROPIC_API_KEY` (et éventuellement `INSTANCE_ANTHROPIC_MODEL`) passe avant la clé OpenRouter de l'instance s'il est défini.
- Les erreurs sont traduites dans les mêmes codes `AiError` : l'interface ne sait pas quel *provider* a échoué.

## 📊 Conséquences

**Bonnes** 👍

- Un bon modèle de plus, sans toucher aux appelants.
- La page des réglages explique la différence entre abonnement et *API key*.

**Mauvaises** 👎

- Deux chemins de code dans le client : une option de request se change aux deux endroits.
- Claude est payant : chaque *feedback* coûte des crédits d'API (les avertissements de l'app le disent).
