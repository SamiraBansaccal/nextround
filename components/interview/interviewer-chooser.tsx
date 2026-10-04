"use client";

import { Briefcase, Building2, Clapperboard, Eye, EyeOff, Gamepad2, Landmark, Music, Sparkles, Swords, Tv, UserRound, Users } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fill, type InterviewCopy } from "@/lib/interview/copy";
import type { Interviewer, InterviewerCategory, Lang } from "@/lib/interviewers/types";
import { cn } from "@/lib/utils";
import { InterviewerAvatar } from "./interviewer-avatar";

// The interviewer picker (a side sheet by category), used before the call and during it to switch.
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
  const { open, onOpenChange, categories, interviewers, selectedId, language, t, onChoose } = props;
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl" lang={language}>
        <SheetHeader>
          <SheetTitle>{t.chooseInterviewer}</SheetTitle>
          <SheetDescription>{t.chooseInterviewerHint}</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-6">
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
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-earth/20 bg-card hover:border-primary/50",
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
          <ul className="grid gap-2 sm:grid-cols-2">
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
                      "flex h-full w-full items-start gap-3 rounded-lg border p-3 pr-10 text-left transition-colors",
                      active ? "border-primary bg-primary-soft/60" : "border-earth/20 bg-card hover:border-primary/50",
                    )}
                  >
                    <InterviewerAvatar interviewer={{ id: i.id, name: c.name, image: i.image }} />
                    <span className="min-w-0">
                      <span className="block font-semibold">{c.name}</span>
                      <span className="block text-xs font-semibold text-primary">{c.style}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{c.description}</span>
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
            <button type="button" className="text-sm font-semibold text-primary underline-offset-4 hover:underline" onClick={() => setShowHidden(!showHidden)}>
              {showHidden ? t.hideHidden : fill(t.showHidden, { n: String(hiddenHere) })}
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
