"use client";

import { Check, Copy, Download, Loader2, Printer, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SourcedSentence } from "@/lib/types";

type CvSentence = SourcedSentence & { section?: string };

interface Props {
  offerId: string;
  offerLabel: string;
  candidate: { name: string; imageUrl: string | null; githubLogin: string | null };
  cv: { version: number; sentences: CvSentence[] } | null;
  letter: { version: number; sentences: SourcedSentence[] } | null;
  versions: number[];
  facts: Record<string, string>;
  feedback: { covered: string[]; gaps: string[]; unusedFacts: string[] };
  generate: (offerId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

// Printable tailored CV + cover letter. Every sentence is checked: green chips = validated facts,
// red "Unsupported" = no valid fact behind it. Print / Save as PDF uses the browser's print dialog.
export function CvView({ offerId, offerLabel, candidate, cv, letter, versions, facts, feedback, generate }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const letterText = letter?.sentences.map((s) => s.text).join(" ") ?? "";
  const unsupported = [...(cv?.sentences ?? []), ...(letter?.sentences ?? [])].filter((s) => s.factIds.length === 0).length;
  const sections = cv ? [...new Set(cv.sentences.map((s) => s.section ?? "CV"))] : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/offers/${offerId}`} className="underline">
              {offerLabel}
            </Link>
          </p>
          <h1 className="text-3xl">Tailored CV and cover letter</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await generate(offerId);
                if (result.ok) router.refresh();
                else setError(result.error);
              });
            }}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}
            {cv ? "Generate a new version" : "Generate"}
          </Button>
          {cv && (
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden="true" /> Print / Save as PDF
            </Button>
          )}
        </div>
      </div>
      <div className="no-print flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
        {pending && <span className="text-muted-foreground">Writing from your validated facts only… up to a minute with free models.</span>}
        {error && <span className="text-destructive">{error}</span>}
        {versions.length > 0 && (
          <span className="flex flex-wrap items-center gap-1 text-muted-foreground">
            Versions:
            {versions.map((v) => (
              <Link key={v} href={`/offers/${offerId}/cv?v=${v}`} className={`rounded border px-1.5 ${cv?.version === v ? "bg-primary-soft font-semibold text-foreground" : ""}`}>
                v{v}
              </Link>
            ))}
          </span>
        )}
        {cv && (
          <Badge variant={unsupported ? "destructive" : "secondary"}>
            {unsupported ? `${unsupported} unsupported sentence${unsupported > 1 ? "s" : ""}` : "Every sentence is backed by a fact"}
          </Badge>
        )}
      </div>

      {!cv && !pending && <p className="no-print text-muted-foreground">No CV yet for this offer. Generate one: it uses only your validated facts.</p>}

      {cv && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="print-page rounded-lg border bg-card p-6 shadow-soft sm:p-10">
            <header className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
              <div>
                <p className="font-display text-lg text-muted-foreground">Curriculum Vitae</p>
                <h2 className="text-3xl">{candidate.name}</h2>
                {candidate.githubLogin && <p className="text-sm text-muted-foreground">github.com/{candidate.githubLogin}</p>}
              </div>
              {candidate.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- remote avatar from Clerk
                <img src={candidate.imageUrl} alt={candidate.name} width={96} height={96} className="aspect-square w-20 rounded-full border-4 border-primary object-cover" />
              )}
            </header>
            {sections.map((section) => (
              <section key={section} className="mb-5">
                <h3 className="mb-2 border-b pb-1 text-lg">{section}</h3>
                <ul className="flex flex-col gap-1.5">
                  {cv.sentences
                    .filter((s) => (s.section ?? "CV") === section)
                    .map((s, i) => (
                      <li key={i}>
                        <SentenceView s={s} facts={facts} />
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </article>

          <div className="no-print flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CV feedback</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <List title={`Requirements covered (${feedback.covered.length})`} items={feedback.covered} icon="check" />
                <List title={`Gaps (${feedback.gaps.length}) — never claimed`} items={feedback.gaps} icon="x" />
                <List title={`Relevant facts not used (${feedback.unusedFacts.length})`} items={feedback.unusedFacts} icon="dot" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {letter && (
        <Card className="no-print">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Cover letter (v{letter.version})</CardTitle>
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
          </CardHeader>
          <CardContent className="flex flex-col gap-2 leading-relaxed">
            {letter.sentences.map((s, i) => (
              <p key={i}>
                <SentenceView s={s} facts={facts} />
              </p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SentenceView({ s, facts }: { s: SourcedSentence; facts: Record<string, string> }) {
  if (s.factIds.length === 0) {
    return (
      <span>
        <span className="unsupported-underline">{s.text}</span>{" "}
        <span className="no-print inline-flex items-center gap-0.5 rounded bg-gap-soft px-1.5 text-xs text-gap">
          <X className="size-3" aria-hidden="true" /> Unsupported
        </span>
      </span>
    );
  }
  return (
    <span>
      {s.text}
      {s.factIds.map((id) => (
        <span key={id} title={facts[id]} className="no-print ml-1 inline-flex items-center gap-0.5 rounded-full border border-success/30 bg-success-soft px-1.5 align-middle text-xs">
          <Check className="size-3 text-success" aria-hidden="true" /> {(facts[id] ?? "fact").slice(0, 24)}
        </span>
      ))}
    </span>
  );
}

function List({ title, items, icon }: { title: string; items: string[]; icon: "check" | "x" | "dot" }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      {items.length === 0 ? (
        <p className="text-muted-foreground">—</p>
      ) : (
        <ul className="mt-1 flex flex-col gap-1">
          {items.map((item, i) => (
            <li key={i} className="flex gap-1.5">
              {icon === "check" ? <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" /> : icon === "x" ? <X className="mt-0.5 size-3.5 shrink-0 text-gap" aria-hidden="true" /> : <span className="text-muted-foreground">•</span>}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
