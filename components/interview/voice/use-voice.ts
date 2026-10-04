"use client";

import { useEffect, useRef, useState } from "react";
import { speakQuestion, type Playback } from "./question-speech";
import { createSpeechToTextEngine, type SpeechToTextEngine } from "./speech-to-text";

// The interview's voice: the interviewer reads the question (TTS), the candidate answers out loud
// (STT). Both sit behind small client abstractions in ./voice, so providers can change without
// touching the call's components.

const LOCALES: Record<string, string> = { fr: "fr-BE", en: "en-US", nl: "nl-BE", de: "de-DE", es: "es-ES", it: "it-IT" };

export interface VoiceNotes {
  voiceUnsupported: string;
  voiceDenied: string;
  voiceFailed: string;
  readFailed: string;
}

/** `language` is the interview's language: it sets the accent of both the reading and the dictation. */
export function useVoice(language: string | null, notes: VoiceNotes) {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const playback = useRef<Playback | null>(null);
  const engine = useRef<SpeechToTextEngine | null>(null);
  const locale = LOCALES[language ?? "en"] ?? "en-US";

  useEffect(
    () => () => {
      engine.current?.stop();
      playback.current?.stop();
    },
    [],
  );

  async function speak(questionId: string, text: string) {
    setNote(null);
    playback.current?.stop();
    setSpeaking(true);
    try {
      playback.current = await speakQuestion(questionId, text, locale, () => setSpeaking(false));
    } catch {
      setSpeaking(false);
      setNote(notes.readFailed);
    }
  }

  function toggleListening(onTranscript: (text: string) => void) {
    if (listening) {
      engine.current?.stop();
      return;
    }
    const stt = createSpeechToTextEngine(locale);
    if (!stt) {
      setNote(notes.voiceUnsupported);
      return;
    }
    engine.current = stt;
    setNote(null);
    setListening(true);
    stt.start({
      onText: onTranscript,
      onEnd: () => setListening(false),
      onError: (error) => {
        setListening(false);
        setNote(error === "denied" ? notes.voiceDenied : notes.voiceFailed);
      },
    });
  }

  return { speak, speaking, listening, toggleListening, note };
}
