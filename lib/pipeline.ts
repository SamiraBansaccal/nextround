import type { Offer, Requirement } from "@/lib/data/offers";
import { matchScore } from "@/lib/data/offers";

// Dashboard pipeline cards (business logic, kept out of the components).
// Follow-up reminder: 7 days after applying, while the offer is still Applied or Interview.

const DAY = 24 * 60 * 60 * 1000;
export const FOLLOW_UP_DAYS = 7;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export interface PipelineCardData {
  id: string;
  company: string | null;
  title: string | null;
  location: string | null;
  sourceSite: Offer["sourceSite"];
  status: Offer["status"];
  covered: number;
  total: number;
  interviews: number;
  appliedOn: string | null;
  followUp: { due: boolean; on: string } | null;
}

export function buildPipelineCards(
  offers: Offer[],
  reqs: Pick<Requirement, "offerId" | "factIds">[],
  validFactIds: ReadonlySet<string>,
  interviewCounts: ReadonlyMap<string, number>,
  now: number = Date.now(),
): PipelineCardData[] {
  return offers.map((offer) => {
    const m = matchScore(reqs.filter((r) => r.offerId === offer.id), validFactIds);
    const waiting = offer.status === "applied" || offer.status === "interview";
    const followUpAt = offer.appliedAt && waiting ? new Date(offer.appliedAt.getTime() + FOLLOW_UP_DAYS * DAY) : null;
    return {
      id: offer.id,
      company: offer.company,
      title: offer.title,
      location: offer.location,
      sourceSite: offer.sourceSite,
      status: offer.status,
      covered: m.covered,
      total: m.total,
      interviews: interviewCounts.get(offer.id) ?? 0,
      appliedOn: offer.appliedAt ? isoDay(offer.appliedAt) : null,
      followUp: followUpAt ? { due: followUpAt.getTime() <= now, on: isoDay(followUpAt) } : null,
    };
  });
}
