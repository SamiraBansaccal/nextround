"use client";

import { ArrowLeft, ArrowRight, Check, Code2, Layers, Loader2, MessagesSquare, Mic, MicOff, PhoneCall, UserRound, Video, VideoOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { fill, type InterviewCopy, LANGUAGES } from "@/lib/interview/copy";
import type { InterviewKind } from "@/lib/interview/practice";
import type { Focus } from "@/lib/interview/session";
import type { Interviewer, InterviewerCategory, Lang } from "@/lib/interviewers/types";
import { cn } from "@/lib/utils";
import { InterviewerAvatar } from "./interviewer-avatar";
import { InterviewerBrowser } from "./interviewer-chooser";
import { InterviewerProfile } from "./interviewer-profile";
import { SelfPreview } from "./media/self-preview";
import { saveMediaChoice, useLocalMedia } from "./media/use-local-media";

// Before the call, in two steps: choose the interviewer (with the interview's language and, for an
// offer, which questions), then check the camera and microphone and start. The camera is only opened
// at the second step. The screen switches to the interview's language, like the whole interview.

export interface SetupContext {
  kind: InterviewKind;
  offerId: string | null;
  topic: string | null; // technology interviews: "track:<id>" or "tech:<id>"
  title: string; // what the interview is about: the offer, the technology, or "HR interview"
}

interface Props {
  context: SetupContext;
  me: { name: string; imageUrl: string | null };
  categories: InterviewerCategory[];
  interviewers: Interviewer[];
  defaultInterviewerId: string;
  defaultLanguage: Lang;
  copies: Record<Lang, InterviewCopy>;
  start: (input: { kind: InterviewKind; offerId: string | null; topic: string | null; interviewerId: string; language: Lang; focus: Focus }) => Promise<{ ok: true; interviewId: string } | { ok: false; error: string }>;
}

export function InterviewSetup({ context, me, categories, interviewers, defaultInterviewerId, defaultLanguage, copies, start }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"interviewer" | "devices">("interviewer");
  const [language, setLanguage] = useState<Lang>(defaultLanguage);
  const [focus, setFocus] = useState<Focus>("both");
  const [interviewerId, setInterviewerId] = useState(defaultInterviewerId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const media = useLocalMedia({ microphone: true, camera: true });
  const t = copies[language];
  const interviewer = interviewers.find((i) => i.id === interviewerId) ?? interviewers[0];
  const copy = interviewer.copy[language];
  const { start: startMedia, stop: stopMedia } = media;

  // The camera and microphone are only asked for at the call check, and released when going back.
  useEffect(() => {
    if (step === "devices") void startMedia();
    else stopMedia();
  }, [step, startMedia, stopMedia]);

  function join() {
    setError(null);
    saveMediaChoice({ microphone: media.microphone && media.hasAudio, camera: media.camera && media.hasVideo });
    startTransition(async () => {
      const result = await start({ kind: context.kind, offerId: context.offerId, topic: context.topic, interviewerId: interviewer.id, language, focus });
      if (result.ok) {
        media.stop(); // the call page opens its own preview
        router.push(`/interview/${result.interviewId}`);
      } else setError(result.error);
    });
  }

  const focusOptions: { id: Focus; label: string; hint: string; Icon: typeof UserRound }[] = [
    { id: "general", label: t.focusGeneral, hint: t.focusGeneralHint, Icon: MessagesSquare },
    { id: "technical", label: t.focusTechnical, hint: t.focusTechnicalHint, Icon: Code2 },
    { id: "both", label: t.focusBoth, hint: t.focusBothHint, Icon: Layers },
  ];
  const live = media.videoLive;

  if (step === "interviewer") {
    return (
      <div className="space-y-8" lang={language}>
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-terracotta">{context.title}</p>
          <h1 className="mt-1 text-4xl leading-tight sm:text-5xl">{t.interviewerStepTitle}</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">{t.interviewerStepIntro}</p>
        </header>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
          <InterviewerBrowser categories={categories} interviewers={interviewers} selectedId={interviewer.id} language={language} t={t} onChoose={setInterviewerId} />
          <aside className="space-y-5 lg:sticky lg:top-24">
            <InterviewerProfile interviewer={interviewer} language={language} t={t} />
            <section className="space-y-5 rounded-3xl border-2 border-dashed border-border p-5" aria-label={t.settingsHeading}>
              <div>
                <h2 className="font-sans text-sm font-bold">{t.languageHeading}</h2>
                <div className="mt-2 inline-flex rounded-full bg-muted p-1" role="group" aria-label={t.languageHeading}>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      aria-pressed={language === l.id}
                      onClick={() => setLanguage(l.id)}
                      lang={l.id}
                      className={cn("rounded-full px-5 py-2 text-sm font-semibold transition-colors", language === l.id ? "bg-ink text-white" : "text-muted-foreground hover:text-foreground")}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.languageHint}</p>
              </div>
              {context.kind === "offer" && (
                <div>
                  <h2 className="font-sans text-sm font-bold">{t.questionsHeading}</h2>
                  <div className="mt-2 grid gap-2" role="group" aria-label={t.questionsHeading}>
                    {focusOptions.map(({ id, label, hint, Icon }) => {
                      const active = focus === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setFocus(id)}
                          aria-pressed={active}
                          className={cn("flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition-colors", active ? "border-ink bg-ink-soft" : "border-transparent bg-card hover:border-ink/40")}
                        >
                          <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", active ? "bg-ink text-white" : "bg-muted text-muted-foreground")}>
                            <Icon className="size-4" aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold">{label}</span>
                            <span className="block text-sm text-muted-foreground">{hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
            <Button variant="action" size="xl" className="w-full" onClick={() => setStep("devices")}>
              {t.continueToCall} <ArrowRight aria-hidden="true" />
            </Button>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" lang={language}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-terracotta">{context.title}</p>
          <h1 className="mt-1 text-4xl leading-tight sm:text-5xl">{t.setupTitle}</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">{t.setupIntro}</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => setStep("interviewer")}>
          <ArrowLeft aria-hidden="true" /> {t.backToInterviewer}
        </Button>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ---------- Camera and microphone check ---------- */}
        <section className="space-y-3" aria-labelledby="devices-title">
          <h2 id="devices-title" className="sr-only">
            {t.devicesHeading}
          </h2>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-earth text-earth-foreground shadow-soft">
            <SelfPreview attach={media.attach} live={live} me={me} />
            {!live && media.status === "ready" && <p className="absolute inset-x-0 bottom-20 text-center text-sm text-earth-foreground/80">{t.cameraOffPreview}</p>}
            {(media.status === "requesting" || media.status === "denied" || media.status === "unavailable") && (
              <div className="absolute inset-x-4 top-4 rounded-md bg-earth/85 p-3 text-sm backdrop-blur-md" role="status">
                {media.status === "requesting" ? t.devicesWaiting : media.status === "denied" ? t.devicesDenied : t.devicesUnavailable}
                {media.status !== "requesting" && (
                  <Button size="sm" variant="secondary" className="mt-2" onClick={() => void media.start()}>
                    {t.devicesAsk}
                  </Button>
                )}
              </div>
            )}
            {/* Real controls: they switch the tracks off and on. */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
              <Button
                size="icon"
                className={cn("size-12 rounded-full", media.microphone ? "bg-earth-foreground/15 hover:bg-earth-foreground/25" : "bg-destructive hover:bg-destructive/90")}
                onClick={media.toggleMicrophone}
                disabled={!media.hasAudio}
                aria-pressed={!media.microphone}
                aria-label={media.microphone ? t.mute : t.unmute}
                title={media.microphone ? t.mute : t.unmute}
              >
                {media.microphone ? <Mic className="size-5" /> : <MicOff className="size-5" />}
              </Button>
              <Button
                size="icon"
                className={cn("size-12 rounded-full", media.camera ? "bg-earth-foreground/15 hover:bg-earth-foreground/25" : "bg-destructive hover:bg-destructive/90")}
                onClick={media.toggleCamera}
                disabled={!media.hasVideo}
                aria-pressed={!media.camera}
                aria-label={media.camera ? t.turnCameraOff : t.turnCameraOn}
                title={media.camera ? t.turnCameraOff : t.turnCameraOn}
              >
                {media.camera ? <Video className="size-5" /> : <VideoOff className="size-5" />}
              </Button>
            </div>
          </div>

          {/* Microphone test */}
          <div className="rounded-xl border border-earth/20 bg-card p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-semibold">
                {media.microphone ? <Mic className="size-4 text-primary" aria-hidden="true" /> : <MicOff className="size-4 text-destructive" aria-hidden="true" />}
                {t.micLabel}
              </span>
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {!media.hasAudio ? "" : !media.microphone ? t.micMutedHint : media.level > 0.15 ? t.micHeard : t.micTest}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="meter" aria-label={t.micLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(media.level * 100)}>
              <div className="h-2 rounded-full bg-success transition-[width] duration-75" style={{ width: `${Math.round(media.level * 100)}%` }} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t.privacy}</p>
          </div>
        </section>

        {/* ---------- Summary and start ---------- */}
        <section className="space-y-5 lg:sticky lg:top-24" aria-label={t.settingsHeading}>
          <div className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-soft">
            <InterviewerAvatar interviewer={{ id: interviewer.id, name: copy.name, image: interviewer.image }} className="size-16 text-xl" />
            <div className="min-w-0">
              <p className="font-display text-2xl leading-tight">{copy.name}</p>
              <p className="text-sm font-semibold text-terracotta">{copy.style}</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="size-4 text-success" aria-hidden="true" /> {LANGUAGES.find((l) => l.id === language)?.label}
            </li>
            {context.kind === "offer" && (
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden="true" /> {focusOptions.find((f) => f.id === focus)?.label}
              </li>
            )}
          </ul>
          <Button variant="action" size="xl" className="w-full" onClick={join} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <PhoneCall aria-hidden="true" />} {t.start}
          </Button>
          <p className="min-h-5 text-sm" aria-live="polite">
            {pending && <span className="text-muted-foreground">{fill(t.joining, { name: copy.name })}</span>}
            {error && <span className="font-semibold text-destructive">{error}</span>}
          </p>
        </section>
      </div>
    </div>
  );
}
