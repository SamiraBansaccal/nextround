import { Cake, Flag, FolderGit2, Globe, Info, Link2, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { EditableLine, type EditableLineCopy } from "@/components/shared/editable-line";
import type { CvEditPath } from "@/lib/profile/cv-edit";
import type { CvContactKind, CvDocument, CvEntry } from "@/lib/types";

// A CV shown as a document, as in the Lovable design (profile page). Every string comes from the
// document laid out from the PDF (lib/profile/cv-document.ts). With `edit`, each line gets a small
// pencil to fix it (a date, a typo, a capital letter). Section titles follow the CV's language.

export interface CvEditing {
  save: (path: CvEditPath, value: string) => Promise<boolean>;
  t: EditableLineCopy & { emptyRemoves: string };
}

/** A line of the CV, editable when the page allows it. */
function Line({ edit, path, value, removable = false, children }: { edit?: CvEditing; path: CvEditPath; value: string; removable?: boolean; children?: ReactNode }) {
  if (!edit) return <>{children ?? value}</>;
  return (
    <EditableLine value={value} onSave={(next) => edit.save(path, next)} t={edit.t} hint={removable ? edit.t.emptyRemoves : undefined}>
      {children}
    </EditableLine>
  );
}

const HEADINGS: Record<string, { cv: string; contact: string; experience: string; education: string; languages: string; skills: string; grid: string[] }> = {
  fr: { cv: "Curriculum Vitae", contact: "Coordonnées", experience: "Expériences", education: "Formations", languages: "Compétences linguistiques", skills: "Compétences", grid: ["Langue", "Compréhension orale", "Compréhension écrite", "Expression orale", "Interaction", "Écrit"] },
  en: { cv: "Curriculum Vitae", contact: "Contact", experience: "Experience", education: "Education", languages: "Languages", skills: "Skills", grid: ["Language", "Listening", "Reading", "Spoken production", "Spoken interaction", "Writing"] },
  nl: { cv: "Curriculum Vitae", contact: "Contactgegevens", experience: "Werkervaring", education: "Opleiding", languages: "Talenkennis", skills: "Vaardigheden", grid: ["Taal", "Luisteren", "Lezen", "Spreken", "Gesprekken voeren", "Schrijven"] },
  de: { cv: "Lebenslauf", contact: "Kontakt", experience: "Berufserfahrung", education: "Ausbildung", languages: "Sprachkenntnisse", skills: "Kenntnisse", grid: ["Sprache", "Hören", "Lesen", "Sprechen", "An Gesprächen teilnehmen", "Schreiben"] },
  es: { cv: "Currículum vitae", contact: "Contacto", experience: "Experiencia", education: "Formación", languages: "Idiomas", skills: "Competencias", grid: ["Idioma", "Comprensión auditiva", "Comprensión lectora", "Expresión oral", "Interacción oral", "Expresión escrita"] },
  it: { cv: "Curriculum vitae", contact: "Contatti", experience: "Esperienze", education: "Formazione", languages: "Competenze linguistiche", skills: "Competenze", grid: ["Lingua", "Ascolto", "Lettura", "Produzione orale", "Interazione", "Scrittura"] },
};

const CONTACT_ICON: Record<CvContactKind, ReactNode> = {
  email: <Mail />,
  phone: <Phone />,
  address: <MapPin />,
  website: <Globe />,
  linkedin: <Link2 />,
  github: <FolderGit2 />,
  birthdate: <Cake />,
  nationality: <Flag />,
  other: <Info />,
};

export function CvDocumentView({ document, fallbackName, photoUrl, edit }: { document: CvDocument; fallbackName: string; photoUrl: string | null; edit?: CvEditing }) {
  const t = HEADINGS[document.language] ?? HEADINGS.en;
  const name = document.name ?? fallbackName;
  const grid = document.languages.some((l) => l.listening || l.reading || l.spoken || l.interaction || l.writing);

  return (
    <article className="print-page overflow-hidden border border-earth/20 bg-card shadow-soft" aria-label={`${t.cv} — ${name}`}>
      <header className="grid gap-5 bg-primary-soft/55 p-5 sm:grid-cols-[minmax(0,1fr)_112px] sm:items-center sm:p-8 lg:px-12">
        <div className="min-w-0 text-center sm:text-left">
          <p className="font-display text-xl text-earth">{t.cv}</p>
          <h3 className="mt-1 text-3xl text-earth sm:text-4xl">{name}</h3>
          {document.headline && (
            <p className="mt-2 text-sm text-muted-foreground">
              <Line edit={edit} path={{ part: "headline" }} value={document.headline} removable />
            </p>
          )}
        </div>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- the avatar comes from Clerk's CDN
          <img src={photoUrl} width={112} height={112} alt="" className="mx-auto aspect-square w-24 border-4 border-primary object-cover sm:w-28" />
        )}
      </header>

      <div className="p-5 sm:p-8 lg:p-12">
        {document.contacts.length > 0 && (
          <section className="grid gap-4 border-b-2 border-primary pb-6 md:grid-cols-[180px_minmax(0,1fr)]">
            <h4 className="font-sans text-lg font-bold text-earth uppercase">{t.contact}</h4>
            <dl className="grid gap-2 text-sm">
              {document.contacts.map((c, i) => (
                <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
                  <span className="mt-0.5 [&>svg]:size-4 [&>svg]:text-primary" aria-hidden="true">
                    {CONTACT_ICON[c.kind]}
                  </span>
                  <div className="min-w-0">
                    {c.label && <dt className="inline font-bold text-earth">{c.label} : </dt>}
                    <dd className="inline break-words">{c.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>
        )}

        <CvBlock title={t.experience} entries={document.experiences} section="experiences" edit={edit} />
        <CvBlock title={t.education} entries={document.education} section="education" edit={edit} />

        {document.languages.length > 0 && (
          <section className="border-t-2 border-primary pt-5 pb-7">
            <h4 className="mb-5 font-sans text-lg font-bold text-earth uppercase">{t.languages}</h4>
            {grid ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-center text-xs">
                  <thead>
                    <tr className="bg-primary-soft">
                      {t.grid.map((h, i) => (
                        <th key={h} className={i === 0 ? "p-2 text-left" : "p-2"}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {document.languages.map((l, i) => (
                      <tr key={i} className="border-b border-primary/15">
                        <th className="p-2 text-left text-primary">
                          <Line edit={edit} path={{ part: "language", index: i, field: "name" }} value={l.name} />
                        </th>
                        {[l.listening, l.reading, l.spoken, l.interaction, l.writing].map((v, i) => (
                          <td key={i} className="p-2">
                            {v ?? (i === 0 ? l.level : null) ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
                {document.languages.map((l, i) => (
                  <li key={i}>
                    <span className="font-bold text-primary">
                      <Line edit={edit} path={{ part: "language", index: i, field: "name" }} value={l.name} />
                    </span>
                    {l.level && (
                      <span>
                        {" — "}
                        <Line edit={edit} path={{ part: "language", index: i, field: "level" }} value={l.level} removable />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {document.skills.length > 0 && (
          <section className="border-t-2 border-primary pt-5">
            <h4 className="mb-4 font-sans text-lg font-bold text-earth uppercase">{t.skills}</h4>
            <ul className="flex flex-wrap gap-2 text-sm">
              {document.skills.map((s, i) => (
                <li key={i} className="border border-primary/25 bg-primary-soft/40 px-2.5 py-1">
                  <Line edit={edit} path={{ part: "skill", index: i }} value={s} removable />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

function CvBlock({ title, entries, section, edit }: { title: string; entries: CvEntry[]; section: "experiences" | "education"; edit?: CvEditing }) {
  if (entries.length === 0) return null;
  return (
    <section className="py-7">
      <h4 className="mb-6 border-b-2 border-primary pb-3 font-sans text-lg font-bold text-earth uppercase">{title}</h4>
      <div className="space-y-7">
        {entries.map((entry, i) => (
          <article key={i} className="grid gap-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-6">
            <div className="text-sm text-primary">
              {entry.location && (
                <p className="font-bold">
                  <Line edit={edit} path={{ part: "entry", section, index: i, field: "location" }} value={entry.location} removable />
                </p>
              )}
              {entry.period && (
                <p className="italic">
                  <Line edit={edit} path={{ part: "entry", section, index: i, field: "period" }} value={entry.period} removable />
                </p>
              )}
            </div>
            <div className="min-w-0">
              <h5 className="font-sans text-sm font-bold text-earth sm:text-base">
                <Line edit={edit} path={{ part: "entry", section, index: i, field: "title" }} value={entry.title} />
              </h5>
              {entry.organisation && (
                <p className="text-sm text-primary">
                  <Line edit={edit} path={{ part: "entry", section, index: i, field: "organisation" }} value={entry.organisation} removable />
                </p>
              )}
              {entry.details.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm leading-relaxed">
                  {entry.details.map((detail, j) => (
                    <li key={j}>
                      <Line edit={edit} path={{ part: "detail", section, index: i, detail: j }} value={detail} removable />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
