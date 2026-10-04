import type { Localized } from "@/lib/interviewers/types";

// The HR question bank (lib/interview/hr-bank/data.ts): app data written once, the same for everyone.

export const HR_TYPES = ["introduction", "motivation", "strengths", "weaknesses", "experience", "situation", "career", "salary", "tricky", "closing", "inappropriate"] as const;
export type HrType = (typeof HR_TYPES)[number];

/** As written in the data file: [slug, type, phrasings EN, phrasings FR (same order), answer EN, answer FR]. */
export type HrEntry = readonly [slug: string, type: HrType, en: readonly string[], fr: readonly string[], answerEn: string, answerFr: string];

export interface HrQuestion {
  id: string; // "hr.<slug>": stored with the questions asked, never reused for another question
  type: HrType;
  /** Several phrasings of the same question; French ones hold "{formal|casual}" pairs. */
  variants: readonly Localized[];
  /** How to answer well (general advice; never a claim about the candidate). */
  answer: Localized;
}
