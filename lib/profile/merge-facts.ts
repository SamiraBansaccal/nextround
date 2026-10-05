// Merging near-duplicate facts for good. The display already folds them (lib/profile/dedupe-facts.ts);
// merging makes it final: every reference to a merged-away fact (an offer requirement it covers, a
// sentence of a CV or a letter, a model answer, a feedback claim) is pointed to the fact that is kept, and
// only then are the other wordings deleted (lib/data/facts.ts), so nothing loses its proof.
// Pure (tests/profile/merge-facts.test.ts).

/**
 * A copy of a stored value (a requirement's ids, a document, a feedback…) where the fact ids found in
 * `replace` are swapped: in every `factIds` array (deduplicated afterwards) and every `factId` string.
 */
export function replaceFactIds<T>(value: T, replace: ReadonlyMap<string, string>): T {
  const swap = (id: unknown) => (typeof id === "string" ? (replace.get(id) ?? id) : id);
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v === null || typeof v !== "object") return v;
    return Object.fromEntries(
      Object.entries(v).map(([key, x]) => {
        if (key === "factIds" && Array.isArray(x)) return [key, [...new Set(x.map(swap))]];
        if (key === "factId") return [key, swap(x)];
        return [key, walk(x)];
      }),
    );
  };
  return walk(value) as T;
}

/** The new value when the swap changes something, else null (so only the rows that cite a merged fact are written). */
export function rewriteFactIds<T>(value: T, replace: ReadonlyMap<string, string>): T | null {
  const next = replaceFactIds(value, replace);
  return JSON.stringify(next) === JSON.stringify(value) ? null : next;
}
