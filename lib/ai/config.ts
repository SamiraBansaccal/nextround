import "server-only";
import { getAiSecrets } from "@/lib/data/ai-settings";
import { serverEnv } from "@/lib/env";
import type { LlmConfig } from "./client";
import { AiError } from "./errors";
import { DEFAULT_ANTHROPIC_MODEL, DEFAULT_INSTANCE_FALLBACK_MODELS, DEFAULT_INSTANCE_MODEL, PRESETS } from "./providers";

// Who pays for an AI call:
// 1. the user's own key, if they saved one in Settings (no limit from us);
// 2. otherwise, the OWNER falls back to the instance key: Anthropic (ANTHROPIC_API_KEY) if set, else
//    OpenRouter (rate limited + daily cap);
// 3. otherwise: "Add your AI key in Settings to use AI features".

export async function resolveLlmConfig(userId: string, isOwner: boolean): Promise<LlmConfig> {
  const saved = await getAiSecrets(userId);
  if (saved?.apiKey) {
    return { baseUrl: saved.baseUrl, apiKey: saved.apiKey, model: saved.model, source: "user" };
  }
  const env = serverEnv();
  if (isOwner && env.ANTHROPIC_API_KEY) {
    return { baseUrl: PRESETS.anthropic.baseUrl, apiKey: env.ANTHROPIC_API_KEY, model: env.INSTANCE_ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL, source: "instance" };
  }
  if (isOwner && env.OPENROUTER_API_API_KEY) {
    return {
      baseUrl: PRESETS.openrouter.baseUrl,
      apiKey: env.OPENROUTER_API_API_KEY,
      model: env.INSTANCE_LLM_MODEL ?? DEFAULT_INSTANCE_MODEL,
      fallbackModels: env.INSTANCE_LLM_FALLBACK_MODELS?.split(",").map((m) => m.trim()).filter(Boolean) ?? DEFAULT_INSTANCE_FALLBACK_MODELS,
      source: "instance",
    };
  }
  throw new AiError("no_key");
}

export type VoiceConfig =
  | { provider: "elevenlabs"; apiKey: string; source: "user" | "instance" }
  | { provider: "browser" }; // free: the browser's own speech synthesis / recognition

/**
 * Same logic for voice: the user's ElevenLabs key, else the instance key for the owner ONLY when
 * INSTANCE_VOICE_ENABLED=true (it spends paid credits), else the browser's free voice.
 */
export async function resolveVoiceConfig(userId: string, isOwner: boolean): Promise<VoiceConfig> {
  const saved = await getAiSecrets(userId);
  if (saved?.voiceKey) return { provider: "elevenlabs", apiKey: saved.voiceKey, source: "user" };
  const env = serverEnv();
  const instanceKey = env.INSTANCE_VOICE_ENABLED === "true" ? env.ELEVENLABS_API_KEY : undefined;
  if (isOwner && instanceKey) return { provider: "elevenlabs", apiKey: instanceKey, source: "instance" };
  return { provider: "browser" };
}

/** What the UI may know about the AI in use (never a key). */
export interface AiStatus {
  mode: "own_key" | "instance" | "none";
  providerLabel: string | null;
  model: string | null;
  voice: "own_key" | "instance" | "browser";
}

export async function getAiStatus(userId: string, isOwner: boolean): Promise<AiStatus> {
  const voice = await resolveVoiceConfig(userId, isOwner);
  const voiceMode = voice.provider === "browser" ? "browser" : voice.source === "user" ? "own_key" : "instance";
  try {
    const llm = await resolveLlmConfig(userId, isOwner);
    const preset = Object.values(PRESETS).find((p) => p.baseUrl === llm.baseUrl);
    return {
      mode: llm.source === "user" ? "own_key" : "instance",
      providerLabel: preset?.label ?? "Custom",
      model: llm.model,
      voice: voiceMode,
    };
  } catch {
    return { mode: "none", providerLabel: null, model: null, voice: voiceMode };
  }
}
