import type { Lang, Localized } from "@/lib/interviewers/types";
import type { QuestionGroup } from "@/lib/types";

// Finer question types, shown on the call ("Question 3 / 10 · Motivation"). PROVISIONAL list: edit it
// here; the generator is told which types fit each group, and anything else falls back to the group.

export const QUESTION_TYPES = ["introduction", "motivation", "strengths", "weaknesses", "experience", "situation", "technical", "skill_gap"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABEL: Record<QuestionType, Localized> = {
  introduction: { en: "Introduction", fr: "Présentation" },
  motivation: { en: "Motivation", fr: "Motivation" },
  strengths: { en: "Strengths", fr: "Qualités" },
  weaknesses: { en: "Weaknesses", fr: "Points faibles" },
  experience: { en: "Experience", fr: "Expérience" },
  situation: { en: "Situation", fr: "Mise en situation" },
  technical: { en: "Technical", fr: "Technique" },
  skill_gap: { en: "Skill gap", fr: "Lacune" },
};

/** Which types fit each group of questions. */
export const TYPES_BY_GROUP: Record<QuestionGroup, readonly QuestionType[]> = {
  hr: ["introduction", "motivation", "strengths", "weaknesses", "experience", "situation"],
  technical: ["technical", "situation"],
  gap: ["skill_gap"],
};

export const GROUP_LABEL: Record<QuestionGroup, Localized> = {
  hr: { en: "General", fr: "Générale" },
  technical: { en: "Technical", fr: "Technique" },
  gap: { en: "Skill gap", fr: "Lacune" },
};

/** Keeps a proposed type only if it fits the question's group. */
export function questionType(group: QuestionGroup, proposed: string | null | undefined): QuestionType | null {
  const type = proposed?.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return type && (TYPES_BY_GROUP[group] as readonly string[]).includes(type) ? (type as QuestionType) : null;
}

/** What the call shows for a question: its type when known, else its group. */
export function questionLabel(group: QuestionGroup, type: string | null, lang: Lang = "en"): string {
  const known = questionType(group, type);
  return known ? QUESTION_TYPE_LABEL[known][lang] : GROUP_LABEL[group][lang];
}
