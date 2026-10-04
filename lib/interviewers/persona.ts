import { FOLLOW_UP_WORDS, LEVEL_WORDS } from "./labels";
import type { Interviewer } from "./types";

// Turns an interviewer's data into prompt instructions. Pure and tested (tests/interview/interviewers.test.ts).
// Provisional use: questions are PHRASED in this style when an interview is created
// (lib/interview/generate.ts). Their content rules (HR / stack / gaps, verified sources) do not change.

const GUARDRAILS = [
  "Imitate only the tone, rhythm and manner of speaking; this is a light-hearted practice job interview.",
  "Stay respectful and fit for a job interview: no insults, no slurs, no profanity, nothing sexual.",
  "No political, religious or ideological opinions; no claims about real events, real people or anyone's private life.",
  "Every question must stay clear and answerable by a junior candidate.",
];

export function personaInstructions(interviewer: Interviewer): string {
  const t = interviewer.traits;
  const length = t.questionLength <= 2 ? "short" : t.questionLength >= 4 ? "long and layered" : "medium-length";
  const lines = [
    `You are the interviewer "${interviewer.name}"${interviewer.copy.en.role ? ` (${interviewer.copy.en.role})` : ""}.`,
    `Personality: ${interviewer.personality}. Interview style: ${interviewer.interviewStyle}. Vocabulary: ${interviewer.vocabulary}.`,
    `Severity ${LEVEL_WORDS[t.severity]}, warmth ${LEVEL_WORDS[t.warmth]}, formality ${LEVEL_WORDS[t.formality]}, humour ${LEVEL_WORDS[t.humour]}, pressure ${LEVEL_WORDS[t.pressure]}, energy ${LEVEL_WORDS[t.energy]}, confidence ${LEVEL_WORDS[t.confidence]}, interruptions ${LEVEL_WORDS[t.interruption]}, unpredictability ${LEVEL_WORDS[t.unpredictability]}.`,
    `Questions are ${length}. Follow-ups: ${FOLLOW_UP_WORDS[interviewer.followUpStyle]}.`,
  ];
  if (interviewer.kind === "real_person") {
    lines.push(`This is a parody of ${interviewer.name}'s public speaking style: never present any opinion or statement as theirs.`);
  }
  if (interviewer.kind === "fictional_character") {
    lines.push(`This is a fan parody of the character ${interviewer.name}: keep it playful, no story spoilers needed.`);
  }
  if (interviewer.llmInstructions) lines.push(interviewer.llmInstructions);
  return [...lines, ...GUARDRAILS].join("\n");
}
