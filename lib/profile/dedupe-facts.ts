// One fact base from several CVs: the same experience or skill written a little differently in two CVs
// ("Développeuse Java – Collabr (2024)" and "Développeuse Java chez Collabr, 2024") is shown once, in
// its most complete wording, with every CV it comes from. Pure (tests/profile/dedupe-facts.test.ts).

const STOP = new Set(["a", "an", "the", "of", "in", "at", "and", "for", "with", "le", "la", "les", "l", "de", "des", "du", "d", "un", "une", "et", "en", "chez", "au", "aux", "pour", "avec", "à"]);

function words(text: string): Set<string> {
  return new Set(
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9+#]+/)
      .filter((w) => w.length > 0 && !STOP.has(w)),
  );
}

/** True when two facts say the same thing: one's words hold the other's, or they share most of them. */
export function isNearDuplicate(a: string, b: string): boolean {
  const wa = words(a);
  const wb = words(b);
  if (wa.size === 0 || wb.size === 0) return false;
  let common = 0;
  for (const w of wa) if (wb.has(w)) common++;
  const smaller = Math.min(wa.size, wb.size);
  const union = wa.size + wb.size - common;
  // Contained (every word of the shorter one in the longer one, at least three words), or very similar.
  return (smaller >= 3 && common === smaller) || common / union >= 0.75;
}

export interface FactGroup<F> {
  /** The wording shown: the most complete one (most words, then the most recent). */
  fact: F;
  /** The other wordings of the same fact, from other CVs or sources. */
  duplicates: F[];
}

/** The profile's merged base: validated facts, newest first, near-duplicates grouped (as the profile shows them). */
export function groupValidatedFacts<F extends { type: string; text: string; validated: boolean; createdAt: Date }>(facts: readonly F[]): FactGroup<F>[] {
  return groupNearDuplicates(facts.filter((f) => f.validated).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
}

/** Groups near-duplicate facts of the same type; the input order (newest first) breaks ties. */
export function groupNearDuplicates<F extends { type: string; text: string }>(facts: readonly F[]): FactGroup<F>[] {
  const groups: { members: F[] }[] = [];
  for (const fact of facts) {
    const group = groups.find((g) => g.members[0].type === fact.type && g.members.some((m) => isNearDuplicate(m.text, fact.text)));
    if (group) group.members.push(fact);
    else groups.push({ members: [fact] });
  }
  return groups.map(({ members }) => {
    const best = members.reduce((a, b) => (words(b.text).size > words(a.text).size ? b : a));
    return { fact: best, duplicates: members.filter((m) => m !== best) };
  });
}
