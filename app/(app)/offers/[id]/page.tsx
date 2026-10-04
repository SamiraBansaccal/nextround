import { notFound } from "next/navigation";
import { OfferView } from "@/components/offers/offer-view";
import { requireUserId } from "@/lib/server/auth";
import { listDocuments } from "@/lib/data/documents";
import { listFacts } from "@/lib/data/facts";
import { listInterviewIdsForOffer } from "@/lib/data/interviews";
import { getOfferDetail } from "@/lib/data/offers";
import { factIndex, matchScore, provingFactIds } from "@/lib/offers/coverage";
import { highlightSegments } from "@/lib/offers/segments";
import { markAppliedAction, rematchOfferAction } from "../actions";
import { formatDay } from "@/lib/shared/dates";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import { getUiLang } from "@/lib/i18n/server";
import { documentPlainText } from "@/lib/documents/plain-text";

export const maxDuration = 120;

/** Latest version (documents come newest first), its plain text, and how many sentences have no valid fact. */
function docSummary(doc: { kind: "cv" | "cover_letter"; version: number; sentences: { text: string; factIds: string[]; section?: string }[] } | undefined) {
  return doc
    ? { version: doc.version, unsupported: doc.sentences.filter((s) => s.factIds.length === 0).length, text: documentPlainText(doc.kind, doc.sentences) }
    : null;
}

export default async function OfferPage({ params }: PageProps<"/offers/[id]">) {
  const { id } = await params;
  const userId = await requireUserId();
  const lang = await getUiLang();
  const [detail, facts, interviewIds, docs] = await Promise.all([
    getOfferDetail(userId, id),
    listFacts(userId),
    listInterviewIdsForOffer(userId, id),
    listDocuments(userId, id),
  ]);
  if (!detail) notFound();

  const profile = factIndex(facts);
  const byId = new Map(facts.map((f) => [f.id, f]));
  const requirements = detail.requirements.map((r) => {
    const proving = provingFactIds(r, profile).map((fid) => byId.get(fid)!);
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
        appliedAt: detail.offer.appliedAt ? formatDay(detail.offer.appliedAt) : null,
        stack: detail.offer.stack,
      }}
      segments={highlightSegments(detail.offer.rawText, requirements)}
      requirements={requirements}
      contacts={detail.contacts.map((c) => ({ kind: c.kind, value: c.value, quote: c.quote }))}
      score={matchScore(detail.requirements, profile)}
      interviewIds={interviewIds}
      documents={{ cv: docSummary(docs.find((d) => d.kind === "cv")), letter: docSummary(docs.find((d) => d.kind === "cover_letter")) }}
      actions={{ markApplied: markAppliedAction, rematch: rematchOfferAction }}
      lang={lang}
      t={OFFERS_COPY[lang]}
    />
  );
}
