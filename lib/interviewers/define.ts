import type { FollowUpStyle, Interviewer, InterviewerKind, InterviewerTraits, Localized, VoiceProfile } from "./types";

// Lets each catalog file state only what is specific to a character. Defaults: no picture yet
// (a placeholder is generated), the default voice, no extra prompt notes, the category's role.

export interface InterviewerSpec {
  id: string;
  name: string; // canonical (English) name
  nameFr?: string; // only when the French name differs ("M. Burns")
  role?: Localized | null;
  style: Localized; // the interview style in one line, shown before joining
  description: Localized;
  personality: string;
  interviewStyle: string;
  vocabulary: string;
  followUpStyle: FollowUpStyle;
  traits: InterviewerTraits;
  voiceStyle: string;
  kind?: InterviewerKind;
  image?: string | null;
  voice?: Partial<Omit<VoiceProfile, "style">>;
  llmInstructions?: string | null;
}

export function defineCategory(categoryId: string, defaults: { kind: InterviewerKind; role: Localized | null }, specs: InterviewerSpec[]): Interviewer[] {
  return specs.map(({ voiceStyle, voice, nameFr, role, style, description, ...spec }) => {
    const r = role === undefined ? defaults.role : role;
    return {
      ...spec,
      categoryId,
      kind: spec.kind ?? defaults.kind,
      image: spec.image ?? null,
      llmInstructions: spec.llmInstructions ?? null,
      voice: { provider: "default", voiceId: null, settings: null, ...voice, style: voiceStyle },
      copy: {
        en: { name: spec.name, role: r?.en ?? null, style: style.en, description: description.en },
        fr: { name: nameFr ?? spec.name, role: r?.fr ?? null, style: style.fr, description: description.fr },
      },
    };
  });
}

/** Role shown for guest characters (parodies). */
export const GUEST: Localized = { en: "Guest interviewer", fr: "Personnalité invitée" };
