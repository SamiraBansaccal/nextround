import "server-only";
import { z } from "zod";
import { type AiContext, aiJson } from "@/lib/ai";
import { bankQuestionText, pickTechnicalQuestions, type TechPick } from "@/lib/interview/bank";
import { fill, INTERVIEW_COPY, LANGUAGES } from "@/lib/interview/copy";
import { questionType, type QuestionType, TYPES_BY_GROUP } from "@/lib/interview/question-types";
import type { Register } from "@/lib/interview/register";
import { type Focus, PLANS } from "@/lib/interview/session";
import type { Lang } from "@/lib/interviewers/types";
import { factAliases, type FactForPrompt } from "@/lib/prompt-facts";
import { shorten } from "@/lib/text";
import type { QuestionGroup, SourcedSentence } from "@/lib/types";
import { isOtherLanguage } from "@/lib/text-lang";
import { keepValidFactIds } from "@/lib/verify";

// Interview questions on the offer, as configured for the session: general (HR), technical (the
// offer's own stack and the candidate's gaps), or both; in the session's language.
// - Technical questions come from the question bank (lib/interview/bank), chosen by code from the
//   offer's verified stack and the candidate's validated facts: written once, reviewed, never invented.
// - The AI writes the other questions and every suggested answer. It cites its sources with aliases
//   (S# = stack item, R# = requirement, B# = bank question); the code rebuilds each source line from
//   the VERIFIED data, so a question can never cite something the offer lacks.

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
  type?: QuestionType | null; // finer label, when known
  text: string;
  source: string;
  suggestedAnswer: SourcedSentence[];
  /** A question of the bank: its id, to find its model answer and its technology again. */
  bankId?: string | null;
  /** The technology of a technical question, in the interview's language (for the interviewer's lead-in). */
  techLabel?: string | null;
  /** What the interviewer says before and after the question (lib/interviewers/flavor); never part of it. */
  intro?: string | null;
  outro?: string | null;
}

export interface QuestionOptions {
  language: Lang;
  focus: Focus;
  /** lib/interviewers/persona.ts: only changes how the AI's questions are PHRASED (provisional use). */
  persona?: string | null;
  /** The interviewer's register: "vous" or "tu" in French (lib/interview/register.ts). */
  register?: Register;
  /** Bank questions already asked to this candidate: asked again only when nothing new is left. */
  askedBefore?: ReadonlySet<string>;
  random?: () => number;
}

/** How many technical questions a session asks: its plan's, plus the gap questions that have no verified gap. */
export function technicalSlots(focus: Focus, gapCount: number): number {
  const plan = PLANS[focus];
  return plan.technical + Math.max(0, plan.gap - gapCount);
}

