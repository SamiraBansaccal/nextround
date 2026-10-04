import { describe, expect, it } from "vitest";
import { getInterviewer } from "@/lib/interviewers";
import { audioCacheKey, isCacheable } from "@/lib/voice/audio-cache";
import { DEFAULT_VOICE_ID, elevenLabsVoice } from "@/lib/voice/elevenlabs";
import type { SpeechRequest } from "@/lib/voice/types";

// Voice architecture: provider choices stay in lib/voice; audio reuse is keyed on exactly what is said.

const request = (patch: Partial<SpeechRequest> = {}): SpeechRequest => ({
  text: "Tell me about yourself.",
  language: "en",
  voice: getInterviewer("marie").voice,
  content: "static",
  ...patch,
});

describe("audio cache key", () => {
  it("is the same for the same audio, whitespace aside", () => {
    expect(audioCacheKey("elevenlabs", request())).toBe(audioCacheKey("elevenlabs", request({ text: "  Tell me   about yourself. " })));
  });

  it("changes with the text, the voice, the language or the provider", () => {
    const base = audioCacheKey("elevenlabs", request());
    expect(audioCacheKey("elevenlabs", request({ text: "Why us?" }))).not.toBe(base);
    expect(audioCacheKey("elevenlabs", request({ language: "fr" }))).not.toBe(base);
    expect(audioCacheKey("elevenlabs", request({ voice: { ...request().voice, voiceId: "other-voice" } }))).not.toBe(base);
    expect(audioCacheKey("another-provider", request())).not.toBe(base);
  });

  it("caches only static content (validated questions), not follow-ups", () => {
    expect(isCacheable(request())).toBe(true);
    expect(isCacheable(request({ content: "dynamic" }))).toBe(false);
  });
});

describe("ElevenLabs voice choice", () => {
  it("uses the default voice unless the interviewer names an ElevenLabs voice", () => {
    expect(elevenLabsVoice(request())).toEqual({ voiceId: DEFAULT_VOICE_ID, settings: null });
    const own = request({ voice: { provider: "elevenlabs", voiceId: "licensed-voice", style: "calm", settings: { stability: 0.4, speed: 1.1 } } });
    expect(elevenLabsVoice(own)).toEqual({ voiceId: "licensed-voice", settings: { stability: 0.4, speed: 1.1 } });
    const otherProvider = request({ voice: { provider: "browser", voiceId: "x", style: "calm", settings: null } });
    expect(elevenLabsVoice(otherProvider).voiceId).toBe(DEFAULT_VOICE_ID);
  });
});
