import "server-only";
import { z } from "zod";
import { type AiContext, aiJson } from "@/lib/ai";
import { fill, INTERVIEW_COPY, LANGUAGES } from "@/lib/interview/copy";
import { questionType, type QuestionType, TYPES_BY_GROUP } from "@/lib/interview/question-types";
import { type Focus, PLANS } from "@/lib/interview/session";
import type { Lang } from "@/lib/interviewers/types";
import { factAliases, type FactForPrompt } from "@/lib/prompt-facts";
import type { QuestionGroup, SourcedSentence } from "@/lib/types";
import { keepValidFactIds } from "@/lib/verify";

// Interview questions on the offer, as configured for the session: general (HR), technical (the
// offer's own stack and the candidate's gaps), or both; in the session's language. The AI cites its
// source with an alias (S# = stack item, R# = requirement); the code rebuilds the source line from
// the VERIFIED offer data, so a question can never cite something the offer lacks.

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
    .min(4)
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

export interface QuestionOptions {
  language: Lang;
  focus: Focus;
  /** lib/interviewers/persona.ts: only changes how questions are PHRASED (provisional use). */
  persona?: string | null;
}

/** Pure: maps aliases back, rebuilds sources from verified data, keeps only fact-backed sentences. */
export function verifyQuestions(
  raw: z.infer<typeof questionsSchema>,
  offer: OfferForInterview,
  aliasToId: ReadonlyMap<string, string>,
  validIds: ReadonlySet<string>,
  options: Pick<QuestionOptions, "language" | "focus"> = { language: "en", focus: "both" },
): GeneratedQuestion[] {
  const copy = INTERVIEW_COPY[options.language];
  const plan = PLANS[options.focus];
  const gaps = offer.requirements.filter((r) => !r.covered);
  // Gap questions with no verifiable gap become technical ones, as many as the gaps that are missing.
  const limits: Record<QuestionGroup, number> = { hr: plan.hr, technical: plan.technical + Math.max(0, plan.gap - gaps.length), gap: plan.gap };
  const counts: Record<QuestionGroup, number> = { hr: 0, technical: 0, gap: 0 };
  const out: GeneratedQuestion[] = [];

  for (const q of raw.questions) {
    let group: QuestionGroup = q.group;
    let source = copy.sourceHr;
    const ref = q.ref?.toUpperCase() ?? "";
    if (group === "technical") {
      const item = offer.stack[Number(ref.replace(/^S/, "")) - 1];
      source = item ? fill(copy.sourceStack, { item: item.value, quote: item.quote }) : copy.sourceStackShort;
    } else if (group === "gap") {
      const req = gaps[Number(ref.replace(/^R/, "")) - 1];
      if (req) source = fill(copy.sourceGap, { quote: req.quote });
      else {
        group = "technical"; // no verifiable gap behind it
        source = copy.sourceStackShort;
      }
    }
    if (counts[group] >= limits[group]) continue;
    counts[group]++;
    const suggestedAnswer = q.suggested_answer
      .map((s) => ({ text: s.text, factIds: keepValidFactIds(s.fact_ids.map((a) => aliasToId.get(a.trim()) ?? ""), validIds) }))
      .filter((s) => s.factIds.length > 0); // built ONLY from validated facts
    out.push({ group, type: questionType(group, q.type), text: q.text, source, suggestedAnswer });
  }
  const order: QuestionGroup[] = ["hr", "technical", "gap"];
  return out.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
}

/** The question plan, in words, for the prompt. */
function planLines(focus: Focus): string[] {
  const plan = PLANS[focus];
  const lines: string[] = [];
  if (plan.hr) {
    const topics =
      focus === "general"
        ? "introduce yourself, motivation (why this company, why this role), strengths, weaknesses, a past experience, a situation to handle"
        : "introduce yourself, strengths, weaknesses, why you / why this company";
    lines.push(`- ${plan.hr} "hr" questions: ${topics}.`);
  }
  if (plan.technical) lines.push(`- ${plan.technical} "technical" questions about the offer's stack (use its S# ids in "ref"), junior level, conceptual, answerable orally (no live coding).`);
  if (plan.gap) {
    lines.push(`- ${plan.gap} "gap" questions about the requirements the candidate does not cover yet (use their R# ids in "ref"); if there are no gaps, write ${plan.gap} more technical questions instead.`);
  }
  return lines;
}

export async function generateQuestions(ctx: AiContext, offer: OfferForInterview, facts: FactForPrompt[], options: QuestionOptions): Promise<GeneratedQuestion[]> {
  const { aliasToId, listing } = factAliases(facts);
  const plan = PLANS[options.focus];
  const total = plan.hr + plan.technical + plan.gap;
  const technical = plan.technical + plan.gap > 0;
  const gaps = offer.requirements.filter((r) => !r.covered);
  const stackList = offer.stack.map((s, i) => `S${i + 1} ${s.value}`).join("\n") || "(no stack listed)";
  const gapList = gaps.map((r, i) => `R${i + 1} ${r.text}`).join("\n") || "(no gaps)";
  const languageName = LANGUAGES.find((l) => l.id === options.language)?.english ?? "English";

  const raw = await aiJson(ctx, {
    schema: questionsSchema,
    system: `You prepare a junior candidate for a job interview for one specific offer.
Write ${total} interview questions:
${planLines(options.focus).join("\n")}
Write EVERYTHING (questions and suggested answers) in ${languageName}, whatever the language of the offer or of the facts.
"type" labels the question: ${TYPES_BY_GROUP.hr.join(" | ")} for "hr"; ${TYPES_BY_GROUP.technical.join(" | ")} for "technical"; ${TYPES_BY_GROUP.gap.join(" | ")} for "gap".
For each question, "suggested_answer" is a short answer as a list of sentences built ONLY from the candidate facts, each sentence with the ids (F#) of the facts it relies on. Never add experience, numbers or skills that are not in the facts. For gap questions, be honest: say what the candidate has not done yet and what they are learning, using only the facts.${
      options.persona
        ? `
INTERVIEWER PERSONA: phrase every question the way this interviewer would ask it (tone, rhythm, pressure). The rules above still apply. The suggested answers stay in a neutral, professional voice: they are the candidate's answers, not the interviewer's.
<persona>
${options.persona}
</persona>`
        : ""
    }
Output format: {"questions": [{"group": "hr" | "technical" | "gap", "type": "...", "text": "...", "ref": "S1" | "R1" | null, "suggested_answer": [{"text": "...", "fact_ids": ["F1"]}]}]}`,
    user: `OFFER: ${offer.title ?? "(untitled)"} at ${offer.company ?? "(company not stated)"}
${technical ? `STACK:\n${stackList}\nGAPS (requirements not covered by the candidate's facts):\n${gapList}\n` : ""}CANDIDATE FACTS (validated):\n${listing || "(none yet)"}`,
  });
  return verifyQuestions(raw, offer, aliasToId, new Set(facts.map((f) => f.id)), options);
}
