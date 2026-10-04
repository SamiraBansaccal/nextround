// Client side of speech-to-text: an ENGINE turns the candidate's voice into text. Today the only engine
// is the browser's own speech recognition (free, Chrome and Edge). A server engine (record with
// MediaRecorder, send to an /api/stt route backed by lib/voice/speech-to-text.ts) can be added here
// later without touching the components: they only use createSpeechToTextEngine().

export type SpeechError = "denied" | "failed";

export interface SpeechHandlers {
  onText(text: string): void; // a final piece of transcript
  onEnd(): void;
  onError(error: SpeechError): void;
}

export interface SpeechToTextEngine {
  readonly id: "browser";
  start(handlers: SpeechHandlers): void;
  stop(): void;
}

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionConstructor = new () => RecognitionLike;

function browserRecognition(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** The engine available in this browser, or null (the candidate types instead). */
export function createSpeechToTextEngine(locale: string): SpeechToTextEngine | null {
  const Recognition = browserRecognition();
  if (!Recognition) return null;
  let current: RecognitionLike | null = null;
  return {
    id: "browser",
    start(handlers) {
      const rec = new Recognition();
      rec.lang = locale;
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (event) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) if (event.results[i].isFinal) text += event.results[i][0].transcript;
        if (text.trim()) handlers.onText(text.trim());
      };
      rec.onend = () => handlers.onEnd();
      rec.onerror = (event) => handlers.onError(event.error === "not-allowed" || event.error === "service-not-allowed" ? "denied" : "failed");
      current = rec;
      rec.start();
    },
    stop() {
      current?.stop();
    },
  };
}
