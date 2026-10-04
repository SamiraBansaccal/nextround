import "server-only";
import { z } from "zod";
import { type AiContext, aiJson } from "@/lib/ai";
import { questionType, type QuestionType, TYPES_BY_GROUP } from "@/lib/interview/question-types";
import { factAliases, type FactForPrompt } from "@/lib/prompt-facts";
import type { QuestionGroup, SourcedSentence } from "@/lib/types";
import { keepValidFactIds } from "@/lib/verify";

// Interview questions on the offer: 4 HR, 4 technical on the offer's own stack, 2 on the gaps.
// The AI cites its source with an alias (S# = stack item, R# = requirement); the code rebuilds the
// source line from the VERIFIED offer data, so a question can never cite something the offer lacks.

const sentence = z.object({ text: z.string().trim().min(1).max(400), fact_ids: z.array(z.string()).max(6).default([]) });

export const questionsSchema = z.object({
  questions: z
    .array(
      z.object({
        group: z.enum(["hr", "technical", "gap"]),
        type: z.string().trim().max(30).nullish(),
        text: z.string().trim().min(5).max(400),
        ref: z.string().trim().max(10).nullish(),
        suggested_answer: z.array(sentence).max(8).default([]),
      }),
    )
    .min(6)
    .max(14),
});

export interface OfferForInterview {
  title: string | null;
  company: string | null;
  language: string | null;
  stack: { value: string; quote: string }[];
  requirements: { text: string; quote: string; covered: boolean }[];
}

export interface GeneratedQuestion {
  group: QuestionGroup;
  type?: QuestionType | null; // finer label, when the model gave a valid one
  text: string;
  source: string;
  suggestedAnswer: SourcedSentence[];
}

const LIMITS: Record<QuestionGroup, number> = { hr: 4, technical: 4, gap: 2 };

/** Pure: maps aliases back, rebuilds sources from verified data, keeps only fact-backed sentences. */
export function verifyQuestions(
  raw: z.infer<typeof questionsSchema>,
  offer: OfferForInterview,
  aliasToId: ReadonlyMap<string, string>,
  validIds: ReadonlySet<string>,
): GeneratedQuestion[] {
  const gaps = offer.requirements.filter((r) => !r.covered);
  const counts: Record<QuestionGroup, number> = { hr: 0, technical: 0, gap: 0 };
  const out: GeneratedQuestion[] = [];

  for (const q of raw.questions) {
    let group: QuestionGroup = q.group;
    let source = "Standard HR question";
    const ref = q.ref?.toUpperCase() ?? "";
    if (group === "technical") {
      const item = offer.stack[Number(ref.replace(/^S/, "")) - 1];
      source = item ? `From the offer's stack: ${item.value} — “${item.quote}”` : "From the offer's stack";
    } else if (group === "gap") {
      const req = gaps[Number(ref.replace(/^R/, "")) - 1];
      if (req) source = `From a gap in your profile: ${req.text} — “${req.quote}”`;
      else group = "technical"; // no verifiable gap behind it
      if (!req) source = "From the offer's stack";
    }
    if (counts[group] >= LIMITS[group] + (group === "technical" ? Math.max(0, 2 - gaps.length) : 0)) continue;
    counts[group]++;
    const suggestedAnswer = q.suggested_answer
      .map((s) => ({ text: s.text, factIds: keepValidFactIds(s.fact_ids.map((a) => aliasToId.get(a.trim()) ?? ""), validIds) }))
      .filter((s) => s.factIds.length > 0); // built ONLY from validated facts
    out.push({ group, type: questionType(group, q.type), text: q.text, source, suggestedAnswer });
  }
  const order: QuestionGroup[] = ["hr", "technical", "gap"];
  return out.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
}

/**
 * `persona` (lib/interviewers/persona.ts) only changes how questions are PHRASED (provisional use):
 * groups, sources and suggested answers follow the same rules for every interviewer.
 */
export async function generateQuestions(ctx: AiContext, offer: OfferForInterview, facts: FactForPrompt[], persona?: string | null): Promise<GeneratedQuestion[]> {
  const { aliasToId, listing } = factAliases(facts);
  const gaps = offer.requirements.filter((r) => !r.covered);
  const stackList = offer.stack.map((s, i) => `S${i + 1} ${s.value}`).join("\n") || "(no stack listed)";
  const gapList = gaps.map((r, i) => `R${i + 1} ${r.text}`).join("\n") || "(no gaps)";
  const language = offer.language ?? "en";

  const raw = await aiJson(ctx, {
    schema: questionsSchema,
    system: `You prepare a junior candidate for a job interview for one specific offer.
Write 10 interview questions in the language "${language}" (the offer's language):
- 4 "hr" questions: introduce yourself, strengths, weaknesses, why you / why this company.
- 4 "technical" questions about the offer's stack (use its S# ids in "ref"), junior level, conceptual, answerable orally (no live coding).
- 2 "gap" questions about the requirements the candidate does not cover yet (use their R# ids in "ref"); if there are no gaps, write 2 more technical questions instead.
"type" labels the question: ${TYPES_BY_GROUP.hr.join(" | ")} for "hr"; ${TYPES_BY_GROUP.technical.join(" | ")} for "technical"; ${TYPES_BY_GROUP.gap.join(" | ")} for "gap".
For each question, "suggested_answer" is a short answer as a list of sentences built ONLY from the candidate facts, each sentence with the ids (F#) of the facts it relies on. Never add experience, numbers or skills that are not in the facts. For gap questions, be honest: say what the candidate has not done yet and what they are learning, using only the facts.${
      persona
        ? `
INTERVIEWER PERSONA: phrase every question the way this interviewer would ask it (tone, rhythm, pressure). The rules above still apply. The suggested answers stay in a neutral, professional voice: they are the candidate's answers, not the interviewer's.
<persona>
${persona}
</persona>`
        : ""
    }
Output format: {"questions": [{"group": "hr" | "technical" | "gap", "type": "...", "text": "...", "ref": "S1" | "R1" | null, "suggested_answer": [{"text": "...", "fact_ids": ["F1"]}]}]}`,
    user: `OFFER: ${offer.title ?? "(untitled)"} at ${offer.company ?? "(company not stated)"}
STACK:\n${stackList}
GAPS (requirements not covered by the candidate's facts):\n${gapList}
CANDIDATE FACTS (validated):\n${listing || "(none yet)"}`,
  });
  return verifyQuestions(raw, offer, aliasToId, new Set(facts.map((f) => f.id)));
}
