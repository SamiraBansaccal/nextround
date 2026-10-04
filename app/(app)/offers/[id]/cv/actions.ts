"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aiErrorMessage } from "@/lib/ai/errors";
import { getAccount, requireUserId } from "@/lib/server/auth";
import { getDocument, saveDocumentVersion, setDocumentKept, updateDocumentContent } from "@/lib/data/documents";
import { listFacts } from "@/lib/data/facts";
import { getOfferDetail } from "@/lib/data/offers";
import { generateCoverLetter } from "@/lib/documents/cover-letter";
import { applyDocEdit, docEditPathSchema } from "@/lib/documents/edit";
import { documentSentences } from "@/lib/documents/render";
import { generateTailoredCv, type OfferForDocuments } from "@/lib/documents/tailored-cv";
import { factIndex, isCovered } from "@/lib/offers/coverage";
import { DOCUMENTS_COPY } from "@/lib/i18n/documents";
import { getUiLang } from "@/lib/i18n/server";
import type { DocumentLanguage } from "@/lib/types";

// The CV and the cover letter written for one offer: one AI call each, in English or French, optionally
// starting from a document the candidate kept in their profile for a similar job.

type Result = { ok: true } | { ok: false; error: string };

const generateSchema = z.object({ offerId: z.string().uuid(), language: z.enum(["en", "fr"]), baseId: z.string().uuid().nullish() });

async function prepare(input: unknown) {
  const account = await getAccount();
  const ui = await getUiLang(); // messages in the site's language
  const t = DOCUMENTS_COPY[ui];
  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t.offerNotFound } as const;
  const detail = await getOfferDetail(account.userId, parsed.data.offerId);
  if (!detail) return { ok: false, error: t.offerNotFound } as const;
  const facts = await listFacts(account.userId);
  if (!facts.some((f) => f.validated)) return { ok: false, error: t.validateFirst } as const;
  const profile = factIndex(facts); // a vibe-coded project never covers a technical requirement
  const offer: OfferForDocuments = {
    title: detail.offer.title,
    company: detail.offer.company,
    stack: detail.offer.stack.map((s) => s.value),
    requirements: detail.requirements.map((r) => ({ text: r.text, covered: isCovered(r, profile) })),
  };
  const base = parsed.data.baseId ? await getDocument(account.userId, parsed.data.baseId) : null;
  const language: DocumentLanguage = parsed.data.language;
  const title = `${[detail.offer.title, detail.offer.company].filter(Boolean).join(" · ") || "Offer"} (${language.toUpperCase()})`;
  return { ok: true, account, ui, offerId: detail.offer.id, facts, offer, language, base, title } as const;
}

export async function generateCvAction(input: unknown): Promise<Result> {
  const ready = await prepare(input);
  if (!ready.ok) return { ok: false, error: ready.error };
  const { account, ui, offerId, facts, offer, language, base, title } = ready;
  try {
    const cv = await generateTailoredCv(
      { userId: account.userId, isOwner: account.isOwner },
      { offer, facts, language, base: base?.content?.kind === "tailored_cv" ? base.content : null },
    );
    await saveDocumentVersion(account.userId, offerId, "cv", documentSentences(cv), { language, content: cv, title });
    revalidatePath(`/offers/${offerId}/cv`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, ui) };
  }
}

export async function generateLetterAction(input: unknown): Promise<Result> {
  const ready = await prepare(input);
  if (!ready.ok) return { ok: false, error: ready.error };
  const { account, ui, offerId, facts, offer, language, base, title } = ready;
  try {
    const letter = await generateCoverLetter(
      { userId: account.userId, isOwner: account.isOwner },
      { offer, facts, candidateName: account.fullName, language, base: base?.content?.kind === "cover_letter" ? base.content : null },
    );
    await saveDocumentVersion(account.userId, offerId, "cover_letter", documentSentences(letter), { language, content: letter, title });
    revalidatePath(`/offers/${offerId}/cv`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, ui) };
  }
}

const keepSchema = z.object({ id: z.string().uuid(), kept: z.boolean() });

/** Keeps a CV or a letter in the profile, to reuse it or start a new one from it; or takes it out. */
export async function keepDocumentAction(input: unknown): Promise<Result> {
  const userId = await requireUserId();
  const parsed = keepSchema.safeParse(input);
  if (!parsed.success || !(await setDocumentKept(userId, parsed.data.id, parsed.data.kept))) return { ok: false, error: DOCUMENTS_COPY[await getUiLang()].documentNotFound };
  revalidatePath("/", "layout");
  return { ok: true };
}

const editSchema = z.object({ id: z.string().uuid(), path: docEditPathSchema, value: z.string().max(2000) });

/** Changes one sentence of a CV or a letter by hand, in the same version: nothing is written again by the AI. */
export async function editDocumentLineAction(input: unknown): Promise<Result> {
  const userId = await requireUserId();
  const t = DOCUMENTS_COPY[await getUiLang()];
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t.lineInvalid };
  const document = await getDocument(userId, parsed.data.id);
  if (!document?.content) return { ok: false, error: t.documentNotFound };
  const next = applyDocEdit(document.content, parsed.data.path, parsed.data.value);
  if (!next) return { ok: false, error: t.lineInvalid };
  await updateDocumentContent(userId, document.id, next, documentSentences(next));
  revalidatePath("/", "layout");
  return { ok: true };
}
