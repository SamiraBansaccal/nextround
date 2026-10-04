import { describe, expect, it } from "vitest";
import { aiErrorMessage, AiError } from "@/lib/ai/errors";
import { fill, INTERVIEW_COPY, LANGUAGES, toLang } from "@/lib/interview/copy";
import { summarizeInterview } from "@/lib/interview/summary";
import type { Feedback } from "@/lib/types";

// The interview runs entirely in one language: every text must exist in each language, with the same
// placeholders, so that nothing falls back to another language halfway through a call.

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("interview copy", () => {
  it("has the same keys and placeholders in every language, and no empty text", () => {
    const keys = Object.keys(INTERVIEW_COPY.en).sort();
    for (const { id } of LANGUAGES) {
      const copy = INTERVIEW_COPY[id];
      expect(Object.keys(copy).sort(), id).toEqual(keys);
      for (const key of keys) {
        const text = copy[key as keyof typeof copy];
        expect(text.trim().length, `${id}.${key}`).toBeGreaterThan(0);
        expect(placeholders(text), `${id}.${key}`).toEqual(placeholders(INTERVIEW_COPY.en[key as keyof typeof INTERVIEW_COPY.en]));
      }
    }
  });

  it("fills placeholders and maps language codes", () => {
    expect(fill(INTERVIEW_COPY.fr.questionOf, { n: 3, total: 10 })).toBe("Question 3 / 10");
    expect(fill(INTERVIEW_COPY.fr.callTitle, { name: "M. Burns" })).toBe("Entretien avec M. Burns");
    expect(toLang("fr-BE")).toBe("fr");
    expect(toLang("de")).toBe("en");
    expect(toLang(null)).toBe("en");
  });

  it("gives AI errors in the interview's language", () => {
    expect(aiErrorMessage(new AiError("invalid_output"), "fr")).toBe("Ce modèle n'a pas renvoyé de réponse valide — essaie un autre modèle.");
    expect(aiErrorMessage(new AiError("invalid_output"))).toBe("This model could not return valid output — try another model.");
  });

  it("writes the summary in the interview's language", () => {
    const feedback: Feedback = {
      star: { rating: "good", comment: "Clair." },
      relevance: { rating: "to_improve", comment: "Relie ta réponse à l'offre." },
      evidence: { rating: "good", comment: "Prouvé.", claims: [] },
      improvedAnswer: [],
    };
    const summary = summarizeInterview([{ id: "q1", group: "hr" as const, text: "Q" }], [{ questionId: "q1", feedback, createdAt: new Date() }], "fr");
    expect(summary.strengths[0]).toContain("Tes réponses suivent une structure claire");
    expect(summary.toWork[0].label).toBe("Rester sur la question et sur cette offre");
  });
});
