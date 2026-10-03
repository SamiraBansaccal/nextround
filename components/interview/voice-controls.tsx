"use client";

import { Mic, MicOff, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// Voice mode: ElevenLabs reads the question (or the browser's free voice), and the answer is
// dictated with the browser's speech recognition (Chrome / Edge). The transcript stays editable.

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

export function VoiceControls({
  questionId,
  questionText,
  language,
  voiceLabel,
  onTranscript,
  disabled,
}: {
  questionId: string;
  questionText: string;
  language: string | null;
  voiceLabel: string;
  onTranscript: (text: string) => void;
  disabled: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const locale = LOCALES[language ?? "en"] ?? "en-US";

  useEffect(() => () => {
    recognition.current?.stop();
    audio.current?.pause();
  }, []);

  async function readAloud() {
    setNote(null);
    setSpeaking(true);
    try {
      const response = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId }) });
      if (response.status === 200) {
        const url = URL.createObjectURL(await response.blob());
        audio.current?.pause();
        audio.current = new Audio(url);
        audio.current.onended = () => setSpeaking(false);
        await audio.current.play();
        return;
      }
      // 204: no ElevenLabs key: the browser's own voice (free).
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.lang = locale;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(false);
      setNote("The question could not be read aloud.");
    }
  }

  function toggleListening() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
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
      setNote("The microphone is not available. Check the browser permission, or type your answer.");
    };
    recognition.current = rec;
    setNote(null);
    setListening(true);
    rec.start();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={speaking} onClick={readAloud}>
          <Volume2 className="size-4" aria-hidden="true" /> {speaking ? "Reading…" : "Read the question aloud"}
        </Button>
        <Button type="button" variant={listening ? "destructive" : "outline"} size="sm" disabled={disabled} onClick={toggleListening}>
          {listening ? <MicOff className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
          {listening ? "Stop recording" : "Answer by voice"}
        </Button>
        <span className="text-xs text-muted-foreground">Voice: {voiceLabel}</span>
      </div>
      {listening && <p className="text-sm text-gap">● Listening… speak your answer, then press Stop.</p>}
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </div>
  );
}
