/** A short label for a chip: cut at a word boundary, with "…" when something was cut. */
export function shorten(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const space = cut.lastIndexOf(" ");
  const head = space > max / 2 ? cut.slice(0, space) : cut;
  return `${head.replace(/[\s,;:(—–-]+$/, "")}…`;
}
