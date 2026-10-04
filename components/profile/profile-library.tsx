"use client";

import {
  Award,
  Briefcase,
  Check,
  FilePlus2,
  FileText,
  FolderGit2,
  GraduationCap,
  Languages,
  Loader2,
  MessageCircle,
  PencilLine,
  Plus,
  Printer,
  RefreshCw,
  Send,
  Sparkles,
  Swords,
  Trash2,
  Upload,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useRef, useState, useTransition } from "react";
import { PageHeading, SectionHeading } from "@/components/page-heading";
import { CvDocumentView } from "@/components/profile/cv-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CvDocument, FactType } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ProfileFactView {
  id: string;
  type: FactType;
  text: string;
  source: "github" | "codewars" | "cv_upload" | "chat" | "manual";
  sourceRef: string | null;
  quote: string | null;
  validated: boolean;
  aiAssisted: boolean; // a project built with AI ("vibe coding"): never proof of its technologies
  origin: string; // e.g. "CV · cv-frontend-2025.pdf", "GitHub"
}

export interface CvItem {
  id: string;
  fileName: string;
  importedAt: string;
  facts: number;
  validated: number;
}

/** The CV shown as a document: the one chosen in the library, else the latest. */
export interface SelectedCv {
  id: string;
  fileName: string;
  document: CvDocument | null;
  hasText: boolean; // false for CVs added before the text was kept: they must be added again
}

type Result = { ok: true; message: string; sourceId?: string } | { ok: false; error: string };

interface Props {
  candidate: { name: string; imageUrl: string | null; githubLogin: string | null };
  cvs: CvItem[];
  selectedCv: SelectedCv | null;
  facts: ProfileFactView[];
  actions: {
    importGithub: () => Promise<Result>;
    importCodewars: (username: string) => Promise<Result>;
    importCvText: (input: { fileName: string; text: string }) => Promise<Result>;
    removeCv: (sourceId: string) => Promise<Result>;
    structureCv: (sourceId: string) => Promise<Result>;
    chatFacts: (answers: { question: string; answer: string }[]) => Promise<Result>;
    validate: (id: string) => Promise<Result>;
    validateAll: () => Promise<Result>;
    reject: (id: string) => Promise<Result>;
    edit: (input: { id: string; text: string }) => Promise<Result>;
    setAiAssisted: (input: { id: string; aiAssisted: boolean }) => Promise<Result>;
    addManual: (input: { type: FactType; text: string }) => Promise<Result>;
  };
}

const MAX_PDF_BYTES = 5 * 1024 * 1024;

const SECTIONS: { type: FactType; label: string; Icon: typeof Briefcase }[] = [
  { type: "experience", label: "Experience", Icon: Briefcase },
  { type: "project", label: "Projects", Icon: FolderGit2 },
  { type: "skill", label: "Skills", Icon: Wrench },
  { type: "education", label: "Education", Icon: GraduationCap },
  { type: "language", label: "Languages", Icon: Languages },
  { type: "achievement", label: "Achievements", Icon: Award },
];

const CHAT_QUESTIONS = [
  "Which roles are you targeting?",
  "Which technologies do you use (your stack)?",
  "Which projects are you proudest of, and what did you do in them?",
  "Which languages do you speak, and at what level?",
  "When are you available, and for which kind of contract?",
];

/** Text of a PDF, extracted IN THE BROWSER: the file itself never leaves the user's computer. */
async function pdfToText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  if (header !== "%PDF-") throw new Error("not a pdf");
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  return (Array.isArray(text) ? text.join("\n") : text).trim();
}

