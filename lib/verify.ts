// The core promise, in code: the AI proposes, this module verifies.
// - A quote is kept only if it appears word for word in the source text (offer page, user answer).
//   Tolerated: whitespace/line breaks, letter case, typographic quotes and dashes. Nothing else.
// - A fact reference is kept only if it is one of the user's VALIDATED facts.
// Pure functions: no I/O, fully unit-tested.

export interface Span {
  start: number;
  end: number;
}

const MAX_QUOTE = 600;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenPattern(token: string): string {
  return escapeRegExp(token)
    .replace(/['’‘]/g, "['’‘]")
    .replace(/["“”«»]/g, "[\"“”«»]")
    .replace(/[-–—]/g, "[-–—]");
}

/** Where `quote` appears in `text`, or null if it does not appear verbatim. */
export function findQuote(text: string, quote: string): Span | null {
  const tokens = quote.trim().slice(0, MAX_QUOTE).split(/\s+/).filter(Boolean);
  if (tokens.length === 0 || tokens.join(" ").length < 3) return null;
  const match = new RegExp(tokens.map(tokenPattern).join("\\s+"), "i").exec(text);
  return match ? { start: match.index, end: match.index + match[0].length } : null;
}

export function isQuoteIn(text: string, quote: string): boolean {
  return findQuote(text, quote) !== null;
}

/** Keeps only the ids that belong to the user's validated facts (dedup, order kept). */
export function keepValidFactIds(ids: readonly string[] | undefined, validFactIds: ReadonlySet<string>): string[] {
  return [...new Set((ids ?? []).filter((id) => validFactIds.has(id)))];
}

const digits = (value: string) => value.replace(/\D/g, "");

/**
 * A contact detail is shown only if its quote is in the offer AND the value itself is inside
 * that quote (phone numbers compared digit by digit). Never show a contact that is not in the offer.
 */
export function isContactInText(text: string, kind: "email" | "phone" | "person" | "apply_url", value: string, quote: string): boolean {
  const span = findQuote(text, quote);
  if (!span) return false;
  const quoted = text.slice(span.start, span.end);
  if (kind === "phone") {
    const d = digits(value);
    return d.length >= 6 && digits(quoted).includes(d);
  }
  return findQuote(quoted, value) !== null;
}
