import { ChevronRight, Loader2, Mic, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

// Where the candidate answers: typed, or out loud (the transcript lands in the text box, editable).
// Every button here does something; recording has its own, unmistakable state.

interface Props {
  draft: string;
  max: number;
  timer: string;
  overTime: boolean;
  listening: boolean;
  pending: boolean;
  previousAnswer: string | null; // shown during a retry
  status: string | null; // e.g. "Marie is listening…"
  error: string | null;
  note: string | null; // voice notes
  hasNext: boolean;
  onDraft: (value: string) => void;
  onToggleVoice: () => void;
  onSubmit: () => void;
  onNext: () => void;
}

export function AnswerComposer(props: Props) {
  const { draft, max, timer, overTime, listening, pending, previousAnswer, status, error, note, hasNext, onDraft, onToggleVoice, onSubmit, onNext } = props;
  return (
    <section className="rounded-xl border border-earth/20 bg-card p-5 shadow-soft sm:p-6" aria-labelledby="answer-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="answer-title" className="font-sans text-lg font-bold">
          Your answer
        </h2>
        <p className="text-xs text-muted-foreground tabular-nums">
          {timer}
          {overTime ? " · aim for about 2 minutes" : ""} · {draft.length}/{max}
        </p>
      </div>

      {previousAnswer !== null && (
        <p className="mb-3 rounded-md border border-earth/15 bg-muted p-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Previous answer:</strong> {previousAnswer}
        </p>
      )}

      <label htmlFor="answer" className="sr-only">
        Your answer
      </label>
      <textarea
        id="answer"
        rows={5}
        maxLength={max}
        value={draft}
        onChange={(e) => onDraft(e.target.value)}
        placeholder="Type your answer here, or answer out loud: your words appear in this box."
        className="w-full rounded-md border border-input bg-background p-3 text-base leading-relaxed placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      />

      {listening && (
        <p className="mt-3 flex items-center gap-2 rounded-md border border-gap/30 bg-gap-soft px-3 py-2 text-sm font-semibold text-gap" role="status">
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-gap opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-gap" />
          </span>
          Recording — speak now. Press “Stop recording” when you are done.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button variant={listening ? "destructive" : "outline"} onClick={onToggleVoice} disabled={pending} aria-pressed={listening}>
          {listening ? <Square className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
          {listening ? "Stop recording" : "Answer out loud"}
        </Button>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
          {hasNext && (
            <Button variant="ghost" onClick={onNext} disabled={pending}>
              Skip to the next question <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          )}
          <Button size="lg" onClick={onSubmit} disabled={pending || listening || draft.trim().length === 0}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />} Submit answer
          </Button>
        </div>
      </div>

      <p className="mt-3 min-h-5 text-sm" aria-live="polite">
        {pending && status && <span className="text-muted-foreground">{status}</span>}
        {error && <span className="font-semibold text-destructive">{error}</span>}
        {!error && note && <span className="text-muted-foreground">{note}</span>}
      </p>
    </section>
  );
}
