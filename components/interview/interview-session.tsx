"use client";

import { Check, ChevronRight, Copy, Loader2, PhoneOff, Repeat, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { fill, type InterviewCopy } from "@/lib/interview/copy";
import type { Interviewer, InterviewerCategory, Lang } from "@/lib/interviewers/types";
import type { Criterion, Feedback, QuestionGroup, SourcedSentence } from "@/lib/types";
import { shorten } from "@/lib/text";
import { cn } from "@/lib/utils";
import { AnswerComposer } from "./answer-composer";
import { CallControls, CallStage } from "./call-stage";
import { InterviewerChooser } from "./interviewer-chooser";
import { readMediaChoice, useLocalMedia } from "./media/use-local-media";
import { QuestionPanel } from "./question-panel";
import { useVoice } from "./use-voice";

export interface SessionQuestion {
  id: string;
  group: QuestionGroup;
  label: string; // question type, in the interview's language
  text: string;
  intro: string | null; // what the interviewer says before the question
  outro: string | null; // … and after it
  source: string;
  /** Bank questions: the model answer (general knowledge), or how to build the answer ("method"). */
  model: { text: string; method: boolean } | null;
  suggestedAnswer: SourcedSentence[];
  lastAnswer: { answer: string; feedback: Feedback | null } | null;
}

export interface SessionInterviewer {
  id: string;
  name: string; // in the interview's language
  role: string | null;
  image: string | null;
  notice: string | null; // parody notice, when the interviewer is inspired by someone
}

interface Props {
  interviewId: string;
  offerId: string | null;
  offerTitle: string;
  lang: Lang;
  copy: InterviewCopy; // every text of the call, in the interview's language
  interviewer: SessionInterviewer;
  questions: SessionQuestion[];
  facts: Record<string, string>;
  initialIndex: number;
  voiceLabel: string;
  me: { name: string; imageUrl: string | null };
  submit: (input: { questionId: string; answer: string }) => Promise<{ ok: true; feedback: Feedback } | { ok: false; error: string }>;
  /** Switching interviewer during the call: the catalog and the server action. */
  switcher: {
    categories: InterviewerCategory[];
    interviewers: Interviewer[];
    change: (input: { interviewId: string; interviewerId: string }) => Promise<{ ok: boolean }>;
  };
}

const MAX = 3000;

// A simulated one-to-one video interview with the chosen interviewer, entirely in the interview's
// language: the video (with real microphone and camera controls) on one side, the question in its own
// readable panel on the other, the answer below.
export function InterviewSession(props: Props) {
  const { interviewId, offerId, offerTitle, lang, copy, interviewer, questions, facts, initialIndex, voiceLabel, me, submit, switcher } = props;
  const router = useRouter();
  const [chooserOpen, setChooserOpen] = useState(false);
  const [switching, startSwitch] = useTransition();
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
  const voice = useVoice(lang, copy);
  const media = useLocalMedia({ microphone: false, camera: false }, { meter: false });
  const { restore, start: startMedia } = media;

  // Microphone and camera as chosen on the "Ready to join?" screen.
  useEffect(() => {
    const choice = readMediaChoice();
    if (!choice) return;
    restore(choice);
    if (choice.microphone || choice.camera) void startMedia();
  }, [restore, startMedia]);

  const q = questions.find((x) => x.id === current) ?? questions[0];
  const position = questions.findIndex((x) => x.id === q?.id);
  const done = q ? answers[q.id] : undefined;
  const feedback = retrying === null ? (done?.feedback ?? null) : null;

  useEffect(() => {
    if (feedback) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [feedback, current]);

  if (!q) return <p>—</p>;

  function goTo(id: string) {
    setCurrent(id);
    setDraft("");
    setRetrying(null);
    setShowSuggested(false);
    setSeconds(0);
    setError(null);
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

  /** A switch turned on before the camera / microphone were ever opened opens them. */
  function switchDevice(toggle: () => void) {
    toggle();
    if (media.status === "idle") void media.start();
  }

  const next = questions[position + 1];
  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const summaryHref = `/interview/${interviewId}/summary`;
  const blocked = media.status === "denied" || media.status === "unavailable";

  return (
    <div className="space-y-6" lang={lang}>
      {/* ---------- Header: offer, interviewer ---------- */}
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
          <h1 className="text-3xl leading-tight sm:text-4xl">{fill(copy.callTitle, { name: interviewer.name })}</h1>
          {interviewer.notice && <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{interviewer.notice}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setChooserOpen(true)} disabled={switching}>
            {switching ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Repeat className="size-4" aria-hidden="true" />} {copy.changeInterviewer}
          </Button>
          <Button asChild variant="outline">
            <Link href={summaryHref}>
              <PhoneOff className="size-4" aria-hidden="true" /> {copy.leaveInterview}
            </Link>
          </Button>
        </div>
      </header>
      <InterviewerChooser
        open={chooserOpen}
        onOpenChange={setChooserOpen}
        categories={switcher.categories}
        interviewers={switcher.interviewers}
        selectedId={interviewer.id}
        language={lang}
        t={copy}
        onChoose={(id) => {
          setChooserOpen(false);
          if (id === interviewer.id) return;
          startSwitch(async () => {
            const result = await switcher.change({ interviewId, interviewerId: id });
            if (result.ok) router.refresh();
          });
        }}
      />

      {/* ---------- The call: video + controls, and the question ---------- */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          <CallStage
            interviewer={interviewer}
            me={me}
            self={{ attach: media.attach, live: media.videoLive, microphone: media.microphone }}
            timer={timer}
            speaking={voice.speaking}
            listening={voice.listening}
            copy={copy}
          />
          <CallControls
            microphone={media.microphone}
            camera={media.camera}
            canUseMicrophone={!blocked || media.hasAudio}
            canUseCamera={!blocked || media.hasVideo}
            onMicrophone={() => switchDevice(media.toggleMicrophone)}
            onCamera={() => switchDevice(media.toggleCamera)}
            leaveHref={summaryHref}
            copy={copy}
          />
        </div>
        <QuestionPanel
          question={{ id: q.id, text: q.text, intro: q.intro, outro: q.outro, label: q.label, source: q.source, answered: !!answers[q.id] }}
          position={position}
          questions={questions.map((item) => ({ id: item.id, text: item.text, intro: null, outro: null, label: item.label, source: item.source, answered: !!answers[item.id] }))}
          interviewerName={interviewer.name}
          speaking={voice.speaking}
          voiceLabel={voiceLabel}
          summaryHref={summaryHref}
          copy={copy}
          onRead={() => voice.speak(q.id, [q.intro, q.text, q.outro].filter(Boolean).join(" "))}
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
          microphone={media.microphone}
          pending={pending}
          previousAnswer={retrying}
          status={fill(copy.checking, { name: interviewer.name })}
          error={error}
          note={voice.note}
          hasNext={!!next}
          copy={copy}
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
              <span className="block text-xs font-bold text-terracotta uppercase">{copy.hiddenOnPurpose}</span>
              <span className="font-display text-xl">{q.model ? copy.suggestedTitleWithModel : copy.suggestedTitle}</span>
            </span>
            <span className="shrink-0 text-sm underline">{showSuggested ? copy.hide : copy.show}</span>
          </button>
          {showSuggested && (
            <div className="mt-4 space-y-4">
              {q.model && (
                <div className="rounded-lg border border-earth/15 bg-muted/40 p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase">{q.model.method ? copy.modelMethod : copy.modelAnswer}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{copy.modelNote}</p>
                  <p className="mt-2 text-sm leading-relaxed">{q.model.text}</p>
                </div>
              )}
              {/* Answers built from the candidate's facts: only interviews created before the question banks have them. */}
              {(q.suggestedAnswer.length > 0 || !q.model) && (
                <div>
                  {q.model && <p className="mb-2 text-xs font-bold text-muted-foreground uppercase">{copy.fromYourFacts}</p>}
                  <Sentences sentences={q.suggestedAnswer} facts={facts} empty={copy.suggestedEmpty} copy={copy} />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ---------- Feedback ---------- */}
      {feedback && done && (
        <div className="space-y-5">
          <div className="border-l-4 border-terracotta bg-terracotta-soft p-4 text-sm leading-relaxed">
            <p className="mb-1 text-xs font-bold text-terracotta uppercase">{copy.yourAnswer}</p>
            {done.answer}
          </div>
          <FeedbackPanel feedback={feedback} facts={facts} copy={copy} />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRetrying(done.answer);
                setDraft("");
                setSeconds(0);
              }}
            >
              <RotateCcw className="size-4" aria-hidden="true" /> {copy.retry}
            </Button>
            {next ? (
              <Button onClick={() => goTo(next.id)}>
                {copy.next} <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button asChild>
                <Link href={summaryHref}>{copy.seeSummary}</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Sentences({ sentences, facts, empty, copy }: { sentences: SourcedSentence[]; facts: Record<string, string>; empty: string; copy: InterviewCopy }) {
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
                <X className="size-3" aria-hidden="true" /> {copy.unsupported}
              </span>
            </>
          )}
        </p>
      ))}
    </div>
  );
}

function Row({ label, c, copy }: { label: string; c: Criterion; copy: InterviewCopy }) {
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
          {good ? copy.good : copy.toImprove}
        </span>
        {c.comment}
      </span>
    </div>
  );
}

function FeedbackPanel({ feedback, facts, copy }: { feedback: Feedback; facts: Record<string, string>; copy: InterviewCopy }) {
  const [copied, setCopied] = useState(false);
  const improved = feedback.improvedAnswer.map((s) => s.text).join(" ");
  return (
    <section className="space-y-5 border border-earth/20 bg-card p-5 md:p-7">
      <div>
        <p className="text-xs font-bold text-terracotta uppercase">{copy.coachFeedback}</p>
        <h2 className="mt-1 text-2xl">{copy.howItLands}</h2>
      </div>
      <div>
        <Row label={copy.star} c={feedback.star} copy={copy} />
        <Row label={copy.relevance} c={feedback.relevance} copy={copy} />
        <Row label={copy.evidence} c={feedback.evidence} copy={copy} />
        {feedback.honesty && <Row label={copy.honesty} c={feedback.honesty} copy={copy} />}
      </div>
      {feedback.evidence.claims.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold">{copy.claimsTitle}</p>
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
                    <X className="size-3" aria-hidden="true" /> {copy.notInProfile}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {feedback.honesty && feedback.honesty.learningPlan.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold">{copy.learningPlan}</p>
          <ol className="ml-5 list-decimal space-y-1 text-sm">
            {feedback.honesty.learningPlan.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      <div className="border-t border-earth/10 pt-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold">{copy.improvedAnswer}</p>
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
              <Copy className="size-4" aria-hidden="true" /> {copied ? copy.copied : copy.copy}
            </Button>
          )}
        </div>
        <Sentences sentences={feedback.improvedAnswer} facts={facts} empty={copy.improvedEmpty} copy={copy} />
      </div>
    </section>
  );
}
