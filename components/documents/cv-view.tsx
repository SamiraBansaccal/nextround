"use client";

import { AlertTriangle, ArrowLeft, Bookmark, BookmarkCheck, Check, Copy, Download, History, Loader2, PenLine, Printer, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CoverageLabel } from "@/components/source/badges";
import { Button } from "@/components/ui/button";
import { letterText, tailoredCvText } from "@/lib/documents/render";
import type { DocumentLanguage, SourcedSentence, TailoredCv, TailoredLetter } from "@/lib/types";
import { shorten } from "@/lib/text";
import { cn } from "@/lib/utils";
import { TailoredCvDocument, TailoredLetterDocument } from "./tailored-document";

type CvSentence = SourcedSentence & { section?: string };
type Result = { ok: true } | { ok: false; error: string };

interface ShownDocument<T> {
  id: string;
  version: number;
  kept: boolean;
  content: T | null; // null: an early version, made of sentences only
  sentences: CvSentence[];
}

interface Props {
  autoPrint?: boolean; // opened from the offer's "PDF" button: print right away
  offerId: string;
  offerLabel: string;
  language: DocumentLanguage;
  candidate: { name: string; imageUrl: string | null; contacts: { kind: string; value: string }[] };
  cv: ShownDocument<TailoredCv> | null;
  letter: ShownDocument<TailoredLetter> | null;
  versions: { kind: "cv" | "cover_letter"; version: number; language: DocumentLanguage; createdOn: string }[];
  /** Documents added to the profile, to start a new one from. */
  bases: { cv: { id: string; title: string }[]; letter: { id: string; title: string }[] };
  facts: Record<string, string>;
  feedback: { requirements: { text: string; covered: boolean }[]; unusedFacts: string[] };
  actions: {
    generateCv: (input: { offerId: string; language: DocumentLanguage; baseId: string | null }) => Promise<Result>;
    generateLetter: (input: { offerId: string; language: DocumentLanguage; baseId: string | null }) => Promise<Result>;
    keep: (input: { id: string; kept: boolean }) => Promise<Result>;
  };
}

const LANGUAGES: { id: DocumentLanguage; label: string }[] = [
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
];

