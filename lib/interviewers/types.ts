// Interviewers: who asks the questions in a practice interview. Pure data types, shared by the server
// (prompts, voice) and the UI (setup screen, call). To add or change an interviewer, edit the catalog
// files in lib/interviewers/catalog/, not the components.

/** The languages an interview can run in. A property of the SESSION, never of the interviewer. */
export type Lang = "en" | "fr";
export type Localized = Record<Lang, string>;

/** 1 = very low … 5 = very high. Provisional scale: easy to change in one place (lib/interviewers/persona.ts). */
export type Level = 1 | 2 | 3 | 4 | 5;

export interface InterviewerTraits {
  severity: Level; // how demanding the evaluation feels
  warmth: Level;
  formality: Level;
  humour: Level;
  interruption: Level; // how often they cut in
  questionLength: Level; // 1 = one-liners, 5 = long, layered questions
  pressure: Level;
  energy: Level;
  confidence: Level;
  unpredictability: Level;
}

/** How the interviewer reacts after an answer (used for dynamic follow-ups later). */
export type FollowUpStyle = "gentle" | "probing" | "rapid" | "challenging" | "tangential" | "silent";

/**
 * - original: a character made for NextRound (e.g. Marie);
 * - archetype: a recognisable workplace type, invented ("the LinkedIn CEO");
 * - real_person: a parody inspired by a public figure's speaking style;
 * - fictional_character: a fan parody of a character owned by someone else.
 */
export type InterviewerKind = "original" | "archetype" | "real_person" | "fictional_character";

/**
 * The interviewer's voice, independent of any provider. "default" = the voice the instance or the
 * user already uses (ElevenLabs if a key exists, else the browser). A provider-specific voice id is
 * only an option for later: never assume a real person's voice can be cloned.
 */
export interface VoiceProfile {
  provider: "default" | "elevenlabs" | "browser";
  voiceId: string | null; // provider's voice id, when one is chosen and licensed
  style: string; // human description, e.g. "calm, low, measured"
  settings: { stability?: number; similarityBoost?: number; style?: number; speed?: number } | null;
}

/** What the user reads about an interviewer, in one language. */
export interface InterviewerCopy {
  name: string;
  role: string | null; // shown on the call's name tag, e.g. "Talent Partner"
  style: string; // the interview style in one line: "Cold, formal and extremely demanding"
  description: string; // one short line
}

export interface Interviewer {
  id: string; // stable, used in URLs, the database and asset names (public/interviewers/<id>.webp)
  name: string; // canonical name, used in prompts
  categoryId: string;
  kind: InterviewerKind;
  image: string | null; // public path of a 16:9 webcam-style picture; null = generated placeholder
  copy: Record<Lang, InterviewerCopy>;
  // For the prompt only (English is fine for the model, whatever the interview language):
  personality: string;
  interviewStyle: string;
  vocabulary: string;
  followUpStyle: FollowUpStyle;
  traits: InterviewerTraits;
  voice: VoiceProfile;
  llmInstructions: string | null; // extra persona notes for the prompt, if any
}

export interface InterviewerCategory {
  id: string;
  label: Localized;
  description: Localized;
  icon: string; // a key mapped to an icon by the UI
}
