"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FilePenLine,
  FileText,
  Languages,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Play,
  Plus,
  Printer,
  Send,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CoverageLabel, MatchRing, QuoteChip, SiteBadge, StatusBadge } from "@/components/source/badges";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { OfferStatus, SourceSite } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface OfferViewData {
  offer: {
    id: string;
    title: string | null;
    company: string | null;
    location: string | null;
    contract: string | null;
    language: string | null;
    sourceSite: SourceSite;
    sourceUrl: string | null;
    status: OfferStatus;
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
  contacts: { kind: "email" | "phone" | "person" | "apply_url"; value: string; quote: string }[];
  score: { covered: number; total: number };
  interviewIds: string[];
  /** Latest version of each document, with its number of sentences not backed by a fact. */
  documents: { cv: DocSummary | null; letter: DocSummary | null };
}

interface Props extends OfferViewData {
  actions: {
    markApplied: (offerId: string) => Promise<{ ok: boolean }>;
    startInterview: (offerId: string) => Promise<{ ok: true; interviewId: string } | { ok: false; error: string }>;
  };
}

const CONTACT_ICON = { email: Mail, phone: Phone, person: User, apply_url: Link2 } as const;

interface DocSummary {
  version: number;
  unsupported: number;
  text: string; // plain text, to copy or download
}

// Offer page (layout from the Lovable prototype): header, application kit, annotated offer on the
// left; profile match, practice and apply on the right. Every highlighted requirement was verified
// verbatim in the offer; clicking one opens the facts that prove it.
export function OfferView({ offer, segments, requirements, contacts, score, interviewIds, documents, actions }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchOpen, setMatchOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const byId = new Map(requirements.map((r) => [r.id, r]));
  const selected = selectedId ? byId.get(selectedId) : undefined;

  function startInterview() {
    setError(null);
    startTransition(async () => {
      const result = await actions.startInterview(offer.id);
      if (result.ok) router.push(`/interview/${result.interviewId}`);
      else setError(result.error);
    });
  }

  return (
    <>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-10">
          {/* ---------- Header ---------- */}
          <header className="border-b border-earth/20 pb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={offer.status} />
              <SiteBadge site={offer.sourceSite} />
              {offer.appliedAt && <span className="text-xs text-muted-foreground">Applied on {offer.appliedAt}</span>}
            </div>
            <h1 className="max-w-3xl text-3xl text-earth sm:text-4xl md:text-5xl dark:text-foreground">{offer.title ?? "Untitled offer"}</h1>
            {offer.company && <p className="mt-2 text-xl font-semibold text-terracotta">{offer.company}</p>}
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {offer.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-terracotta" aria-hidden="true" />
                  {offer.location}
                </span>
              )}
              {offer.contract && (
                <span className="flex items-center gap-2">
                  <BriefcaseBusiness className="size-4 text-terracotta" aria-hidden="true" />
                  {offer.contract}
                </span>
              )}
              {offer.language && (
                <span className="flex items-center gap-2">
                  <Languages className="size-4 text-terracotta" aria-hidden="true" />
                  {offer.language}
                </span>
              )}
            </div>
            {offer.stack.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {offer.stack.map((item) => (
                  <span
                    key={item.value}
                    className="inline-flex items-center gap-1.5 rounded-md border border-earth/20 bg-card px-3 py-1.5 text-sm font-semibold text-earth dark:text-foreground"
                  >
                    {item.value}
                    <QuoteChip quote={item.quote} />
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* ---------- Application kit ---------- */}
          <section aria-labelledby="documents-title">
            <div className="mb-5">
              <p className="text-xs font-bold text-terracotta uppercase">Application kit</p>
              <h2 id="documents-title" className="mt-1 text-2xl text-earth sm:text-3xl dark:text-foreground">
                Documents for this opportunity
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DocumentPanel kind="letter" doc={documents.letter} offerId={offer.id} />
              <DocumentPanel kind="cv" doc={documents.cv} offerId={offer.id} />
            </div>
          </section>

          {/* ---------- Annotated offer ---------- */}
          <section className="border-t border-earth/20 pt-8" aria-labelledby="analysis-title">
            <p className="text-xs font-bold text-terracotta uppercase">Source analysis</p>
            <h2 id="analysis-title" className="mt-1 text-2xl text-earth sm:text-3xl dark:text-foreground">
              See what matches — and what does not
            </h2>
            <div className="mt-5 rounded-md bg-card p-5">
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
                <CoverageLabel covered />
                <CoverageLabel covered={false} />
                <span className="text-xs text-muted-foreground">Every highlight is quoted word for word from the offer. Click one.</span>
              </div>
              <div className="max-h-[70vh] overflow-y-auto text-[17px] leading-[1.9] whitespace-pre-wrap">
                {segments.map((seg, i) => {
                  const req = seg.reqId ? byId.get(seg.reqId) : undefined;
                  if (!req) return <span key={i}>{seg.text}</span>;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedId(req.id)}
                      className={cn(
                        "inline rounded px-1 text-left font-medium underline decoration-2 underline-offset-4 transition",
                        req.covered ? "bg-success-soft decoration-success/60 hover:decoration-success" : "bg-gap-soft decoration-gap/60 hover:decoration-gap",
                      )}
                    >
                      {req.covered ? (
                        <CheckCircle2 className="mr-1 inline size-3.5 align-[-2px] text-success" aria-label="Covered" />
                      ) : (
                        <XCircle className="mr-1 inline size-3.5 align-[-2px] text-gap" aria-label="Gap" />
                      )}
                      {seg.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* ---------- Side column ---------- */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="border-l-4 border-terracotta bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-terracotta uppercase">Profile match</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {score.covered} of {score.total}
                  </span>{" "}
                  requirements covered
                </p>
              </div>
              <MatchRing covered={score.covered} total={score.total} />
            </div>
            <Button
              variant="ghost"
              className="mt-4 w-full justify-between text-earth dark:text-foreground"
              onClick={() => setMatchOpen((o) => !o)}
              aria-expanded={matchOpen}
            >
              Covered &amp; gaps <ChevronDown className={cn("size-4 transition-transform", matchOpen && "rotate-180")} aria-hidden="true" />
            </Button>
            {matchOpen && (
              <div className="mt-3 space-y-1 border-t pt-4">
                {requirements.map((r) => (
                  <Button key={r.id} variant="ghost" className="h-auto w-full justify-between gap-3 px-2 py-2 text-left" onClick={() => setSelectedId(r.id)}>
                    <span className="text-sm whitespace-normal">
                      {r.text}
                      {r.kind === "nice" && <span className="ml-1 text-xs text-muted-foreground">(nice to have)</span>}
                    </span>
                    {r.covered ? (
                      <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Covered" />
                    ) : (
                      <XCircle className="size-4 shrink-0 text-gap" aria-label="Gap" />
                    )}
                  </Button>
                ))}
              </div>
            )}
          </section>

          <section id="practise" className="scroll-mt-24 bg-earth p-6 text-earth-foreground shadow-soft">
            <Sparkles className="size-6 text-terracotta" aria-hidden="true" />
            <h2 className="mt-5 text-2xl">Ready to practise?</h2>
            <p className="mt-2 text-sm text-earth-foreground/75">
              A one-to-one call with a simulated recruiter, built from this offer&apos;s stack and your validated profile.
            </p>
            <Button size="lg" className="mt-6 w-full bg-terracotta text-earth-foreground hover:bg-terracotta/90" disabled={pending} onClick={startInterview}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              Start interview simulation
            </Button>
            <p aria-live="polite" className="mt-3 min-h-5 text-sm">
              {pending && <span className="text-earth-foreground/75">Preparing 10 questions on this offer… up to a minute with free models.</span>}
              {error && <span className="font-semibold">{error}</span>}
            </p>
            {interviewIds.length > 0 && (
              <div className="mt-2 border-t border-earth-foreground/15 pt-3 text-sm">
                <p className="mb-1 text-earth-foreground/60">Previous practice</p>
                <div className="flex flex-wrap gap-2">
                  {interviewIds.map((id, i) => (
                    <Link key={id} href={`/interview/${id}`} className="underline hover:text-earth-foreground/80">
                      Interview #{i + 1}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="border border-earth/20 bg-card p-5" aria-labelledby="apply-title">
            <p className="text-xs font-bold text-terracotta uppercase">Apply</p>
            <h2 id="apply-title" className="mt-1 text-xl">
              How to apply
            </h2>
            {contacts.length === 0 ? (
              <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">No contact details in this offer.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {contacts.map((c) => {
                  const Icon = CONTACT_ICON[c.kind];
                  return (
                    <li key={`${c.kind}-${c.value}`} className="flex items-center gap-2 text-sm">
                      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{c.value}</span>
                      <QuoteChip quote={c.quote} />
                    </li>
                  );
                })}
              </ul>
            )}
            <ApplicationKit offerId={offer.id} company={offer.company} cv={documents.cv} letter={documents.letter} />
            <div className="mt-4 flex flex-col gap-2">
              {offer.sourceUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={offer.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" aria-hidden="true" /> Open original source <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
                  </a>
                </Button>
              )}
              {offer.status === "saved" && (
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
                  <Send className="size-4" aria-hidden="true" /> I applied
                </Button>
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* ---------- Requirement detail ---------- */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetDescription className="flex gap-2 text-xs tracking-wide uppercase">
                  {selected.kind === "must" ? "Must have" : "Nice to have"} · {selected.category}
                </SheetDescription>
                <SheetTitle className="font-display text-2xl font-medium">{selected.text}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6 px-4">
                <CoverageLabel covered={selected.covered} />
                <blockquote className="border-l-2 border-primary pl-3 text-muted-foreground italic">“{selected.quote}”</blockquote>
                {selected.covered ? (
                  <div>
                    <p className="mb-2 text-sm font-semibold">Proven by</p>
                    <ul className="space-y-2">
                      {selected.facts.map((f) => (
                        <li key={f.id} className="rounded-md border border-success/30 bg-success-soft px-3 py-2 text-sm">
                          {f.text}
                          {f.sourceRef?.startsWith("http") && (
                            <a href={f.sourceRef} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-primary underline">
                              {f.sourceRef}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gap/30 bg-gap-soft p-4">
                    <p className="text-sm font-medium">Gap — nothing in your validated profile proves this yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">If it is true, add it as a fact: it will then count for every offer.</p>
                    <Button size="sm" variant="outline" className="mt-3" asChild>
                      <Link href="/profile">
                        <Plus className="size-4" aria-hidden="true" /> Add a fact
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function DocumentPanel({ kind, doc, offerId }: { kind: "cv" | "letter"; doc: DocSummary | null; offerId: string }) {
  const isCv = kind === "cv";
  const Icon = isCv ? FileText : FilePenLine;
  return (
    <article className={cn("border p-5", isCv ? "border-earth/25 bg-secondary/55" : "border-terracotta/30 bg-terracotta-soft")}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-md text-earth-foreground", isCv ? "bg-earth" : "bg-terracotta")}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-sans text-base font-bold">{isCv ? "Tailored CV" : "Cover letter"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {doc
              ? doc.unsupported === 0
                ? `Version ${doc.version} — every sentence is backed by a validated fact.`
                : `Version ${doc.version} — ${doc.unsupported} sentence${doc.unsupported > 1 ? "s" : ""} not backed by your profile.`
              : isCv
                ? "Written for this offer from your validated facts only."
                : "Specific to this company, built from your validated facts only."}
          </p>
        </div>
      </div>
      <Button className="mt-5" size="sm" variant={doc ? "outline" : "default"} asChild>
        <Link href={`/offers/${offerId}/cv`}>
          {doc ? (
            "Open"
          ) : (
            <>
              <Sparkles className="size-4" aria-hidden="true" /> Create {isCv ? "tailored CV" : "cover letter"}
            </>
          )}
        </Link>
      </Button>
    </article>
  );
}

/** "Apply" panel: the tailored CV and cover letter, ready to copy or download (or the way to create them). */
function ApplicationKit({ offerId, company, cv, letter }: { offerId: string; company: string | null; cv: DocSummary | null; letter: DocSummary | null }) {
  const [copied, setCopied] = useState<"cv" | "letter" | null>(null);
  const slug = (company ?? "offer").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "offer";

  async function copy(kind: "cv" | "letter", text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  }

  function download(text: string, fileName: string) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!cv && !letter) {
    return (
      <div className="mt-4 border-t border-earth/15 pt-4">
        <p className="text-xs font-bold text-muted-foreground uppercase">Your application kit</p>
        <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
          <Link href={`/offers/${offerId}/cv`}>
            <FileText className="size-4" aria-hidden="true" /> Create your CV and cover letter
          </Link>
        </Button>
      </div>
    );
  }

  const rows: { kind: "cv" | "letter"; label: string; doc: DocSummary }[] = [];
  if (letter) rows.push({ kind: "letter", label: "Cover letter", doc: letter });
  if (cv) rows.push({ kind: "cv", label: "Tailored CV", doc: cv });

  return (
    <div className="mt-4 border-t border-earth/15 pt-4">
      <p className="text-xs font-bold text-muted-foreground uppercase">Your application kit</p>
      <ul className="mt-2 space-y-3">
        {rows.map(({ kind, label, doc }) => (
          <li key={kind}>
            <p className="text-sm font-semibold">
              {label} <span className="font-normal text-muted-foreground">· version {doc.version}</span>
            </p>
            {doc.unsupported > 0 && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gap">
                <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                {doc.unsupported} sentence{doc.unsupported > 1 ? "s" : ""} not backed by your profile: check before sending
              </p>
            )}
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(kind, doc.text)}>
                <Copy className="size-4" aria-hidden="true" /> {copied === kind ? "Copied" : "Copy"}
              </Button>
              {kind === "letter" ? (
                <Button size="sm" variant="outline" onClick={() => download(doc.text, `cover-letter-${slug}.txt`)}>
                  <Download className="size-4" aria-hidden="true" /> Download
                </Button>
              ) : (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/offers/${offerId}/cv?print=1`}>
                    <Printer className="size-4" aria-hidden="true" /> PDF
                  </Link>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
