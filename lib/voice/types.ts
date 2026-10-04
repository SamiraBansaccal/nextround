import type { VoiceProfile } from "@/lib/interviewers/types";

// Voice, provider-independent. Two separate directions, never coupled:
//   TTS  text  -> audio   (the interviewer reads a question)      TextToSpeechProvider
//   STT  audio -> text    (the candidate answers out loud)        SpeechToTextProvider
// The frontend never sees a provider: it calls /api/tts (and later an STT endpoint) and falls back to
// the browser's own speech APIs when the server has nothing configured.

/**
 * - static: a validated question, identical for everyone -> generate once, store, reuse;
 * - dynamic: generated for one answer (a follow-up) -> generate on demand, not stored by default.
 */
export type SpokenContentKind = "static" | "dynamic";

export interface SpeechRequest {
  text: string;
  language: string | null; // ISO code of the text, e.g. "fr"
  voice: VoiceProfile;
  content: SpokenContentKind;
}

export interface SynthesizedAudio {
  audio: ArrayBuffer;
  contentType: string; // e.g. "audio/mpeg"
}

export interface TextToSpeechProvider {
  readonly id: string; // "elevenlabs", later others
  synthesize(request: SpeechRequest): Promise<SynthesizedAudio>;
}

export interface TranscriptionRequest {
  audio: ArrayBuffer;
  mimeType: string; // e.g. "audio/webm"
  language: string | null;
}

export interface Transcript {
  text: string;
  confidence: number | null;
}

export interface SpeechToTextProvider {
  readonly id: string; // e.g. "whisper", a cloud API, a local model
  transcribe(request: TranscriptionRequest): Promise<Transcript>;
}
