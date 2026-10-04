import { describe, expect, it } from "vitest";
import { summarizeInterview } from "@/lib/interview/summary";
import type { Feedback } from "@/lib/types";

const fb = (over: Partial<Feedback>): Feedback => ({
  star: { rating: "good", comment: "ok" },
  relevance: { rating: "good", comment: "ok" },
  evidence: { rating: "good", comment: "ok", claims: [] },
  improvedAnswer: [],
  ...over,
});

const questions = [
  { id: "q1", group: "hr" as const, text: "Introduce yourself" },
  { id: "q2", group: "technical" as const, text: "React state?" },
  { id: "q3", group: "gap" as const, text: "Docker?" },
];

describe("interview summary (computed by code, no AI)", () => {
  it("uses the latest answer of each question, lists strengths, things to work on and questions to retry", () => {
    const s = summarizeInterview(questions, [
      { questionId: "q1", createdAt: new Date("2026-10-04T10:00:00Z"), feedback: fb({ star: { rating: "to_improve", comment: "Add a result." } }) },
      { questionId: "q1", createdAt: new Date("2026-10-04T10:05:00Z"), feedback: fb({}) }, // retry, now good
      {
        questionId: "q2",
        createdAt: new Date("2026-10-04T10:10:00Z"),
        feedback: fb({ evidence: { rating: "to_improve", comment: "One claim is not in your profile.", claims: [{ quote: "2 years of Redux" }, { quote: "weather-app", factId: "f1" }] } }),
      },
    ]);
    expect(s.answered).toBe(2);
    expect(s.strengths).toContain("Your answers follow a clear Situation → Action → Result structure (2 of 2).");
    expect(s.toWork).toEqual([{ label: "Back up what you claim", comment: "One claim is not in your profile." }]);
    expect(s.unsupportedClaims).toEqual(["2 years of Redux"]);
    expect(s.toRetry.map((r) => [r.question.id, r.answered])).toEqual([
      ["q2", true],
      ["q3", false],
    ]);
  });
});
