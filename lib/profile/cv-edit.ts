import { z } from "zod";
import type { CvDocument } from "@/lib/types";

// Editing one line of a CV laid out as a document (profile page): a typo, a date written differently,
// a capital letter. The CV is the candidate's own: their edit is kept as written. Pure
// (tests/profile/cv-edit.test.ts); the server action validates the path with `cvEditPathSchema`.

const section = z.enum(["experiences", "education"]);
const index = z.number().int().min(0).max(200);

export const cvEditPathSchema = z.discriminatedUnion("part", [
  z.object({ part: z.literal("headline") }),
  z.object({ part: z.literal("entry"), section, index, field: z.enum(["title", "organisation", "location", "period"]) }),
  z.object({ part: z.literal("detail"), section, index, detail: index }),
  z.object({ part: z.literal("skill"), index }),
  z.object({ part: z.literal("language"), index, field: z.enum(["name", "level"]) }),
]);
export type CvEditPath = z.infer<typeof cvEditPathSchema>;

export const MAX_CV_LINE = 500;

/**
 * The document with one line changed, or null if the path does not exist or a required line (a title, a
 * language name) would become empty. An emptied detail or skill is removed; an emptied optional field
 * (organisation, place, period, headline, level) is cleared.
 */
export function applyCvEdit(document: CvDocument, path: CvEditPath, raw: string): CvDocument | null {
  const value = raw.trim().slice(0, MAX_CV_LINE);
  const doc: CvDocument = structuredClone(document);
  switch (path.part) {
    case "headline":
      doc.headline = value || null;
      return doc;
    case "entry": {
      const entry = doc[path.section][path.index];
      if (!entry) return null;
      if (path.field === "title") {
        if (!value) return null;
        entry.title = value;
      } else entry[path.field] = value || null;
      return doc;
    }
    case "detail": {
      const entry = doc[path.section][path.index];
      if (!entry || path.detail >= entry.details.length) return null;
      if (value) entry.details[path.detail] = value;
      else entry.details.splice(path.detail, 1);
      return doc;
    }
    case "skill": {
      if (path.index >= doc.skills.length) return null;
      if (value) doc.skills[path.index] = value;
      else doc.skills.splice(path.index, 1);
      return doc;
    }
    case "language": {
      const language = doc.languages[path.index];
      if (!language) return null;
      if (path.field === "name") {
        if (!value) return null;
        language.name = value;
      } else language.level = value || null;
      return doc;
    }
  }
}
