import "server-only";
import type { SpeechRequest, SynthesizedAudio, TextToSpeechProvider } from "./types";

// ElevenLabs text-to-speech (REST), one implementation of TextToSpeechProvider. Default voice and
// model checked in the official ElevenLabs skill: "Sarah" (premade voice) and eleven_flash_v2_5
// (32 languages, ~75 ms latency). An interviewer can name another ElevenLabs voice later
// (voice.provider "elevenlabs" + voiceId): only voices the account may legally use.
export const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
export const MODEL_ID = "eleven_flash_v2_5";
const MAX_CHARS = 600;

export class TtsError extends Error {}

/** The voice id and settings sent to ElevenLabs for a request (pure, tested). */
export function elevenLabsVoice(request: SpeechRequest): { voiceId: string; settings: Record<string, number> | null } {
  const own = request.voice.provider === "elevenlabs" && request.voice.voiceId ? request.voice.voiceId : null;
  const s = request.voice.settings;
  const entries = s
    ? Object.entries({ stability: s.stability, similarity_boost: s.similarityBoost, style: s.style, speed: s.speed }).filter(
        (entry): entry is [string, number] => typeof entry[1] === "number",
      )
    : [];
  return { voiceId: own ?? DEFAULT_VOICE_ID, settings: entries.length > 0 ? Object.fromEntries(entries) : null };
}

export function createElevenLabsTts(apiKey: string): TextToSpeechProvider {
  return {
    id: "elevenlabs",
    async synthesize(request: SpeechRequest): Promise<SynthesizedAudio> {
      const { voiceId, settings } = elevenLabsVoice(request);
      let response: Response;
      try {
        response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify({ text: request.text.slice(0, MAX_CHARS), model_id: MODEL_ID, ...(settings ? { voice_settings: settings } : {}) }),
          signal: AbortSignal.timeout(20_000),
          cache: "no-store",
        });
      } catch {
        throw new TtsError("network");
      }
      if (!response.ok) throw new TtsError(String(response.status)); // never forward the provider's body
      return { audio: await response.arrayBuffer(), contentType: "audio/mpeg" };
    },
  };
}
