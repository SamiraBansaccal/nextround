import "server-only";
import { and, desc, eq, isNull, max } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { documents, offers } from "@/lib/db/schema";
import { isUuid } from "@/lib/shared/ids";
import type { DocumentLanguage, SourcedSentence, TailoredDocument } from "@/lib/types";

// Versioned CVs and cover letters (history per offer), and the ones the candidate kept in their profile
// to reuse. Every query filters on the session user id.

export type DocumentRow = typeof documents.$inferSelect;

function offerCondition(offerId: string | null) {
  return offerId ? eq(documents.offerId, offerId) : isNull(documents.offerId);
}

export async function saveDocumentVersion(
  userId: string,
  offerId: string | null,
  kind: "cv" | "cover_letter",
  sentences: SourcedSentence[],
  extra: { language?: DocumentLanguage; content?: TailoredDocument; title?: string } = {},
) {
  const db = getDb();
  const [{ latest }] = await db
    .select({ latest: max(documents.version) })
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.kind, kind), offerCondition(offerId)));
  const [row] = await db
    .insert(documents)
    .values({ userId, offerId, kind, version: (latest ?? 0) + 1, sentences, language: extra.language ?? null, content: extra.content ?? null, title: extra.title ?? null })
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

export async function getDocument(userId: string, documentId: string): Promise<DocumentRow | null> {
  if (!isUuid(documentId)) return null;
  const [row] = await getDb()
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
    .limit(1);
  return row ?? null;
}

/** Keeps a document in the profile (to reuse it or start from it), or takes it out. */
export async function setDocumentKept(userId: string, documentId: string, kept: boolean): Promise<boolean> {
  if (!isUuid(documentId)) return false;
  const rows = await getDb()
    .update(documents)
    .set({ kept })
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
    .returning({ id: documents.id });
  return rows.length > 0;
}

/** The documents kept in the profile, newest first, with the offer they were written for. */
export async function listKeptDocuments(userId: string) {
  return getDb()
    .select({ document: documents, offerTitle: offers.title, company: offers.company })
    .from(documents)
    .leftJoin(offers, and(eq(offers.id, documents.offerId), eq(offers.userId, userId)))
    .where(and(eq(documents.userId, userId), eq(documents.kept, true)))
    .orderBy(desc(documents.createdAt));
}
