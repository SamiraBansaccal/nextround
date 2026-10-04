import { bankQuestionText, findTech, pickTechnicalQuestions, type TechPick, techsIn, TECHS } from "@/lib/interview/bank";
import { fill, INTERVIEW_COPY } from "@/lib/interview/copy";
import { HR_PLANS, hrAskedId, hrQuestionText, pickHrQuestions } from "@/lib/interview/hr-bank";
import { questionType, type QuestionType } from "@/lib/interview/question-types";
import { inRegister, type Register } from "@/lib/interview/register";
import { type Focus, PLANS } from "@/lib/interview/session";
import type { Lang } from "@/lib/interviewers/types";
import { shorten } from "@/lib/shared/text";
import type { QuestionGroup, SourcedSentence } from "@/lib/types";

// The questions of an interview, built by code from texts written in advance (no AI, so instant, free
// and always in correct English and French):
// - HR questions from the HR bank (lib/interview/hr-bank), a plan of slots per session;
// - technical questions from the technical bank (lib/interview/bank), on the offer's verified stack or
//   the practice topic, and the candidate's validated facts;
// - skill-gap questions from the offer's requirements the candidate's facts do not cover yet, with
//   phrasings written in both languages.
// Every bank question comes with its model answer (shown by the call). The AI is only used afterwards,
// to give feedback on the candidate's own answers (lib/interview/feedback.ts).

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
  /** A bank question ("<tech>.<slug>" or "hr.<slug>#<phrasing>"): finds its model answer again. */
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
  /** The interviewer's register: "vous" or "tu" in French (lib/interview/register.ts). */
  register?: Register;
  /** Bank questions already asked to this candidate: asked again only when nothing new is left. */
  askedBefore?: ReadonlySet<string>;
  /** A practice interview on a technology: technical questions only on `offer.stack`, never on the profile's others. */
  stackOnly?: boolean;
  random?: () => number;
}

/** How many technical questions a session asks: its plan's, plus the gap questions that have no verified gap. */
export function technicalSlots(focus: Focus, gapCount: number): number {
  const plan = PLANS[focus];
  return plan.technical + Math.max(0, plan.gap - gapCount);
}

/** Skill-gap phrasings: with a known technology (fully translated), or quoting the offer's requirement. */
const GAP_TECH: Record<Lang, readonly string[]> = {
  en: [
    "The offer asks for {tech}, which is not in your profile yet. How would you get up to speed quickly?",
    "You haven't worked with {tech} yet, and this role needs it. What do you already know about it, and how would you learn the rest?",
  ],
  fr: [
    "L'offre demande {tech}, qui ne figure pas encore dans {votre|ton} profil. Comment {vous mettriez-vous|te mettrais-tu} à niveau rapidement ?",
    "{Vous n'avez|Tu n'as} pas encore travaillé avec {tech}, et ce poste en a besoin. Qu'en {savez-vous|sais-tu} déjà, et comment {apprendriez-vous|apprendrais-tu} le reste ?",
  ],
};
const GAP_QUOTE: Record<Lang, readonly string[]> = {
  en: [
    "The offer mentions: “{quote}”. Your profile doesn't show it yet. How would you handle this part of the job?",
    "One requirement is: “{quote}”. What is your experience with it, and how would you close the gap?",
  ],
  fr: [
    "L'offre mentionne : « {quote} ». {Votre|Ton} profil ne le montre pas encore. Comment {aborderiez-vous|aborderais-tu} cette partie du poste ?",
    "Une des exigences est : « {quote} ». Quelle est {votre|ta} expérience là-dessus, et comment {combleriez-vous|comblerais-tu} cet écart ?",
  ],
};

/** The questions of an interview, in order: HR, technical, then skill gaps. Pure once `random` is given. */
export function buildQuestions(offer: OfferForInterview, factTexts: readonly string[], options: QuestionOptions): GeneratedQuestion[] {
  const lang = options.language;
  const register = options.register ?? "formal";
  const random = options.random ?? Math.random;
  const copy = INTERVIEW_COPY[lang];
  const plan = PLANS[options.focus];
  const gaps = offer.requirements.filter((r) => !r.covered).slice(0, plan.gap);

  const hr: GeneratedQuestion[] =
    plan.hr > 0
      ? pickHrQuestions(options.focus === "general" ? HR_PLANS.general : HR_PLANS.both, options.askedBefore, random).map(({ question, variant }) => {
          const id = hrAskedId(question, variant);
          return {
            group: "hr" as const,
            type: questionType("hr", question.type),
            text: hrQuestionText(id, lang, register) ?? "",
            source: question.type === "inappropriate" ? copy.sourceInappropriate : copy.sourceHr,
            suggestedAnswer: [],
            bankId: id,
          };
        })
      : [];

  const slots = technicalSlots(options.focus, gaps.length);
  let picks: TechPick[] = pickTechnicalQuestions({
    stack: offer.stack,
    facts: options.stackOnly ? [] : factTexts,
    count: slots,
    askedBefore: options.askedBefore,
    random,
  });
  // Nothing the bank knows in the offer or the profile: the foundations every junior is asked about.
  if (picks.length < slots && !options.stackOnly) {
    const foundations = TECHS.filter((t) => t.family === "foundations").map((t) => ({ value: t.label.en, quote: t.label.en }));
    const taken = new Set(picks.map((p) => p.question.id));
    const extra = pickTechnicalQuestions({ stack: foundations, facts: [], count: slots - picks.length, askedBefore: new Set([...(options.askedBefore ?? []), ...taken]), random });
    picks = [...picks, ...extra.filter((p) => !taken.has(p.question.id))];
  }
  const practice = !offer.title && !offer.company;
  const technical: GeneratedQuestion[] = picks.map((pick) => ({
    group: "technical" as const,
    type: questionType("technical", pick.question.kind),
    text: bankQuestionText(pick.question, lang, register),
    source:
      pick.origin.kind === "profile"
        ? fill(copy.sourceProfile, { fact: shorten(pick.origin.fact, 120) })
        : practice
          ? fill(copy.sourcePractice, { tech: pick.tech.label[lang] })
          : fill(copy.sourceStack, { item: pick.origin.value, quote: pick.origin.quote }),
    suggestedAnswer: [],
    bankId: pick.question.id,
    techLabel: pick.tech.label[lang],
  }));

  const gapQuestions: GeneratedQuestion[] = gaps.map((req, i) => {
    const tech = techsIn(req.text)[0] ?? null;
    const templates = tech ? GAP_TECH[lang] : GAP_QUOTE[lang];
    const template = templates[(i + Math.floor(random() * templates.length)) % templates.length];
    return {
      group: "gap" as const,
      type: "skill_gap" as const,
      text: fill(inRegister(template, register), { tech: tech?.label[lang] ?? "", quote: shorten(req.quote, 160) }),
      source: fill(copy.sourceGap, { quote: req.quote }),
      suggestedAnswer: [],
      techLabel: tech ? (findTech(tech.id)?.label[lang] ?? null) : null,
    };
  });

  return [...hr, ...technical, ...gapQuestions];
}
