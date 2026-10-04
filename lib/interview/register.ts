import type { InterviewerTraits } from "@/lib/interviewers/types";

// How the interviewer addresses the candidate. In French it decides "vous" or "tu"; in English it only
// changes a few polite forms. Texts carry both forms inline, formal first: "{Pouvez-vous|Peux-tu}
// expliquer…". `inRegister` keeps the form that fits the interviewer.

export type Register = "formal" | "casual";

/** Formality 3 and above: "vous" (Marie, Mr. Burns); below: "tu" (Homer, Rick). */
export function registerOf(traits: Pick<InterviewerTraits, "formality">): Register {
  return traits.formality >= 3 ? "formal" : "casual";
}

const PAIR = /\{([^{}|]*)\|([^{}|]*)\}/g;

/** Keeps the formal or the casual form of every "{formal|casual}" pair; other placeholders stay. */
export function inRegister(text: string, register: Register): string {
  return text.replace(PAIR, (_, formal: string, casual: string) => (register === "formal" ? formal : casual));
}
