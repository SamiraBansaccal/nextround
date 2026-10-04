"use client";

import { AlertTriangle, ArrowLeft, Check, Copy, Download, History, Loader2, Printer, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CoverageLabel } from "@/components/source/badges";
import { Button } from "@/components/ui/button";
import type { SourcedSentence } from "@/lib/types";
import { shorten } from "@/lib/text";
import { cn } from "@/lib/utils";

type CvSentence = SourcedSentence & { section?: string };

interface Props {
  autoPrint?: boolean; // opened from the offer's "PDF" button: print right away
  offerId: string;
  offerLabel: string;
  candidate: { name: string; imageUrl: string | null; githubLogin: string | null };
  cv: { version: number; sentences: CvSentence[] } | null;
  letter: { version: number; sentences: SourcedSentence[] } | null;
  versions: { version: number; createdOn: string }[];
  facts: Record<string, string>;
  feedback: { requirements: { text: string; covered: boolean }[]; unusedFacts: string[] };
  generate: (offerId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

// Tailored CV + cover letter (layout from the Lovable prototype). Every sentence carries the facts
// it relies on; a sentence without one is "Unsupported". Print / Save as PDF uses the browser.
export function CvView({ offerId, offerLabel, candidate, cv, letter, versions, facts, feedback, generate, autoPrint = false }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasCv = cv !== null;

  useEffect(() => {
    if (autoPrint && hasCv) window.print();
  }, [autoPrint, hasCv]);
  const letterText = letter?.sentences.map((s) => s.text).join(" ") ?? "";
  const unsupported = [...(cv?.sentences ?? []), ...(letter?.sentences ?? [])].filter((s) => s.factIds.length === 0).length;
  const sections = cv ? [...new Set(cv.sentences.map((s) => s.section ?? "Profile"))] : [];

  function regenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generate(offerId);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href={`/offers/${offerId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> {offerLabel}
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button disabled={pending} onClick={regenerate}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}
            {cv ? "Generate a new version" : "Generate CV and cover letter"}
          </Button>
          {cv && (
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden="true" /> Print / Save as PDF
            </Button>
          )}
        </div>
      </div>
      <p aria-live="polite" className="no-print min-h-5 text-sm">
        {pending && <span className="text-muted-foreground">Writing from your validated facts only… up to a minute with free models.</span>}
        {error && <span className="text-destructive">{error}</span>}
      </p>

      {!cv && !pending && (
        <div className="no-print border border-dashed border-earth/30 p-10 text-center">
          <p className="font-display text-2xl">No CV for this offer yet</p>
          <p className="mt-2 text-sm text-muted-foreground">It is written only from the facts you validated — never more.</p>
        </div>
      )}

      {cv && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            {unsupported > 0 && (
              <p className="no-print flex items-start gap-2 rounded-xl border border-gap/30 bg-gap-soft p-3 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gap" aria-hidden="true" />
                {unsupported} sentence{unsupported > 1 ? "s aren't" : " isn't"} backed by your profile. Remove {unsupported > 1 ? "them" : "it"}, or add the fact
                if it&apos;s true.
              </p>
            )}
            <article className="print-page bg-card p-8 shadow-soft md:p-12">
              <header className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-4xl">{candidate.name}</h1>
                  <p className="mt-1 text-muted-foreground">
                    {offerLabel}
                    {candidate.githubLogin && ` · github.com/${candidate.githubLogin}`}
                  </p>
                </div>
                {candidate.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- remote avatar from Clerk
                  <img src={candidate.imageUrl} alt={candidate.name} width={96} height={96} className="aspect-square w-20 shrink-0 border-4 border-primary object-cover" />
                )}
              </header>
              <hr className="my-6" />
              {sections.map((section) => (
                <section key={section} className="mb-6">
                  <h2 className="mb-3 font-sans text-sm font-semibold tracking-widest text-muted-foreground uppercase">{section}</h2>
                  <div className="space-y-2">
                    {cv.sentences
                      .filter((s) => (s.section ?? "Profile") === section)
                      .map((s, i) => (
                        <SentenceView key={i} s={s} facts={facts} />
                      ))}
                  </div>
                </section>
              ))}
            </article>

            {letter && (
              <article className="no-print bg-card p-8 shadow-soft">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl">Cover letter</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await navigator.clipboard.writeText(letterText);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      <Copy className="size-4" aria-hidden="true" /> {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = URL.createObjectURL(new Blob([letterText], { type: "text/plain;charset=utf-8" }));
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "cover-letter.txt";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="size-4" aria-hidden="true" /> Download
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {letter.sentences.map((s, i) => (
                    <SentenceView key={i} s={s} facts={facts} />
                  ))}
                </div>
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
              <p className="mt-2 text-xs text-muted-foreground">Gaps are never claimed in the CV.</p>
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
                <History className="size-4" aria-hidden="true" /> Version history
              </h3>
              <ul className="space-y-1 text-sm">
                {versions.map((v) => (
                  <li key={v.version}>
                    <Link
                      href={`/offers/${offerId}/cv?v=${v.version}`}
                      className={cn("flex justify-between rounded-md px-2 py-1 hover:bg-muted", cv.version === v.version && "bg-primary-soft font-semibold")}
                    >
                      <span>Version {v.version}</span>
                      <span className="text-muted-foreground">{v.createdOn}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
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
