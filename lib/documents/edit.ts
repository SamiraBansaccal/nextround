import { z } from "zod";
import type { SourcedSentence, TailoredDocument } from "@/lib/types";

// Editing one sentence of a CV or a cover letter written for an offer, without writing it again: the
// candidate changes a word, a phrase or a whole sentence. The sentence keeps the facts it cited (the
// proof marks stay), and the edit is kept as written: the candidate is the author. Pure
// (tests/documents/document-edit.test.ts); the server action validates the path with `docEditPathSchema`.

const index = z.number().int().min(0).max(200);

export const docEditPathSchema = z.discriminatedUnion("part", [
  z.object({ part: z.literal("headline") }),
  z.object({ part: z.literal("summary"), index }),
  z.object({
    part: z.literal("bullet"),
    section: z.enum(["projects", "education", "experience"]),
    entry: index,
    index,
  }),
  z.object({ part: z.literal("greeting") }),
  z.object({ part: z.literal("sentence"), paragraph: index, index }),
  z.object({ part: z.literal("closing") }),
]);
export type DocEditPath = z.infer<typeof docEditPathSchema>;

export const MAX_DOC_LINE = 1000;

/** Replaces sentence `i` of a list, or removes it when the new text is empty. False if it does not exist. */
function editSentence(list: SourcedSentence[], i: number, value: string): boolean {
  if (!list[i]) return false;
  if (value) list[i] = { ...list[i], text: value };
  else list.splice(i, 1);
  return true;
}

/**
 * The document with one sentence changed, or null if the path does not exist in this kind of document,
 * or a greeting or closing would become empty. An emptied sentence is removed; an emptied headline is cleared.
 */
export function applyDocEdit<D extends TailoredDocument>(document: D, path: DocEditPath, raw: string): D | null {
  const value = raw.trim().slice(0, MAX_DOC_LINE);
  const doc = structuredClone(document);
  if (doc.kind === "tailored_cv") {
    switch (path.part) {
      case "headline":
        doc.headline = value || null;
        return doc;
      case "summary":
        return editSentence(doc.summary, path.index, value) ? doc : null;
      case "bullet": {
        const entry = doc[path.section][path.entry];
        return entry && editSentence(entry.bullets, path.index, value) ? doc : null;
      }
      default:
        return null;
    }
  }
  switch (path.part) {
    case "greeting":
    case "closing":
      if (!value) return null;
      doc[path.part] = value;
      return doc;
    case "sentence": {
      const paragraph = doc.paragraphs[path.paragraph];
      if (!paragraph || !editSentence(paragraph, path.index, value)) return null;
      if (paragraph.length === 0) doc.paragraphs.splice(path.paragraph, 1);
      return doc;
    }
    default:
      return null;
  }
}
