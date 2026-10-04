"use client";

import { Briefcase, Building2, Clapperboard, Landmark, Loader2, Music, Play, Sparkles, Swords, Tv, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { FOLLOW_UP_WORDS, KIND_LABEL, KIND_NOTICE, LEVEL_WORDS, TRAIT_LABELS } from "@/lib/interviewers/labels";
import type { Interviewer, InterviewerCategory } from "@/lib/interviewers/types";
import { cn } from "@/lib/utils";
import { InterviewerAvatar, InterviewerPicture } from "./interviewer-avatar";

// Choose an interviewer: category -> character -> preview -> start. All the data comes in as props
// (lib/interviewers/): this component only lays it out.

const ICONS: Record<string, typeof UserRound> = {
  briefcase: Briefcase,
  users: Users,
  landmark: Landmark,
  building: Building2,
  clapperboard: Clapperboard,
  music: Music,
  tv: Tv,
  sparkles: Sparkles,
  swords: Swords,
};

interface Props {
  offer: { id: string; title: string };
  categories: InterviewerCategory[];
  interviewers: Interviewer[];
  defaultInterviewerId: string;
  start: (input: { offerId: string; interviewerId: string }) => Promise<{ ok: true; interviewId: string } | { ok: false; error: string }>;
}

export function InterviewerPicker({ offer, categories, interviewers, defaultInterviewerId, start }: Props) {
  const router = useRouter();
  const initial = interviewers.find((i) => i.id === defaultInterviewerId) ?? interviewers[0];
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [selectedId, setSelectedId] = useState(initial.id);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const preview = useRef<HTMLElement>(null);

  const category = categories.find((c) => c.id === categoryId) ?? categories[0];
  const list = interviewers.filter((i) => i.categoryId === category.id);
  const selected = interviewers.find((i) => i.id === selectedId) ?? initial;

  function choose(id: string) {
    setSelectedId(id);
    setError(null);
    // On a phone the preview is below the list: bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) preview.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function begin() {
    setError(null);
    startTransition(async () => {
      const result = await start({ offerId: offer.id, interviewerId: selected.id });
      if (result.ok) router.push(`/interview/${result.interviewId}`);
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-8">
      <PageHeading eyebrow={`Interview practice · ${offer.title}`} title="Choose your interviewer" />
      <p className="-mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Your interviewer changes <strong className="text-foreground">how</strong> the questions are asked: tone, pressure, rhythm, and later the voice. What is asked
        does not change: the questions always come from this offer and your validated profile, and the coach&apos;s feedback stays the same.
      </p>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-8">
          {/* ---------- 1. Category ---------- */}
          <section aria-labelledby="category-title">
            <h2 id="category-title" className="mb-3 font-sans text-xs font-bold text-terracotta uppercase">
              1 · Category
            </h2>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Interviewer categories">
              {categories.map((c) => {
                const Icon = ICONS[c.icon] ?? UserRound;
                const active = c.id === category.id;
                const count = interviewers.filter((i) => i.categoryId === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-earth/20 bg-card hover:border-primary/50",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {c.label}
                    <span className={cn("text-xs", active ? "opacity-80" : "text-muted-foreground")}>{count}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{category.description}</p>
          </section>

          {/* ---------- 2. Interviewer ---------- */}
          <section aria-labelledby="interviewer-title">
            <h2 id="interviewer-title" className="mb-3 font-sans text-xs font-bold text-terracotta uppercase">
              2 · Interviewer
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((i) => {
                const active = i.id === selected.id;
                return (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => choose(i.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex h-full w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        active ? "border-primary bg-primary-soft/60" : "border-earth/20 bg-card hover:border-primary/50",
                      )}
                    >
                      <InterviewerAvatar interviewer={i} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{i.name}</span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">{i.description}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* ---------- 3. Preview ---------- */}
        <aside ref={preview} className="scroll-mt-24 overflow-hidden rounded-xl border border-earth/20 bg-card shadow-soft lg:sticky lg:top-24" aria-labelledby="preview-name">
          <div className="relative aspect-video bg-earth">
            <InterviewerPicture interviewer={selected} sizes="400px" />
          </div>
          <div className="space-y-4 p-5">
            <div>
              <p className="font-sans text-xs font-bold text-terracotta uppercase">3 · Preview</p>
              <h2 id="preview-name" className="mt-1 text-2xl">
                {selected.name}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {selected.role && <span>{selected.role}</span>}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">{KIND_LABEL[selected.kind]}</span>
              </p>
              {KIND_NOTICE[selected.kind] && <p className="mt-2 text-xs text-muted-foreground">{KIND_NOTICE[selected.kind]}</p>}
            </div>
            <p className="text-sm">{selected.description}</p>
            <dl className="grid gap-2 text-sm">
              <Detail label="Personality" value={selected.personality} />
              <Detail label="Interview style" value={selected.interviewStyle} />
              <Detail label="Follow-ups" value={FOLLOW_UP_WORDS[selected.followUpStyle]} />
              <Detail label="Vocabulary" value={selected.vocabulary} />
              <Detail label="Voice (later)" value={selected.voice.style} />
            </dl>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2" aria-label="Interviewer traits">
              {TRAIT_LABELS.map(({ key, label }) => {
                const level = selected.traits[key];
                return (
                  <li key={key} className="text-xs">
                    <span className="flex justify-between text-muted-foreground">
                      {label}
                      <span className="sr-only">
                        : {LEVEL_WORDS[level]} ({level} of 5)
                      </span>
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
            <Button size="lg" className="w-full" onClick={begin} disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />} Start the interview
            </Button>
            <p className="min-h-5 text-sm" aria-live="polite">
              {pending && <span className="text-muted-foreground">Preparing about 10 questions in {selected.name}&apos;s style… up to a minute with free models.</span>}
              {error && <span className="font-semibold text-destructive">{error}</span>}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
