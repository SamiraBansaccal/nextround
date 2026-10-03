// OpenAI-compatible providers offered in Settings. Base URLs checked in each provider's docs
// (OpenAI: official openai-node SDK, whose docs block automated access). All four expose GET /models.
//
// Only these presets are allowed on the public instance. A custom base URL (e.g. Ollama on
// localhost) is accepted ONLY when ALLOW_CUSTOM_LLM_BASE_URL=true (self-hosting): otherwise any
// user could make our server call arbitrary hosts (SSRF).

export const PRESET_IDS = ["openrouter", "openai", "mistral", "groq"] as const;
export type PresetId = (typeof PRESET_IDS)[number];
export type ProviderId = PresetId | "custom";

export interface ProviderPreset {
  id: PresetId;
  label: string;
  baseUrl: string;
  keysUrl: string; // where users create an API key
  publicModels: boolean; // GET /models works without a key
}

export const PRESETS: Record<PresetId, ProviderPreset> = {
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    keysUrl: "https://openrouter.ai/keys",
    publicModels: true,
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    keysUrl: "https://platform.openai.com/api-keys",
    publicModels: false,
  },
  mistral: {
    id: "mistral",
    label: "Mistral",
    baseUrl: "https://api.mistral.ai/v1",
    keysUrl: "https://console.mistral.ai/api-keys",
    publicModels: false,
  },
  groq: {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    keysUrl: "https://console.groq.com/keys",
    publicModels: false,
  },
};

export function isPresetId(value: string): value is PresetId {
  return (PRESET_IDS as readonly string[]).includes(value);
}

/** True if the base URL is exactly one of the presets. */
export function isPresetBaseUrl(baseUrl: string): boolean {
  return PRESET_IDS.some((id) => PRESETS[id].baseUrl === baseUrl);
}

/** Custom base URLs (self-hosting only): http(s), no credentials, no query string. */
export function isValidCustomBaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password && !url.search;
  } catch {
    return false;
  }
}

/** Default model of the instance key (OpenRouter free models, checked against /models on 2026-10-03). */
export const DEFAULT_INSTANCE_MODEL = "qwen/qwen3.8-27b:free";
export const DEFAULT_INSTANCE_FALLBACK_MODELS = ["nvidia/nemotron-3-super-120b-a12b:free"];
