import "server-only";
import { and, desc, eq, isNull, max } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { isUuid } from "@/lib/ids";
import type { SourcedSentence } from "@/lib/types";

// Versioned CVs and cover letters (history per offer). Every query filters on the session user id.

export type DocumentRow = typeof documents.$inferSelect;

function offerCondition(offerId: string | null) {
  return offerId ? eq(documents.offerId, offerId) : isNull(documents.offerId);
}

export async function saveDocumentVersion(userId: string, offerId: string | null, kind: "cv" | "cover_letter", sentences: SourcedSentence[]) {
  const db = getDb();
  const [{ latest }] = await db
    .select({ latest: max(documents.version) })
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.kind, kind), offerCondition(offerId)));
  const [row] = await db
    .insert(documents)
    .values({ userId, offerId, kind, version: (latest ?? 0) + 1, sentences })
    .returning();
  return row;
}

/** All versions for an offer (or the base CV with offerId = null), newest first. */
export async function listDocuments(userId: string, offerId: string | null): Promise<DocumentRow[]> {
  if (offerId && !isUuid(offerId)) return [];
  return getDb()
    .select()
    .from(documents)
    .where(and(eq(documents.userId, userId), offerCondition(offerId)))
    .orderBy(desc(documents.version));
}
