import { fill } from "@/lib/interview/copy";
import { inRegister, type Register } from "@/lib/interview/register";
import type { Lang } from "@/lib/interviewers/types";
import { TECH_ENTRIES } from "./catalog";
import { TOOL_QUESTIONS } from "./generic";
import { type BankQuestion, type Tech, type TechKind } from "./types";

// The technical question bank (app data, same for everyone) and how an interview draws from it: the
// technologies of the offer's verified stack first, then those of the candidate's validated facts.
// Pure and deterministic once `random` is given (tests/interview/question-bank.test.ts).

export type { BankQuestion, Tech, TechKind } from "./types";
export { TECH_KINDS } from "./types";

export const TECHS: readonly Tech[] = TECH_ENTRIES.map((entry) => entry.tech);

/** Every question: those written for each technology, plus the generic ones for each tool. */
export const BANK: readonly BankQuestion[] = TECH_ENTRIES.flatMap(({ tech, questions }) => [
  ...questions,
  ...(tech.tool
    ? TOOL_QUESTIONS.map(([slug, kind, en, fr, answerEn, answerFr]) => ({
        id: `${tech.id}.${slug}`,
        tech: tech.id,
        kind,
        text: { en, fr },
        answer: { en: answerEn, fr: answerFr },
      }))
    : []),
]);

const TECH_BY_ID = new Map(TECHS.map((t) => [t.id, t]));
const QUESTION_BY_ID = new Map(BANK.map((q) => [q.id, q]));

export function findTech(id: string | null | undefined): Tech | undefined {
  return id ? TECH_BY_ID.get(id) : undefined;
}

export function findBankQuestion(id: string | null | undefined): BankQuestion | undefined {
  return id ? QUESTION_BY_ID.get(id) : undefined;
}

/** The question as the interviewer asks it: in the interview's language and the interviewer's register. */
export function bankQuestionText(question: BankQuestion, lang: Lang, register: Register): string {
  const tech = findTech(question.tech);
  return fill(inRegister(question.text[lang], register), { tech: tech?.label[lang] ?? question.tech });
}

/** The model answer (general knowledge, or how to build the answer for "experience" questions). */
export function bankAnswerText(question: BankQuestion, lang: Lang): string {
  const tech = findTech(question.tech);
  return fill(question.answer[lang], { tech: tech?.label[lang] ?? question.tech });
}

// ---------- Finding technologies in a text ----------

