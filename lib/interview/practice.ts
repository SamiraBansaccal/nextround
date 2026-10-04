import type { Lang } from "@/lib/interviewers/types";
import type { OfferForInterview } from "./generate";
import type { Focus } from "./session";
import { type Topic, topicLabel, topicTechs } from "./tracks";

// What an interview is about: an offer (its stack, requirements and the candidate's gaps), a technology
// or a whole track (technical questions from the question bank only), or general HR questions.

export const INTERVIEW_KINDS = ["offer", "technology", "hr"] as const;
export type InterviewKind = (typeof INTERVIEW_KINDS)[number];

export function isInterviewKind(value: unknown): value is InterviewKind {
  return typeof value === "string" && (INTERVIEW_KINDS as readonly string[]).includes(value);
}

/** The "offer" a practice interview is generated from: its stack is the topic's technologies, no requirements. */
export function practiceOffer(topic: Topic | null): OfferForInterview {
  const stack = topic ? topicTechs(topic).map((t) => ({ value: t.label.en, quote: t.label.en })) : [];
  return { title: null, company: null, language: null, stack, requirements: [] };
}

/** The questions a practice interview asks: technical only on a technology, general only for HR. */
export function practiceFocus(kind: Exclude<InterviewKind, "offer">): Focus {
  return kind === "technology" ? "technical" : "general";
}

/** For the prompt: what the practice interview is about. */
export function practiceAbout(kind: Exclude<InterviewKind, "offer">, topic: Topic | null): string {
  return kind === "technology" && topic ? `technical questions on ${topicLabel(topic, "en")} only` : "general HR questions (motivation, strengths, weaknesses, past experiences, situations), for any junior developer role";
}

/** The interview's title in lists and on the call. */
export function interviewTitle(item: { kind: string; topic: Topic | null; offerTitle: string | null; company?: string | null }, lang: Lang): string {
  if (item.kind === "technology" && item.topic) return topicLabel(item.topic, lang);
  if (item.kind === "hr") return lang === "fr" ? "Entretien RH" : "HR interview";
  return [item.offerTitle ?? (lang === "fr" ? "Offre sans titre" : "Untitled offer"), item.company].filter(Boolean).join(" · ");
}
