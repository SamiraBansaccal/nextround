import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { answers, documents, profileFacts, questions, requirements } from "@/lib/db/schema";
import { rewriteFactIds } from "@/lib/profile/merge-facts";
import { isUuid } from "@/lib/shared/ids";

// Data access for profile facts. Every function takes the userId from requireUserId()
// (server-side session) and applies it to EVERY query, reads and writes alike: changing
// an id in a request can never reach another user's row.

export type Fact = typeof profileFacts.$inferSelect;
export type NewFact = Omit<typeof profileFacts.$inferInsert, "id" | "userId" | "createdAt">;
export type FactPatch = Partial<Pick<Fact, "type" | "text" | "validated" | "sourceRef" | "quote" | "aiAssisted">>;

export async function listFacts(userId: string): Promise<Fact[]> {
  return getDb().select().from(profileFacts).where(eq(profileFacts.userId, userId)).orderBy(desc(profileFacts.createdAt));
}

export async function getFact(userId: string, id: string): Promise<Fact | null> {
  if (!isUuid(id)) return null;
  const [row] = await getDb()
    .select()
    .from(profileFacts)
    .where(and(eq(profileFacts.id, id), eq(profileFacts.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function createFact(userId: string, input: NewFact): Promise<Fact> {
  const [row] = await getDb()
    .insert(profileFacts)
    .values({ ...input, userId })
    .returning();
  return row;
}

/** Returns the updated fact, or null if it does not exist FOR THIS USER. */
export async function updateFact(userId: string, id: string, patch: FactPatch): Promise<Fact | null> {
  if (!isUuid(id)) return null;
  const [row] = await getDb()
    .update(profileFacts)
    .set(patch)
    .where(and(eq(profileFacts.id, id), eq(profileFacts.userId, userId)))
    .returning();
  return row ?? null;
}

/** Returns true only if a fact of THIS USER was deleted. */
export async function deleteFact(userId: string, id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  const rows = await getDb()
    .delete(profileFacts)
    .where(and(eq(profileFacts.id, id), eq(profileFacts.userId, userId)))
    .returning({ id: profileFacts.id });
  return rows.length > 0;
}

/**
 * Merges near-duplicate facts into the one kept: every reference to the others (offer requirements, CV
 * and letter sentences, model answers, feedback claims) is pointed to `keepId`, then the others are
 * deleted, so an offer or a document never loses its proof. Only this user's rows are read and written,
 * and only facts of this user are merged. Returns how many facts were merged away.
 */
export async function mergeFacts(userId: string, keepId: string, mergeIds: readonly string[]): Promise<number> {
  const asked = [...new Set(mergeIds)].filter((id) => id !== keepId && isUuid(id));
  if (!isUuid(keepId) || asked.length === 0) return 0;
  const db = getDb();
  const owned = new Set(
    (await db.select({ id: profileFacts.id }).from(profileFacts).where(and(eq(profileFacts.userId, userId), inArray(profileFacts.id, [keepId, ...asked])))).map((r) => r.id),
  );
  const merged = asked.filter((id) => owned.has(id));
  if (!owned.has(keepId) || merged.length === 0) return 0;
  const replace = new Map(merged.map((id) => [id, keepId]));

  for (const row of await db.select({ id: requirements.id, factIds: requirements.factIds }).from(requirements).where(eq(requirements.userId, userId))) {
    const next = rewriteFactIds({ factIds: row.factIds }, replace);
    if (next) await db.update(requirements).set({ factIds: next.factIds }).where(and(eq(requirements.id, row.id), eq(requirements.userId, userId)));
  }
  for (const row of await db.select({ id: questions.id, suggestedAnswer: questions.suggestedAnswer }).from(questions).where(eq(questions.userId, userId))) {
    const next = rewriteFactIds(row.suggestedAnswer, replace);
    if (next) await db.update(questions).set({ suggestedAnswer: next }).where(and(eq(questions.id, row.id), eq(questions.userId, userId)));
  }
  for (const row of await db.select({ id: answers.id, feedback: answers.feedback }).from(answers).where(eq(answers.userId, userId))) {
    const next = row.feedback && rewriteFactIds(row.feedback, replace);
    if (next) await db.update(answers).set({ feedback: next }).where(and(eq(answers.id, row.id), eq(answers.userId, userId)));
  }
  for (const row of await db.select({ id: documents.id, sentences: documents.sentences, content: documents.content }).from(documents).where(eq(documents.userId, userId))) {
    const sentences = rewriteFactIds(row.sentences, replace);
    const content = row.content && rewriteFactIds(row.content, replace);
    if (sentences || content) {
      await db
        .update(documents)
        .set({ sentences: sentences ?? row.sentences, content: content ?? row.content })
        .where(and(eq(documents.id, row.id), eq(documents.userId, userId)));
    }
  }
  await db.delete(profileFacts).where(and(eq(profileFacts.userId, userId), inArray(profileFacts.id, merged)));
  return merged.length;
}

/** Facts imported before "everything is validated by default" (ADR 0022): validated in one go. Returns how many. */
export async function validateLegacyFacts(userId: string): Promise<number> {
  const rows = await getDb()
    .update(profileFacts)
    .set({ validated: true })
    .where(and(eq(profileFacts.userId, userId), eq(profileFacts.validated, false)))
    .returning({ id: profileFacts.id });
  return rows.length;
}