/** Lowercase, no accents, straight quotes, single spaces: the form the aliases are written in. */
export function normalizeTechText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const WORD_CHAR = /[a-z0-9+#]/;

/** Position of `term` in `text` as a whole word ("c++" in "c/c++", not "java" in "javascript"), or -1. */
function termIndex(text: string, term: string): number {
  for (let at = text.indexOf(term); at >= 0; at = text.indexOf(term, at + 1)) {
    if (!WORD_CHAR.test(text[at - 1] ?? " ") && !WORD_CHAR.test(text[at + term.length] ?? " ")) return at;
  }
  return -1;
}

/** The technologies named in a text, in the order they first appear. */
export function techsIn(text: string): Tech[] {
  const normalized = normalizeTechText(text);
  if (!normalized) return [];
  const found: { tech: Tech; at: number }[] = [];
  for (const tech of TECHS) {
    let at = tech.exact?.includes(normalized) ? 0 : -1;
    for (const alias of tech.aliases) {
      const i = termIndex(normalized, alias);
      if (i >= 0 && (at < 0 || i < at)) at = i;
    }
    if (at >= 0) found.push({ tech, at });
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.tech);
}

// ---------- Choosing the questions of an interview ----------

/** Why a technology is asked about: the offer's stack (with its verified quote), or the candidate's own facts. */
export type PickOrigin = { kind: "stack"; value: string; quote: string } | { kind: "profile"; fact: string };

export interface TechPick {
  question: BankQuestion;
  tech: Tech;
  origin: PickOrigin;
}

export interface PickInput {
  stack: readonly { value: string; quote: string }[];
  /** The text of the candidate's VALIDATED facts. */
  facts: readonly string[];
  count: number;
  /** Bank ids already asked to this candidate: asked again only when nothing new is left. */
  askedBefore?: ReadonlySet<string>;
  random?: () => number;
}

/** Varied kinds first; "experience" only makes sense for a technology the candidate has used. */
const KIND_ORDER: readonly TechKind[] = ["concept", "troubleshoot", "practice", "compare", "best_practice", "design", "experience"];

/**
 * The technical questions of an interview, drawn from the bank: the offer's technologies in turn (the
 * order of its stack), plus one about a technology of the candidate's profile that the offer does not
 * mention when there is room; only profile technologies when the offer names none the bank knows.
 */
export function pickTechnicalQuestions({ stack, facts, count, askedBefore = new Set(), random = Math.random }: PickInput): TechPick[] {
  if (count <= 0) return [];

  const offerTechs = new Map<string, { tech: Tech; origin: PickOrigin }>();
  for (const item of stack) {
    for (const tech of techsIn(item.value)) {
      if (!offerTechs.has(tech.id)) offerTechs.set(tech.id, { tech, origin: { kind: "stack", value: item.value, quote: item.quote } });
    }
  }

  const profile = new Map<string, { tech: Tech; fact: string; mentions: number }>();
  for (const fact of facts) {
    for (const tech of techsIn(fact)) {
      const seen = profile.get(tech.id);
      if (seen) seen.mentions++;
      else profile.set(tech.id, { tech, fact, mentions: 1 });
    }
  }
  const profileOnly = [...profile.values()]
    .filter((p) => !offerTechs.has(p.tech.id))
    .sort((a, b) => b.mentions - a.mentions || TECHS.indexOf(a.tech) - TECHS.indexOf(b.tech))
    .map((p) => ({ tech: p.tech, origin: { kind: "profile", fact: p.fact } as PickOrigin }));

  const offerList = [...offerTechs.values()];
  const fromProfile = offerList.length === 0 ? count : count >= 4 && profileOnly.length > 0 ? 1 : 0;
  const slots = [
    ...roundRobin(offerList, count - fromProfile),
    ...roundRobin(profileOnly, fromProfile),
  ];

  const picked = new Set<string>();
  const kindsUsed = new Map<TechKind, number>();
  const picks: TechPick[] = [];
  for (const { tech, origin } of slots) {
    const known = profile.has(tech.id); // the candidate has used it: their own experience can be asked
    const question = chooseQuestion(tech, { known, preferExperience: origin.kind === "profile", picked, kindsUsed, askedBefore, random });
    if (!question) continue;
    picked.add(question.id);
    kindsUsed.set(question.kind, (kindsUsed.get(question.kind) ?? 0) + 1);
    picks.push({ question, tech, origin });
  }
  return picks;
}

function roundRobin<T>(items: readonly T[], count: number): T[] {
  return items.length ? Array.from({ length: Math.max(0, count) }, (_, i) => items[i % items.length]) : [];
}

function chooseQuestion(
  tech: Tech,
  options: {
    known: boolean;
    preferExperience: boolean;
    picked: ReadonlySet<string>;
    kindsUsed: ReadonlyMap<TechKind, number>;
    askedBefore: ReadonlySet<string>;
    random: () => number;
  },
): BankQuestion | undefined {
  const pool = BANK.filter((q) => q.tech === tech.id && !options.picked.has(q.id) && (options.known || q.kind !== "experience"));
  const fresh = pool.filter((q) => !options.askedBefore.has(q.id));
  const candidates = fresh.length ? fresh : pool;
  if (!candidates.length) return undefined;
  const rank = (q: BankQuestion) =>
    options.preferExperience && q.kind === "experience" ? -1 : (options.kindsUsed.get(q.kind) ?? 0) * KIND_ORDER.length + KIND_ORDER.indexOf(q.kind);
  const best = Math.min(...candidates.map(rank));
  const ties = candidates.filter((q) => rank(q) === best);
  return ties[Math.floor(options.random() * ties.length) % ties.length];
}
