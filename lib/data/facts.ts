import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { profileFacts } from "@/lib/db/schema";
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

/** Facts imported before "everything is validated by default" (ADR 0022): validated in one go. Returns how many. */
export async function validateLegacyFacts(userId: string): Promise<number> {
  const rows = await getDb()
    .update(profileFacts)
    .set({ validated: true })
    .where(and(eq(profileFacts.userId, userId), eq(profileFacts.validated, false)))
    .returning({ id: profileFacts.id });
  return rows.length;
}
