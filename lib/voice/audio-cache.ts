import "server-only";
import { createHash } from "node:crypto";
import type { SpeechRequest, SynthesizedAudio } from "./types";

// Audio reuse, prepared but not switched on. The plan:
//   validated question (static) -> exact text -> TTS once -> stored -> reused by every user;
//   follow-up (dynamic)        -> TTS on demand -> not stored (a cache can come later).
// The key identifies one audio exactly: same provider, voice, settings, language and text.
// No storage is chosen yet (Vercel Blob, S3, a table…): `audioStore` stores nothing for now.

export interface AudioStore {
  get(key: string): Promise<SynthesizedAudio | null>;
  put(key: string, audio: SynthesizedAudio): Promise<void>;
}

/** Stores nothing: every request is synthesised. Replace with a real store when questions are final. */
export const audioStore: AudioStore = {
  async get() {
    return null;
  },
  async put() {},
};

export function isCacheable(request: SpeechRequest): boolean {
  return request.content === "static";
}

export function audioCacheKey(providerId: string, request: SpeechRequest): string {
  const identity = {
    provider: providerId,
    voiceId: request.voice.voiceId,
    settings: request.voice.settings,
    language: request.language,
    text: request.text.trim().replace(/\s+/g, " "),
  };
  return createHash("sha256").update(JSON.stringify(identity)).digest("hex");
}