/** Pure: maps aliases back, rebuilds sources from verified data, keeps only fact-backed sentences. */
export function verifyQuestions(
  raw: z.infer<typeof questionsSchema>,
  offer: OfferForInterview,
  aliasToId: ReadonlyMap<string, string>,
  validIds: ReadonlySet<string>,
  options: Pick<QuestionOptions, "language" | "focus" | "register"> = { language: "en", focus: "both" },
  picks: readonly TechPick[] = [],
): GeneratedQuestion[] {
  const lang = options.language;
  const copy = INTERVIEW_COPY[lang];
  const plan = PLANS[options.focus];
  const gaps = offer.requirements.filter((r) => !r.covered);
  // Gap questions with no verifiable gap become technical ones, as many as the gaps that are missing.
  const limits: Record<QuestionGroup, number> = { hr: plan.hr, technical: technicalSlots(options.focus, gaps.length), gap: plan.gap };
  const counts: Record<QuestionGroup, number> = { hr: 0, technical: picks.length, gap: 0 }; // bank questions come first
  const supported = (sentences: z.infer<typeof sentence>[]) =>
    sentences
      .map((s) => ({ text: s.text, factIds: keepValidFactIds(s.fact_ids.map((a) => aliasToId.get(a.trim()) ?? ""), validIds) }))
      .filter((s) => s.factIds.length > 0); // built ONLY from validated facts

  const fromPick = (pick: TechPick, suggestedAnswer: SourcedSentence[]): GeneratedQuestion => ({
    group: "technical",
    type: questionType("technical", pick.question.kind),
    text: bankQuestionText(pick.question, lang, options.register ?? "formal"),
    source:
      pick.origin.kind === "stack"
        ? fill(copy.sourceStack, { item: pick.origin.value, quote: pick.origin.quote })
        : fill(copy.sourceProfile, { fact: shorten(pick.origin.fact, 120) }),
    suggestedAnswer,
    bankId: pick.question.id,
    techLabel: pick.tech.label[lang],
  });

  const bank: (GeneratedQuestion | undefined)[] = picks.map(() => undefined);
  const out: GeneratedQuestion[] = [];
  for (const q of raw.questions) {
    const ref = q.ref?.trim().toUpperCase() ?? "";
    const b = /^B(\d+)$/.exec(ref);
    if (b) {
      const i = Number(b[1]) - 1; // the AI only wrote the suggested answer: the question is the bank's
      if (picks[i] && !bank[i]) bank[i] = fromPick(picks[i], supported(q.suggested_answer));
      continue;
    }
    let group: QuestionGroup = q.group;
    let source = copy.sourceHr;
    let techLabel: string | null = null;
    if (group === "technical") {
      const item = offer.stack[Number(ref.replace(/^S/, "")) - 1];
      source = item ? fill(copy.sourceStack, { item: item.value, quote: item.quote }) : copy.sourceStackShort;
      techLabel = item?.value ?? null;
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
    out.push({ group, type: questionType(group, q.type), text: q.text, source, suggestedAnswer: supported(q.suggested_answer), techLabel });
  }
  const ofGroup = (group: QuestionGroup) => out.filter((q) => q.group === group);
  // Every bank question is asked, even if the AI skipped its suggested answer.
  return [...ofGroup("hr"), ...picks.map((pick, i) => bank[i] ?? fromPick(pick, [])), ...ofGroup("technical"), ...ofGroup("gap")];
}

/** What the AI must write, in numbers. */
function plan(focus: Focus, picks: number, gapCount: number) {
  const technical = technicalSlots(focus, gapCount);
  return { hr: PLANS[focus].hr, bank: Math.min(picks, technical), technical: Math.max(0, technical - picks), gap: Math.min(PLANS[focus].gap, gapCount) };
}

/** The question plan, in words, for the prompt. */
function planLines(focus: Focus, counts: ReturnType<typeof plan>): string[] {
  const lines: string[] = [];
  if (counts.hr) {
    const topics =
      focus === "general"
        ? "introduce yourself, motivation (why this company, why this role), strengths, weaknesses, a past experience, a situation to handle"
        : "introduce yourself, strengths, weaknesses, why you / why this company";
    lines.push(`- ${counts.hr} "hr" questions: ${topics}.`);
  }
  if (counts.bank) {
    lines.push(
      `- ${counts.bank} "technical" questions are ALREADY WRITTEN (B# ids in the user message): include each of them exactly once, with group "technical", its B# id in "ref", its text copied as is, and its suggested answer.`,
    );
  }
  if (counts.technical) lines.push(`- ${counts.technical} "technical" questions about the offer's stack (use its S# ids in "ref"), junior level, conceptual, answerable orally (no live coding).`);
  if (counts.gap) lines.push(`- ${counts.gap} "gap" questions about the requirements the candidate does not cover yet (use their R# ids in "ref").`);
  return lines;
}

export async function generateQuestions(ctx: AiContext, offer: OfferForInterview, facts: FactForPrompt[], options: QuestionOptions): Promise<GeneratedQuestion[]> {
  const { aliasToId, listing } = factAliases(facts);
  const gaps = offer.requirements.filter((r) => !r.covered);
  const picks = pickTechnicalQuestions({
    stack: offer.stack,
    facts: facts.map((f) => f.text),
    count: technicalSlots(options.focus, gaps.length),
    askedBefore: options.askedBefore,
    random: options.random,
  });
  const counts = plan(options.focus, picks.length, gaps.length);
  const validIds = new Set(facts.map((f) => f.id));

  // Nothing to write and no fact to build an answer from: the bank's questions are enough, no AI call.
  if (counts.hr + counts.technical + counts.gap === 0 && facts.length === 0) {
    return verifyQuestions({ questions: [] }, offer, aliasToId, validIds, options, picks);
  }

  const total = counts.hr + counts.bank + counts.technical + counts.gap;
  const register = options.register ?? "formal";
  const languageName = LANGUAGES.find((l) => l.id === options.language)?.english ?? "English";
  const stackList = offer.stack.map((s, i) => `S${i + 1} ${s.value}`).join("\n") || "(no stack listed)";
  const gapList = gaps.map((r, i) => `R${i + 1} ${r.text}`).join("\n") || "(no gaps)";
  const bankList = picks.map((p, i) => `B${i + 1} [${p.tech.label[options.language]}] ${bankQuestionText(p.question, options.language, register)}`).join("\n");
  const technical = counts.technical + counts.gap > 0;

  const raw = await aiJson(ctx, {
    schema: questionsSchema,
    system: `You prepare a junior candidate for a job interview for one specific offer.
Write ${total} interview questions:
${planLines(options.focus, counts).join("\n")}
Write EVERYTHING (questions and suggested answers) in ${languageName}, whatever the language of the offer or of the facts.${
      options.language === "fr" ? `\nAddress the candidate as "${register === "formal" ? "vous" : "tu"}" in every question you write.` : ""
    }
"type" labels the question: ${TYPES_BY_GROUP.hr.join(" | ")} for "hr"; ${TYPES_BY_GROUP.technical.join(" | ")} for "technical"; ${TYPES_BY_GROUP.gap.join(" | ")} for "gap".
For each question, "suggested_answer" is a short answer as a list of sentences built ONLY from the candidate facts, each sentence with the ids (F#) of the facts it relies on. Never add experience, numbers or skills that are not in the facts. For gap questions, be honest: say what the candidate has not done yet and what they are learning, using only the facts. For a B# question, only relate it to the candidate's own facts (the app shows its own model answer separately); if no fact relates to it, leave "suggested_answer" empty.${
      options.persona
        ? `
INTERVIEWER PERSONA: phrase the questions you write in this interviewer's tone (vocabulary, rhythm, pressure), without greetings, catchphrases or sound effects: the app adds those around the questions. Copy the B# questions exactly as given. The rules above still apply. The suggested answers stay in a neutral, professional voice: they are the candidate's answers, not the interviewer's.
<persona>
${options.persona}
</persona>`
        : ""
    }
Output format: {"questions": [{"group": "hr" | "technical" | "gap", "type": "...", "text": "...", "ref": "S1" | "R1" | "B1" | null, "suggested_answer": [{"text": "...", "fact_ids": ["F1"]}]}]}`,
    user: `OFFER: ${offer.title ?? "(untitled)"} at ${offer.company ?? "(company not stated)"}
${technical ? `STACK:\n${stackList}\nGAPS (requirements not covered by the candidate's facts):\n${gapList}\n` : ""}${
      bankList ? `TECHNICAL QUESTIONS ALREADY WRITTEN (copy them, add the suggested answers):\n${bankList}\n` : ""
    }CANDIDATE FACTS (validated):\n${listing || "(none yet)"}`,
  });
  return verifyQuestions(await inLanguage(ctx, raw, options.language, languageName), offer, aliasToId, validIds, options, picks);
}

const translationSchema = z.object({ texts: z.array(z.string().trim().min(1).max(400)) });

/**
 * Every question and suggested answer the AI wrote must be in the interview's language: the code checks
 * it (lib/text-lang.ts); texts in another language are translated in one extra call, and whatever is
 * still in the wrong language is dropped (a question) or left out (an answer sentence).
 */
async function inLanguage(ctx: AiContext, raw: z.infer<typeof questionsSchema>, lang: Lang, languageName: string): Promise<z.infer<typeof questionsSchema>> {
  const wrong: { set: (text: string) => void; text: string }[] = [];
  const questions = raw.questions.map((q) => ({ ...q, suggested_answer: q.suggested_answer.map((a) => ({ ...a })) }));
  for (const q of questions) {
    if (!isBank(q.ref) && isOtherLanguage(q.text, lang)) wrong.push({ text: q.text, set: (t) => (q.text = t) });
    for (const a of q.suggested_answer) if (isOtherLanguage(a.text, lang)) wrong.push({ text: a.text, set: (t) => (a.text = t) });
  }
  if (wrong.length > 0) {
    try {
      const out = await aiJson(ctx, {
        schema: translationSchema,
        system: `Translate each text into ${languageName}. Keep the meaning, the tone and any technical term. Return {"texts": [...]} with exactly ${wrong.length} texts, in the same order.`,
        user: JSON.stringify({ texts: wrong.map((w) => w.text) }),
      });
      if (out.texts.length === wrong.length) wrong.forEach((w, i) => w.set(out.texts[i]));
    } catch {
      // translation unavailable: the checks below drop what is still in the wrong language
    }
  }
  return dropOtherLanguage({ questions }, lang);
}

const isBank = (ref: string | null | undefined) => /^B\d+$/i.test(ref?.trim() ?? "");

/** Pure: drops the questions, and the answer sentences, written in another language than `lang`. */
export function dropOtherLanguage(raw: z.infer<typeof questionsSchema>, lang: Lang): z.infer<typeof questionsSchema> {
  return {
    questions: raw.questions
      .filter((q) => isBank(q.ref) || !isOtherLanguage(q.text, lang))
      .map((q) => ({ ...q, suggested_answer: q.suggested_answer.filter((a) => !isOtherLanguage(a.text, lang)) })),
  };
}
