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

export class AiError extends Error {
  constructor(public readonly code: AiErrorCode) {
    super(MESSAGES[code]);
    this.name = "AiError";
  }
}

export function aiErrorMessage(error: unknown): string {
  return error instanceof AiError ? error.message : "Something went wrong. Please try again.";
}
