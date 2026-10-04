import { AlertTriangle, Check, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { EditableLine, type EditableLineCopy } from "@/components/shared/editable-line";
import type { DocEditPath } from "@/lib/documents/edit";
import { DOC_HEADINGS } from "@/lib/documents/render";
import type { SourcedSentence, TailoredCv, TailoredEntry, TailoredItem, TailoredLetter } from "@/lib/types";
import { cn } from "@/lib/utils";

// A CV written for one offer, laid out like a tech CV (header, profile, skills table, projects, education,
// experience, languages), and its cover letter. On screen, each line shows whether facts prove it; the
// marks are hidden when printing. With `edit`, each sentence gets a small pencil to change it by hand,
// without writing the document again.

type Facts = Record<string, string>;

export interface DocEditing {
  save: (path: DocEditPath, value: string) => Promise<boolean>;
  t: EditableLineCopy & { emptyRemoves: string };
}

/** A piece of text, editable when the page allows it. */
function Editable({ edit, path, value, removable = true, children }: { edit?: DocEditing; path: DocEditPath; value: string; removable?: boolean; children?: ReactNode }) {
  if (!edit) return <>{children ?? value}</>;
  return (
    <EditableLine value={value} onSave={(next) => edit.save(path, next)} t={edit.t} hint={removable ? edit.t.emptyRemoves : undefined}>
      {children}
    </EditableLine>
  );
}

function Proof({ factIds, facts }: { factIds: string[]; facts: Facts }) {
  if (factIds.length === 0) {
    return (
      <span className="no-print ml-1 inline-flex items-center gap-1 rounded-full border border-gap/30 bg-gap-soft px-1.5 py-0.5 align-middle text-[10px] font-semibold text-gap">
        <AlertTriangle className="size-3" aria-hidden="true" /> Unsupported
      </span>
    );
  }
  return (
    <span className="no-print ml-1 inline-flex align-middle text-success" title={factIds.map((id) => facts[id] ?? "fact").join("\n")}>
      <Check className="size-3" aria-label={`${factIds.length} fact${factIds.length > 1 ? "s" : ""}`} />
    </span>
  );
}

function Line({ s, facts, edit, path }: { s: SourcedSentence & { fromOffer?: boolean }; facts: Facts; edit?: DocEditing; path: DocEditPath }) {
  return (
    <>
      <Editable edit={edit} path={path} value={s.text}>
        <span className={cn(s.factIds.length === 0 && !s.fromOffer && "unsupported-underline")}>{s.text}</span>
      </Editable>
      {s.fromOffer ? (
        <span className="no-print ml-1 rounded-full bg-muted px-1.5 py-0.5 align-middle text-[10px] text-muted-foreground">offer</span>
      ) : (
        <Proof factIds={s.factIds} facts={facts} />
      )}
    </>
  );
}

function Tags({ items }: { items: TailoredItem[] }) {
  if (!items.length) return null;
  return (
    <p className="mt-1.5 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t.name} className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[11px] text-earth dark:text-foreground">
          {t.name}
        </span>
      ))}
    </p>
  );
}

