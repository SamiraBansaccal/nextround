import { z } from "zod";
import { consumeInstanceQuota } from "@/lib/ai/usage";
import { getAccount } from "@/lib/auth";
import { getQuestionWithOffer } from "@/lib/data/interviews";
import { getInterviewer } from "@/lib/interviewers";
import { audioCacheKey, audioStore, isCacheable } from "@/lib/voice/audio-cache";
import { resolveTextToSpeech } from "@/lib/voice/text-to-speech";
import type { SpeechRequest } from "@/lib/voice/types";

export const maxDuration = 30;

const bodySchema = z.object({ questionId: z.string().uuid() });

// Reads an interview question aloud, in the voice profile of the interview's interviewer. Only the
// user's own questions can be read (no arbitrary text), so the voice key cannot be used as a free TTS
// service. 204 = no server voice available: the browser's free voice is used instead.
export async function POST(request: Request) {
  const account = await getAccount();
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response("Bad request", { status: 400 });
  const found = await getQuestionWithOffer(account.userId, parsed.data.questionId);
  if (!found) return new Response("Not found", { status: 404 });

  const tts = await resolveTextToSpeech(account.userId, account.isOwner);
  if (!tts) return new Response(null, { status: 204 });
  const { intro, text, outro } = found.question;
  const speech: SpeechRequest = {
    text: [intro, text, outro].filter(Boolean).join(" "), // the interviewer's lines around the question, then the question
    language: found.interview?.language ?? found.offer?.language ?? null, // the session's language
    voice: getInterviewer(found.interview?.interviewerId).voice,
    // Still "dynamic": the AI writes part of the questions. Bank questions and interviewer lines are fixed
    // texts, so they could later be cached once per voice and assembled ("static").
    content: "dynamic",
  };
  try {
    const key = isCacheable(speech) ? audioCacheKey(tts.provider.id, speech) : null;
    const cached = key ? await audioStore.get(key) : null;
    if (!cached && tts.source === "instance") await consumeInstanceQuota(account.userId, "tts");
    const audio = cached ?? (await tts.provider.synthesize(speech));
    if (key && !cached) await audioStore.put(key, audio);
    return new Response(audio.audio, { headers: { "Content-Type": audio.contentType, "Cache-Control": "private, no-store" } });
  } catch {
    return new Response(null, { status: 204 }); // limit reached or provider error: fall back to the browser voice
  }
}
