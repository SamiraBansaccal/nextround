import type { FactType, TailoredDocument, TailoredEntry } from "@/lib/types";

// The sentences of a CV or a letter that the candidate wrote or corrected by hand (`edited`): once the
// document is in the profile, they join the base as facts, because they are the candidate's own words
// and may say more than the facts they were written from. The sentences written by the AI do not: they
// only reword facts that are already in the base, and a letter's sentences about the company
// (`fromOffer`) say nothing about the candidate. Pure (tests/documents/hand-written.test.ts).

export interface HandWrittenFact {
  type: FactType;
  text: string;
}

/** Each hand-written sentence as a fact, typed by where it sits; a bullet keeps the title of its entry. */
export function handWrittenFacts(doc: TailoredDocument): HandWrittenFact[] {
  if (doc.kind === "cover_letter") {
    return doc.paragraphs.flat().filter((s) => s.edited && !s.fromOffer).map((s) => ({ type: "achievement", text: s.text }));
  }
  const bullets = (type: FactType) => (entry: TailoredEntry) =>
    entry.bullets.filter((b) => b.edited).map((b) => ({ type, text: `${entry.title}${entry.context ? ` (${entry.context})` : ""}: ${b.text}` }));
  return [
    ...doc.summary.filter((s) => s.edited).map((s) => ({ type: "achievement" as const, text: s.text })),
    ...doc.projects.flatMap(bullets("project")),
    ...doc.experience.flatMap(bullets("experience")),
    ...doc.education.flatMap(bullets("education")),
  ];
}
