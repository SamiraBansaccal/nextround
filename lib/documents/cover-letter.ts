import "server-only";
import { z } from "zod";
import { type AiContext, aiJson } from "@/lib/ai";
import { lenientArray } from "@/lib/ai/lenient";
import { factAliases, type FactForPrompt } from "@/lib/ai/prompt-facts";
import type { DocumentLanguage, SourcedSentence, TailoredLetter } from "@/lib/types";
import { keepValidFactIds } from "@/lib/ai/verify";
import type { OfferForDocuments, ProfileFact } from "./tailored-cv";

// A cover letter for ONE offer, in English or French. The greeting and the closing are formalities;
// every sentence of the body cites the validated facts it relies on (a sentence about the offer itself
// cites "OFFER" and is shown as such). A kept letter can inspire the next one.

const sentence = z.object({ text: z.string().trim().min(1).max(450), fact_ids: z.array(z.string()).max(8).default([]) });

export const letterSchema = z.object({
  greeting: z.string().trim().min(1).max(140),
  paragraphs: lenientArray(lenientArray(sentence, 6), 5),
  closing: z.string().trim().min(1).max(200),
});

export type LetterSentence = SourcedSentence & { fromOffer?: boolean };

/** Pure: aliases back to ids; "OFFER" marks a sentence about the offer, not about the candidate. */
export function verifyLetter(
  raw: z.infer<typeof letterSchema>,
  aliasToId: ReadonlyMap<string, string>,
  validIds: ReadonlySet<string>,
  language: DocumentLanguage,
): TailoredLetter {
  const paragraphs = raw.paragraphs
    .map((paragraph) =>
      paragraph.map((s): LetterSentence => {
        const fromOffer = s.fact_ids.some((id) => id.trim().toUpperCase() === "OFFER");
        const factIds = keepValidFactIds(s.fact_ids.map((a) => aliasToId.get(a.trim()) ?? ""), validIds);
        return fromOffer && factIds.length === 0 ? { text: s.text, factIds, fromOffer: true } : { text: s.text, factIds };
      }),
    )
    .filter((paragraph) => paragraph.length > 0);
  return { kind: "cover_letter", language, greeting: raw.greeting, paragraphs, closing: raw.closing };
}

const LANGUAGE_NAME: Record<DocumentLanguage, string> = { en: "English", fr: "French" };

export interface LetterInput {
  offer: OfferForDocuments;
  facts: (FactForPrompt & ProfileFact)[];
  candidateName: string;
  language: DocumentLanguage;
  /** A letter the candidate kept: its tone and structure may inspire this one. */
  base?: TailoredLetter | null;
}

export async function generateCoverLetter(ctx: AiContext, input: LetterInput): Promise<TailoredLetter> {
  const validated = input.facts.filter((f) => f.validated);
  const { aliasToId, listing } = factAliases(validated);
  const { offer } = input;
  const raw = await aiJson(ctx, {
    schema: letterSchema,
    system: `You write the cover letter of a junior tech candidate for ONE job offer, in ${LANGUAGE_NAME[input.language]}, whatever the language of the facts.
Structure: "greeting" (to the recruitment team of the company; no invented names), 3 or 4 short "paragraphs" of sentences, then "closing" (a polite closing formula followed by the candidate's name).
- Paragraph 1: the role applied for and what draws the candidate to it, from the offer.
- Then: the facts that match the offer best (training, projects, what was built), and the transferable strengths of an earlier career in one or two sentences at most.
- Last: honest about what is still to learn (never claim a requirement listed under GAPS), and availability if the facts give it.
Rules:
- Every body sentence lists in "fact_ids" the F# ids of the facts it relies on. A sentence only about the offer or the company (the role, the mission, what they look for) uses ["OFFER"]: never mix a claim about the candidate into it.
- Never invent experience, dates, numbers, employers, degrees or skills. No clichés, no flattery: concrete and sincere.
- A project marked "built with AI assistance (vibe coding)" shows interest in AI and creativity, never mastery of its technologies.
Output format: {"greeting": "...", "paragraphs": [[{"text": "...", "fact_ids": ["OFFER"]}], [{"text": "...", "fact_ids": ["F1"]}]], "closing": "..."}`,
    user: `CANDIDATE: ${input.candidateName}
OFFER: ${offer.title ?? "(untitled)"} at ${offer.company ?? "(company not stated)"}
STACK: ${offer.stack.join(", ") || "(none listed)"}
REQUIREMENTS THE CANDIDATE COVERS:\n${offer.requirements.filter((r) => r.covered).map((r) => `- ${r.text}`).join("\n") || "(none)"}
GAPS (never claim these):\n${offer.requirements.filter((r) => !r.covered).map((r) => `- ${r.text}`).join("\n") || "(none)"}
${input.base ? `A LETTER THE CANDIDATE KEPT (inspiration for tone and structure only; do not copy claims that the facts below do not prove):\n${[input.base.greeting, ...input.base.paragraphs.map((p) => p.map((s) => s.text).join(" ")), input.base.closing].join("\n")}\n` : ""}CANDIDATE FACTS (validated):\n${listing || "(none)"}`,
  });
  return verifyLetter(raw, aliasToId, new Set(validated.map((f) => f.id)), input.language);
}
