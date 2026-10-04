import type { Lang } from "@/lib/interviewers/types";
import type { Feedback, QuestionGroup } from "@/lib/types";

// End-of-interview summary, computed by code from the (already verified) feedback of each answer.
// No AI call: every line comes from what the feedback said, so it cannot invent anything new.

type Key = "star" | "relevance" | "evidence" | "honesty";

const STRENGTH: Record<Lang, Record<Key, (good: number, total: number) => string>> = {
  en: {
    star: (g, t) => `Your answers follow a clear Situation → Action → Result structure (${g} of ${t}).`,
    relevance: (g, t) => `You answer the question asked and connect it to the offer (${g} of ${t}).`,
    evidence: (g, t) => `What you claim is backed by your validated profile (${g} of ${t}).`,
    honesty: (g, t) => `You are honest about your gaps, with a plan to close them (${g} of ${t}).`,
  },
  fr: {
    star: (g, t) => `Tes réponses suivent une structure claire Situation → Action → Résultat (${g} sur ${t}).`,
    relevance: (g, t) => `Tu réponds à la question posée et tu la relies à l'offre (${g} sur ${t}).`,
    evidence: (g, t) => `Ce que tu affirmes est prouvé par ton profil validé (${g} sur ${t}).`,
    honesty: (g, t) => `Tu es honnête sur tes lacunes, avec un plan pour les combler (${g} sur ${t}).`,
  },
};

const LABEL: Record<Lang, Record<Key, string>> = {
  en: {
    star: "Structure your answers (STAR)",
    relevance: "Stay on the question and on this offer",
    evidence: "Back up what you claim",
    honesty: "Be upfront about the gaps",
  },
  fr: {
    star: "Structurer tes réponses (STAR)",
    relevance: "Rester sur la question et sur cette offre",
    evidence: "Prouver ce que tu affirmes",
    honesty: "Être franc sur les lacunes",
  },
};

export interface SummaryQuestion {
  id: string;
  group: QuestionGroup;
  text: string;
}

export function summarizeInterview<Q extends SummaryQuestion>(
  questions: Q[],
  answers: { questionId: string; feedback: Feedback | null; createdAt: Date }[],
  lang: Lang = "en",
) {
  // Latest answer per question (answers may contain retries).
  const latest = new Map<string, Feedback | null>();
  for (const a of [...answers].sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime())) {
    if (!latest.has(a.questionId)) latest.set(a.questionId, a.feedback);
  }
  const feedbacks = [...latest.values()].filter((f): f is Feedback => f !== null);

  const tally = (Object.keys(LABEL.en) as Key[]).map((key) => {
    const rated = feedbacks.map((f) => f[key]).filter((c): c is NonNullable<typeof c> => !!c);
    const good = rated.filter((c) => c.rating === "good").length;
    const toImprove = rated.filter((c) => c.rating === "to_improve");
    return { key, rated: rated.length, good, improve: toImprove.length, comment: toImprove[0]?.comment ?? "" };
  });

  return {
    answered: latest.size,
    strengths: tally.filter((t) => t.good > 0 && t.good >= t.improve).map((t) => STRENGTH[lang][t.key](t.good, t.rated)),
    toWork: tally
      .filter((t) => t.improve > 0)
      .sort((a, b) => b.improve - a.improve)
      .slice(0, 3)
      .map((t) => ({ label: LABEL[lang][t.key], comment: t.comment })),
    unsupportedClaims: [...new Set(feedbacks.flatMap((f) => f.evidence.claims.filter((c) => !c.factId).map((c) => c.quote)))],
    toRetry: questions
      .map((question, index) => ({ question, index, fb: latest.get(question.id) }))
      .filter(({ fb }) => fb === undefined || fb === null || (["star", "relevance", "evidence", "honesty"] as Key[]).some((k) => fb[k]?.rating === "to_improve"))
      .map(({ question, index, fb }) => ({ question, index, answered: fb !== undefined })),
  };
}
