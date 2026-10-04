import "server-only";
import { resolveVoiceConfig } from "@/lib/ai/config";
import { createElevenLabsTts } from "./elevenlabs";
import type { TextToSpeechProvider } from "./types";

// Which TTS provider serves a user: their own ElevenLabs key, else the instance key for the owner,
// else none (null) and the browser reads the question for free. Adding a provider = one more branch
// here; nothing else in the app knows which provider is used.

export async function resolveTextToSpeech(userId: string, isOwner: boolean): Promise<{ provider: TextToSpeechProvider; source: "user" | "instance" } | null> {
  const voice = await resolveVoiceConfig(userId, isOwner);
  if (voice.provider === "browser") return null;
  return { provider: createElevenLabsTts(voice.apiKey), source: voice.source };
}
