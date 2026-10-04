import { AlertTriangle, Check, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { DOC_HEADINGS } from "@/lib/documents/render";
import type { SourcedSentence, TailoredCv, TailoredEntry, TailoredItem, TailoredLetter } from "@/lib/types";
import { cn } from "@/lib/utils";

// A CV written for one offer, laid out like a tech CV (header, profile, skills table, projects, education,
// experience, languages), and its cover letter. On screen, each line shows whether facts prove it; the
// marks are hidden when printing.

type Facts = Record<string, string>;

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

function Line({ s, facts }: { s: SourcedSentence & { fromOffer?: boolean }; facts: Facts }) {
  return (
    <>
      <span className={cn(s.factIds.length === 0 && !s.fromOffer && "unsupported-underline")}>{s.text}</span>
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

function Entry({ entry, facts, builtWithAi }: { entry: TailoredEntry; facts: Facts; builtWithAi: string }) {
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
              <Line s={b} facts={facts} />
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
}: {
  cv: TailoredCv;
  candidate: { name: string; contacts: { kind: string; value: string }[] };
  facts: Facts;
}) {
  const t = DOC_HEADINGS[cv.language];
  return (
    <article className="print-page overflow-hidden border border-earth/20 bg-card shadow-soft" lang={cv.language} aria-label={`${candidate.name} — CV`}>
      <header className="bg-primary-soft/60 px-6 py-6 text-center sm:px-10">
        <h2 className="text-3xl text-earth sm:text-4xl dark:text-foreground">{candidate.name}</h2>
        {cv.headline && <p className="mt-1 font-sans text-lg font-bold text-earth dark:text-foreground">{cv.headline}</p>}
        {candidate.contacts.length > 0 && <p className="mt-2 text-sm text-muted-foreground">{candidate.contacts.map((c) => c.value).join(" · ")}</p>}
      </header>
      <div className="space-y-2 px-6 py-5 sm:px-10">
        {cv.summary.length > 0 && (
          <Section title={t.summary}>
            <p className="border-l-4 border-primary/40 pl-4 text-sm leading-relaxed">
              {cv.summary.map((s, i) => (
                <span key={i}>
                  <Line s={s} facts={facts} />{" "}
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
            {cv.projects.map((p) => (
              <Entry key={p.title} entry={p} facts={facts} builtWithAi={t.builtWithAi} />
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
            {cv.education.map((e) => (
              <Entry key={e.title} entry={e} facts={facts} builtWithAi={t.builtWithAi} />
            ))}
          </Section>
        )}
        {cv.experience.length > 0 && (
          <Section title={t.experience}>
            {cv.experience.map((e) => (
              <Entry key={e.title} entry={e} facts={facts} builtWithAi={t.builtWithAi} />
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

export function TailoredLetterDocument({ letter, facts }: { letter: TailoredLetter; facts: Facts }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed" lang={letter.language}>
      <p>{letter.greeting}</p>
      {letter.paragraphs.map((paragraph, i) => (
        <p key={i}>
          {paragraph.map((s, j) => (
            <span key={j}>
              <Line s={s} facts={facts} />{" "}
            </span>
          ))}
        </p>
      ))}
      <p className="whitespace-pre-line">{letter.closing}</p>
    </div>
  );
}
