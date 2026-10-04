"use client";

import { Check, ChevronRight, Copy, PhoneOff, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { Criterion, Feedback, QuestionGroup, SourcedSentence } from "@/lib/types";
import { shorten } from "@/lib/text";
import { cn } from "@/lib/utils";
import { AnswerComposer } from "./answer-composer";
import { CallStage } from "./call-stage";
import { QuestionPanel } from "./question-panel";
import { useVoice } from "./use-voice";

export interface SessionQuestion {
  id: string;
  group: QuestionGroup;
  label: string; // question type shown on the call ("Motivation", "Technical"…)
  text: string;
  source: string;
  suggestedAnswer: SourcedSentence[];
  lastAnswer: { answer: string; feedback: Feedback | null } | null;
}

export interface SessionInterviewer {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
  notice: string | null; // parody notice, when the interviewer is inspired by someone
}

type Focus = "both" | "hr" | "technical";

interface Props {
  interviewId: string;
  offerId: string | null;
  offerTitle: string;
  interviewer: SessionInterviewer;
  questions: SessionQuestion[];
  facts: Record<string, string>;
  initialIndex: number;
  language: string | null;
  voiceLabel: string;
  me: { name: string; imageUrl: string | null };
  submit: (input: { questionId: string; answer: string }) => Promise<{ ok: true; feedback: Feedback } | { ok: false; error: string }>;
}

const MAX = 3000;
const inFocus = (focus: Focus, group: QuestionGroup) => focus === "both" || (focus === "hr" ? group === "hr" : group !== "hr");

// A simulated one-to-one video interview with the chosen interviewer: the video on one side, the
// question in its own readable panel on the other, the answer below. Focus on general HR questions,
// technical ones (with gaps), or both.
export function InterviewSession(props: Props) {
  const { interviewId, offerId, offerTitle, interviewer, questions, facts, initialIndex, language, voiceLabel, me, submit } = props;
  const [focus, setFocus] = useState<Focus>("both");
  const [current, setCurrent] = useState(questions[initialIndex]?.id ?? questions[0]?.id);
  const [answers, setAnswers] = useState<Record<string, { answer: string; feedback: Feedback | null }>>(() =>
    Object.fromEntries(questions.filter((q) => q.lastAnswer).map((q) => [q.id, q.lastAnswer!])),
  );
  const [draft, setDraft] = useState("");
  const [retrying, setRetrying] = useState<string | null>(null); // previous answer shown during a retry
  const [showSuggested, setShowSuggested] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const voice = useVoice(language);

  const visible = questions.filter((q) => inFocus(focus, q.group));
  const q = questions.find((x) => x.id === current) ?? visible[0];
  const position = visible.findIndex((x) => x.id === q?.id);
  const done = q ? answers[q.id] : undefined;
  const feedback = retrying === null ? (done?.feedback ?? null) : null;

  useEffect(() => {
    if (feedback) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [feedback, current]);

  if (!q) return <p>No questions in this interview.</p>;

  function goTo(id: string) {
    setCurrent(id);
    setDraft("");
    setRetrying(null);
    setShowSuggested(false);
    setSeconds(0);
    setError(null);
  }

  function changeFocus(nextFocus: Focus) {
    setFocus(nextFocus);
    const first = questions.find((x) => inFocus(nextFocus, x.group));
    if (q && !inFocus(nextFocus, q.group) && first) goTo(first.id);
  }

  function submitAnswer() {
    setError(null);
    const answer = draft.trim();
    const questionId = q.id;
    startTransition(async () => {
      const result = await submit({ questionId, answer });
      if (result.ok) {
        setAnswers((a) => ({ ...a, [questionId]: { answer, feedback: result.feedback } }));
        setRetrying(null);
        setDraft("");
      } else setError(result.error);
    });
  }

  const next = visible[position + 1];
  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const counts = { both: questions.length, hr: questions.filter((x) => x.group === "hr").length, technical: questions.filter((x) => x.group !== "hr").length };
  const summaryHref = `/interview/${interviewId}/summary`;

  return (
    <div className="space-y-6">
      {/* ---------- Header: offer, interviewer, focus ---------- */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {offerId ? (
              <Link href={`/offers/${offerId}`} className="hover:text-foreground">
                {offerTitle}
              </Link>
            ) : (
              offerTitle
            )}
          </p>
          <h1 className="text-3xl leading-tight sm:text-4xl">Interview with {interviewer.name}</h1>
          {interviewer.notice && <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{interviewer.notice}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1" role="group" aria-label="Focus of the questions">
            {(["hr", "technical", "both"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={focus === f ? "default" : "ghost"}
                className={focus === f ? "bg-earth text-earth-foreground hover:bg-earth/90" : ""}
                aria-pressed={focus === f}
                onClick={() => changeFocus(f)}
              >
                {f === "hr" ? "General HR" : f === "technical" ? "Technical" : "Both"}
                <span className="opacity-60">{counts[f]}</span>
              </Button>
            ))}
          </div>
          <Button asChild variant="outline">
            <Link href={summaryHref}>
              <PhoneOff className="size-4" aria-hidden="true" /> Leave the interview
            </Link>
          </Button>
        </div>
      </header>

      {/* ---------- The call: video + question ---------- */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <CallStage interviewer={interviewer} me={me} timer={timer} speaking={voice.speaking} listening={voice.listening} />
        <QuestionPanel
          question={{ id: q.id, text: q.text, label: q.label, source: q.source, answered: !!answers[q.id] }}
          position={position}
          questions={visible.map((item) => ({ id: item.id, text: item.text, label: item.label, source: item.source, answered: !!answers[item.id] }))}
          interviewerName={interviewer.name}
          speaking={voice.speaking}
          voiceLabel={voiceLabel}
          summaryHref={summaryHref}
          onRead={() => voice.speak(q.id, q.text)}
          onSelect={goTo}
        />
      </div>

      {/* ---------- Answer ---------- */}
      {!feedback && (
        <AnswerComposer
          draft={draft}
          max={MAX}
          timer={timer}
          overTime={seconds >= 120}
          listening={voice.listening}
          pending={pending}
          previousAnswer={retrying}
          status={`${interviewer.name} is listening… checking every claim against your profile.`}
          error={error}
          note={voice.note}
          hasNext={!!next}
          onDraft={setDraft}
          onToggleVoice={() => voice.toggleListening((text) => setDraft((d) => (d ? `${d} ${text}` : text).slice(0, MAX)))}
          onSubmit={submitAnswer}
          onNext={() => next && goTo(next.id)}
        />
      )}

      {/* ---------- Suggested answer ---------- */}
      {!feedback && (
        <section className="border border-earth/20 bg-card p-5">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left"
            onClick={() => setShowSuggested((s) => !s)}
            aria-expanded={showSuggested}
          >
            <span>
              <span className="block text-xs font-bold text-terracotta uppercase">Hidden on purpose</span>
              <span className="font-display text-xl">Suggested answer, built only from your validated facts</span>
            </span>
            <span className="shrink-0 text-sm underline">{showSuggested ? "Hide" : "Show"}</span>
          </button>
          {showSuggested && (
            <div className="mt-4">
              <Sentences sentences={q.suggestedAnswer} facts={facts} empty="No validated fact supports an answer yet: add facts to your profile." />
            </div>
          )}
        </section>
      )}

      {/* ---------- Feedback ---------- */}
      {feedback && done && (
        <div className="space-y-5">
          <div className="border-l-4 border-terracotta bg-terracotta-soft p-4 text-sm leading-relaxed">
            <p className="mb-1 text-xs font-bold text-terracotta uppercase">Your answer</p>
            {done.answer}
          </div>
          <FeedbackPanel feedback={feedback} facts={facts} />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRetrying(done.answer);
                setDraft("");
                setSeconds(0);
              }}
            >
              <RotateCcw className="size-4" aria-hidden="true" /> Retry this question
            </Button>
            {next ? (
              <Button onClick={() => goTo(next.id)}>
                Next question <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button asChild>
                <Link href={summaryHref}>See the summary</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Sentences({ sentences, facts, empty }: { sentences: SourcedSentence[]; facts: Record<string, string>; empty: string }) {
  if (sentences.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-col gap-2 text-sm leading-relaxed">
      {sentences.map((s, i) => (
        <p key={i}>
          {s.factIds.length > 0 ? (
            <>
              {s.text}
              {s.factIds.map((id) => (
                <span
                  key={id}
                  title={facts[id]}
                  className="ml-1 inline-flex max-w-full items-center gap-1 rounded-full border border-success/30 bg-success-soft px-2 py-0.5 align-middle text-xs font-medium"
                >
                  <Check className="size-3 shrink-0 text-success" aria-hidden="true" />
                  <span className="truncate">{shorten(facts[id] ?? "fact", 32)}</span>
                </span>
              ))}
            </>
          ) : (
            <>
              <span className="unsupported-underline">{s.text}</span>{" "}
              <span className="inline-flex items-center gap-1 rounded-full bg-gap-soft px-2 py-0.5 align-middle text-xs font-medium text-gap">
                <X className="size-3" aria-hidden="true" /> Unsupported
              </span>
            </>
          )}
        </p>
      ))}
    </div>
  );
}

function Row({ label, c }: { label: string; c: Criterion }) {
  const good = c.rating === "good";
  return (
    <div className="grid gap-1 border-b border-earth/10 py-3 last:border-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
      <span className="text-sm font-bold">{label}</span>
      <span className="flex items-start gap-2 text-sm">
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            good ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
          )}
        >
          {good ? <Check className="size-3" aria-hidden="true" /> : <RotateCcw className="size-3" aria-hidden="true" />}
          {good ? "Good" : "To improve"}
        </span>
        {c.comment}
      </span>
    </div>
  );
}

function FeedbackPanel({ feedback, facts }: { feedback: Feedback; facts: Record<string, string> }) {
  const [copied, setCopied] = useState(false);
  const improved = feedback.improvedAnswer.map((s) => s.text).join(" ");
  return (
    <section className="space-y-5 border border-earth/20 bg-card p-5 md:p-7">
      <div>
        <p className="text-xs font-bold text-terracotta uppercase">Coach feedback</p>
        <h2 className="mt-1 text-2xl">How this answer lands</h2>
      </div>
      <div>
        <Row label="STAR structure" c={feedback.star} />
        <Row label="Relevance" c={feedback.relevance} />
        <Row label="Evidence" c={feedback.evidence} />
        {feedback.honesty && <Row label="Honesty" c={feedback.honesty} />}
      </div>
      {feedback.evidence.claims.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold">What you claimed (quoted from your answer)</p>
          <ul className="space-y-2">
            {feedback.evidence.claims.map((claim, i) => (
              <li key={i} className="text-sm">
                “{claim.quote}”{" "}
                {claim.factId ? (
                  <span
                    title={facts[claim.factId]}
                    className="ml-1 inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-soft px-2 py-0.5 align-middle text-xs font-medium"
                  >
                    <Check className="size-3 text-success" aria-hidden="true" /> {shorten(facts[claim.factId] ?? "fact", 36)}
                  </span>
                ) : (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-gap-soft px-2 py-0.5 align-middle text-xs font-medium text-gap">
                    <X className="size-3" aria-hidden="true" /> Not in your profile – add it as a fact if true, otherwise don&apos;t say it
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {feedback.honesty && feedback.honesty.learningPlan.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold">Learning plan</p>
          <ol className="ml-5 list-decimal space-y-1 text-sm">
            {feedback.honesty.learningPlan.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      <div className="border-t border-earth/10 pt-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold">Improved answer, only from your facts</p>
          {improved && (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await navigator.clipboard.writeText(improved);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }}
            >
              <Copy className="size-4" aria-hidden="true" /> {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>
        <Sentences sentences={feedback.improvedAnswer} facts={facts} empty="Not enough validated facts to build an improved answer." />
      </div>
    </section>
  );
}
