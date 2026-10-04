import { Check, ChevronDown, Lightbulb, Volume2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fill } from "@/lib/interview/copy";
import { cn } from "@/lib/utils";

// The question being asked, in its own panel next to the video: dark text on a light card, large
// type, so it stays readable whatever the interviewer's picture looks like.

export interface PanelQuestion {
  id: string;
  text: string;
  label: string; // "Motivation", "Technique"…, already in the interview's language
  source: string;
  answered: boolean;
}

interface PanelCopy {
  questionOf: string;
  progress: string;
  asks: string;
  readAloud: string;
  speaking: string;
  voice: string;
  allQuestions: string;
  finish: string;
}

interface Props {
  question: PanelQuestion;
  position: number; // 0-based
  questions: PanelQuestion[];
  interviewerName: string;
  speaking: boolean;
  voiceLabel: string;
  summaryHref: string;
  copy: PanelCopy;
  onRead: () => void;
  onSelect: (id: string) => void;
}

export function QuestionPanel({ question, position, questions, interviewerName, speaking, voiceLabel, summaryHref, copy, onRead, onSelect }: Props) {
  const total = questions.length;
  return (
    <aside className="flex flex-col rounded-xl border border-earth/20 bg-card p-5 shadow-soft sm:p-6" aria-labelledby="question-heading">
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground uppercase">
        <span id="question-heading">{fill(copy.questionOf, { n: position + 1, total })}</span>
        <span className="rounded-full bg-terracotta-soft px-2.5 py-1 text-terracotta normal-case">{question.label}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-muted" role="progressbar" aria-valuenow={position + 1} aria-valuemin={1} aria-valuemax={total} aria-label={copy.progress}>
        <div className="h-1.5 rounded-full bg-primary transition-[width]" style={{ width: `${((position + 1) / total) * 100}%` }} />
      </div>

      <p className="mt-5 text-xs font-semibold text-muted-foreground">{fill(copy.asks, { name: interviewerName })}</p>
      <h2 className="mt-1 text-2xl leading-snug text-foreground sm:text-[1.75rem]">{question.text}</h2>
      <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
        <Lightbulb className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {question.source}
      </p>

      <Button variant="outline" className="mt-5 w-full" onClick={onRead} disabled={speaking}>
        <Volume2 className="size-4" aria-hidden="true" /> {speaking ? fill(copy.speaking, { name: interviewerName }) : copy.readAloud}
      </Button>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">{fill(copy.voice, { voice: voiceLabel })}</p>

      <details className="group mt-5 border-t border-earth/15 pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
          {copy.allQuestions}
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <ol className="mt-3 space-y-1">
          {questions.map((item, i) => {
            const active = item.id === question.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn("flex w-full items-start gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted", active ? "bg-muted font-medium" : "text-muted-foreground")}
                  aria-current={active ? "step" : undefined}
                >
                  <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10px]", item.answered ? "border-success bg-success text-white" : "border-earth/30")}>
                    {item.answered ? <Check className="size-3" aria-hidden="true" /> : i + 1}
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase opacity-70">{item.label}</span>
                    <span className="line-clamp-2">{item.text}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <Link href={summaryHref} className="mt-3 block text-sm text-primary hover:underline">
          {copy.finish}
        </Link>
      </details>
    </aside>
  );
}
