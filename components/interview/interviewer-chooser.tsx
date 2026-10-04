"use client";

import { Briefcase, Building2, Clapperboard, Eye, EyeOff, Gamepad2, Landmark, Music, Sparkles, Swords, Tv, UserRound, Users } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fill, type InterviewCopy } from "@/lib/interview/copy";
import type { Interviewer, InterviewerCategory, Lang } from "@/lib/interviewers/types";
import { cn } from "@/lib/utils";
import { InterviewerAvatar } from "./interviewer-avatar";

// The interviewer picker: a grid by category (the setup page) and the same grid in a wide side sheet
// (switching during the call).
// Interviewers can be hidden from the list (temporary, this browser only): hidden ones stay one click
// away ("Show hidden") and the current interviewer is always listed.

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
  gamepad: Gamepad2,
};

const HIDDEN_KEY = "nextround.hiddenInterviewers";

function readHidden(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function useHiddenInterviewers() {
  // Read once on the client; the list only renders inside the sheet, after it is opened.
  const [hidden, setHidden] = useState<string[]>(() => (typeof window === "undefined" ? [] : readHidden()));
  const save = (next: string[]) => {
    setHidden(next);
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable (private mode): the choice lasts until the page is closed
    }
  };
  return {
    hidden: new Set(hidden),
    hide: (id: string) => save([...new Set([...hidden, id])]),
    show: (id: string) => save(hidden.filter((h) => h !== id)),
  };
}

/** Categories and interviewers as a grid of tiles, with the hide button (this browser only). */
export function InterviewerBrowser(props: {
  categories: InterviewerCategory[];
  interviewers: Interviewer[];
  selectedId: string;
  language: Lang;
  t: InterviewCopy;
  onChoose: (id: string) => void;
  /** "beside": next to the profile panel (one column on large screens, so sentences stay on a line); "wide": full width. */
  layout?: "beside" | "wide";
}) {
  const { categories, interviewers, selectedId, language, t, onChoose, layout = "beside" } = props;
  const selected = interviewers.find((i) => i.id === selectedId);
  const [categoryId, setCategoryId] = useState(selected?.categoryId ?? categories[0].id);
  const [showHidden, setShowHidden] = useState(false);
  const { hidden, hide, show } = useHiddenInterviewers();
  const category = categories.find((c) => c.id === categoryId) ?? categories[0];
  const visible = (i: Interviewer) => !hidden.has(i.id) || i.id === selectedId;
  const inCategory = interviewers.filter((i) => i.categoryId === category.id);
  const list = inCategory.filter((i) => showHidden || visible(i));
  const hiddenHere = inCategory.filter((i) => !visible(i)).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.chooseInterviewer}>
        {categories.map((c) => {
          const Icon = ICONS[c.icon] ?? UserRound;
          const active = c.id === category.id;
          const count = interviewers.filter((i) => i.categoryId === c.id && visible(i)).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                active ? "border-ink bg-ink text-white" : "border-border bg-card hover:border-ink/60",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {c.label[language]}
              <span className={cn("text-xs", active ? "opacity-80" : "text-muted-foreground")}>{count}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">{category.description[language]}</p>
      <ul className={cn("grid gap-3", layout === "wide" ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2")}>
        {list.map((i) => {
          const active = i.id === selectedId;
          const isHidden = hidden.has(i.id);
          const c = i.copy[language];
          return (
            <li key={i.id} className={cn("relative", isHidden && "opacity-50")}>
              <button
                type="button"
                onClick={() => onChoose(i.id)}
                aria-pressed={active}
                className={cn(
                  "flex h-full w-full items-center gap-4 rounded-2xl border-2 p-3 pr-11 text-left transition-colors",
                  active ? "border-ink bg-ink-soft" : "border-transparent bg-card hover:border-ink/40",
                )}
              >
                <InterviewerAvatar interviewer={{ id: i.id, name: c.name, image: i.image }} className="size-16 text-xl" />
                <span className="min-w-0">
                  <span className="block font-display text-lg leading-tight">{c.name}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-terracotta">{c.style}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{c.description}</span>
                </span>
              </button>
              {!active && (
                <button
                  type="button"
                  onClick={() => (isHidden ? show(i.id) : hide(i.id))}
                  className="absolute top-2 right-2 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={fill(isHidden ? t.showInterviewer : t.hideInterviewer, { name: c.name })}
                  title={fill(isHidden ? t.showInterviewer : t.hideInterviewer, { name: c.name })}
                >
                  {isHidden ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {(hiddenHere > 0 || showHidden) && (
        <button type="button" className="text-sm font-semibold text-ink underline-offset-4 hover:underline" onClick={() => setShowHidden(!showHidden)}>
          {showHidden ? t.hideHidden : fill(t.showHidden, { n: String(hiddenHere) })}
        </button>
      )}
    </div>
  );
}

/** The browser in a wide side sheet: switching interviewer during the call. */
export function InterviewerChooser(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: InterviewerCategory[];
  interviewers: Interviewer[];
  selectedId: string;
  language: Lang;
  t: InterviewCopy;
  onChoose: (id: string) => void;
}) {
  const { open, onOpenChange, language, t, ...browser } = props;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[min(72rem,92vw)]" lang={language}>
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">{t.chooseInterviewer}</SheetTitle>
          <SheetDescription>{t.chooseInterviewerHint}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <InterviewerBrowser {...browser} language={language} t={t} layout="wide" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
