import type { UiLang } from "./ui";

// The Settings page (AI provider, voice) and its server actions, in the SITE's language.
// Text between `backticks` is shown as code.

const en = {
  eyebrow: "Bring your own AI",
  title: "Settings",
  // AI provider
  aiTitle: "AI provider",
  aiIntro: "Your key stays yours. Free models work fine: OpenRouter lists them with ids ending in `:free`.",
  aiOwner: " As the instance owner, NextRound uses the instance key whenever you have no key saved.",
  aiCost:
    "The AI is only used to give feedback on your answers: questions and model answers are written in advance and cost nothing. Each feedback is one call billed by your provider (free on OpenRouter's `:free` models), and the same answer to the same question is never sent twice.",
  provider: "Provider",
  customUrl: "Custom URL",
  customOff:
    "A custom base URL (e.g. a local model) is off on this public instance, so the server never calls arbitrary hosts. Self-hosters turn it on with `ALLOW_CUSTOM_LLM_BASE_URL=true`.",
  claudeNote:
    "To use Claude, create an API key in the Anthropic Console. A Claude.ai subscription (Pro, Max) can't be used by an app: API usage is billed separately, per call, as prepaid credits.",
  baseUrl: "Base URL",
  model: "Model",
  modelPlaceholder: "Model id, e.g. provider/model-name",
  loadModels: "Load models",
  modelsLoaded: "{count} models loaded: start typing to pick one.",
  apiKey: "API key",
  replace: "Replace",
  remove: "Remove",
  keyRemoved: "Key removed.",
  pasteKey: "Paste your key",
  stored: "Stored encrypted (AES-256-GCM), used only by the server, never shown again.",
  getKey: "Get a {provider} key",
  save: "Save",
  savedWithKey: "Saved. Your key is stored encrypted.",
  savedNoKey: "Saved. Add a key to use your own AI.",
  test: "Test connection",
  connectedOwn: "Connected — {model} answered with your key.",
  connectedInstance: "Connected — {model} answered with the instance key.",
  // Voice
  voiceTitle: "Voice",
  voiceIntro: "Used to read questions aloud in the interview call. Without an ElevenLabs key, NextRound uses your browser's voice, for free.",
  voiceOwner:
    " As the owner, the instance's ElevenLabs key is only used when `INSTANCE_VOICE_ENABLED=true` is set on the server: it spends paid credits, so it is off by default.",
  voiceCredits: " ElevenLabs spends credits on each new sentence; a sentence already read in the same voice is reused, not paid again.",
  voiceKey: "ElevenLabs key (optional)",
  voiceSavedKey: "Saved key ••••{last4} — paste a new one to replace it",
  voiceEmpty: "Leave empty to use the browser voice",
  voiceSaved: "Saved, stored encrypted.",
  voiceRemoved: "Voice key removed.",
  currently: "Currently using: {voice}",
  currentOwn: "ElevenLabs, with your key",
  currentInstance: "ElevenLabs, with the instance key (you are the owner)",
  currentBrowser: "Browser voice (free)",
  // Server actions
  checkForm: "Please check the form: model is required, keys are at least 8 characters.",
  validUrl: "Enter a valid http(s) base URL.",
  customDisabled: "Custom base URLs are disabled on this instance.",
  unknownProvider: "Unknown provider.",
  urlNotAllowed: "This base URL is not allowed on this instance.",
  saveKeyFirst: "Save your API key first, then load the models.",
  notElevenLabs: "This does not look like an ElevenLabs key.",
};

export type SettingsCopy = typeof en;

