import "server-only";
import type { SpeechToTextProvider } from "./types";

// Server-side speech-to-text: NOT chosen yet (Whisper, a cloud API or a local model are all possible).
// Until then there is no provider, and the browser's own speech recognition transcribes the answer
// (components/interview/voice/speech-to-text.ts). Kept separate from TTS on purpose: using ElevenLabs
// for the interviewer's voice says nothing about who transcribes the candidate.
//
// To add one later: implement SpeechToTextProvider, return it here, expose an /api/stt route that
// accepts a short audio upload (size and duration limits, signed-in user only), and add a recording
// engine on the client.

export function resolveSpeechToText(): SpeechToTextProvider | null {
  return null;
}
