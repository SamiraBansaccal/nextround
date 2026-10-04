import type { Localized } from "@/lib/interviewers/types";

// The technical question bank: app data, written once, the same for every user. Nothing here comes from
// a user or from an AI. Questions are junior level and answerable out loud (no live coding). Each one
// comes with a model answer: general technical knowledge, never a claim about the candidate (what the
// candidate has done comes only from their validated facts, see lib/interview/generate.ts).

/** The kinds of technical questions, from "explain a notion" to "tell me about your project". */
export const TECH_KINDS = ["concept", "compare", "practice", "troubleshoot", "design", "best_practice", "experience"] as const;
export type TechKind = (typeof TECH_KINDS)[number];

export type TechFamily = "language" | "systems" | "devops" | "data" | "web" | "foundations";

export interface Tech {
  id: string; // stable: the prefix of every question id ("cpp.raii"), stored with the questions asked
  label: Localized; // "C++", "Réseaux"…
  family: TechFamily;
  /** Found anywhere in a text, on word boundaries ("node.js", "spring boot"). Lowercase, no accents. */
  aliases: string[];
  /** Matched only when they are the WHOLE value: one letter or a common word ("c", "go", "rest"). */
  exact?: string[];
  /** A tool or a language, so "tell me about a project with {tech}" makes sense; not a topic. */
  tool: boolean;
}

/** As written in the bank files: [slug, kind, question EN, question FR, answer EN, answer FR]. */
export type QuestionEntry = readonly [slug: string, kind: TechKind, en: string, fr: string, answerEn: string, answerFr: string];

export interface BankQuestion {
  id: string; // `${tech}.${slug}`: never reuse an id for a different question (asked questions keep it)
  tech: string;
  kind: TechKind;
  /** May hold "{formal|casual}" pairs (lib/interview/register.ts) and {tech}. */
  text: Localized;
  /**
   * What a good answer says, in the candidate's voice; for "experience" questions, how to build the
   * answer instead (only the candidate's own facts can fill it). May hold {tech}.
   */
  answer: Localized;
}

export interface TechEntry {
  tech: Tech;
  questions: BankQuestion[];
}

export function same(label: string): Localized {
  return { en: label, fr: label };
}

export function defineTech(tech: Tech, entries: readonly QuestionEntry[]): TechEntry {
  return {
    tech,
    questions: entries.map(([slug, kind, en, fr, answerEn, answerFr]) => ({
      id: `${tech.id}.${slug}`,
      tech: tech.id,
      kind,
      text: { en, fr },
      answer: { en: answerEn, fr: answerFr },
    })),
  };
}
