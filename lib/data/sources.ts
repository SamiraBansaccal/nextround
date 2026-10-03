import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { profileFacts, sources } from "@/lib/db/schema";
import { isUuid } from "@/lib/ids";

// Profile sources: each uploaded CV (and the GitHub / Codewars / chat imports) is one row.
// All the user's CVs together feed ONE fact base. Every query filters on the session user id.

export type Source = typeof sources.$inferSelect;

/** Facts extracted from a CV point to it with "cv:<source id>" (two CVs may share a file name). */
export const cvRef = (sourceId: string) => `cv:${sourceId}`;

export async function addSource(userId: string, kind: string, ref: string): Promise<Source> {
  const [row] = await getDb().insert(sources).values({ userId, kind, ref }).returning();
  return row;
}

export async function listSources(userId: string, kind?: string): Promise<Source[]> {
  const where = kind ? and(eq(sources.userId, userId), eq(sources.kind, kind)) : eq(sources.userId, userId);
  return getDb().select().from(sources).where(where).orderBy(desc(sources.importedAt));
}

/** Removes a CV from the library, with the facts proposed from it that were NOT validated yet. */
export async function removeCvSource(userId: string, sourceId: string): Promise<boolean> {
  if (!isUuid(sourceId)) return false;
  const db = getDb();
  const [source] = await db
    .delete(sources)
    .where(and(eq(sources.id, sourceId), eq(sources.userId, userId), eq(sources.kind, "cv_upload")))
    .returning();
  if (!source) return false;
  await db
    .delete(profileFacts)
    .where(
      and(
        eq(profileFacts.userId, userId),
        eq(profileFacts.source, "cv_upload"),
        eq(profileFacts.sourceRef, cvRef(source.id)),
        eq(profileFacts.validated, false),
      ),
    );
  return true;
}
