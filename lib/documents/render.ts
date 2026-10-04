import type { DocumentLanguage, SourcedSentence, TailoredCv, TailoredDocument, TailoredEntry, TailoredLetter } from "@/lib/types";

// Section titles and plain text of the documents written for an offer, in their own language (not the
// language of the interface): a French CV has French headings. Pure (tests/documents/tailored-documents.test.ts).

export const DOC_HEADINGS: Record<DocumentLanguage, Record<"summary" | "skills" | "projects" | "more" | "education" | "experience" | "languages" | "letter" | "builtWithAi", string>> = {
  en: {
    summary: "Profile",
    skills: "Technical skills",
    projects: "Projects",
    more: "Also on GitHub",
    education: "Education & training",
    experience: "Experience",
    languages: "Languages",
    letter: "Cover letter",
    builtWithAi: "built with AI assistance",
  },
  fr: {
    summary: "Profil",
    skills: "Compétences techniques",
    projects: "Projets",
    more: "Aussi sur GitHub",
    education: "Formations",
    experience: "Expérience",
    languages: "Langues",
    letter: "Lettre de motivation",
    builtWithAi: "réalisé avec l'aide de l'IA",
  },
};

export function isDocumentLanguage(value: unknown): value is DocumentLanguage {
  return value === "en" || value === "fr";
}

const entryLines = (entry: TailoredEntry, builtWithAi: string): string[] => [
  [entry.title, entry.context, entry.aiAssisted ? builtWithAi : null, entry.link].filter(Boolean).join(" · "),
  ...(entry.tags.length ? [entry.tags.map((t) => t.name).join(", ")] : []),
  ...entry.bullets.map((b) => `- ${b.text}`),
];

/** The CV as plain text, to paste into a form or a mail. */
export function tailoredCvText(cv: TailoredCv, header: { name: string; contacts: readonly string[] }): string {
  const t = DOC_HEADINGS[cv.language];
  const blocks: string[][] = [[header.name, ...(cv.headline ? [cv.headline] : []), ...(header.contacts.length ? [header.contacts.join(" · ")] : [])]];
  if (cv.summary.length) blocks.push([t.summary.toUpperCase(), cv.summary.map((s) => s.text).join(" ")]);
  if (cv.skills.length) blocks.push([t.skills.toUpperCase(), ...cv.skills.map((g) => `${g.category}: ${g.items.map((i) => i.name).join(", ")}`)]);
  if (cv.projects.length || cv.moreProjects.length) {
    blocks.push([
      t.projects.toUpperCase(),
      ...cv.projects.flatMap((p) => [...entryLines(p, t.builtWithAi), ""]),
      ...(cv.moreProjects.length ? [`${t.more}: ${cv.moreProjects.map((p) => p.name).join(" · ")}`] : []),
    ]);
  }
  for (const [title, entries] of [[t.education, cv.education], [t.experience, cv.experience]] as const) {
    if (entries.length) blocks.push([title.toUpperCase(), ...entries.flatMap((e) => [...entryLines(e, t.builtWithAi), ""])]);
  }
  if (cv.languages.length) blocks.push([t.languages.toUpperCase(), cv.languages.map((l) => `${l.name}: ${l.level}`).join(" · ")]);
  return blocks
    .map((b) => b.join("\n").trimEnd())
    .join("\n\n")
    .trim();
}

export function letterText(letter: TailoredLetter): string {
  return [letter.greeting, ...letter.paragraphs.map((p) => p.map((s) => s.text).join(" ")), letter.closing].join("\n\n");
}

/** Every line of a document with its facts, for counts and texts that read `documents.sentences`. */
export function documentSentences(doc: TailoredDocument): (SourcedSentence & { section?: string })[] {
  if (doc.kind === "cover_letter") return doc.paragraphs.flat().map(({ text, factIds }) => ({ text, factIds }));
  const t = DOC_HEADINGS[doc.language];
  const entry = (section: string) => (e: TailoredEntry) => e.bullets.map((b) => ({ ...b, section: `${section} · ${e.title}` }));
  return [
    ...doc.summary.map((s) => ({ ...s, section: t.summary })),
    ...doc.projects.flatMap(entry(t.projects)),
    ...doc.education.flatMap(entry(t.education)),
    ...doc.experience.flatMap(entry(t.experience)),
  ];
}

/** Every fact a document relies on (to tell which relevant facts it leaves out). */
export function documentFactIds(doc: TailoredDocument): string[] {
  if (doc.kind === "cover_letter") return [...new Set(doc.paragraphs.flat().flatMap((s) => s.factIds))];
  const entry = (e: TailoredEntry) => [...e.factIds, ...e.tags.flatMap((t) => t.factIds), ...e.bullets.flatMap((b) => b.factIds)];
  return [
    ...new Set([
      ...doc.summary.flatMap((s) => s.factIds),
      ...doc.skills.flatMap((g) => g.items.flatMap((i) => i.factIds)),
      ...doc.projects.flatMap(entry),
      ...doc.moreProjects.flatMap((p) => p.factIds),
      ...doc.education.flatMap(entry),
      ...doc.experience.flatMap(entry),
      ...doc.languages.flatMap((l) => l.factIds),
    ]),
  ];
}
