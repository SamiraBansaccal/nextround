import { z } from "zod";
import { resolveVoiceConfig } from "@/lib/ai/config";
import { consumeInstanceQuota } from "@/lib/ai/usage";
import { getAccount } from "@/lib/auth";
import { getQuestionWithOffer } from "@/lib/data/interviews";
import { synthesize } from "@/lib/voice/tts";

export const maxDuration = 30;

const bodySchema = z.object({ questionId: z.string().uuid() });

// Reads an interview question aloud with ElevenLabs. Only the user's own questions can be read
// (no arbitrary text), so the voice key cannot be used as a free TTS service.
// 204 = no ElevenLabs key available: the browser's free voice is used instead.
export async function POST(request: Request) {
  const account = await getAccount();
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response("Bad request", { status: 400 });
  const found = await getQuestionWithOffer(account.userId, parsed.data.questionId);
  if (!found) return new Response("Not found", { status: 404 });

  const voice = await resolveVoiceConfig(account.userId, account.isOwner);
  if (voice.provider === "browser") return new Response(null, { status: 204 });
  try {
    if (voice.source === "instance") await consumeInstanceQuota(account.userId, "tts");
    const audio = await synthesize(voice.apiKey, found.question.text);
    return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, no-store" } });
  } catch {
    return new Response(null, { status: 204 }); // limit reached or provider error: fall back to the browser voice
  }
}