// The CV and the cover letter written for one offer, in English or French. The profile holds everything;
// these keep only what serves the offer. Every line shows the facts that prove it; a document can be
// added to the profile, to reuse it or to start the next one from it. Print / Save as PDF uses the browser.
export function CvView({ offerId, offerLabel, language, candidate, cv, letter, versions, bases, facts, feedback, actions, autoPrint = false }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [working, setWorking] = useState<"cv" | "letter" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [cvBase, setCvBase] = useState("");
  const [letterBase, setLetterBase] = useState("");
  const hasCv = cv !== null;

  useEffect(() => {
    if (autoPrint && hasCv) window.print();
  }, [autoPrint, hasCv]);

  const cvText = cv?.content ? tailoredCvText(cv.content, { name: candidate.name, contacts: candidate.contacts.map((c) => c.value) }) : (cv?.sentences.map((s) => s.text).join("\n") ?? "");
  const lettersText = letter?.content ? letterText(letter.content) : (letter?.sentences.map((s) => s.text).join(" ") ?? "");
  const unsupported = [...(cv?.sentences ?? []), ...(letter?.sentences ?? [])].filter((s) => s.factIds.length === 0).length;

  function run(kind: "cv" | "letter", action: () => Promise<Result>) {
    setError(null);
    setWorking(kind);
    startTransition(async () => {
      const result = await action();
      setWorking(null);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  function copy(label: string, text: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      window.setTimeout(() => setCopied(null), 2000);
    });
  }

  function download(name: string, text: string) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  const keepButton = (doc: ShownDocument<unknown>) => (
    <Button size="sm" variant={doc.kept ? "secondary" : "outline"} disabled={pending} onClick={() => run("cv", () => actions.keep({ id: doc.id, kept: !doc.kept }))}>
      {doc.kept ? <BookmarkCheck className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
      {doc.kept ? "In my profile" : "Add to my profile"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/offers/${offerId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" /> {offerLabel}
          </Link>
          <h1 className="mt-1 text-3xl">CV &amp; cover letter</h1>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-earth/20 p-1" role="group" aria-label="Language of the documents">
          {LANGUAGES.map((l) => (
            <Link
              key={l.id}
              href={`/offers/${offerId}/cv?lang=${l.id}`}
              aria-current={l.id === language ? "true" : undefined}
              className={cn("rounded-full px-3 py-1 text-sm", l.id === language ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ---------- Write ---------- */}
      <div className="no-print grid gap-3 md:grid-cols-2">
        {(
          [
            { kind: "cv", label: hasCv ? "Write a new CV" : "Write the CV", options: bases.cv, base: cvBase, setBase: setCvBase, go: () => actions.generateCv({ offerId, language, baseId: cvBase || null }) },
            {
              kind: "letter",
              label: letter ? "Write a new cover letter" : "Write the cover letter",
              options: bases.letter,
              base: letterBase,
              setBase: setLetterBase,
              go: () => actions.generateLetter({ offerId, language, baseId: letterBase || null }),
            },
          ] as const
        ).map((w) => (
          <div key={w.kind} className="flex flex-wrap items-center gap-2 rounded-xl border border-earth/20 bg-card p-3">
            <Button disabled={pending} onClick={() => run(w.kind, w.go)}>
              {working === w.kind ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : w.kind === "cv" ? <RefreshCw className="size-4" aria-hidden="true" /> : <PenLine className="size-4" aria-hidden="true" />}
              {w.label}
            </Button>
            {w.options.length > 0 && (
              <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground">
                Start from
                <select value={w.base} onChange={(e) => w.setBase(e.target.value)} className="min-w-0 flex-1 rounded-md border border-earth/20 bg-background px-2 py-1 text-xs text-foreground">
                  <option value="">the whole profile</option>
                  {w.options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        ))}
      </div>
      <p aria-live="polite" className="no-print min-h-5 text-sm">
        {working && <span className="text-muted-foreground">Writing from your validated facts only, in {language === "fr" ? "French" : "English"}…</span>}
        {error && <span className="text-destructive">{error}</span>}
      </p>

      {!cv && !letter && !pending && (
        <div className="no-print border border-dashed border-earth/30 p-10 text-center">
          <p className="font-display text-2xl">Nothing written for this offer in {language === "fr" ? "French" : "English"} yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Your profile holds everything; the CV keeps only what serves this offer, from the facts you validated.</p>
        </div>
      )}

      {(cv || letter) && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            {unsupported > 0 && (
              <p className="no-print flex items-start gap-2 rounded-xl border border-gap/30 bg-gap-soft p-3 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gap" aria-hidden="true" />
                {unsupported} line{unsupported > 1 ? "s aren't" : " isn't"} backed by your profile. Write a new version, or add the fact if it&apos;s true.
              </p>
            )}

            {cv && (
              <div className="space-y-3">
                <div className="no-print flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl">CV · version {cv.version}</h2>
                  <div className="flex flex-wrap gap-2">
                    {keepButton(cv)}
                    <Button size="sm" variant="outline" onClick={() => copy("cv", cvText)}>
                      <Copy className="size-4" aria-hidden="true" /> {copied === "cv" ? "Copied" : "Copy"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.print()}>
                      <Printer className="size-4" aria-hidden="true" /> Print / PDF
                    </Button>
                  </div>
                </div>
                {cv.content ? (
                  <TailoredCvDocument cv={cv.content} candidate={candidate} facts={facts} />
                ) : (
                  <LegacyCv sentences={cv.sentences} candidate={candidate} offerLabel={offerLabel} facts={facts} />
                )}
              </div>
            )}

            {letter && (
              <article className="no-print space-y-4 bg-card p-8 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl">Cover letter · version {letter.version}</h2>
                  <div className="flex flex-wrap gap-2">
                    {keepButton(letter)}
                    <Button size="sm" variant="outline" onClick={() => copy("letter", lettersText)}>
                      <Copy className="size-4" aria-hidden="true" /> {copied === "letter" ? "Copied" : "Copy"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => download(`cover-letter-${language}.txt`, lettersText)}>
                      <Download className="size-4" aria-hidden="true" /> Download
                    </Button>
                  </div>
                </div>
                {letter.content ? (
                  <TailoredLetterDocument letter={letter.content} facts={facts} />
                ) : (
                  <div className="space-y-3">
                    {letter.sentences.map((s, i) => (
                      <SentenceView key={i} s={s} facts={facts} />
                    ))}
                  </div>
                )}
              </article>
            )}
          </div>

          <aside className="no-print space-y-6">
            <section>
              <h3 className="mb-2 font-sans text-sm font-semibold">Requirements</h3>
              <ul className="space-y-1">
                {feedback.requirements.map((r, i) => (
                  <li key={i} className="flex justify-between gap-2 text-sm">
                    <span>{r.text}</span>
                    <CoverageLabel covered={r.covered} />
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">Gaps are never claimed. A project built with AI never counts as mastery of its stack.</p>
            </section>
            <section>
              <h3 className="mb-2 font-sans text-sm font-semibold">Relevant facts not used</h3>
              {feedback.unusedFacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">None — every fact that proves a requirement is in the CV.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {feedback.unusedFacts.map((text, i) => (
                    <span key={i} title={text} className="inline-flex max-w-full items-center gap-1 rounded-full border border-success/30 bg-success-soft px-2 py-0.5 text-xs font-medium">
                      <Check className="size-3 shrink-0 text-success" aria-hidden="true" />
                      <span className="truncate">{shorten(text, 48)}</span>
                    </span>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h3 className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold">
                <History className="size-4" aria-hidden="true" /> Versions
              </h3>
              <ul className="space-y-1 text-sm">
                {versions.map((v) => {
                  const current = (v.kind === "cv" ? cv : letter)?.version === v.version;
                  return (
                    <li key={`${v.kind}-${v.version}`}>
                      <Link
                        href={`/offers/${offerId}/cv?lang=${v.language}&${v.kind === "cv" ? "v" : "l"}=${v.version}`}
                        className={cn("flex justify-between rounded-md px-2 py-1 hover:bg-muted", current && "bg-primary-soft font-semibold")}
                      >
                        <span>
                          {v.kind === "cv" ? "CV" : "Letter"} {v.version} · {v.language.toUpperCase()}
                        </span>
                        <span className="text-muted-foreground">{v.createdOn}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

/** The first versions, written as plain sentences by section. */
function LegacyCv({ sentences, candidate, offerLabel, facts }: { sentences: CvSentence[]; candidate: Props["candidate"]; offerLabel: string; facts: Record<string, string> }) {
  const sections = [...new Set(sentences.map((s) => s.section ?? "Profile"))];
  return (
    <article className="print-page bg-card p-8 shadow-soft md:p-12">
      <header>
        <h2 className="text-4xl">{candidate.name}</h2>
        <p className="mt-1 text-muted-foreground">{offerLabel}</p>
      </header>
      <hr className="my-6" />
      {sections.map((section) => (
        <section key={section} className="mb-6">
          <h2 className="mb-3 font-sans text-sm font-semibold tracking-widest text-muted-foreground uppercase">{section}</h2>
          <div className="space-y-2">
            {sentences
              .filter((s) => (s.section ?? "Profile") === section)
              .map((s, i) => (
                <SentenceView key={i} s={s} facts={facts} />
              ))}
          </div>
        </section>
      ))}
    </article>
  );
}

function SentenceView({ s, facts }: { s: SourcedSentence; facts: Record<string, string> }) {
  const unsupported = s.factIds.length === 0;
  return (
    <p className="leading-relaxed">
      <span className={cn(unsupported && "unsupported-underline")}>{s.text}</span>{" "}
      <span className="no-print inline-flex flex-wrap gap-1 align-middle">
        {unsupported ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-gap/30 bg-gap-soft px-2 py-0.5 text-xs font-semibold text-gap">
            <AlertTriangle className="size-3" aria-hidden="true" /> Unsupported
          </span>
        ) : (
          s.factIds.map((id) => (
            <span key={id} title={facts[id]} className="inline-flex max-w-full items-center gap-1 rounded-full border border-success/30 bg-success-soft px-2 py-0.5 text-xs font-medium">
              <Check className="size-3 shrink-0 text-success" aria-hidden="true" />
              <span className="truncate">{shorten(facts[id] ?? "fact", 32)}</span>
            </span>
          ))
        )}
      </span>
    </p>
  );
}
