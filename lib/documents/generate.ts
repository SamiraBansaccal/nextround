import "server-only";
import { z } from "zod";
import { type AiContext, aiJson } from "@/lib/ai";
import { factAliases, type FactForPrompt } from "@/lib/prompt-facts";
import type { SourcedSentence } from "@/lib/types";
import { keepValidFactIds } from "@/lib/verify";

// Tailored CV + cover letter for one offer (or a base CV without offer), in ONE AI call.
// Format: sentences = [{text, fact_ids}]. The deterministic verifier keeps the sentences but maps
// fact ids to the user's validated facts: a sentence left without a valid fact is "Unsupported".

export type CvSentence = SourcedSentence & { section: string };

const sentence = z.object({ text: z.string().trim().min(1).max(500), fact_ids: z.array(z.string()).max(6).default([]) });

export const documentsSchema = z.object({
  cv: z.array(z.object({ section: z.string().trim().min(1).max(60), sentences: z.array(sentence).max(12) })).min(1).max(8),
  cover_letter: z.array(sentence).max(16).default([]),
});

export function verifyDocuments(raw: z.infer<typeof documentsSchema>, aliasToId: ReadonlyMap<string, string>, validIds: ReadonlySet<string>) {
  const map = (ids: string[]) => keepValidFactIds(ids.map((a) => aliasToId.get(a.trim()) ?? ""), validIds);
  const cv: CvSentence[] = raw.cv.flatMap((s) => s.sentences.map((x) => ({ section: s.section, text: x.text, factIds: map(x.fact_ids) })));
  const coverLetter: SourcedSentence[] = raw.cover_letter.map((x) => ({ text: x.text, factIds: map(x.fact_ids) }));
  return { cv, coverLetter };
}

export interface OfferForDocuments {
  title: string | null;
  company: string | null;
  language: string | null;
  requirements: { text: string; covered: boolean }[];
}

export async function generateDocuments(ctx: AiContext, offer: OfferForDocuments | null, facts: FactForPrompt[], candidateName: string) {
  const { aliasToId, listing } = factAliases(facts);
  const language = offer?.language ?? "en";
  const offerBlock = offer
    ? `OFFER: ${offer.title ?? "(untitled)"} at ${offer.company ?? "(company not stated)"}
COVERED REQUIREMENTS:\n${offer.requirements.filter((r) => r.covered).map((r) => `- ${r.text}`).join("\n") || "(none)"}
GAPS (never claim these):\n${offer.requirements.filter((r) => !r.covered).map((r) => `- ${r.text}`).join("\n") || "(none)"}`
    : "No specific offer: write a general base CV and leave cover_letter empty.";

  const raw = await aiJson(ctx, {
    schema: documentsSchema,
    system: `You write a junior tech candidate's CV and cover letter in the language "${language}".
Rules:
- Use ONLY the candidate facts. Every sentence lists in "fact_ids" the F# ids of the facts it relies on.
- Never invent experience, dates, numbers, employers, degrees or skills. If something is not in the facts, do not write it.
- Never claim a gap. You may write an honest sentence such as "currently learning X" only if it helps; it will be shown as unsupported unless a fact proves it.
- CV: 3 to 6 short sections (e.g. Profile, Projects, Skills, Education, Languages), each with short sentences; put first what matches the offer.
- Cover letter: 6 to 10 sentences, addressed to the company, specific to the offer, built only from the facts.
Output format: {"cv": [{"section": "Projects", "sentences": [{"text": "...", "fact_ids": ["F1"]}]}], "cover_letter": [{"text": "...", "fact_ids": ["F2"]}]}`,
    user: `CANDIDATE: ${candidateName}\n${offerBlock}\nCANDIDATE FACTS (validated):\n${listing || "(none)"}`,
  });
  return verifyDocuments(raw, aliasToId, new Set(facts.map((f) => f.id)));
}
