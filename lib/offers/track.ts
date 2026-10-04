import { techsIn } from "@/lib/interview/bank";
import { TRACKS } from "@/lib/interview/tracks";

// The career track of an offer (DevOps, web, Java…), the same tracks as the technical practice
// interviews: the one holding most of the technologies the offer asks for. Foundations (algorithms,
// testing, agile…) only count when nothing else is named. Pure (tests/offers/track.test.ts).

/** The bank's technologies named in an offer's stack, then in its title, without duplicates. */
export function offerTechIds(stack: readonly string[], title: string | null): string[] {
  const ids = [...stack, title ?? ""].flatMap((text) => techsIn(text).map((t) => t.id));
  return [...new Set(ids)];
}

/** The track holding most of these technologies (the first track wins a tie), or null if none. */
export function primaryTrack(techIds: readonly string[]): string | null {
  const score = (techs: readonly string[]) => techIds.filter((id) => techs.includes(id)).length;
  const ranked = TRACKS.filter((t) => t.id !== "foundations")
    .map((t) => ({ id: t.id, n: score(t.techs) }))
    .filter((t) => t.n > 0);
  if (ranked.length === 0) return TRACKS.some((t) => t.id === "foundations" && score(t.techs) > 0) ? "foundations" : null;
  return ranked.reduce((best, t) => (t.n > best.n ? t : best)).id;
}
