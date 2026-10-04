"use client";

import { Check, ChevronRight, Copy, Lightbulb, Loader2, Mic, MicOff, PhoneOff, RotateCcw, Send, Sparkles, Volume2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { Criterion, Feedback, QuestionGroup, SourcedSentence } from "@/lib/types";
import { shorten } from "@/lib/text";
import { cn } from "@/lib/utils";
import { useVoice } from "./use-voice";

export interface SessionQuestion {
  id: string;
  group: QuestionGroup;
  text: string;
  source: string;
  suggestedAnswer: SourcedSentence[];
  lastAnswer: { answer: string; feedback: Feedback | null } | null;
}

type Focus = "both" | "hr" | "technical";

interface Props {
  interviewId: string;
  offerId: string | null;
  offerTitle: string;
  questions: SessionQuestion[];
  facts: Record<string, string>;
  initialIndex: number;
  language: string | null;
  voiceLabel: string;
  me: { name: string; imageUrl: string | null };
  submit: (input: { questionId: string; answer: string }) => Promise<{ ok: true; feedback: Feedback } | { ok: false; error: string }>;
}

const MAX = 3000;
const GROUP_LABEL: Record<QuestionGroup, string> = { hr: "General HR", technical: "Technical", gap: "Technical · gap" };
const inFocus = (focus: Focus, group: QuestionGroup) => focus === "both" || (focus === "hr" ? group === "hr" : group !== "hr");

// One-to-one video call (Teams / Slack style, design from the Lovable prototype) with a simulated
// recruiter. Focus on general HR questions, technical ones (with gaps), or both.
export function InterviewSession(props: Props) {
  const { interviewId, offerId, offerTitle, questions, facts, initialIndex, language, voiceLabel, me, submit } = props;
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

  const next = visible[position + 1];
  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const counts = { both: questions.length, hr: questions.filter((x) => x.group === "hr").length, technical: questions.filter((x) => x.group !== "hr").length };

  return (
    <div className="space-y-6">
      {/* ---------- Header: offer + focus ---------- */}
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
          <h1 className="text-3xl leading-tight sm:text-4xl">Interview practice</h1>
        </div>
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
      </header>

      {/* ---------- The call ---------- */}
      <section
        className="overflow-hidden rounded-xl bg-earth text-earth-foreground shadow-[0_24px_70px_-28px_color-mix(in_oklab,var(--earth)_70%,transparent)]"
        aria-label="Simulated video interview"
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="relative min-h-[460px] overflow-hidden sm:min-h-[540px]">
            <Image
              src="/brand/recruiter-video-call.jpg"
              fill
              priority
              sizes="(min-width: 1024px) 70vw, 100vw"
              alt="Marie, the simulated recruiter, in a video call"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-earth/55 via-earth/5 to-earth" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-6">
              <div className="flex items-center gap-2 rounded-full border border-earth-foreground/20 bg-earth/65 px-3 py-2 text-sm backdrop-blur-md">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-terracotta opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-terracotta" />
                </span>
                <span className="font-semibold">Practice live</span>
                <span className="text-earth-foreground/65">·</span>
                <span>{timer}</span>
                {seconds >= 120 && !feedback && <span className="text-earth-foreground/65">· aim for ~2 min</span>}
              </div>
              <div className="rounded-md border border-earth-foreground/20 bg-earth/65 px-3 py-2 text-right backdrop-blur-md">
                <p className="text-[10px] font-bold text-earth-foreground/60 uppercase">
                  Question {position + 1} of {visible.length}
                </p>
                <p className="text-sm font-semibold">{GROUP_LABEL[q.group]}</p>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 left-0 p-4 pb-24 md:p-7 md:pb-28 lg:pr-52">
              <div className="mb-3 flex items-center gap-2 text-earth-foreground drop-shadow">
                {voice.speaking ? (
                  <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="w-1 animate-pulse rounded-full bg-terracotta" style={{ height: `${6 + ((i * 5) % 8)}px`, animationDelay: `${i * 120}ms` }} />
                    ))}
                  </span>
                ) : (
                  <span className="size-2 rounded-full bg-terracotta" />
                )}
                <span className="text-sm font-bold">{voice.speaking ? "Marie is speaking…" : "Marie is asking"}</span>
              </div>
              <h2 className="max-w-3xl text-2xl leading-snug text-earth-foreground drop-shadow md:text-4xl">“{q.text}”</h2>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-earth-foreground/75">
                <Lightbulb className="size-4" aria-hidden="true" />
                {q.source}
              </p>
            </div>

            {/* Self view */}
            <div className="absolute top-24 right-4 z-10 w-24 overflow-hidden rounded-md border-2 border-earth-foreground/25 bg-earth shadow-xl md:top-auto md:right-6 md:bottom-6 md:w-40">
              <div className="grid aspect-video place-items-center bg-primary-soft">
                {me.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote avatar from Clerk
                  <img src={me.imageUrl} alt="" className="size-8 rounded-full object-cover md:size-12" />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground md:size-12 md:text-sm">
                    {me.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute bottom-1.5 left-2 flex items-center gap-1 text-[10px] font-bold">
                {voice.listening ? <Mic className="size-3 text-terracotta" aria-hidden="true" /> : <MicOff className="size-3 opacity-60" aria-hidden="true" />} You
              </span>
            </div>

            {/* Call controls */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-earth-foreground/15 bg-earth/85 p-2 shadow-xl backdrop-blur-md md:bottom-6">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "rounded-full text-earth-foreground hover:bg-earth-foreground/10 hover:text-earth-foreground",
                  voice.listening && "bg-terracotta hover:bg-terracotta/90",
                )}
                disabled={!!feedback || pending}
                onClick={() => voice.toggleListening((text) => setDraft((d) => (d ? `${d} ${text}` : text).slice(0, MAX)))}
                aria-label={voice.listening ? "Stop dictating" : "Answer by voice"}
                title={voice.listening ? "Stop dictating" : "Answer by voice"}
              >
                {voice.listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-earth-foreground hover:bg-earth-foreground/10 hover:text-earth-foreground"
                disabled={voice.speaking}
                onClick={() => voice.speak(q.id, q.text)}
                aria-label="Read the question aloud"
                title={`Read the question aloud (${voiceLabel})`}
              >
                <Volume2 className="size-5" />
              </Button>
              {next && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full text-earth-foreground hover:bg-earth-foreground/10 hover:text-earth-foreground"
                  onClick={() => goTo(next.id)}
                  aria-label="Next question"
                  title="Next question"
                >
                  <ChevronRight className="size-5" />
                </Button>
              )}
              <Button asChild size="icon" variant="destructive" className="rounded-full" aria-label="Leave the call and see the summary" title="Leave the call">
                <Link href={`/interview/${interviewId}/summary`}>
                  <PhoneOff className="size-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Question list */}
          <aside className="max-h-[540px] overflow-y-auto border-t border-earth-foreground/10 bg-earth p-5 lg:border-t-0 lg:border-l" aria-label="Interview questions">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-terracotta uppercase">Practice route</p>
                <h3 className="mt-1 text-xl text-earth-foreground">Questions</h3>
              </div>
              <Sparkles className="size-5 text-terracotta" aria-hidden="true" />
            </div>
            <ol className="space-y-1">
              {visible.map((item, i) => {
                const active = item.id === q.id;
                const answered = !!answers[item.id];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goTo(item.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-earth-foreground/10",
                        active ? "bg-earth-foreground/10 text-earth-foreground" : "text-earth-foreground/70",
                      )}
                      aria-current={active ? "step" : undefined}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10px]",
                          answered ? "border-success bg-success text-earth-foreground" : "border-earth-foreground/30",
                        )}
                      >
                        {answered ? <Check className="size-3" aria-hidden="true" /> : i + 1}
                      </span>
                      <span>
                        <span className="block text-[10px] font-bold text-earth-foreground/50 uppercase">{GROUP_LABEL[item.group]}</span>
                        <span className="line-clamp-2">{item.text}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <Link
              href={`/interview/${interviewId}/summary`}
              className="mt-6 block border-t border-earth-foreground/10 pt-4 text-sm text-earth-foreground/70 hover:text-earth-foreground"
            >
              Finish and see the summary →
            </Link>
          </aside>
        </div>

        {/* Answer composer */}
        {!feedback && (
          <div className="border-t border-earth-foreground/10 bg-earth px-4 py-5 md:px-7">
            {retrying !== null && (
              <div className="mb-4 rounded-md border border-earth-foreground/15 bg-earth-foreground/5 p-3 text-sm text-earth-foreground/70">
                <strong className="text-earth-foreground">Previous answer:</strong> {retrying}
              </div>
            )}
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label htmlFor="answer" className="text-sm font-bold">
                    Your answer
                  </label>
                  <span className="text-xs text-earth-foreground/60">
                    {voice.listening ? "● listening — speak, then press the mic again" : `${draft.length}/${MAX}`}
                  </span>
                </div>
                <textarea
                  id="answer"
                  rows={3}
                  maxLength={MAX}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Take a breath. Answer in your own words — or press the mic and speak."
                  className="w-full rounded-md border border-earth-foreground/20 bg-earth-foreground/5 p-3 text-sm text-earth-foreground placeholder:text-earth-foreground/40 focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:outline-none"
                />
              </div>
              <Button
                size="lg"
                className="bg-terracotta text-earth-foreground hover:bg-terracotta/90"
                disabled={pending || draft.trim().length === 0}
                onClick={() => {
                  setError(null);
                  const answer = draft.trim();
                  startTransition(async () => {
                    const result = await submit({ questionId: q.id, answer });
                    if (result.ok) {
                      setAnswers((a) => ({ ...a, [q.id]: { answer, feedback: result.feedback } }));
                      setRetrying(null);
                      setDraft("");
                    } else setError(result.error);
                  });
                }}
              >
                {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />} Submit answer
              </Button>
            </div>
            <p className="mt-2 min-h-5 text-sm" aria-live="polite">
              {pending && <span className="text-earth-foreground/70">Marie is listening… checking every claim against your profile.</span>}
              {error && <span className="font-semibold text-earth-foreground">{error}</span>}
              {voice.note && <span className="text-earth-foreground/70">{voice.note}</span>}
            </p>
          </div>
        )}
      </section>

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
                <Link href={`/interview/${interviewId}/summary`}>See the summary</Link>
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
