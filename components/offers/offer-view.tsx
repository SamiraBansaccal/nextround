"use client";

import { Check, ExternalLink, Loader2, Mic, Quote, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface OfferViewData {
  offer: {
    id: string;
    title: string | null;
    company: string | null;
    location: string | null;
    contract: string | null;
    language: string | null;
    sourceSite: string;
    sourceUrl: string | null;
    status: string;
    appliedAt: string | null;
    stack: { value: string; quote: string }[];
  };
  segments: { text: string; reqId?: string }[];
  requirements: {
    id: string;
    kind: "must" | "nice";
    category: string;
    text: string;
    quote: string;
    covered: boolean;
    facts: { id: string; text: string; sourceRef: string | null }[];
  }[];
  contacts: { kind: string; value: string; quote: string }[];
  score: { covered: number; total: number };
  interviewIds: string[];
}

interface Props extends OfferViewData {
  actions: {
    markApplied: (offerId: string) => Promise<{ ok: boolean }>;
    startInterview: (offerId: string) => Promise<{ ok: true; interviewId: string } | { ok: false; error: string }>;
  };
}

// Presentational: the offer text with every verified requirement highlighted, green (covered by a
// validated fact) or red (gap). Clicking a requirement shows the facts that prove it.
export function OfferView({ offer, segments, requirements, contacts, score, interviewIds, actions }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(requirements[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const byId = new Map(requirements.map((r) => [r.id, r]));
  const current = selected ? byId.get(selected) : undefined;
  const percent = score.total ? Math.round((score.covered / score.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">{offer.sourceSite}</Badge>
          <Badge variant="secondary">{offer.status === "applied" && offer.appliedAt ? `Applied on ${offer.appliedAt}` : offer.status}</Badge>
          {offer.language && <Badge variant="outline">{offer.language}</Badge>}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{offer.title ?? "Untitled offer"}</h1>
        <p className="text-muted-foreground">{[offer.company, offer.location, offer.contract].filter(Boolean).join(" · ") || "Details not stated in the offer"}</p>
        <div className="mt-2 flex max-w-md flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span>Match</span>
            <span className="font-medium">
              {score.covered}/{score.total} requirements covered
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Match score">
            <div className="h-2 rounded-full bg-success" style={{ width: `${percent}%` }} />
          </div>
        </div>
        {offer.stack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {offer.stack.map((s) => (
              <span key={s.value} title={`“${s.quote}”`} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs">
                <Quote className="size-3 text-muted-foreground" aria-hidden="true" /> {s.value}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="lg"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await actions.startInterview(offer.id);
                if (result.ok) router.push(`/interview/${result.interviewId}`);
                else setError(result.error);
              });
            }}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
            Practise an interview for this offer
          </Button>
          {interviewIds.map((id, i) => (
            <Button key={id} variant="outline" onClick={() => router.push(`/interview/${id}`)}>
              Interview #{i + 1}
            </Button>
          ))}
        </div>
        <p aria-live="polite" className="text-sm">
          {pending && <span className="text-muted-foreground">Preparing 10 questions on this offer&apos;s stack… up to a minute with free models.</span>}
          {error && <span className="text-destructive">{error}</span>}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">The offer</CardTitle>
            <p className="text-xs text-muted-foreground">
              <span className="rounded bg-success-soft px-1">✓ green</span> = covered by your
              validated facts · <span className="rounded bg-gap-soft px-1 text-gap">✗ red</span> = gap. Click one.
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
              {segments.map((seg, i) => {
                const req = seg.reqId ? byId.get(seg.reqId) : undefined;
                if (!req) return <span key={i}>{seg.text}</span>;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelected(req.id)}
                    className={`rounded px-0.5 text-left ${
                      req.covered
                        ? "bg-success-soft text-foreground"
                        : "bg-gap-soft text-foreground"
                    } ${selected === req.id ? "ring-2 ring-foreground/40" : ""}`}
                    aria-label={`${req.covered ? "Covered" : "Gap"}: ${req.text}`}
                  >
                    {req.covered ? "✓ " : "✗ "}
                    {seg.text}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Requirement</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {!current && <p className="text-muted-foreground">Click a highlighted requirement.</p>}
              {current && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={current.covered ? "secondary" : "destructive"}>
                      {current.covered ? <Check className="size-3" aria-hidden="true" /> : <X className="size-3" aria-hidden="true" />}
                      {current.covered ? "Covered" : "Gap"}
                    </Badge>
                    <Badge variant="outline">{current.kind === "must" ? "Must have" : "Nice to have"}</Badge>
                    <Badge variant="outline">{current.category}</Badge>
                  </div>
                  <p className="font-medium">{current.text}</p>
                  <blockquote className="border-l-2 pl-2 text-muted-foreground">“{current.quote}”</blockquote>
                  {current.covered ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-medium">Proved by:</p>
                      {current.facts.map((f) => (
                        <p key={f.id} className="rounded-md border px-2 py-1 text-xs">
                          {f.text}
                          {f.sourceRef?.startsWith("http") && (
                            <a href={f.sourceRef} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center underline">
                              <ExternalLink className="size-3" aria-hidden="true" />
                            </a>
                          )}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nothing in your validated profile proves this yet. If it is true, add it as a fact in your profile.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Apply</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {contacts.length === 0 ? (
                <p className="text-muted-foreground">No contact details in this offer.</p>
              ) : (
                contacts.map((c) => (
                  <div key={`${c.kind}-${c.value}`} className="flex flex-col">
                    <span>
                      <span className="text-muted-foreground">{c.kind}:</span> <span className="break-all font-medium">{c.value}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">“{c.quote}”</span>
                  </div>
                ))
              )}
              <Button asChild variant="outline">
                <Link href={`/offers/${offer.id}/cv`}>Tailored CV and cover letter</Link>
              </Button>
              {offer.sourceUrl && (
                <Button asChild variant="outline">
                  <a href={offer.sourceUrl} target="_blank" rel="noopener noreferrer">
                    Open the original posting <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                </Button>
              )}
              {offer.status !== "applied" && (
                <Button
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm("Confirm that you applied to this offer?")) return;
                    startTransition(async () => {
                      await actions.markApplied(offer.id);
                      router.refresh();
                    });
                  }}
                >
                  I applied
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
