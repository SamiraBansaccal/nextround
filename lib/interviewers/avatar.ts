// Placeholders for interviewers without a picture yet: a monogram on one of a few app colours, always
// the same for a given id. The final pictures go to public/interviewers/<id>.webp (see the catalog).

const SKIP = new Set(["the", "mr", "mr.", "ms", "ms.", "mrs", "mrs.", "dr", "dr.", "professor", "chief", "principal"]);

export function initials(name: string): string {
  const words = name
    .replace(/[“”"'’()]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !SKIP.has(w.toLowerCase()) && /[\p{L}\p{N}]/u.test(w));
  const letters = words.slice(0, 2).map((w) => [...w.replace(/^[^\p{L}\p{N}]+/u, "")][0] ?? "");
  return letters.join("").toUpperCase() || "?";
}

/** 0 … tones-1, stable for an id (FNV-1a hash). */
export function placeholderTone(id: string, tones: number): number {
  let hash = 0x811c9dc5;
  for (const char of id) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash % tones;
}
