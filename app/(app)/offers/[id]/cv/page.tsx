import { notFound } from "next/navigation";
import { CvView } from "@/components/documents/cv-view";
import { getAccount } from "@/lib/auth";
import { listDocuments } from "@/lib/data/documents";
import { listFacts } from "@/lib/data/facts";
import { getOfferDetail } from "@/lib/data/offers";
import type { SourcedSentence } from "@/lib/types";
import { generateDocumentsAction } from "./actions";

export const maxDuration = 120;

export default async function OfferCvPage({ params, searchParams }: PageProps<"/offers/[id]/cv">) {
  const { id } = await params;
  const { v } = await searchParams;
  const account = await getAccount();
  const [detail, facts, docs] = await Promise.all([getOfferDetail(account.userId, id), listFacts(account.userId), listDocuments(account.userId, id)]);
  if (!detail) notFound();

  const validated = facts.filter((f) => f.validated);
  const validIds = new Set(validated.map((f) => f.id));
  const cvVersions = docs.filter((d) => d.kind === "cv");
  const wanted = Number(v);
  const cv = cvVersions.find((d) => d.version === wanted) ?? cvVersions[0] ?? null;
  const letter = docs.find((d) => d.kind === "cover_letter" && cv && d.createdAt.getTime() >= cv.createdAt.getTime() - 60_000 && d.createdAt.getTime() <= cv.createdAt.getTime() + 60_000)
    ?? docs.find((d) => d.kind === "cover_letter") ?? null;

  // CV feedback, computed by code: requirements covered, gaps, relevant facts not used.
  const usedFacts = new Set((cv?.sentences ?? []).flatMap((s) => s.factIds));
  const covered = detail.requirements.filter((r) => r.factIds.some((fid) => validIds.has(fid)));
  const gaps = detail.requirements.filter((r) => !r.factIds.some((fid) => validIds.has(fid)));
  const relevant = new Set(covered.flatMap((r) => r.factIds.filter((fid) => validIds.has(fid))));
  const unusedFacts = validated.filter((f) => relevant.has(f.id) && !usedFacts.has(f.id)).map((f) => f.text);

  return (
    <CvView
      offerId={detail.offer.id}
      offerLabel={[detail.offer.title, detail.offer.company].filter(Boolean).join(" · ") || "Offer"}
      candidate={{ name: account.fullName, imageUrl: account.imageUrl, githubLogin: account.githubLogin }}
      cv={cv ? { version: cv.version, sentences: cv.sentences as (SourcedSentence & { section?: string })[] } : null}
      letter={letter ? { version: letter.version, sentences: letter.sentences } : null}
      versions={cvVersions.map((d) => d.version).sort((a, b) => a - b)}
      facts={Object.fromEntries(validated.map((f) => [f.id, f.text]))}
      feedback={{ covered: covered.map((r) => r.text), gaps: gaps.map((r) => r.text), unusedFacts }}
      generate={generateDocumentsAction}
    />
  );
}
