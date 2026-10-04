# 🔌 ADR 0004 — Un seul client compatible OpenAI ; seulement des presets sur l'instance publique

> 🇬🇧 Version anglaise : [ENG/adr/0004](../../en/adr/0004-one-openai-compatible-client.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée

## 🎯 Contexte

Chaque utilisateur apporte son IA, payante ou gratuite. Les fournisseurs diffèrent, mais la plupart
parlent le format **chat completions** d'OpenAI : `POST {base_url}/chat/completions` avec une clé et
un nom de modèle. La spec demandait aussi une option « Custom base URL » — utile pour
s'auto-héberger avec un modèle local (Ollama), dangereuse sur un serveur public.

## ✅ Décision

1. **Un seul client**, `lib/ai/client.ts`, pour tous les fournisseurs : base URL + clé d'API + modèle.
2. **Quatre presets** dont la base URL a été vérifiée dans la doc de chaque fournisseur :
   OpenRouter `https://openrouter.ai/api/v1`, OpenAI `https://api.openai.com/v1` (d'après le SDK
   officiel `openai-node` — la doc web refuse les accès automatisés), Mistral
   `https://api.mistral.ai/v1`, Groq `https://api.groq.com/openai/v1`. Les quatre exposent
   `GET /models`, utilisé par « Load models ».
3. **Une base URL personnalisée est refusée sauf si `ALLOW_CUSTOM_LLM_BASE_URL=true`.** Sinon,
   n'importe quel utilisateur pourrait faire appeler n'importe quelle adresse par notre serveur
   (SSRF), par exemple l'adresse des métadonnées d'un hébergeur cloud. Le contrôle a lieu **deux
   fois** : à l'enregistrement (le serveur déduit l'URL du nom du fournisseur et ignore celle
   envoyée par le navigateur) et à chaque appel (`assertAllowedBaseUrl`).
4. **Les erreurs des fournisseurs deviennent des messages génériques** (`lib/ai/errors.ts`). La
   réponse brute n'est jamais affichée ni journalisée : certains fournisseurs y recopient une partie
   de la clé.

## 📊 Conséquences

**Bonnes** 👍

- Ajouter un fournisseur, c'est une entrée dans `lib/ai/providers.ts`.
- L'instance publique ne peut pas servir de relais vers des adresses internes.
- Les auto-hébergeurs gardent l'option du modèle local avec une variable d'environnement.

**Mauvaises** 👎

- **Les fonctions propres à un fournisseur sont hors de portée** (*structured outputs* d'OpenAI,
  API native d'Anthropic, *tool calling*). Tout passe par du *chat completions* simple et notre
  propre validation JSON.
- Avec une URL personnalisée, le champ de clé reste obligatoire : un utilisateur d'Ollama y met
  n'importe quel texte.
- La liste des presets est codée en dur ; un fournisseur qui change de base URL demande une
  modification du code.
