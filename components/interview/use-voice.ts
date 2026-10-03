"use client";

import { useEffect, useRef, useState } from "react";

// Voice for the interview call: the recruiter's voice (ElevenLabs through /api/tts, or the
// browser's free voice when the server answers 204), and dictation with the browser's speech
// recognition (Chrome / Edge). The transcript is handed to the caller and stays editable.

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

const LOCALES: Record<string, string> = { fr: "fr-BE", en: "en-US", nl: "nl-BE", de: "de-DE", es: "es-ES", it: "it-IT" };

export function useVoice(language: string | null) {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const locale = LOCALES[language ?? "en"] ?? "en-US";

  useEffect(
    () => () => {
      recognition.current?.stop();
      audio.current?.pause();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    },
    [],
  );

  async function speak(questionId: string, text: string) {
    setNote(null);
    audio.current?.pause();
    window.speechSynthesis?.cancel();
    setSpeaking(true);
    try {
      const response = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId }) });
      if (response.status === 200) {
        audio.current = new Audio(URL.createObjectURL(await response.blob()));
        audio.current.onended = () => setSpeaking(false);
        await audio.current.play();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(false);
      setNote("The question could not be read aloud.");
    }
  }

  function toggleListening(onTranscript: (text: string) => void) {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setNote("Voice answers need Chrome or Edge. You can type your answer instead.");
      return;
    }
    const rec = new Ctor();
    rec.lang = locale;
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) if (event.results[i].isFinal) text += event.results[i][0].transcript;
      if (text.trim()) onTranscript(text.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      setNote("The microphone is not available. Allow it in the browser, or type your answer.");
    };
    recognition.current = rec;
    setNote(null);
    setListening(true);
    rec.start();
  }

  return { speak, speaking, listening, toggleListening, note };
}
