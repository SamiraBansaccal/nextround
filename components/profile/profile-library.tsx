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
  Plus,
  Printer,
  RefreshCw,
  Send,
  Sparkles,
  Swords,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useRef, useState, useTransition } from "react";
import { TailoredCvDocument, TailoredLetterDocument } from "@/components/documents/tailored-document";
import { PageHeading, SectionHeading } from "@/components/layout/page-heading";
import { CvDocumentView } from "@/components/profile/cv-document";
import { EditableLine } from "@/components/shared/editable-line";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProfileCopy } from "@/lib/i18n/profile";
import { fill } from "@/lib/interview/copy";
import type { DocEditPath } from "@/lib/documents/edit";
import type { CvEditPath } from "@/lib/profile/cv-edit";
import type { CvDocument, FactType, TailoredCv, TailoredLetter } from "@/lib/types";
import { cn } from "@/lib/utils";

// The profile: every CV the candidate added, one of them shown as a document, and the profile merged
// from all of them without duplicates. Everything comes from the candidate's own CVs and accounts, so it
// is validated from the start; any line can be fixed with the pencil next to it.

/** One fact of the merged profile: the most complete wording, and the ids of the other wordings. */
export interface ProfileFactView {
  id: string;
  type: FactType;
  text: string;
  aiAssisted: boolean; // a project built with AI ("vibe coding"): never proof of its technologies
  origin: string; // e.g. "CV · cv-2025.pdf", "GitHub"
  /** Ids of the same fact found in other CVs or sources (hidden: this wording is the shown one). */
  mergedIds: string[];
}

export interface CvItem {
  id: string;
  category: string; // a career track id (devops, web, java…) or "general"
  fileName: string;
  importedAt: string;
  facts: number;
}

