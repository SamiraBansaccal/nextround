import type { FollowUpStyle, InterviewerKind, InterviewerTraits, Level, Localized } from "./types";

// Words for the UI and the prompt, kept as data so they can be reworded without touching components.

/** For the prompt (English is fine for the model, whatever the interview language). */
export const LEVEL_WORDS: Record<Level, string> = { 1: "very low", 2: "low", 3: "medium", 4: "high", 5: "very high" };

/** The traits shown as meters before joining, in this order. */
export const TRAIT_LABELS: { key: keyof InterviewerTraits; label: Localized }[] = [
  { key: "severity", label: { en: "Severity", fr: "Sévérité" } },
  { key: "pressure", label: { en: "Pressure", fr: "Pression" } },
  { key: "warmth", label: { en: "Warmth", fr: "Chaleur" } },
  { key: "formality", label: { en: "Formality", fr: "Formalité" } },
  { key: "humour", label: { en: "Humour", fr: "Humour" } },
  { key: "energy", label: { en: "Energy", fr: "Énergie" } },
  { key: "interruption", label: { en: "Interruptions", fr: "Interruptions" } },
  { key: "unpredictability", label: { en: "Unpredictability", fr: "Imprévisibilité" } },
];

export const LEVEL_OF: Localized = { en: "{level} of 5", fr: "{level} sur 5" };

/** For the prompt. */
export const FOLLOW_UP_WORDS: Record<FollowUpStyle, string> = {
  gentle: "gentle, encouraging follow-ups",
  probing: "probing follow-ups that dig into one detail",
  rapid: "rapid follow-ups, one after another",
  challenging: "challenging follow-ups that push back",
  tangential: "follow-ups that wander off, then come back",
  silent: "few follow-ups and long silences",
};

/** Shown before joining and on the call for parodies; null = no notice needed. */
export const KIND_NOTICE: Record<InterviewerKind, Localized | null> = {
  original: null,
  archetype: null,
  real_person: {
    en: "Parody inspired by a public figure's speaking style. Not affiliated with or endorsed by them; it never speaks for them.",
    fr: "Parodie inspirée du style oratoire d'une personnalité publique. Sans lien avec elle ni son accord ; elle ne parle jamais en son nom.",
  },
  fictional_character: {
    en: "Fan parody of a fictional character. Not affiliated with or endorsed by the rights holders.",
    fr: "Parodie d'un personnage de fiction, faite par des fans. Sans lien avec les ayants droit ni leur accord.",
  },
};

export const KIND_LABEL: Record<InterviewerKind, Localized> = {
  original: { en: "NextRound original", fr: "Création NextRound" },
  archetype: { en: "Archetype", fr: "Archétype" },
  real_person: { en: "Parody", fr: "Parodie" },
  fictional_character: { en: "Fan parody", fr: "Parodie de fan" },
};
