import "server-only";
import { createHash } from "node:crypto";
import type { SpeechRequest, SynthesizedAudio } from "./types";

// Audio reuse: a paid voice never reads the same sentence twice in the same voice.
//   question written in advance (static) -> exact text -> TTS once -> kept -> reused by every user;
//   follow-up (dynamic)                  -> TTS on demand -> not kept.
// The key identifies one audio exactly: same provider, voice, settings, language and text.
// Kept in the server's memory for now (bounded, least recently used out first): a server restart
// forgets it. A durable store (Vercel Blob, S3…) can replace `audioStore` without touching callers.

export interface AudioStore {
  get(key: string): Promise<SynthesizedAudio | null>;
  put(key: string, audio: SynthesizedAudio): Promise<void>;
}

const MAX_BYTES = 64 * 1024 * 1024;

/** In-memory LRU: a Map keeps insertion order, so the first key is the least recently used. */
export function memoryAudioStore(maxBytes = MAX_BYTES): AudioStore {
  const entries = new Map<string, SynthesizedAudio>();
  let size = 0;
  return {
    async get(key) {
      const audio = entries.get(key);
      if (!audio) return null;
      entries.delete(key);
      entries.set(key, audio);
      return audio;
    },
    async put(key, audio) {
      if (audio.audio.byteLength > maxBytes) return;
      const previous = entries.get(key);
      if (previous) {
        entries.delete(key);
        size -= previous.audio.byteLength;
      }
      entries.set(key, audio);
      size += audio.audio.byteLength;
      for (const [oldest, old] of entries) {
        if (size <= maxBytes) break;
        entries.delete(oldest);
        size -= old.audio.byteLength;
      }
    },
  };
}

export const audioStore: AudioStore = memoryAudioStore();

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
