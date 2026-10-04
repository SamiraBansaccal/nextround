import { techsIn } from "@/lib/interview/bank";
import { TRACKS } from "@/lib/interview/tracks";

// The career track of an offer (DevOps, web, Java…), the same tracks as the technical practice
// interviews: the one holding most of the technologies the offer asks for. A technology named in the
// title counts double; tools almost every job lists (Git, Docker, SQL…) count half, so "Java developer,
// Docker, Git" is a Java offer. Foundations (algorithms, testing…) only count when nothing else is
// named. Pure (tests/offers/track.test.ts).

const COMMON_TOOLS = new Set(["git", "docker", "linux", "bash", "cicd", "sql", "rest", "html-css"]);

const idsIn = (text: string) => techsIn(text).map((t) => t.id);

/** The bank's technologies named in an offer's stack, then in its title, without duplicates. */
export function offerTechIds(stack: readonly string[], title: string | null): string[] {
  return [...new Set([...stack.flatMap(idsIn), ...idsIn(title ?? "")])];
}

/** The track of an offer, or null if it names no known technology. */
export function offerTrack(stack: readonly string[], title: string | null): string | null {
  const inTitle = new Set(idsIn(title ?? ""));
  const weight = (id: string) => (COMMON_TOOLS.has(id) ? 0.5 : 1) * (inTitle.has(id) ? 2 : 1);
  const ids = offerTechIds(stack, title);
  const score = (techs: readonly string[]) => ids.filter((id) => techs.includes(id)).reduce((sum, id) => sum + weight(id), 0);
  const ranked = TRACKS.filter((t) => t.id !== "foundations")
    .map((t) => ({ id: t.id, n: score(t.techs), own: ids.filter((id) => t.techs.includes(id) && !COMMON_TOOLS.has(id)).length }))
    .filter((t) => t.n > 0);
  if (ranked.length === 0) return TRACKS.some((t) => t.id === "foundations" && score(t.techs) > 0) ? "foundations" : null;
  // A tie goes to the track with more of its own technologies (Java beats Docker + Git), then to the first.
  return ranked.reduce((best, t) => (t.n > best.n || (t.n === best.n && t.own > best.own) ? t : best)).id;
}
