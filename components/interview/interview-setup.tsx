"use client";

import {
  Check,
  Code2,
  Layers,
  Loader2,
  MessagesSquare,
  Mic,
  MicOff,
  PhoneCall,
  UserRound,
  Video,
  VideoOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { fill, type InterviewCopy, LANGUAGES } from "@/lib/interview/copy";
import type { Focus } from "@/lib/interview/session";
import { KIND_LABEL, KIND_NOTICE, LEVEL_OF, TRAIT_LABELS } from "@/lib/interviewers/labels";
import type { Interviewer, InterviewerCategory, Lang } from "@/lib/interviewers/types";
import { cn } from "@/lib/utils";
import { InterviewerAvatar } from "./interviewer-avatar";
import { InterviewerChooser } from "./interviewer-chooser";
import { SelfPreview } from "./media/self-preview";
import { saveMediaChoice, useLocalMedia } from "./media/use-local-media";

// "Ready to join?": the pre-call screen. Configure the session (interviewer, language, questions),
// check the camera and microphone, then start: only then is the interview created and the call shown.
// The screen itself switches to the chosen language, like the whole interview will.

interface Props {
  offer: { id: string; title: string };
  me: { name: string; imageUrl: string | null };
  categories: InterviewerCategory[];
  interviewers: Interviewer[];
  defaultInterviewerId: string;
  defaultLanguage: Lang;
  copies: Record<Lang, InterviewCopy>;
  start: (input: { offerId: string; interviewerId: string; language: Lang; focus: Focus }) => Promise<{ ok: true; interviewId: string } | { ok: false; error: string }>;
}

export function InterviewSetup({ offer, me, categories, interviewers, defaultInterviewerId, defaultLanguage, copies, start }: Props) {
  const router = useRouter();
  const [language, setLanguage] = useState<Lang>(defaultLanguage);
  const [focus, setFocus] = useState<Focus>("both");
  const [interviewerId, setInterviewerId] = useState(defaultInterviewerId);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const media = useLocalMedia({ microphone: true, camera: true });
  const t = copies[language];
  const interviewer = interviewers.find((i) => i.id === interviewerId) ?? interviewers[0];
  const copy = interviewer.copy[language];
  const notice = KIND_NOTICE[interviewer.kind];
  const { start: startMedia } = media;

  useEffect(() => {
    void startMedia(); // like a video call's pre-join screen: ask for the camera and microphone right away
  }, [startMedia]);

  function join() {
    setError(null);
    saveMediaChoice({ microphone: media.microphone && media.hasAudio, camera: media.camera && media.hasVideo });
    startTransition(async () => {
      const result = await start({ offerId: offer.id, interviewerId: interviewer.id, language, focus });
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

  return (
    <div className="space-y-8" lang={language}>
      <header>
        <p className="text-sm text-muted-foreground">{fill(t.setupEyebrow, { offer: offer.title })}</p>
        <h1 className="text-3xl leading-tight sm:text-4xl">{t.setupTitle}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t.setupIntro}</p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
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

        {/* ---------- The session's configuration ---------- */}
        <section className="space-y-6 rounded-xl border border-earth/20 bg-card p-5 shadow-soft sm:p-6" aria-label={t.setupTitle}>
          {/* Interviewer */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-sans text-xs font-bold text-terracotta uppercase">{t.interviewerHeading}</h2>
              <Button size="sm" variant="outline" onClick={() => setChooserOpen(true)}>
                {t.change}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <InterviewerAvatar interviewer={interviewer} className="size-14 text-xl" />
              <div className="min-w-0">
                <p id="setup-interviewer" className="truncate font-display text-xl">
                  {copy.name}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {copy.role && <span>{copy.role}</span>}
                  <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">{KIND_LABEL[interviewer.kind][language]}</span>
                </p>
              </div>
            </div>
            <p className="mt-3 rounded-md bg-primary-soft/50 p-3 text-sm">
              <span className="block text-xs font-bold text-primary uppercase">{t.styleLabel}</span>
              <span className="font-semibold">{copy.style}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{copy.description}</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2" aria-label={t.styleLabel}>
              {TRAIT_LABELS.map(({ key, label }) => {
                const level = interviewer.traits[key];
                return (
                  <li key={key} className="text-xs">
                    <span className="text-muted-foreground">
                      {label[language]}
                      <span className="sr-only"> : {fill(LEVEL_OF[language], { level })}</span>
                    </span>
                    <span className="mt-1 flex gap-0.5" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className={cn("h-1.5 flex-1 rounded-full", n <= level ? "bg-primary" : "bg-muted")} />
                      ))}
                    </span>
                  </li>
                );
              })}
            </ul>
            {notice && <p className="mt-3 text-xs text-muted-foreground">{notice[language]}</p>}
          </div>

          {/* Language */}
          <div className="border-t border-earth/15 pt-5">
            <h2 className="font-sans text-xs font-bold text-terracotta uppercase">{t.languageHeading}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label={t.languageHeading}>
              {LANGUAGES.map((l) => (
                <Button key={l.id} variant={language === l.id ? "default" : "outline"} aria-pressed={language === l.id} onClick={() => setLanguage(l.id)} lang={l.id}>
                  {language === l.id && <Check className="size-4" aria-hidden="true" />} {l.label}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t.languageHint}</p>
          </div>

          {/* Questions */}
          <div className="border-t border-earth/15 pt-5">
            <h2 className="font-sans text-xs font-bold text-terracotta uppercase">{t.questionsHeading}</h2>
            <div className="mt-3 grid gap-2" role="group" aria-label={t.questionsHeading}>
              {focusOptions.map(({ id, label, hint, Icon }) => {
                const active = focus === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFocus(id)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      active ? "border-primary bg-primary-soft/60" : "border-earth/20 hover:border-primary/50",
                    )}
                  >
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-md", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{label}</span>
                      <span className="block text-xs text-muted-foreground">{hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button size="lg" className="h-12 w-full text-base" onClick={join} disabled={pending}>
            {pending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <PhoneCall className="size-5" aria-hidden="true" />} {t.start}
          </Button>
          <p className="-mt-3 min-h-5 text-sm" aria-live="polite">
            {pending && <span className="text-muted-foreground">{fill(t.joining, { name: copy.name })}</span>}
            {error && <span className="font-semibold text-destructive">{error}</span>}
          </p>
        </section>
      </div>

      <InterviewerChooser
        open={chooserOpen}
        onOpenChange={setChooserOpen}
        categories={categories}
        interviewers={interviewers}
        selectedId={interviewer.id}
        language={language}
        t={t}
        onChoose={(id) => {
          setInterviewerId(id);
          setChooserOpen(false);
        }}
      />
    </div>
  );
}
