import type { QuestionGroup } from "@/lib/types";

// Finer question types, shown on the call ("Question 3 / 10 · Motivation"). PROVISIONAL list: edit it
// here; the generator is told which types fit each group, and anything else falls back to the group.

export const QUESTION_TYPES = ["introduction", "motivation", "strengths", "weaknesses", "experience", "situation", "technical", "skill_gap"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  introduction: "Introduction",
  motivation: "Motivation",
  strengths: "Strengths",
  weaknesses: "Weaknesses",
  experience: "Experience",
  situation: "Situation",
  technical: "Technical",
  skill_gap: "Skill gap",
};

/** Which types fit each group of questions. */
export const TYPES_BY_GROUP: Record<QuestionGroup, readonly QuestionType[]> = {
  hr: ["introduction", "motivation", "strengths", "weaknesses", "experience", "situation"],
  technical: ["technical", "situation"],
  gap: ["skill_gap"],
};

export const GROUP_LABEL: Record<QuestionGroup, string> = { hr: "General HR", technical: "Technical", gap: "Skill gap" };

/** Keeps a proposed type only if it fits the question's group. */
export function questionType(group: QuestionGroup, proposed: string | null | undefined): QuestionType | null {
  const type = proposed?.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return type && (TYPES_BY_GROUP[group] as readonly string[]).includes(type) ? (type as QuestionType) : null;
}

/** What the call shows for a question: its type when known, else its group. */
export function questionLabel(group: QuestionGroup, type: string | null): string {
  const known = questionType(group, type);
  return known ? QUESTION_TYPE_LABEL[known] : GROUP_LABEL[group];
}