function Entry({
  entry,
  facts,
  builtWithAi,
  edit,
  section,
  index,
}: {
  entry: TailoredEntry;
  facts: Facts;
  builtWithAi: string;
  edit?: DocEditing;
  section: "projects" | "education" | "experience";
  index: number;
}) {
  return (
    <div className="break-inside-avoid py-2.5">
      <h4 className="font-sans text-base font-bold text-earth italic dark:text-foreground">{entry.title}</h4>
      <p className="text-xs text-muted-foreground italic">
        {[entry.context].filter(Boolean).join(" · ")}
        {entry.aiAssisted && (
          <span className="ml-1 inline-flex items-center gap-1 not-italic">
            <Sparkles className="size-3" aria-hidden="true" /> {builtWithAi}
          </span>
        )}
        {entry.link && (
          <>
            {" · "}
            <a href={entry.link} className="text-primary underline" target="_blank" rel="noopener noreferrer">
              {entry.link.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </>
        )}
      </p>
      <Tags items={entry.tags} />
      {entry.bullets.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          {entry.bullets.map((b, i) => (
            <li key={i}>
              <Line s={b} facts={facts} edit={edit} path={{ part: "bullet", section, entry: index, index: i }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-primary/40 pt-4 pb-2">
      <h3 className="mb-2 font-sans text-sm font-bold tracking-widest text-earth uppercase dark:text-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function TailoredCvDocument({
  cv,
  candidate,
  facts,
  edit,
}: {
  cv: TailoredCv;
  candidate: { name: string; contacts: { kind: string; value: string }[] };
  facts: Facts;
  edit?: DocEditing;
}) {
  const t = DOC_HEADINGS[cv.language];
  return (
    <article className="print-page overflow-hidden border border-earth/20 bg-card shadow-soft" lang={cv.language} aria-label={`${candidate.name} — CV`}>
      <header className="bg-primary-soft/60 px-6 py-6 text-center sm:px-10">
        <h2 className="text-3xl text-earth sm:text-4xl dark:text-foreground">{candidate.name}</h2>
        {cv.headline && (
          <p className="mt-1 font-sans text-lg font-bold text-earth dark:text-foreground">
            <Editable edit={edit} path={{ part: "headline" }} value={cv.headline} />
          </p>
        )}
        {candidate.contacts.length > 0 && <p className="mt-2 text-sm text-muted-foreground">{candidate.contacts.map((c) => c.value).join(" · ")}</p>}
      </header>
      <div className="space-y-2 px-6 py-5 sm:px-10">
        {cv.summary.length > 0 && (
          <Section title={t.summary}>
            <p className="border-l-4 border-primary/40 pl-4 text-sm leading-relaxed">
              {cv.summary.map((s, i) => (
                <span key={i}>
                  <Line s={s} facts={facts} edit={edit} path={{ part: "summary", index: i }} />{" "}
                </span>
              ))}
            </p>
          </Section>
        )}
        {cv.skills.length > 0 && (
          <Section title={t.skills}>
            <table className="w-full text-sm">
              <tbody>
                {cv.skills.map((group) => (
                  <tr key={group.category} className="align-top">
                    <th scope="row" className="w-36 py-1 pr-4 text-right font-bold">
                      {group.category}
                    </th>
                    <td className="py-1">
                      <Tags items={group.items} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}
        {(cv.projects.length > 0 || cv.moreProjects.length > 0) && (
          <Section title={t.projects}>
            {cv.projects.map((p, i) => (
              <Entry key={p.title} entry={p} facts={facts} builtWithAi={t.builtWithAi} edit={edit} section="projects" index={i} />
            ))}
            {cv.moreProjects.length > 0 && (
              <p className="pt-2 text-sm">
                <span className="font-bold">{t.more}</span> — {cv.moreProjects.map((p) => p.name).join(" · ")}
              </p>
            )}
          </Section>
        )}
        {cv.education.length > 0 && (
          <Section title={t.education}>
            {cv.education.map((e, i) => (
              <Entry key={e.title} entry={e} facts={facts} builtWithAi={t.builtWithAi} edit={edit} section="education" index={i} />
            ))}
          </Section>
        )}
        {cv.experience.length > 0 && (
          <Section title={t.experience}>
            {cv.experience.map((e, i) => (
              <Entry key={e.title} entry={e} facts={facts} builtWithAi={t.builtWithAi} edit={edit} section="experience" index={i} />
            ))}
          </Section>
        )}
        {cv.languages.length > 0 && (
          <Section title={t.languages}>
            <p className="text-sm">
              {cv.languages.map((l, i) => (
                <span key={l.name}>
                  {i > 0 && " · "}
                  <span className="font-bold">{l.name}</span> {l.level}
                </span>
              ))}
            </p>
          </Section>
        )}
      </div>
    </article>
  );
}

export function TailoredLetterDocument({ letter, facts, edit }: { letter: TailoredLetter; facts: Facts; edit?: DocEditing }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed" lang={letter.language}>
      <p>
        <Editable edit={edit} path={{ part: "greeting" }} value={letter.greeting} removable={false} />
      </p>
      {letter.paragraphs.map((paragraph, i) => (
        <p key={i}>
          {paragraph.map((s, j) => (
            <span key={j}>
              <Line s={s} facts={facts} edit={edit} path={{ part: "sentence", paragraph: i, index: j }} />{" "}
            </span>
          ))}
        </p>
      ))}
      <p className="whitespace-pre-line">
        <Editable edit={edit} path={{ part: "closing" }} value={letter.closing} removable={false} />
      </p>
    </div>
  );
}