/** A CV or a cover letter written for an offer and kept in the profile, to reuse it or start from it. */
export interface KeptDocument {
  id: string;
  category: string; // the career track of the offer it was written for, or "general"
  kind: "cv" | "cover_letter";
  title: string;
  language: string | null;
  createdOn: string;
  href: string | null;
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
  t: ProfileCopy;
  candidate: {
    name: string;
    imageUrl: string | null;
    githubLogin: string | null;
  };
  cvs: CvItem[];
  keptDocuments: KeptDocument[];
  /** The CV categories present, in order, for the tabs above the library ("all" is added here). */
  categories: { id: string; label: string }[];
  /** GitHub projects already in the base, and when the repositories were last read (null: never). */
  github: { projects: number; lastImport: string | null };
  selectedCv: SelectedCv | null;
  /** A document written for an offer and added to the profile, shown instead of a CV (?doc=). */
  selectedDocument: {
    id: string;
    title: string;
    href: string | null;
    content: TailoredCv | TailoredLetter;
    contacts: { kind: string; value: string }[];
  } | null;
  /** The merged profile (one entry per fact, duplicates folded in). */
  facts: ProfileFactView[];
  /** Validated fact texts by id, for the documents written for an offer. */
  factTexts: Record<string, string>;
  actions: {
    importGithub: () => Promise<Result>;
    importCodewars: (username: string) => Promise<Result>;
    importLeetcode: (username: string) => Promise<Result>;
    importCvText: (input: { fileName: string; text: string }) => Promise<Result>;
    removeCv: (sourceId: string) => Promise<Result>;
    structureCv: (sourceId: string) => Promise<Result>;
    editCvLine: (input: { sourceId: string; path: CvEditPath; value: string }) => Promise<Result>;
    chatFacts: (answers: { question: string; answer: string }[]) => Promise<Result>;
    reject: (ids: string[]) => Promise<Result>;
    edit: (input: { id: string; text: string; mergedIds: string[] }) => Promise<Result>;
    setAiAssisted: (input: { id: string; aiAssisted: boolean }) => Promise<Result>;
    keepDocument: (input: { id: string; kept: boolean }) => Promise<{ ok: true } | { ok: false; error: string }>;
    editDocumentLine: (input: { id: string; path: DocEditPath; value: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
    addManual: (input: { type: FactType; text: string }) => Promise<Result>;
  };
}

const MAX_PDF_BYTES = 5 * 1024 * 1024;

const SECTIONS: { type: FactType; Icon: typeof Briefcase }[] = [
  { type: "experience", Icon: Briefcase },
  { type: "project", Icon: FolderGit2 },
  { type: "skill", Icon: Wrench },
  { type: "education", Icon: GraduationCap },
  { type: "language", Icon: Languages },
  { type: "achievement", Icon: Award },
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

export function ProfileLibrary({ t, candidate, cvs, keptDocuments, categories, github, selectedCv, selectedDocument, facts, factTexts, actions }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [uploads, setUploads] = useState<
    {
      name: string;
      status: "reading" | "analysing" | "done" | "error";
      note?: string;
    }[]
  >([]);
  const [codewars, setCodewars] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [manual, setManual] = useState<{ type: FactType; text: string }>({
    type: "skill",
    text: "",
  });
  const [category, setCategory] = useState("all");
  const inCategory = (item: { category: string }) => category === "all" || item.category === category;
  const uploading = uploads.some((u) => u.status === "reading" || u.status === "analysing");
  const lineCopy = { editLine: t.editLine, save: t.save, cancel: t.cancel };

  const selectCv = (id: string) => router.push(`/profile?cv=${id}`, { scroll: false });

  function run(action: () => Promise<Result>, after?: () => void) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? { kind: "success", text: result.message } : { kind: "error", text: result.error });
      if (result.ok) after?.();
    });
  }

  /** For inline edits: shows an error, says whether to close the field, refreshes the page on success. */
  async function saveLine(action: () => Promise<Result>): Promise<boolean> {
    setMessage(null);
    const result = await action();
    if (!result.ok) setMessage({ kind: "error", text: result.error });
    else router.refresh();
    return result.ok;
  }

  /** The pencil on each sentence of a kept CV or letter: saved in place. */
  const documentEditing = (id: string) => ({
    t: { ...lineCopy, emptyRemoves: t.emptyRemoves },
    save: (path: DocEditPath, value: string) =>
      saveLine(async () => {
        const result = await actions.editDocumentLine({ id, path, value });
        return result.ok ? { ok: true, message: "" } : result;
      }),
  });

  async function handleFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (fileInput.current) fileInput.current.value = "";
    if (files.length === 0) return;
    setMessage(null);
    setUploads(files.map((f) => ({ name: f.name, status: "reading" })));
    let added: string | undefined;
    // One CV after the other: each one is read in the browser, then analysed by the AI.
    for (const [i, file] of files.entries()) {
      const update = (status: "reading" | "analysing" | "done" | "error", note?: string) => setUploads((u) => u.map((x, j) => (j === i ? { ...x, status, note } : x)));
      if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) {
        update("error", t.pdfOnly);
        continue;
      }
      if (file.size > MAX_PDF_BYTES) {
        update("error", t.tooBig);
        continue;
      }
      let text: string;
      try {
        text = await pdfToText(file);
      } catch {
        update("error", t.unreadable);
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
    <div className="space-y-8">
      <div className="no-print space-y-6">
        <PageHeading eyebrow={t.eyebrow} title={t.title}>
          <input ref={fileInput} type="file" accept="application/pdf,.pdf" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} aria-label={t.addCvsLabel} />
          <Button onClick={() => fileInput.current?.click()} disabled={uploading} className="w-full sm:w-auto">
            <Upload className="size-4" aria-hidden="true" /> {t.addCvs}
          </Button>
        </PageHeading>

        <p className="-mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t.intro}</p>

        {message && (
          <p role="status" className={`text-sm ${message.kind === "error" ? "text-destructive" : "text-success"}`}>
            {message.text}
          </p>
        )}

        {/* ---------- The CVs ---------- */}
        <section aria-labelledby="library-title">
          <SectionHeading
            eyebrow={t.libraryEyebrow}
            title={t.libraryTitle}
            id="library-title"
            aside={<span className="text-sm text-muted-foreground">{fill(t.cvCount, { count: cvs.length })}</span>}
          />
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
                  <span className="text-muted-foreground">{u.status === "reading" ? t.readingPdf : u.status === "analysing" ? t.analysing : u.note}</span>
                </li>
              ))}
            </ul>
          )}
          {categories.length > 1 && (
            <div className="mb-3 flex gap-1 overflow-x-auto" role="tablist" aria-label={t.cvCategories}>
              {[{ id: "all", label: t.allCvs }, ...categories].map((c) => {
                const n = c.id === "all" ? cvs.length + keptDocuments.length : [...cvs, ...keptDocuments].filter((x) => x.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={category === c.id}
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1 text-sm transition-colors",
                      category === c.id ? "border-earth bg-earth text-earth-foreground" : "border-earth/20 text-muted-foreground hover:border-earth/50 hover:text-foreground",
                    )}
                  >
                    {c.label} <span className="text-xs tabular-nums opacity-70">{n}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {cvs.filter(inCategory).map((cv) => {
              const shown = !selectedDocument && cv.id === selectedCv?.id;
              return (
                <article
                  key={cv.id}
                  className={cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border p-2.5", shown ? "border-primary bg-primary-soft/45" : "border-earth/20 bg-card")}
                >
                  <span className="grid size-8 shrink-0 place-items-center bg-earth text-earth-foreground">
                    <FileText className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-sans text-sm font-bold" title={cv.fileName}>
                      {cv.fileName.replace(/\.pdf$/i, "")}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fill(t.cvAdded, {
                        date: cv.importedAt,
                        count: cv.facts,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant={shown ? "default" : "outline"} onClick={() => selectCv(cv.id)} aria-pressed={shown}>
                      {shown ? t.shown : t.show}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      disabled={pending}
                      onClick={() => run(() => actions.removeCv(cv.id))}
                      aria-label={fill(t.removeNamed, { name: cv.fileName })}
                      title={t.remove}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </article>
              );
            })}
            {keptDocuments.filter(inCategory).map((doc) => {
              const shown = doc.id === selectedDocument?.id;
              return (
                <article
                  key={doc.id}
                  className={cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border p-2.5", shown ? "border-primary bg-primary-soft/45" : "border-earth/20 bg-card")}
                >
                  <span className="grid size-8 shrink-0 place-items-center bg-terracotta text-white">
                    <FileText className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-sans text-sm font-bold" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {doc.kind === "cv" ? t.keptCv : t.keptLetter}
                      {doc.language && ` · ${doc.language.toUpperCase()}`} · {doc.createdOn}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant={shown ? "default" : "outline"} onClick={() => router.push(`/profile?doc=${doc.id}`, { scroll: false })} aria-pressed={shown}>
                      {shown ? t.shown : t.show}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      disabled={pending}
                      aria-label={fill(t.takeOut, { title: doc.title })}
                      title={t.remove}
                      onClick={() =>
                        run(async () => {
                          const result = await actions.keepDocument({
                            id: doc.id,
                            kept: false,
                          });
                          return result.ok ? { ok: true, message: t.takenOut } : result;
                        })
                      }
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </article>
              );
            })}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border border-dashed border-earth/30 p-2.5 text-left text-muted-foreground transition hover:border-primary hover:bg-primary-soft/40"
            >
              <FilePlus2 className="size-5 text-primary" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">{cvs.length ? t.addMoreCvs : t.addFirstCv}</span>
                <span className="block truncate text-xs">{t.uploadHint}</span>
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* ---------- A document written for an offer and added to the profile ---------- */}
      {selectedDocument && (
        <section aria-labelledby="preview-title">
          <div className="no-print">
            <SectionHeading
              eyebrow={selectedDocument.content.kind === "tailored_cv" ? t.keptCv : t.keptLetter}
              title={selectedDocument.title}
              id="preview-title"
              aside={
                <div className="flex gap-2">
                  {selectedDocument.href && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={selectedDocument.href}>{t.openWithOffer}</Link>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => window.print()}>
                    <Printer className="size-4" aria-hidden="true" /> PDF
                  </Button>
                </div>
              }
            />
            <p className="-mt-2 mb-4 text-sm text-muted-foreground">{t.keptHint}</p>
          </div>
          {selectedDocument.content.kind === "tailored_cv" ? (
            <TailoredCvDocument
              cv={selectedDocument.content}
              candidate={{
                name: candidate.name,
                contacts: selectedDocument.contacts,
              }}
              facts={factTexts}
              edit={documentEditing(selectedDocument.id)}
            />
          ) : (
            <article className="print-page bg-card p-8 shadow-soft">
              <TailoredLetterDocument letter={selectedDocument.content} facts={factTexts} edit={documentEditing(selectedDocument.id)} />
            </article>
          )}
        </section>
      )}

      {/* ---------- The selected CV, as a document, every line editable ---------- */}
      {!selectedDocument && selectedCv && (
        <section aria-labelledby="preview-title">
          <div className="no-print">
            <SectionHeading
              eyebrow={t.selectedCv}
              title={selectedCv.fileName.replace(/\.pdf$/i, "")}
              id="preview-title"
              aside={
                <div className="flex flex-wrap gap-2">
                  {selectedCv.hasText && (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => actions.structureCv(selectedCv.id))}>
                      <RefreshCw className={cn("size-4", pending && "animate-spin")} aria-hidden="true" /> {selectedCv.document ? t.layOutAgain : t.layOut}
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
            {selectedCv.document && <p className="-mt-2 mb-4 text-sm text-muted-foreground">{t.cvHint}</p>}
          </div>
          {selectedCv.document ? (
            <CvDocumentView
              document={selectedCv.document}
              fallbackName={candidate.name}
              photoUrl={candidate.imageUrl}
              edit={{
                t: { ...lineCopy, emptyRemoves: t.emptyRemoves },
                save: (path, value) =>
                  saveLine(() =>
                    actions.editCvLine({
                      sourceId: selectedCv.id,
                      path,
                      value,
                    }),
                  ),
              }}
            />
          ) : (
            <div className="no-print border border-dashed border-earth/30 p-8 text-center text-sm text-muted-foreground">{selectedCv.hasText ? t.notLaidOut : t.noText}</div>
          )}
        </section>
      )}

      <div className="no-print space-y-8">
        {/* ---------- The merged profile ---------- */}
        <section aria-labelledby="base-title">
          <SectionHeading eyebrow={t.baseEyebrow} title={t.baseTitle} id="base-title" aside={<span className="text-sm text-muted-foreground">{fill(t.factCount, { count: facts.length })}</span>} />
          <p className="-mt-2 mb-4 max-w-3xl text-sm text-muted-foreground">{t.baseHint}</p>
          <article className="overflow-hidden border border-earth/20 bg-card shadow-soft" aria-label={fill(t.baseOf, { name: candidate.name })}>
            <header className="flex items-center gap-4 bg-primary-soft/55 px-5 py-4 sm:px-8">
              {candidate.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- remote avatar from Clerk
                <img src={candidate.imageUrl} width={56} height={56} alt="" className="aspect-square w-14 shrink-0 border-2 border-primary object-cover" />
              )}
              <div className="min-w-0">
                <h3 className="truncate text-2xl text-earth dark:text-foreground">{candidate.name}</h3>
                {candidate.githubLogin && <p className="mt-1 text-sm text-muted-foreground">github.com/{candidate.githubLogin}</p>}
              </div>
            </header>
            <div className="px-5 py-2 sm:px-8">
              {facts.length === 0 && <p className="text-sm text-muted-foreground">{t.nothingYet}</p>}
              {SECTIONS.map(({ type, Icon }) => {
                const all = facts.filter((f) => f.type === type);
                if (all.length === 0) return null;
                const own = all.filter((f) => !f.aiAssisted);
                const vibe = all.filter((f) => f.aiAssisted);
                const row = (fact: ProfileFactView) => (
                  <FactRow
                    key={fact.id}
                    fact={fact}
                    t={t}
                    disabled={pending}
                    onSave={(text) =>
                      saveLine(() =>
                        actions.edit({
                          id: fact.id,
                          text,
                          mergedIds: fact.mergedIds,
                        }),
                      )
                    }
                    onDelete={() => run(() => actions.reject([fact.id, ...fact.mergedIds]))}
                    onToggleAi={
                      type === "project"
                        ? (aiAssisted) =>
                            run(async () => {
                              const results = await Promise.all([fact.id, ...fact.mergedIds].map((id) => actions.setAiAssisted({ id, aiAssisted })));
                              return results.find((r) => !r.ok) ?? results[0];
                            })
                        : undefined
                    }
                    lineCopy={lineCopy}
                  />
                );
                return (
                  <section key={type} className="py-3">
                    <h4 className="mb-2 flex items-center gap-2 border-b-2 border-primary pb-1.5 font-sans text-base font-bold text-earth uppercase dark:text-foreground">
                      <Icon className="size-4 text-primary" aria-hidden="true" /> {t.sections[type]}
                    </h4>
                    <ul className="space-y-1">{own.map(row)}</ul>
                    {vibe.length > 0 && (
                      <div className="mt-3 rounded-lg border border-dashed border-earth/30 p-3">
                        <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                          <Sparkles className="size-3.5" aria-hidden="true" /> {t.builtWithAiTitle}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{t.builtWithAiHint}</p>
                        <ul className="mt-2 space-y-1">{vibe.map(row)}</ul>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </article>
        </section>

        <section aria-labelledby="enrich-title">
          <SectionHeading eyebrow={t.enrichEyebrow} title={t.enrichTitle} id="enrich-title" />
          <p className="-mt-2 mb-2 max-w-3xl text-sm text-muted-foreground">{t.enrichHint}</p>
          <div className="border-t border-earth/20">
          {/* ---------- GitHub ---------- */}
          <ImportSection
            icon={<FolderGit2 className="size-4" aria-hidden="true" />}
            eyebrow={t.githubEyebrow}
            title={t.githubTitle}
            body={candidate.githubLogin ? fill(t.githubBody, { login: candidate.githubLogin }) : t.githubSignIn}
          >
            <div className="flex flex-col gap-1.5 lg:items-end">
              {github.lastImport || github.projects > 0 ? (
                <p className="flex items-center gap-1.5 text-sm text-success">
                  <Check className="size-4" aria-hidden="true" />
                  {github.lastImport ? fill(t.githubDone, { date: github.lastImport, count: github.projects }) : fill(t.githubDoneNoDate, { count: github.projects })}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{t.githubNever}</p>
              )}
              <Button variant="outline" className="w-fit" disabled={pending || !candidate.githubLogin} onClick={() => run(actions.importGithub)}>
                {pending ? <RefreshCw className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}{" "}
                {github.lastImport || github.projects > 0 ? t.updateRepos : t.importRepos}
              </Button>
            </div>
          </ImportSection>

          {/* ---------- Codewars and LeetCode ---------- */}
          <ImportSection icon={<Swords className="size-4" aria-hidden="true" />} eyebrow={t.challengesEyebrow} title={t.challengesTitle} body={t.challengesBody}>
            <div className="grid gap-2 sm:grid-cols-2">
              <ChallengeInput label={t.codewarsUser} value={codewars} onChange={setCodewars} button={t.import} disabled={pending} onImport={() => run(() => actions.importCodewars(codewars.trim()))} />
              <ChallengeInput label={t.leetcodeUser} value={leetcode} onChange={setLeetcode} button={t.import} disabled={pending} onImport={() => run(() => actions.importLeetcode(leetcode.trim()))} />
            </div>
          </ImportSection>

          {/* ---------- Onboarding chat ---------- */}
          <OnboardingChat t={t} pending={pending} onFinish={(answers) => run(() => actions.chatFacts(answers))} />

          {/* ---------- By hand ---------- */}
          <ImportSection icon={<Plus className="size-4" aria-hidden="true" />} eyebrow={t.manualEyebrow} title={t.manualTitle} body={t.manualBody}>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <select
                className="h-9 rounded-md border bg-transparent px-2 text-sm"
                value={manual.type}
                onChange={(e) => setManual((m) => ({ ...m, type: e.target.value as FactType }))}
                aria-label={t.factType}
              >
                {SECTIONS.map((s) => (
                  <option key={s.type} value={s.type}>
                    {t.sections[s.type]}
                  </option>
                ))}
              </select>
              <Input placeholder={t.factPlaceholder} value={manual.text} onChange={(e) => setManual((m) => ({ ...m, text: e.target.value }))} aria-label={t.factText} className="sm:flex-1" />
              <Button
                disabled={pending || manual.text.trim().length < 3}
                onClick={() =>
                  run(
                    () =>
                      actions.addManual({
                        type: manual.type,
                        text: manual.text.trim(),
                      }),
                    () => setManual((m) => ({ ...m, text: "" })),
                  )
                }
              >
                {t.add}
              </Button>
            </div>
          </ImportSection>
          </div>
        </section>
      </div>
    </div>
  );
}

/** One fact of the merged profile: its text with a pencil, where it comes from, and quiet actions on the side. */
function FactRow({
  fact,
  t,
  disabled,
  onSave,
  onDelete,
  onToggleAi,
  lineCopy,
}: {
  fact: ProfileFactView;
  t: ProfileCopy;
  disabled: boolean;
  onSave: (text: string) => Promise<boolean>;
  onDelete: () => void;
  onToggleAi?: (aiAssisted: boolean) => void;
  lineCopy: { editLine: string; save: string; cancel: string };
}) {
  const also = fact.mergedIds.length;
  return (
    <li className="group flex items-start justify-between gap-3 text-sm leading-relaxed">
      <span className="min-w-0 flex-1">
        <EditableLine value={fact.text} onSave={onSave} t={lineCopy} />{" "}
        <span className="text-xs text-muted-foreground">
          · {fact.origin}
          {also > 0 && ` · ${also === 1 ? t.alsoInOne : fill(t.alsoInMany, { count: also })}`}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {onToggleAi && (
          <button
            type="button"
            aria-pressed={fact.aiAssisted}
            disabled={disabled}
            onClick={() => onToggleAi(!fact.aiAssisted)}
            title={fact.aiAssisted ? t.aiToggleOn : t.aiToggleOff}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] transition-colors disabled:opacity-50",
              fact.aiAssisted ? "border-terracotta/40 bg-terracotta-soft text-terracotta" : "border-earth/20 text-muted-foreground hover:text-foreground",
            )}
          >
            <Sparkles className="size-3" aria-hidden="true" /> {fact.aiAssisted ? t.aiOn : t.aiOff}
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          aria-label={fill(t.deleteFact, { text: fact.text })}
          className="grid size-6 place-items-center rounded text-muted-foreground/70 transition-opacity hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      </span>
    </li>
  );
}

function ChallengeInput({
  label,
  value,
  onChange,
  button,
  disabled,
  onImport,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  button: string;
  disabled: boolean;
  onImport: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Input placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="min-w-0" />
      <Button variant="outline" disabled={disabled || !value.trim()} onClick={onImport}>
        {button}
      </Button>
    </div>
  );
}

function ImportSection({ icon, eyebrow, title, body, children }: { icon: ReactNode; eyebrow: string; title: string; body: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-b border-earth/20 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-center lg:gap-10">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">
          {icon} {eyebrow}
        </p>
        <h2 className="mt-1 text-lg text-earth dark:text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      {children}
    </section>
  );
}

function OnboardingChat({ t, pending, onFinish }: { t: ProfileCopy; pending: boolean; onFinish: (answers: { question: string; answer: string }[]) => void }) {
  const questions = t.chatQuestions;
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const step = answers.length;
  const done = step >= questions.length;
  const next = () => {
    setAnswers((a) => [...a, draft.trim()]);
    setDraft("");
  };

  return (
    <section className="flex flex-col gap-3 border-b border-earth/20 py-4" aria-labelledby="chat-title">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-center lg:gap-10">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">
            <MessageCircle className="size-4" aria-hidden="true" /> {t.chatEyebrow}
          </p>
          <h2 id="chat-title" className="mt-1 text-lg text-earth dark:text-foreground">
            {t.chatTitle}
          </h2>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{t.chatBody}</p>
        </div>
        {!open && (
          <Button variant="outline" className="w-fit lg:justify-self-end" onClick={() => setOpen(true)}>
            <MessageCircle className="size-4" aria-hidden="true" /> {t.start}
          </Button>
        )}
      </div>
      {open && (
        <div className="flex max-w-3xl flex-col gap-3">
          {questions.slice(0, Math.min(step + 1, questions.length)).map((q, i) => (
            <div key={q} className="flex flex-col gap-2">
              <p className="w-fit max-w-[85%] rounded-lg rounded-tl-none bg-primary-soft px-3 py-2 text-sm">{q}</p>
              {answers[i] !== undefined && <p className="ml-auto w-fit max-w-[85%] rounded-lg rounded-tr-none bg-earth px-3 py-2 text-sm text-earth-foreground">{answers[i] || t.skipped}</p>}
            </div>
          ))}
          {!done ? (
            <div className="flex gap-2">
              <Input autoFocus value={draft} placeholder={t.answerPlaceholder} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()} aria-label={t.yourAnswer} />
              <Button onClick={next} aria-label={t.send}>
                <Send className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={pending}
                onClick={() =>
                  onFinish(
                    questions.map((question, i) => ({
                      question,
                      answer: answers[i] ?? "",
                    })),
                  )
                }
              >
                {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} {t.extract}
              </Button>
              <Button variant="ghost" onClick={() => setAnswers([])}>
                {t.startAgain}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