export function ProfileLibrary({ candidate, cvs, selectedCv, facts, actions }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [uploads, setUploads] = useState<{ name: string; status: "reading" | "analysing" | "done" | "error"; note?: string }[]>([]);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [codewars, setCodewars] = useState("");
  const [manual, setManual] = useState<{ type: FactType; text: string }>({ type: "skill", text: "" });

  const proposed = facts.filter((f) => !f.validated);
  const validated = facts.filter((f) => f.validated);
  const uploading = uploads.some((u) => u.status === "reading" || u.status === "analysing");

  const selectCv = (id: string) => router.push(`/profile?cv=${id}`, { scroll: false });

  function run(action: () => Promise<Result>, after?: () => void) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? { kind: "success", text: result.message } : { kind: "error", text: result.error });
      if (result.ok) after?.();
    });
  }

  async function handleFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (fileInput.current) fileInput.current.value = "";
    if (files.length === 0) return;
    setMessage(null);
    setUploads(files.map((f) => ({ name: f.name, status: "reading" })));
    let added: string | undefined;
    // One CV after the other: each one is read in the browser, then analysed by the AI.
    for (const [i, file] of files.entries()) {
      const update = (status: "reading" | "analysing" | "done" | "error", note?: string) =>
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, status, note } : x)));
      if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) {
        update("error", "PDF only");
        continue;
      }
      if (file.size > MAX_PDF_BYTES) {
        update("error", "More than 5 MB");
        continue;
      }
      let text: string;
      try {
        text = await pdfToText(file);
      } catch {
        update("error", "This file could not be read as a PDF");
        continue;
      }
      update("analysing");
      const result = await actions.importCvText({ fileName: file.name, text });
      update(result.ok ? "done" : "error", result.ok ? result.message : result.error);
      if (result.ok && result.sourceId) added = result.sourceId;
    }
    if (added) selectCv(added); // show the CV just added as a document
  }

  return (
    <div className="space-y-12">
      <div className="no-print space-y-12">
      <PageHeading eyebrow="Your professional source library" title="All your CVs">
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Add CVs (PDF)"
        />
        <Button onClick={() => fileInput.current?.click()} disabled={uploading} className="w-full sm:w-auto">
          <Upload className="size-4" aria-hidden="true" /> Add CVs
        </Button>
      </PageHeading>

      <p className="-mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Add <strong className="text-foreground">as many CVs as you want</strong>: the one you sent for each job, your LinkedIn PDF export… NextRound
        reads them all and builds <strong className="text-foreground">one fact base</strong>. Each new application then gets its own CV, written only
        from the facts you validate. PDFs are read in your browser: only their text is sent.
      </p>

      {message && (
        <p role="status" className={`text-sm ${message.kind === "error" ? "text-destructive" : "text-success"}`}>
          {message.text}
        </p>
      )}

      {/* ---------- CV library ---------- */}
      <section aria-labelledby="library-title">
        <SectionHeading eyebrow="CV library" title="Choose a source CV" id="library-title" aside={<span className="text-sm text-muted-foreground">{cvs.length} CV</span>} />
        {uploads.length > 0 && (
          <ul className="mb-4 space-y-1 text-sm" aria-live="polite">
            {uploads.map((u) => (
              <li key={u.name} className="flex flex-wrap items-center gap-2">
                {u.status === "done" ? (
                  <Check className="size-4 text-success" aria-hidden="true" />
                ) : u.status === "error" ? (
                  <X className="size-4 text-gap" aria-hidden="true" />
                ) : (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                <span className="font-medium">{u.name}</span>
                <span className="text-muted-foreground">
                  {u.status === "reading" ? "reading the PDF…" : u.status === "analysing" ? "finding your facts and laying out your CV, every line checked against the PDF… a minute or two with free models" : u.note}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cvs.map((cv) => {
            const selected = cv.id === selectedCv?.id;
            return (
              <article key={cv.id} className={`border p-5 ${selected ? "border-primary bg-primary-soft/45" : "border-earth/20 bg-card"}`}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <span className="grid size-11 shrink-0 place-items-center bg-earth text-earth-foreground">
                    <FileText className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-sans text-base font-bold" title={cv.fileName}>
                      {cv.fileName.replace(/\.pdf$/i, "")}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Added {cv.importedAt} · <span className="font-bold text-primary">{cv.validated}</span> validated · {cv.facts - cv.validated} to review
                    </p>
                    {selected && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                        <Check className="size-3.5" aria-hidden="true" /> Current source
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                  <Button size="sm" variant={selected ? "default" : "outline"} onClick={() => selectCv(cv.id)} aria-pressed={selected}>
                    {selected ? "Selected" : "Use as source"}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => actions.removeCv(cv.id))} aria-label={`Remove ${cv.fileName}`}>
                    <Trash2 className="size-4" aria-hidden="true" /> Remove
                  </Button>
                </div>
              </article>
            );
          })}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="flex min-h-40 flex-col items-center justify-center border border-dashed border-earth/30 p-5 text-center text-muted-foreground transition hover:border-primary hover:bg-primary-soft/40"
          >
            <FilePlus2 className="mb-3 size-7 text-primary" aria-hidden="true" />
            <span className="font-bold text-foreground">{cvs.length ? "Add more CVs" : "Add your first CV"}</span>
            <span className="mt-1 text-sm">PDF, up to 5 MB each · select several at once</span>
          </button>
        </div>
      </section>

      {/* ---------- Facts to review ---------- */}
      {proposed.length > 0 && (
        <section aria-labelledby="review-title">
          <SectionHeading
            eyebrow="Needs your approval"
            title={`${proposed.length} extracted fact${proposed.length > 1 ? "s" : ""} to review`}
            id="review-title"
            aside={
              <Button size="sm" variant="outline" disabled={pending} onClick={() => run(actions.validateAll)}>
                <Check className="size-4" aria-hidden="true" /> Keep all
              </Button>
            }
          />
          <p className="-mt-2 mb-4 text-sm text-muted-foreground">Nothing is reused until you validate it.</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {proposed.map((fact) => (
              <article key={fact.id} className="border border-terracotta/25 bg-card p-4">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <UserRound className="mt-0.5 size-5 text-terracotta" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      {fact.type} · {fact.origin}
                    </p>
                    {editing?.id === fact.id ? (
                      <Input className="mt-1" value={editing.text} onChange={(e) => setEditing({ id: fact.id, text: e.target.value })} aria-label="Edit fact" />
                    ) : (
                      <p className="mt-1 text-sm font-semibold">{fact.text}</p>
                    )}
                    {fact.quote && <p className="mt-2 text-xs text-muted-foreground italic">“{fact.quote}”</p>}
                    {fact.sourceRef?.startsWith("http") && (
                      <a href={fact.sourceRef} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-primary underline">
                        {fact.sourceRef}
                      </a>
                    )}
                    {fact.type === "project" && (
                      <AiAssistedToggle fact={fact} disabled={pending} onToggle={(aiAssisted) => run(() => actions.setAiAssisted({ id: fact.id, aiAssisted }))} />
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
                  {editing?.id === fact.id ? (
                    <Button size="sm" disabled={pending} onClick={() => run(() => actions.edit(editing), () => setEditing(null))}>
                      Save
                    </Button>
                  ) : (
                    <Button size="sm" disabled={pending} onClick={() => run(() => actions.validate(fact.id))}>
                      <Check className="size-4" aria-hidden="true" /> Keep
                    </Button>
                  )}
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => setEditing({ id: fact.id, text: fact.text })}>
                    <PencilLine className="size-4" aria-hidden="true" /> Edit
                  </Button>
                  <Button size="icon" variant="ghost" disabled={pending} onClick={() => run(() => actions.reject(fact.id))} aria-label="Reject fact">
                    <X className="size-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      </div>

      {/* ---------- The selected CV, as a document ---------- */}
      {selectedCv && (
        <section aria-labelledby="preview-title">
          <div className="no-print">
            <SectionHeading
              eyebrow="Selected CV"
              title={selectedCv.fileName.replace(/\.pdf$/i, "")}
              id="preview-title"
              aside={
                <div className="flex gap-2">
                  {selectedCv.hasText && (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => actions.structureCv(selectedCv.id))}>
                      <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} aria-hidden="true" /> {selectedCv.document ? "Lay out again" : "Lay it out"}
                    </Button>
                  )}
                  {selectedCv.document && (
                    <Button size="sm" variant="outline" onClick={() => window.print()}>
                      <Printer className="size-4" aria-hidden="true" /> PDF
                    </Button>
                  )}
                </div>
              }
            />
            <p className="-mt-2 mb-4 text-sm text-muted-foreground">Laid out by the AI, then checked: every line below is written word for word in your PDF.</p>
          </div>
          {selectedCv.document ? (
            <CvDocumentView document={selectedCv.document} fallbackName={candidate.name} photoUrl={candidate.imageUrl} />
          ) : (
            <div className="no-print border border-dashed border-earth/30 p-8 text-center text-sm text-muted-foreground">
              {selectedCv.hasText
                ? "This CV is not laid out yet. Use “Lay it out”: about a minute with free models."
                : "This CV was added before NextRound kept its text. Remove it and add the PDF again to see it here."}
            </div>
          )}
        </section>
      )}

      <div className="no-print space-y-12">
      {/* ---------- Fact base, shown as a CV ---------- */}
      <section aria-labelledby="base-title">
        <SectionHeading eyebrow="Your fact base" title="Everything you validated" id="base-title" aside={<span className="text-sm text-muted-foreground">{validated.length} facts</span>} />
        <article className="overflow-hidden border border-earth/20 bg-card shadow-soft" aria-label={`Fact base of ${candidate.name}`}>
          <header className="grid gap-5 bg-primary-soft/55 p-5 sm:grid-cols-[minmax(0,1fr)_112px] sm:items-center sm:p-8 lg:px-12">
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-display text-xl text-earth dark:text-foreground">Base CV · built only from validated facts</p>
              <h3 className="mt-1 text-3xl text-earth sm:text-4xl dark:text-foreground">{candidate.name}</h3>
              {candidate.githubLogin && <p className="mt-1 text-sm text-muted-foreground">github.com/{candidate.githubLogin}</p>}
            </div>
            {candidate.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- remote avatar from Clerk
              <img src={candidate.imageUrl} width={112} height={112} alt={candidate.name} className="mx-auto aspect-square w-24 border-4 border-primary object-cover sm:w-28" />
            )}
          </header>
          <div className="p-5 sm:p-8 lg:p-12">
            {validated.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing validated yet. Add CVs, import GitHub or answer the 5 questions below, then keep the facts that are true.
              </p>
            )}
            {SECTIONS.map(({ type, label, Icon }) => {
              const all = validated.filter((f) => f.type === type);
              if (all.length === 0) return null;
              const items = all.filter((f) => !f.aiAssisted);
              const vibe = all.filter((f) => f.aiAssisted);
              return (
                <section key={type} className="py-5">
                  <h4 className="mb-4 flex items-center gap-2 border-b-2 border-primary pb-2 font-sans text-lg font-bold text-earth uppercase dark:text-foreground">
                    <Icon className="size-4 text-primary" aria-hidden="true" /> {label}
                  </h4>
                  <ul className="space-y-2">
                    {items.map((fact) => (
                      <li key={fact.id} className="group flex items-start justify-between gap-3 text-sm leading-relaxed">
                        <span>
                          {fact.text} <span className="ml-1 text-xs text-muted-foreground">· {fact.origin}</span>
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 shrink-0 opacity-60 group-hover:opacity-100"
                          disabled={pending}
                          onClick={() => run(() => actions.reject(fact.id))}
                          aria-label={`Delete: ${fact.text}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  {type === "project" && items.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {items.map((fact) => (
                        <AiAssistedToggle key={fact.id} fact={fact} compact disabled={pending} onToggle={(aiAssisted) => run(() => actions.setAiAssisted({ id: fact.id, aiAssisted }))} />
                      ))}
                    </div>
                  )}
                  {vibe.length > 0 && (
                    <div className="mt-5 rounded-lg border border-dashed border-earth/30 p-4">
                      <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                        <Sparkles className="size-3.5" aria-hidden="true" /> Built with AI · vibe coding
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">They show your interest in AI, your creativity and your hackathons. They never count as mastery of their stack.</p>
                      <ul className="mt-3 space-y-2">
                        {vibe.map((fact) => (
                          <li key={fact.id} className="flex items-start justify-between gap-3 text-sm leading-relaxed">
                            <span>
                              {fact.text} <span className="ml-1 text-xs text-muted-foreground">· {fact.origin}</span>
                            </span>
                            <AiAssistedToggle fact={fact} compact disabled={pending} onToggle={(aiAssisted) => run(() => actions.setAiAssisted({ id: fact.id, aiAssisted }))} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </article>
      </section>

      <div className="divide-y divide-earth/20 border-y border-earth/20">
      {/* ---------- GitHub ---------- */}
      <ImportSection
        icon={<FolderGit2 className="size-4" aria-hidden="true" />}
        eyebrow="GitHub projects"
        title="Bring your projects into your next CV"
        body={
          candidate.githubLogin
            ? `One project per public repository of @${candidate.githubLogin}, linked to the repo. NextRound never invents one: projects appear only after GitHub returns them.`
            : "Sign in with GitHub to import your public repositories."
        }
      >
        <Button variant="outline" disabled={pending || !candidate.githubLogin} onClick={() => run(actions.importGithub)}>
          {pending ? <RefreshCw className="size-4 animate-spin" aria-hidden="true" /> : <FolderGit2 className="size-4" aria-hidden="true" />} Import my repositories
        </Button>
      </ImportSection>

      {/* ---------- Codewars ---------- */}
      <ImportSection icon={<Swords className="size-4" aria-hidden="true" />} eyebrow="Codewars" title="Your kata rank, as proof" body="Optional: your public Codewars profile gives one achievement (rank, katas completed, languages).">
        <div className="flex gap-2">
          <Input placeholder="Codewars username" value={codewars} onChange={(e) => setCodewars(e.target.value)} aria-label="Codewars username" className="sm:w-52" />
          <Button variant="outline" disabled={pending || !codewars.trim()} onClick={() => run(() => actions.importCodewars(codewars.trim()))}>
            Import
          </Button>
        </div>
      </ImportSection>

      {/* ---------- Onboarding chat ---------- */}
      <OnboardingChat pending={pending} onFinish={(answers) => run(() => actions.chatFacts(answers))} />

      {/* ---------- Manual ---------- */}
      <ImportSection icon={<Plus className="size-4" aria-hidden="true" />} eyebrow="Manual" title="Add a fact yourself" body="For anything not in your CVs or on GitHub, e.g. a LeetCode streak.">
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={manual.type}
            onChange={(e) => setManual((m) => ({ ...m, type: e.target.value as FactType }))}
            aria-label="Fact type"
          >
            {SECTIONS.map((s) => (
              <option key={s.type} value={s.type}>
                {s.label}
              </option>
            ))}
          </select>
          <Input placeholder="e.g. Solved 150 LeetCode problems" value={manual.text} onChange={(e) => setManual((m) => ({ ...m, text: e.target.value }))} aria-label="Fact text" className="sm:w-72" />
          <Button disabled={pending || manual.text.trim().length < 3} onClick={() => run(() => actions.addManual({ type: manual.type, text: manual.text.trim() }), () => setManual((m) => ({ ...m, text: "" })))}>
            Add
          </Button>
        </div>
      </ImportSection>
      </div>
      </div>
    </div>
  );
}

function ImportSection({ icon, eyebrow, title, body, children }: { icon: ReactNode; eyebrow: string; title: string; body: string; children: ReactNode }) {
  return (
    <section className="py-7">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">
            {icon} {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl text-earth sm:text-3xl dark:text-foreground">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function OnboardingChat({ pending, onFinish }: { pending: boolean; onFinish: (answers: { question: string; answer: string }[]) => void }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const step = answers.length;
  const done = step >= CHAT_QUESTIONS.length;

  return (
    <section className="py-7" aria-labelledby="chat-title">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">
            <MessageCircle className="size-4" aria-hidden="true" /> Short chat
          </p>
          <h2 id="chat-title" className="mt-2 text-2xl text-earth sm:text-3xl dark:text-foreground">
            Answer 5 quick questions
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Target roles, stack, proudest projects, languages, availability. Each proposed fact quotes your own words.
          </p>
        </div>
        {!open && (
          <Button variant="outline" onClick={() => setOpen(true)}>
            <MessageCircle className="size-4" aria-hidden="true" /> Start
          </Button>
        )}
      </div>
      {open && (
        <div className="mt-6 flex max-w-3xl flex-col gap-3">
          {CHAT_QUESTIONS.slice(0, Math.min(step + 1, CHAT_QUESTIONS.length)).map((q, i) => (
            <div key={q} className="flex flex-col gap-2">
              <p className="w-fit max-w-[85%] rounded-lg rounded-tl-none bg-primary-soft px-3 py-2 text-sm">{q}</p>
              {answers[i] !== undefined && (
                <p className="ml-auto w-fit max-w-[85%] rounded-lg rounded-tr-none bg-earth px-3 py-2 text-sm text-earth-foreground">{answers[i] || "(skipped)"}</p>
              )}
            </div>
          ))}
          {!done ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                value={draft}
                placeholder="Your answer (or leave empty to skip)"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setAnswers((a) => [...a, draft.trim()]);
                    setDraft("");
                  }
                }}
                aria-label="Your answer"
              />
              <Button
                onClick={() => {
                  setAnswers((a) => [...a, draft.trim()]);
                  setDraft("");
                }}
                aria-label="Send"
              >
                <Send className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button disabled={pending} onClick={() => onFinish(CHAT_QUESTIONS.map((question, i) => ({ question, answer: answers[i] ?? "" })))}>
                {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Extract my facts
              </Button>
              <Button variant="ghost" onClick={() => setAnswers([])}>
                Start again
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** "Built with AI (vibe coding)": a project the candidate did not write line by line. */
function AiAssistedToggle({
  fact,
  compact = false,
  disabled,
  onToggle,
}: {
  fact: Pick<ProfileFactView, "text" | "aiAssisted">;
  compact?: boolean;
  disabled: boolean;
  onToggle: (aiAssisted: boolean) => void;
}) {
  const name = fact.text.split(" — ")[0];
  return (
    <button
      type="button"
      aria-pressed={fact.aiAssisted}
      disabled={disabled}
      onClick={() => onToggle(!fact.aiAssisted)}
      title={fact.aiAssisted ? "Shown as built with AI: click if you wrote it yourself" : "Built with AI? It will never count as mastery of its stack"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border text-xs transition-colors disabled:opacity-50",
        compact ? "px-2 py-0.5" : "mt-3 px-2.5 py-1",
        fact.aiAssisted ? "border-terracotta/40 bg-terracotta-soft text-terracotta" : "border-earth/20 text-muted-foreground hover:border-terracotta/40 hover:text-foreground",
      )}
    >
      <Sparkles className="size-3" aria-hidden="true" />
      {compact ? (fact.aiAssisted ? `${name}: built with AI` : `${name}: built with AI?`) : fact.aiAssisted ? "Built with AI (vibe coding)" : "Built with AI? (vibe coding)"}
    </button>
  );
}
