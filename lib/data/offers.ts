import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { offerContacts, offers, requirements } from "@/lib/db/schema";
import { isUuid } from "@/lib/shared/ids";
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

/** "I applied": status Applied; the application date is set once (same rule as the pipeline). */
export async function markApplied(userId: string, offerId: string): Promise<boolean> {
  return setOfferStatus(userId, offerId, "applied");
}

const STATUSES = ["saved", "applied", "interview", "offer", "rejected"] as const;
export type PipelineStatus = (typeof STATUSES)[number];
export function isPipelineStatus(value: unknown): value is PipelineStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

/** Moves an offer in the pipeline. Moving to "applied" stamps the application date once. */
export async function setOfferStatus(userId: string, offerId: string, status: PipelineStatus): Promise<boolean> {
  if (!isUuid(offerId)) return false;
  const current = await getOffer(userId, offerId);
  if (!current) return false;
  const appliedAt = status === "applied" && !current.appliedAt ? new Date() : current.appliedAt;
  const rows = await getDb()
    .update(offers)
    .set({ status, appliedAt })
    .where(and(eq(offers.id, offerId), eq(offers.userId, userId)))
    .returning({ id: offers.id });
  return rows.length > 0;
}

/** Replaces the facts linked to each requirement of one of the user's offers (after a new match). */
export async function setRequirementFacts(userId: string, offerId: string, links: ReadonlyMap<string, string[]>): Promise<number> {
  if (!isUuid(offerId)) return 0;
  const db = getDb();
  let updated = 0;
  for (const [requirementId, factIds] of links) {
    if (!isUuid(requirementId)) continue;
    const rows = await db
      .update(requirements)
      .set({ factIds })
      .where(and(eq(requirements.id, requirementId), eq(requirements.offerId, offerId), eq(requirements.userId, userId)))
      .returning({ id: requirements.id });
    updated += rows.length;
  }
  return updated;
}
