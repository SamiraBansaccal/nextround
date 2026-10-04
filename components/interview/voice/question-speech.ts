// Client side of text-to-speech: asks the server to read a question (/api/tts picks the provider and the
// interviewer's voice), and falls back to the browser's free voice when the server answers 204.
// The client never knows which provider is used.

export interface Playback {
  stop(): void;
}

// Audio already received in this tab, per question and spoken text: "read again" replays it without asking
// the server. Cleared when the interviewer changes (another voice reads the same question).
const played = new Map<string, Blob>();

export function forgetPlayedAudio(): void {
  played.clear();
}

export async function speakQuestion(questionId: string, text: string, locale: string, onEnd: () => void): Promise<Playback> {
  const key = `${questionId}\n${text}`;
  let blob = played.get(key) ?? null;
  if (!blob) {
    const response = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId }) });
    if (response.status === 200) {
      blob = await response.blob();
      played.set(key, blob);
    }
  }
  if (blob) {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      onEnd();
    };
    await audio.play();
    return { stop: () => audio.pause() };
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.onend = onEnd;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return { stop: () => window.speechSynthesis.cancel() };
}
