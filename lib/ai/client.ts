import "server-only";
import { AiError } from "./errors";
import { isPresetBaseUrl, isValidCustomBaseUrl, PRESETS } from "./providers";

// The ONE server-side LLM client: OpenAI-compatible chat completions (base URL + API key + model).
// Works with OpenRouter, OpenAI, Mistral, Groq, and any compatible server when self-hosting.

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  /** "user" = the user's own key; "instance" = the instance key (owner only, rate limited). */
  source: "user" | "instance";
  /** OpenRouter only: models tried in order if the first one fails (free models get saturated). */
  fallbackModels?: string[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  /** Set by the caller from ALLOW_CUSTOM_LLM_BASE_URL. */
  allowCustomBaseUrl: boolean;
}

const TIMEOUT_MS = 90_000;

/** SSRF guard, enforced at call time too: presets only, unless custom URLs are explicitly allowed. */
export function assertAllowedBaseUrl(baseUrl: string, allowCustomBaseUrl: boolean): void {
  if (isPresetBaseUrl(baseUrl)) return;
  if (allowCustomBaseUrl && isValidCustomBaseUrl(baseUrl)) return;
  throw new AiError("forbidden_base_url");
}

export async function chatCompletion(config: LlmConfig, messages: ChatMessage[], options: ChatOptions): Promise<string> {
  assertAllowedBaseUrl(config.baseUrl, options.allowCustomBaseUrl);

  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    temperature: options.temperature ?? 0.2,
  };
  if (options.maxTokens) body.max_tokens = options.maxTokens;
  if (config.baseUrl === PRESETS.openrouter.baseUrl && config.fallbackModels?.length) {
    body.models = [config.model, ...config.fallbackModels]; // OpenRouter model fallbacks
  }

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "NextRound", // OpenRouter app attribution (ignored by others)
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new AiError("network");
  }

  if (!response.ok) throw new AiError(errorCodeForStatus(response.status));

  const data = (await response.json().catch(() => null)) as {
    choices?: { message?: { content?: unknown } }[];
  } | null;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") throw new AiError("invalid_output");
  return content;
}

function errorCodeForStatus(status: number) {
  if (status === 401 || status === 403) return "invalid_key" as const;
  if (status === 404) return "model_not_found" as const;
  if (status === 429) return "rate_limited" as const;
  return "provider_error" as const;
}

/** Lists model ids from GET {baseUrl}/models (all presets support it). */
export async function listModels(baseUrl: string, apiKey: string | null, allowCustomBaseUrl: boolean): Promise<string[]> {
  assertAllowedBaseUrl(baseUrl, allowCustomBaseUrl);
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, "")}/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
  } catch {
    throw new AiError("network");
  }
  if (!response.ok) throw new AiError(errorCodeForStatus(response.status));
  const data = (await response.json().catch(() => null)) as { data?: { id?: unknown }[] } | null;
  const ids = (data?.data ?? []).map((m) => m.id).filter((id): id is string => typeof id === "string");
  return [...new Set(ids)].sort().slice(0, 1000);
}
