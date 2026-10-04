// AI errors carry a code and a generic, user-safe message. Raw provider responses are never
// shown or logged: some providers echo part of the API key in their error messages.

export type AiErrorCode =
  | "no_key"
  | "invalid_key"
  | "model_not_found"
  | "rate_limited"
  | "quota_exceeded"
  | "provider_error"
  | "network"
  | "invalid_output"
  | "forbidden_base_url";

const MESSAGES: Record<AiErrorCode, string> = {
  no_key: "Add your AI key in Settings to use AI features.",
  invalid_key: "The provider rejected this API key.",
  model_not_found: "The provider does not know this model. Check the model name.",
  rate_limited: "The provider is rate limiting requests. Wait a moment and try again, or try another model.",
  quota_exceeded: "The daily limit for the shared AI key is reached. Add your own AI key in Settings to continue.",
  provider_error: "The AI provider returned an error. Try again, or try another model.",
  network: "Could not reach the AI provider.",
  invalid_output: "This model could not return valid output — try another model.",
  forbidden_base_url: "This base URL is not allowed on this instance.",
};

const MESSAGES_FR: Record<AiErrorCode, string> = {
  no_key: "Ajoute ta clé d'IA dans Settings pour utiliser les fonctions d'IA.",
  invalid_key: "Le fournisseur a refusé cette clé d'API.",
  model_not_found: "Le fournisseur ne connaît pas ce modèle. Vérifie son nom.",
  rate_limited: "Le fournisseur limite les requêtes. Attends un moment et réessaie, ou essaie un autre modèle.",
  quota_exceeded: "La limite quotidienne de la clé partagée est atteinte. Ajoute ta propre clé d'IA dans Settings pour continuer.",
  provider_error: "Le fournisseur d'IA a renvoyé une erreur. Réessaie, ou essaie un autre modèle.",
  network: "Impossible de joindre le fournisseur d'IA.",
  invalid_output: "Ce modèle n'a pas renvoyé de réponse valide — essaie un autre modèle.",
  forbidden_base_url: "Cette base URL n'est pas autorisée sur cette instance.",
};

export class AiError extends Error {
  constructor(public readonly code: AiErrorCode) {
    super(MESSAGES[code]);
    this.name = "AiError";
  }
}

/** A user-safe message; interviews pass their language ("en" elsewhere in the app). */
export function aiErrorMessage(error: unknown, lang: "en" | "fr" = "en"): string {
  if (lang === "fr") return error instanceof AiError ? MESSAGES_FR[error.code] : "Une erreur s'est produite. Réessaie.";
  return error instanceof AiError ? error.message : "Something went wrong. Please try again.";
}
