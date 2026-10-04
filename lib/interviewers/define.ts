import type { FollowUpStyle, Interviewer, InterviewerKind, InterviewerTraits, VoiceProfile } from "./types";

// Lets each catalog file state only what is specific to a character. Defaults: no picture yet
// (a placeholder is generated), the default voice, no extra prompt notes.

export interface InterviewerSpec {
  id: string;
  name: string;
  description: string;
  personality: string;
  interviewStyle: string;
  vocabulary: string;
  followUpStyle: FollowUpStyle;
  traits: InterviewerTraits;
  voiceStyle: string;
  kind?: InterviewerKind;
  role?: string | null;
  image?: string | null;
  voice?: Partial<Omit<VoiceProfile, "style">>;
  llmInstructions?: string | null;
}

export function defineCategory(categoryId: string, defaults: { kind: InterviewerKind; role: string | null }, specs: InterviewerSpec[]): Interviewer[] {
  return specs.map(({ voiceStyle, voice, ...spec }) => ({
    ...spec,
    categoryId,
    kind: spec.kind ?? defaults.kind,
    role: spec.role === undefined ? defaults.role : spec.role,
    image: spec.image ?? null,
    llmInstructions: spec.llmInstructions ?? null,
    voice: { provider: "default", voiceId: null, settings: null, ...voice, style: voiceStyle },
  }));
}
