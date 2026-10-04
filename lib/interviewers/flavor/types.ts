import type { Localized } from "../types";

// Lines an interviewer says AROUND a question (never inside it): a greeting, a catchphrase or a sound,
// a lead-in, a closing remark. Pieces may hold "{formal|casual}" pairs (lib/interview/register.ts),
// {tech} (the technology of a technical question) and {n} (the question's number).

export interface FlavorPack {
  /** Said once, before the first question. */
  greetings?: readonly Localized[];
  /** Short exclamations or sounds before a question: "D'oh!", "Mmm…". */
  interjections?: readonly Localized[];
  /** Lead-ins to any question but the first: "Next question." */
  openers?: readonly Localized[];
  /** Lead-ins naming the technology of a technical question: "Let's talk {tech}." */
  techOpeners?: readonly Localized[];
  /** After the question: "Take your time." */
  closers?: readonly Localized[];
}

export type FlavorField = keyof FlavorPack;
export const FLAVOR_FIELDS: readonly FlavorField[] = ["greetings", "interjections", "openers", "techOpeners", "closers"];
