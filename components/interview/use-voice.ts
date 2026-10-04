"use client";

import { useEffect, useRef, useState } from "react";
import { speakQuestion, type Playback } from "./voice/question-speech";
import { createSpeechToTextEngine, type SpeechToTextEngine } from "./voice/speech-to-text";

// The interview's voice: the interviewer reads the question (TTS), the candidate answers out loud
// (STT). Both sit behind small client abstractions in ./voice, so providers can change without
// touching the call's components.

const LOCALES: Record<string, string> = { fr: "fr-BE", en: "en-US", nl: "nl-BE", de: "de-DE", es: "es-ES", it: "it-IT" };

export function useVoice(language: string | null) {
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
      setNote("The question could not be read aloud.");
    }
  }

  function toggleListening(onTranscript: (text: string) => void) {
    if (listening) {
      engine.current?.stop();
      return;
    }
    const stt = createSpeechToTextEngine(locale);
    if (!stt) {
      setNote("Voice answers need Chrome or Edge. You can type your answer instead.");
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
        setNote(error === "denied" ? "The microphone is not allowed. Allow it in the browser, or type your answer." : "The microphone is not available. Type your answer instead.");
      },
    });
  }

  return { speak, speaking, listening, toggleListening, note };
}
