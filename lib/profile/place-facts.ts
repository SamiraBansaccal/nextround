import type { CvDocument } from "@/lib/types";

// Where each fact proposed from a CV sits in that CV laid out as a document: under the job or the
// training its quote comes from, in the languages or the skills, or at the end. Lets the candidate review
// the facts inside the CV they recognise instead of in a long list. Pure (tests/place-facts.test.ts).

export type FactPlace = `experiences:${number}` | `education:${number}` | "languages" | "skills" | "other";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();

export function placeFacts<F extends { type: string; text: string; quote: string | null }>(document: CvDocument, facts: readonly F[]): Map<FactPlace, F[]> {
  const places = new Map<FactPlace, F[]>();
  const add = (place: FactPlace, fact: F) => places.set(place, [...(places.get(place) ?? []), fact]);
  const entries = [
    ...document.experiences.map((entry, i) => ({ place: `experiences:${i}` as FactPlace, entry })),
    ...document.education.map((entry, i) => ({ place: `education:${i}` as FactPlace, entry })),
  ].map(({ place, entry }) => ({
    place,
    parts: [entry.title, entry.organisation, entry.location, entry.period, ...entry.details]
      .filter((p): p is string => !!p)
      .map(norm)
      .filter((p) => p.length >= 4),
  }));
  const languages = document.languages.map((l) => norm(l.name)).filter(Boolean);
  const skills = document.skills.map(norm).filter((s) => s.length >= 2);

  for (const fact of facts) {
    const quote = norm(fact.quote ?? fact.text);
    let best: { place: FactPlace; score: number } | null = null;
    for (const { place, parts } of entries) {
      // How much of the entry the quote covers (or how much of the quote one line of the entry holds).
      const score = parts.reduce((sum, part) => sum + (quote.includes(part) ? part.length : part.includes(quote) ? quote.length : 0), 0);
      if (score > 0 && (!best || score > best.score)) best = { place, score };
    }
    if (!quote) add("other", fact);
    else if (fact.type === "language" || (!best && languages.some((l) => quote.includes(l)))) add("languages", fact);
    else if (best) add(best.place, fact);
    else if (skills.some((s) => quote.includes(s) || s.includes(quote))) add("skills", fact);
    else add("other", fact);
  }
  return places;
}