const fr: SettingsCopy = {
  eyebrow: "Ton IA, ta clé",
  title: "Réglages",
  aiTitle: "Fournisseur d'IA",
  aiIntro: "Ta clé reste la tienne. Les modèles gratuits suffisent : OpenRouter les liste avec un identifiant qui finit par `:free`.",
  aiOwner: " En tant que propriétaire de l'instance, NextRound utilise la clé de l'instance tant que tu n'en as pas enregistré.",
  aiCost:
    "L'IA ne sert qu'à commenter tes réponses : les questions et les réponses types sont écrites à l'avance et ne coûtent rien. Chaque retour est un appel facturé par ton fournisseur (gratuit avec les modèles `:free` d'OpenRouter), et une même réponse à une même question n'est jamais envoyée deux fois.",
  provider: "Fournisseur",
  customUrl: "URL personnalisée",
  customOff:
    "Une base URL personnalisée (par ex. un modèle local) est désactivée sur cette instance publique : le serveur n'appelle jamais d'hôte arbitraire. En auto-hébergement, on l'active avec `ALLOW_CUSTOM_LLM_BASE_URL=true`.",
  claudeNote:
    "Pour utiliser Claude, crée une clé d'API dans l'Anthropic Console. Un abonnement Claude.ai (Pro, Max) ne peut pas servir à une app : l'API est facturée à part, à l'appel, avec des crédits prépayés.",
  baseUrl: "Base URL",
  model: "Modèle",
  modelPlaceholder: "Identifiant du modèle, par ex. fournisseur/nom-du-modele",
  loadModels: "Charger les modèles",
  modelsLoaded: "{count} modèles chargés : commence à taper pour en choisir un.",
  apiKey: "Clé d'API",
  replace: "Remplacer",
  remove: "Retirer",
  keyRemoved: "Clé retirée.",
  pasteKey: "Colle ta clé",
  stored: "Stockée chiffrée (AES-256-GCM), utilisée seulement par le serveur, jamais réaffichée.",
  getKey: "Obtenir une clé {provider}",
  save: "Enregistrer",
  savedWithKey: "Enregistré. Ta clé est stockée chiffrée.",
  savedNoKey: "Enregistré. Ajoute une clé pour utiliser ta propre IA.",
  test: "Tester la connexion",
  connectedOwn: "Connecté : {model} a répondu avec ta clé.",
  connectedInstance: "Connecté : {model} a répondu avec la clé de l'instance.",
  voiceTitle: "Voix",
  voiceIntro: "Sert à lire les questions à voix haute pendant l'entretien. Sans clé ElevenLabs, NextRound utilise la voix de ton navigateur, gratuitement.",
  voiceOwner:
    " En tant que propriétaire, la clé ElevenLabs de l'instance n'est utilisée que si `INSTANCE_VOICE_ENABLED=true` est défini sur le serveur : elle dépense des crédits payants, elle est donc coupée par défaut.",
  voiceCredits: " ElevenLabs dépense des crédits à chaque nouvelle phrase ; une phrase déjà lue avec la même voix est réutilisée, pas payée deux fois.",
  voiceKey: "Clé ElevenLabs (facultative)",
  voiceSavedKey: "Clé enregistrée ••••{last4} : colles-en une nouvelle pour la remplacer",
  voiceEmpty: "Laisse vide pour utiliser la voix du navigateur",
  voiceSaved: "Enregistrée, stockée chiffrée.",
  voiceRemoved: "Clé de voix retirée.",
  currently: "Voix utilisée : {voice}",
  currentOwn: "ElevenLabs, avec ta clé",
  currentInstance: "ElevenLabs, avec la clé de l'instance (tu en es propriétaire)",
  currentBrowser: "Voix du navigateur (gratuite)",
  checkForm: "Vérifie le formulaire : le modèle est obligatoire et les clés font au moins 8 caractères.",
  validUrl: "Entre une base URL http(s) valide.",
  customDisabled: "Les base URL personnalisées sont désactivées sur cette instance.",
  unknownProvider: "Fournisseur inconnu.",
  urlNotAllowed: "Cette base URL n'est pas autorisée sur cette instance.",
  saveKeyFirst: "Enregistre d'abord ta clé d'API, puis charge les modèles.",
  notElevenLabs: "Ça ne ressemble pas à une clé ElevenLabs.",
};

export const SETTINGS_COPY: Record<UiLang, SettingsCopy> = { en, fr };
