import { inRegister, type Register } from "@/lib/interview/register";
import type { Lang } from "@/lib/interviewers/types";
import { HR_ENTRIES } from "./data";
import type { HrQuestion, HrType } from "./types";

// HR questions of an interview, drawn from the bank by code (no AI): one question per slot of the
// session's plan, a random phrasing, and questions already asked to the candidate avoided.

export type { HrQuestion, HrType } from "./types";
export { HR_TYPES } from "./types";

export const HR_BANK: readonly HrQuestion[] = HR_ENTRIES.map(([slug, type, en, fr, answerEn, answerFr]) => ({
  id: `hr.${slug}`,
  type,
  variants: en.map((text, i) => ({ en: text, fr: fr[i] ?? fr[0] })),
  answer: { en: answerEn, fr: answerFr },
}));

const BY_ID = new Map(HR_BANK.map((q) => [q.id, q]));

export function findHrQuestion(id: string | null | undefined): HrQuestion | undefined {
  return id ? BY_ID.get(id.split("#")[0]) : undefined;
}

/** Stored id of an asked question: "hr.<slug>#<phrasing>", so the same phrasing is shown again. */
export const hrAskedId = (question: HrQuestion, variant: number) => `${question.id}#${variant}`;

export function hrQuestionText(id: string, lang: Lang, register: Register): string | null {
  const question = findHrQuestion(id);
  if (!question) return null;
  const variant = question.variants[Number(id.split("#")[1]) || 0] ?? question.variants[0];
  return inRegister(variant[lang], register);
}

export function hrAnswerText(id: string, lang: Lang): string | null {
  return findHrQuestion(id)?.answer[lang] ?? null;
}

/** A slot accepts one type, or one of several (chosen at random). */
export type HrSlot = HrType | readonly HrType[];

/** HR plans: a full HR interview, and the HR part of an interview that also asks technical questions. */
export const HR_PLANS: Record<"general" | "both", readonly HrSlot[]> = {
  general: ["introduction", "motivation", "strengths", "weaknesses", "experience", "situation", ["tricky", "inappropriate", "career", "salary"], "closing"],
  both: ["introduction", "motivation", ["strengths", "weaknesses"], ["experience", "situation"]],
};

export interface HrPick {
  question: HrQuestion;
  variant: number;
}

/** One question per slot, never the same twice, preferring questions this candidate has not had yet. */
export function pickHrQuestions(slots: readonly HrSlot[], askedBefore: ReadonlySet<string> = new Set(), random: () => number = Math.random): HrPick[] {
  const asked = new Set([...askedBefore].map((id) => id.split("#")[0]));
  const used = new Set<string>();
  const picks: HrPick[] = [];
  for (const slot of slots) {
    const types = typeof slot === "string" ? [slot] : slot;
    const type = types[Math.floor(random() * types.length) % types.length];
    const pool = HR_BANK.filter((q) => q.type === type && !used.has(q.id));
    const fresh = pool.filter((q) => !asked.has(q.id));
    const candidates = fresh.length ? fresh : pool;
    if (!candidates.length) continue;
    const question = candidates[Math.floor(random() * candidates.length) % candidates.length];
    used.add(question.id);
    picks.push({ question, variant: Math.floor(random() * question.variants.length) % question.variants.length });
  }
  return picks;
}
