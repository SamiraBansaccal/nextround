"use client";

import { Check, ChevronRight, Clock, Loader2, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Criterion, Feedback, QuestionGroup, SourcedSentence } from "@/lib/types";
import { VoiceControls } from "./voice-controls";

export interface SessionQuestion {
  id: string;
  group: QuestionGroup;
  text: string;
  source: string;
  suggestedAnswer: SourcedSentence[];
  lastAnswer: { answer: string; feedback: Feedback | null } | null;
}

interface Props {
  interviewId: string;
  offerTitle: string;
  questions: SessionQuestion[];
  facts: Record<string, string>;
  initialIndex: number;
  language: string | null;
  voiceLabel: string;
  submit: (input: { questionId: string; answer: string }) => Promise<{ ok: true; feedback: Feedback } | { ok: false; error: string }>;
}

const MAX = 3000;
const GROUP_LABEL: Record<QuestionGroup, string> = { hr: "HR", technical: "Technical", gap: "Gap" };

export function InterviewSession({ interviewId, offerTitle, questions, facts, initialIndex, language, voiceLabel, submit }: Props) {
  const [idx, setIdx] = useState(initialIndex);
  const q = questions[idx];
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(q?.lastAnswer?.feedback ?? null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(q?.lastAnswer?.answer ?? null);
  const [showSuggested, setShowSuggested] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (feedback) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [feedback, idx]);

  if (!q) return <p>No questions.</p>;

  function goTo(i: number) {
    const next = questions[i];
    setIdx(i);
    setAnswer("");
    setFeedback(next?.lastAnswer?.feedback ?? null);
    setSubmitted(next?.lastAnswer?.answer ?? null);
    setPrevious(null);
    setShowSuggested(false);
    setSeconds(0);
    setError(null);
  }

  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{offerTitle}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Question {idx + 1} of {questions.length}
          </h1>
        </div>
        <span className={`flex items-center gap-1 text-sm ${seconds >= 120 && !feedback ? "text-warning" : "text-muted-foreground"}`}>
          <Clock className="size-4" aria-hidden="true" /> {timer} {seconds >= 120 && !feedback ? "· aim for about 2 minutes" : ""}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted" aria-hidden="true">
        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
      </div>

      <section className="relative overflow-hidden rounded-lg bg-earth" aria-label="Simulated video interview">
        <Image
          src="/brand/recruiter-video-call.jpg"
          width={1536}
          height={1024}
          alt="Simulated recruiter in a video call"
          priority
          className="h-56 w-full object-cover object-top opacity-90 sm:h-72"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth/95 to-transparent p-4 text-earth-foreground">
          <p className="text-xs tracking-wide uppercase opacity-80">Simulated recruiter</p>
          <p className="font-display text-lg leading-snug sm:text-xl">{q.text}</p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant={q.group === "gap" ? "destructive" : "secondary"}>{GROUP_LABEL[q.group]}</Badge>
          </div>
          <CardTitle className="text-xl leading-snug">{q.text}</CardTitle>
          <p className="text-xs text-muted-foreground">Why this question: {q.source}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {previous !== null && (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Your previous answer</p>
              <p className="whitespace-pre-wrap">{previous}</p>
            </div>
          )}
          {!feedback ? (
            <>
              <VoiceControls
                key={q.id}
                questionId={q.id}
                questionText={q.text}
                language={language}
                voiceLabel={voiceLabel}
                disabled={pending}
                onTranscript={(text) => setAnswer((a) => (a ? `${a} ${text}` : text).slice(0, MAX))}
              />
              <textarea
                className="min-h-40 w-full rounded-md border bg-transparent p-3 text-sm"
                placeholder="Type your answer as you would say it in the interview"
                value={answer}
                maxLength={MAX}
                onChange={(e) => setAnswer(e.target.value)}
                aria-label="Your answer"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {answer.length}/{MAX}
                </span>
                <Button
                  disabled={pending || answer.trim().length === 0}
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      const result = await submit({ questionId: q.id, answer: answer.trim() });
                      if (result.ok) {
                        setFeedback(result.feedback);
                        setSubmitted(answer.trim());
                      } else setError(result.error);
                    });
                  }}
                >
                  {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Get feedback
                </Button>
              </div>
              {pending && <p className="text-sm text-muted-foreground">Analysing your answer and checking every claim against your profile…</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </>
          ) : (
            submitted && (
              <div className="rounded-md border p-3 text-sm">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Your answer</p>
                <p className="whitespace-pre-wrap">{submitted}</p>
              </div>
            )
          )}

          <button type="button" className="w-fit text-sm underline" onClick={() => setShowSuggested((s) => !s)}>
            {showSuggested ? "Hide" : "Show"} the suggested answer (built only from your validated facts)
          </button>
          {showSuggested && <Sentences sentences={q.suggestedAnswer} facts={facts} empty="No validated fact supports an answer yet: add facts to your profile." />}
        </CardContent>
      </Card>

      {feedback && <FeedbackPanel feedback={feedback} facts={facts} />}

      <div className="flex flex-wrap gap-2">
        {feedback && (
          <Button
            variant="outline"
            onClick={() => {
              setPrevious(submitted);
              setFeedback(null);
              setAnswer("");
              setSeconds(0);
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Retry this question
          </Button>
        )}
        {idx + 1 < questions.length ? (
          <Button onClick={() => goTo(idx + 1)}>
            Next question <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button asChild>
            <Link href={`/interview/${interviewId}/summary`}>See the summary</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function Sentences({ sentences, facts, empty }: { sentences: SourcedSentence[]; facts: Record<string, string>; empty: string }) {
  if (sentences.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      {sentences.map((s, i) => (
        <p key={i}>
          {s.factIds.length > 0 ? (
            <>
              {s.text}{" "}
              {s.factIds.map((id) => (
                <span key={id} title={facts[id]} className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-success/30 bg-success-soft px-1.5 text-xs text-foreground">
                  <Check className="size-3" aria-hidden="true" /> {(facts[id] ?? "fact").slice(0, 28)}
                </span>
              ))}
            </>
          ) : (
            <span className="unsupported-underline">
              {s.text}{" "}
              <span className="ml-1 rounded bg-gap-soft px-1.5 text-xs text-gap">✗ Unsupported</span>
            </span>
          )}
        </p>
      ))}
    </div>
  );
}

function Row({ label, c }: { label: string; c: Criterion }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="w-28 shrink-0 text-sm font-medium">{label}</span>
      <span className="flex items-start gap-2 text-sm">
        <Badge variant={c.rating === "good" ? "secondary" : "outline"} className={c.rating === "good" ? "" : "border-warning text-warning"}>
          {c.rating === "good" ? <Check className="size-3" aria-hidden="true" /> : <RotateCcw className="size-3" aria-hidden="true" />}
          {c.rating === "good" ? "Good" : "To improve"}
        </Badge>
        {c.comment}
      </span>
    </div>
  );
}

function FeedbackPanel({ feedback, facts }: { feedback: Feedback; facts: Record<string, string> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Feedback</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Row label="STAR" c={feedback.star} />
          <Row label="Relevance" c={feedback.relevance} />
          <Row label="Evidence" c={feedback.evidence} />
          {feedback.honesty && <Row label="Honesty" c={feedback.honesty} />}
        </div>
        {feedback.evidence.claims.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium">What you claimed (quoted from your answer)</p>
            {feedback.evidence.claims.map((claim, i) => (
              <p key={i} className="text-sm">
                “{claim.quote}”{" "}
                {claim.factId ? (
                  <span title={facts[claim.factId]} className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-success/30 bg-success-soft px-1.5 text-xs text-foreground">
                    <Check className="size-3" aria-hidden="true" /> {(facts[claim.factId] ?? "fact").slice(0, 32)}
                  </span>
                ) : (
                  <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-gap-soft px-1.5 text-xs text-gap">
                    <X className="size-3" aria-hidden="true" /> Not in your profile – add it as a fact if true, otherwise don&apos;t say it
                  </span>
                )}
              </p>
            ))}
          </div>
        )}
        {feedback.honesty && feedback.honesty.learningPlan.length > 0 && (
          <div>
            <p className="text-sm font-medium">Learning plan</p>
            <ol className="ml-5 list-decimal text-sm">
              {feedback.honesty.learningPlan.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">Improved answer (only from your facts)</p>
          <Sentences sentences={feedback.improvedAnswer} facts={facts} empty="Not enough validated facts to build an improved answer." />
        </div>
      </CardContent>
    </Card>
  );
}
