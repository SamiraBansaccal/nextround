import type { Offer, Requirement } from "@/lib/data/offers";
import { findTech } from "@/lib/interview/bank";
import { type TechLogo, techLogo } from "@/lib/interview/tech-logos";
import type { Localized } from "@/lib/interviewers/types";
import { type CoverageFact, matchScore } from "@/lib/offers/coverage";
import { offerTechIds, offerTrack } from "@/lib/offers/track";
import { formatDay } from "@/lib/shared/dates";

// Dashboard pipeline cards (business logic, kept out of the components).
// Follow-up reminder: 7 days after applying, while the offer is still Applied or Interview.

const DAY = 24 * 60 * 60 * 1000;
export const FOLLOW_UP_DAYS = 7;
const isoDay = formatDay;

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
  /** The technologies the offer asks for that the question bank knows, with their logos. */
  techs: { id: string; label: Localized; logo: TechLogo }[];
  /** Its career track (same tracks as the technical practice), null if no known technology. */
  track: string | null;
}

export function buildPipelineCards(
  offers: Offer[],
  reqs: Pick<Requirement, "offerId" | "factIds" | "category">[],
  facts: ReadonlyMap<string, CoverageFact>, // the profile: validated facts cover, vibe-coded projects not for tech
  interviewCounts: ReadonlyMap<string, number>,
  now: number = Date.now(),
): PipelineCardData[] {
  return offers.map((offer) => {
    const m = matchScore(reqs.filter((r) => r.offerId === offer.id), facts);
    const waiting = offer.status === "applied" || offer.status === "interview";
    const techIds = offerTechIds(offer.stack.map((s) => s.value), offer.title);
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
      techs: techIds.flatMap((id) => {
        const tech = findTech(id);
        return tech ? [{ id, label: tech.label, logo: techLogo(id) }] : [];
      }),
      track: offerTrack(offer.stack.map((s) => s.value), offer.title),
    };
  });
}
