"use server";

import { revalidatePath } from "next/cache";
import { aiErrorMessage } from "@/lib/ai/errors";
import { getAccount } from "@/lib/auth";
import { saveDocumentVersion } from "@/lib/data/documents";
import { listFacts } from "@/lib/data/facts";
import { getOfferDetail } from "@/lib/data/offers";
import { generateDocuments } from "@/lib/documents/generate";

/** Generates a new version of the tailored CV and cover letter for an offer (one AI call). */
export async function generateDocumentsAction(offerId: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const account = await getAccount();
  if (typeof offerId !== "string") return { ok: false, error: "Offer not found." };
  const detail = await getOfferDetail(account.userId, offerId);
  if (!detail) return { ok: false, error: "Offer not found." };
  const facts = (await listFacts(account.userId)).filter((f) => f.validated);
  if (facts.length === 0) return { ok: false, error: "Validate some facts in your profile first: the CV is built only from them." };
  const valid = new Set(facts.map((f) => f.id));
  try {
    const docs = await generateDocuments(
      { userId: account.userId, isOwner: account.isOwner },
      {
        title: detail.offer.title,
        company: detail.offer.company,
        language: detail.offer.language,
        requirements: detail.requirements.map((r) => ({ text: r.text, covered: r.factIds.some((id) => valid.has(id)) })),
      },
      facts,
      account.displayName,
    );
    await saveDocumentVersion(account.userId, detail.offer.id, "cv", docs.cv);
    if (docs.coverLetter.length) await saveDocumentVersion(account.userId, detail.offer.id, "cover_letter", docs.coverLetter);
    revalidatePath(`/offers/${detail.offer.id}/cv`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error) };
  }
}
