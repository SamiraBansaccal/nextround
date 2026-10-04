import { findQuote } from "@/lib/ai/verify";

/** Splits the offer text into plain parts and requirement highlights (non-overlapping, in text order). */
export function highlightSegments(text: string, reqs: { id: string; quote: string }[]): { text: string; reqId?: string }[] {
  const spans = reqs
    .map((r) => ({ id: r.id, span: findQuote(text, r.quote) }))
    .filter((x): x is { id: string; span: { start: number; end: number } } => x.span !== null)
    .sort((a, b) => a.span.start - b.span.start);

  const segments: { text: string; reqId?: string }[] = [];
  let cursor = 0;
  for (const { id, span } of spans) {
    if (span.start < cursor) continue; // overlaps a previous highlight
    if (span.start > cursor) segments.push({ text: text.slice(cursor, span.start) });
    segments.push({ text: text.slice(span.start, span.end), reqId: id });
    cursor = span.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}
