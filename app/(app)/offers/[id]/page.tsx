import { notFound } from "next/navigation";
import { OfferView } from "@/components/offers/offer-view";
import { requireUserId } from "@/lib/auth";
import { listDocuments } from "@/lib/data/documents";
import { listFacts } from "@/lib/data/facts";
import { listInterviewIdsForOffer } from "@/lib/data/interviews";
import { getOfferDetail, matchScore } from "@/lib/data/offers";
import { highlightSegments } from "@/lib/offers/segments";
import { startInterviewAction } from "../../interview/actions";
import { markAppliedAction } from "../actions";

export const maxDuration = 120;

export default async function OfferPage({ params }: PageProps<"/offers/[id]">) {
  const { id } = await params;
  const userId = await requireUserId();
  const [detail, facts, interviewIds, docs] = await Promise.all([
    getOfferDetail(userId, id),
    listFacts(userId),
    listInterviewIdsForOffer(userId, id),
    listDocuments(userId, id),
  ]);
  if (!detail) notFound();

  const validFacts = new Map(facts.filter((f) => f.validated).map((f) => [f.id, f]));
  const validIds = new Set(validFacts.keys());
  const requirements = detail.requirements.map((r) => {
    const proving = r.factIds.filter((fid) => validIds.has(fid)).map((fid) => validFacts.get(fid)!);
    return {
      id: r.id,
      kind: r.kind,
      category: r.category,
      text: r.text,
      quote: r.quote,
      covered: proving.length > 0,
      facts: proving.map((f) => ({ id: f.id, text: f.text, sourceRef: f.sourceRef })),
    };
  });

  return (
    <OfferView
      offer={{
        id: detail.offer.id,
        title: detail.offer.title,
        company: detail.offer.company,
        location: detail.offer.location,
        contract: detail.offer.contract,
        language: detail.offer.language,
        sourceSite: detail.offer.sourceSite,
        sourceUrl: detail.offer.sourceUrl,
        status: detail.offer.status,
        appliedAt: detail.offer.appliedAt ? detail.offer.appliedAt.toISOString().slice(0, 10) : null,
        stack: detail.offer.stack,
      }}
      segments={highlightSegments(detail.offer.rawText, requirements)}
      requirements={requirements}
      contacts={detail.contacts.map((c) => ({ kind: c.kind, value: c.value, quote: c.quote }))}
      score={matchScore(detail.requirements, validIds)}
      interviewIds={interviewIds}
      documents={{
        cv: docs.find((d) => d.kind === "cv")?.version ?? null, // newest first
        letter: docs.find((d) => d.kind === "cover_letter")?.version ?? null,
      }}
      actions={{ markApplied: markAppliedAction, startInterview: startInterviewAction }}
    />
  );
}
