import type { Lang } from "@/lib/interviewers/types";
import type { QuestionGroup } from "@/lib/types";

// An interview SESSION is configured before the call (setup screen) and stored with the interview:
//   interviewer · language · focus (which questions)   -> server (lib/data/interviews.ts)
//   microphone · camera                                -> this browser only (never sent)

/** Which questions the interview asks. The UI calls it "Questions"; `type` is taken by each question. */
export const FOCUSES = ["general", "technical", "both"] as const;
export type Focus = (typeof FOCUSES)[number];
export const DEFAULT_FOCUS: Focus = "both";

export function isFocus(value: unknown): value is Focus {
  return typeof value === "string" && (FOCUSES as readonly string[]).includes(value);
}

/** How many questions of each group a session asks. PROVISIONAL numbers: change them here. */
export const PLANS: Record<Focus, Record<QuestionGroup, number>> = {
  general: { hr: 8, technical: 0, gap: 0 },
  technical: { hr: 0, technical: 6, gap: 2 },
  both: { hr: 4, technical: 4, gap: 2 },
};

export interface InterviewConfig {
  interviewerId: string;
  language: Lang;
  focus: Focus;
}

/** Microphone and camera choices, kept in this browser between the setup screen and the call. */
export interface MediaChoice {
  microphone: boolean;
  camera: boolean;
}

export const MEDIA_STORAGE_KEY = "nextround.call.media";
