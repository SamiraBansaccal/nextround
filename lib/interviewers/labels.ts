import type { FollowUpStyle, InterviewerKind, InterviewerTraits, Level } from "./types";

// Words for the UI and the prompt, kept as data so they can be reworded without touching components.

export const LEVEL_WORDS: Record<Level, string> = { 1: "very low", 2: "low", 3: "medium", 4: "high", 5: "very high" };

/** The traits shown as meters in the picker preview, in this order. */
export const TRAIT_LABELS: { key: keyof InterviewerTraits; label: string }[] = [
  { key: "severity", label: "Severity" },
  { key: "pressure", label: "Pressure" },
  { key: "warmth", label: "Warmth" },
  { key: "formality", label: "Formality" },
  { key: "humour", label: "Humour" },
  { key: "energy", label: "Energy" },
  { key: "interruption", label: "Interruptions" },
  { key: "unpredictability", label: "Unpredictability" },
];

export const FOLLOW_UP_WORDS: Record<FollowUpStyle, string> = {
  gentle: "gentle, encouraging follow-ups",
  probing: "probing follow-ups that dig into one detail",
  rapid: "rapid follow-ups, one after another",
  challenging: "challenging follow-ups that push back",
  tangential: "follow-ups that wander off, then come back",
  silent: "few follow-ups and long silences",
};

/** Shown in the picker and on the call for parodies; null = no notice needed. */
export const KIND_NOTICE: Record<InterviewerKind, string | null> = {
  original: null,
  archetype: null,
  real_person: "Parody inspired by a public figure's speaking style. Not affiliated with or endorsed by them; it never speaks for them.",
  fictional_character: "Fan parody of a fictional character. Not affiliated with or endorsed by the rights holders.",
};

export const KIND_LABEL: Record<InterviewerKind, string> = {
  original: "NextRound original",
  archetype: "Archetype",
  real_person: "Parody",
  fictional_character: "Fan parody",
};
