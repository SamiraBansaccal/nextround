import { describe, expect, it } from "vitest";
import { questionLabel, questionType } from "@/lib/interview/question-types";
import { type OfferForInterview, questionsSchema, verifyQuestions } from "@/lib/interview/generate";

// Interview questions: sources rebuilt from verified offer data, suggested answers only from validated
// facts, and the question type kept only when it fits the question's group.

const OFFER: OfferForInterview = {
  title: "Junior developer",
  company: "Example",
  language: "en",
  stack: [{ value: "React", quote: "We use React" }],
  requirements: [
    { text: "React", quote: "We use React", covered: true },
    { text: "Docker", quote: "Docker is a plus", covered: false },
  ],
};

describe("verifyQuestions", () => {
  it("rebuilds sources, keeps valid types and fact-backed sentences only", () => {
    const raw = questionsSchema.parse({
      questions: [
        { group: "hr", type: "motivation", text: "Why do you want to join us?", ref: null, suggested_answer: [{ text: "I built a React app.", fact_ids: ["F1"] }, { text: "I love Kubernetes.", fact_ids: ["F9"] }] },
        { group: "technical", type: "skill_gap", text: "How does React render?", ref: "S1", suggested_answer: [] },
        { group: "gap", type: "Skill gap", text: "Have you used Docker?", ref: "R1", suggested_answer: [] },
        { group: "gap", type: "skill_gap", text: "Tell me about Kubernetes.", ref: "R7", suggested_answer: [] },
        { group: "hr", text: "Introduce yourself.", ref: null, suggested_answer: [] },
        { group: "hr", type: "strengths", text: "What are your strengths?", ref: null, suggested_answer: [] },
      ],
    });
    const questions = verifyQuestions(raw, OFFER, new Map([["F1", "fact-1"]]), new Set(["fact-1"]));

    const motivation = questions.find((q) => q.text.startsWith("Why"))!;
    expect(motivation.type).toBe("motivation");
    expect(motivation.suggestedAnswer).toEqual([{ text: "I built a React app.", factIds: ["fact-1"] }]); // F9 is not a validated fact

    const technical = questions.find((q) => q.text.startsWith("How does"))!;
    expect(technical.source).toBe("From the offer's stack: React — “We use React”");
    expect(technical.type).toBeNull(); // "skill_gap" does not fit a technical question

    const docker = questions.find((q) => q.text.includes("Docker"))!;
    expect(docker.source).toBe("From a gap in your profile: Docker — “Docker is a plus”");
    expect(docker.type).toBe("skill_gap"); // "Skill gap" normalised

    const unknownGap = questions.find((q) => q.text.includes("Kubernetes"))!;
    expect(unknownGap.group).toBe("technical"); // no verifiable gap behind R7
    expect(questions.find((q) => q.text === "Introduce yourself.")!.type).toBeNull();
    expect(questions.map((q) => q.group)).toEqual(["hr", "hr", "hr", "technical", "technical", "gap"]);
  });
});

describe("question types", () => {
  it("keeps a type only when it fits the group", () => {
    expect(questionType("hr", "introduction")).toBe("introduction");
    expect(questionType("hr", "technical")).toBeNull();
    expect(questionType("gap", "Skill Gap")).toBe("skill_gap");
    expect(questionType("technical", null)).toBeNull();
  });

  it("labels a question by its type, else by its group", () => {
    expect(questionLabel("hr", "motivation")).toBe("Motivation");
    expect(questionLabel("hr", null)).toBe("General HR");
    expect(questionLabel("gap", "nonsense")).toBe("Skill gap");
  });
});
