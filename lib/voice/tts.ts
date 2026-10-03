import "server-only";

// ElevenLabs text-to-speech (REST). Voice and model checked in the official ElevenLabs skill:
// "Sarah" (premade voice) and eleven_flash_v2_5 (32 languages, ~75 ms latency).
export const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
export const MODEL_ID = "eleven_flash_v2_5";
const MAX_CHARS = 600;

export class TtsError extends Error {}

export async function synthesize(apiKey: string, text: string): Promise<ArrayBuffer> {
  let response: Response;
  try {
    response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text: text.slice(0, MAX_CHARS), model_id: MODEL_ID }),
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
  } catch {
    throw new TtsError("network");
  }
  if (!response.ok) throw new TtsError(String(response.status)); // never forward the provider's body
  return response.arrayBuffer();
}
