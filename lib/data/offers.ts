import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { offerContacts, offers, requirements } from "@/lib/db/schema";
import { isUuid } from "@/lib/ids";
import type { VerifiedExtraction } from "@/lib/offers/extract";
import type { SourceSite } from "@/lib/types";

// Data access for offers. Same rule as everywhere: every query filters on the session user id,
// including the child tables (requirements, contacts), which carry their own user_id.

export type Offer = typeof offers.$inferSelect;
export type Requirement = typeof requirements.$inferSelect;
export type OfferContact = typeof offerContacts.$inferSelect;

export async function createOffer(
  userId: string,
  input: { sourceUrl: string | null; sourceSite: SourceSite; rawText: string; extraction: VerifiedExtraction },
): Promise<Offer> {
  const { extraction: x } = input;
  const db = getDb();
  const [offer] = await db
    .insert(offers)
    .values({
      userId,
      sourceUrl: input.sourceUrl,
      sourceSite: input.sourceSite,
      title: x.title,
      company: x.company,
      location: x.location,
      contract: x.contract,
      language: x.language,
      rawText: input.rawText,
      stack: x.stack,
      scannedAt: new Date(),
    })
    .returning();
  if (x.requirements.length) {
    await db.insert(requirements).values(x.requirements.map((r) => ({ ...r, userId, offerId: offer.id })));
  }
  if (x.contacts.length) {
    await db.insert(offerContacts).values(x.contacts.map((c) => ({ ...c, userId, offerId: offer.id })));
  }
  return offer;
}

export async function listOffers(userId: string): Promise<Offer[]> {
  return getDb().select().from(offers).where(eq(offers.userId, userId)).orderBy(desc(offers.createdAt));
}

export async function getOffer(userId: string, offerId: string): Promise<Offer | null> {
  if (!isUuid(offerId)) return null;
  const [row] = await getDb()
    .select()
    .from(offers)
    .where(and(eq(offers.id, offerId), eq(offers.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function getOfferDetail(userId: string, offerId: string) {
  const offer = await getOffer(userId, offerId);
  if (!offer) return null;
  const db = getDb();
  const [reqs, contacts] = await Promise.all([
    db.select().from(requirements).where(and(eq(requirements.offerId, offer.id), eq(requirements.userId, userId))),
    db.select().from(offerContacts).where(and(eq(offerContacts.offerId, offer.id), eq(offerContacts.userId, userId))),
  ]);
  return { offer, requirements: reqs, contacts };
}

export async function listRequirementsForUser(userId: string): Promise<Requirement[]> {
  return getDb().select().from(requirements).where(eq(requirements.userId, userId));
}

/** "I applied": status Applied + date. Only for this user's offer. */
export async function markApplied(userId: string, offerId: string): Promise<boolean> {
  if (!isUuid(offerId)) return false;
  const rows = await getDb()
    .update(offers)
    .set({ status: "applied", appliedAt: new Date() })
    .where(and(eq(offers.id, offerId), eq(offers.userId, userId)))
    .returning({ id: offers.id });
  return rows.length > 0;
}

/** Covered = at least one CURRENTLY validated fact proves it (facts can be removed later). */
export function matchScore(reqs: Pick<Requirement, "factIds">[], validFactIds: ReadonlySet<string>) {
  const covered = reqs.filter((r) => r.factIds.some((id) => validFactIds.has(id))).length;
  return { covered, total: reqs.length, score: reqs.length ? covered / reqs.length : 0 };
}
