import { describe, expect, it } from "vitest";
import { bankQuestionText, pickTechnicalQuestions } from "@/lib/interview/bank";
import { questionLabel, questionType } from "@/lib/interview/question-types";
import { dropOtherLanguage, type OfferForInterview, questionsSchema, verifyQuestions } from "@/lib/interview/generate";

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
    expect(docker.source).toBe("From a gap in your profile: “Docker is a plus”");
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
    expect(questionLabel("hr", null)).toBe("General");
    expect(questionLabel("gap", "nonsense")).toBe("Skill gap");
  });
});

describe("verifyQuestions follows the session", () => {
  const raw = questionsSchema.parse({
    questions: [
      { group: "hr", type: "introduction", text: "Introduce yourself.", ref: null, suggested_answer: [] },
      { group: "hr", type: "motivation", text: "Why us?", ref: null, suggested_answer: [] },
      { group: "technical", type: "technical", text: "How does React render?", ref: "S1", suggested_answer: [] },
      { group: "gap", type: "skill_gap", text: "Have you used Docker?", ref: "R1", suggested_answer: [] },
    ],
  });

  it("asks only general questions for a general interview, only technical ones for a technical one", () => {
    const general = verifyQuestions(raw, OFFER, new Map(), new Set(), { language: "en", focus: "general" });
    expect(general.map((q) => q.group)).toEqual(["hr", "hr"]);
    const technical = verifyQuestions(raw, OFFER, new Map(), new Set(), { language: "en", focus: "technical" });
    expect(technical.map((q) => q.group)).toEqual(["technical", "gap"]);
  });

  it("writes the sources in the interview's language, quotes untouched", () => {
    const fr = verifyQuestions(raw, OFFER, new Map(), new Set(), { language: "fr", focus: "both" });
    expect(fr.find((q) => q.group === "hr")!.source).toBe("Question RH classique");
    expect(fr.find((q) => q.group === "technical")!.source).toBe("Tirée de la stack de l'offre : React — « We use React »");
    expect(fr.find((q) => q.group === "gap")!.source).toBe("Tirée d'une lacune de ton profil : « Docker is a plus »");
    expect(questionLabel("hr", "strengths", "fr")).toBe("Qualités");
    expect(questionLabel("technical", null, "fr")).toBe("Technique");
  });
});

describe("verifyQuestions with questions from the bank", () => {
  const picks = pickTechnicalQuestions({ stack: OFFER.stack, facts: ["Built a React app (React)"], count: 3, random: () => 0 });

  it("asks the bank's own text, keeps the fact-backed answer, and adds the bank questions the AI skipped", () => {
    expect(picks.map((p) => p.tech.id)).toEqual(["react", "react", "react"]);
    const raw = questionsSchema.parse({
      questions: [
        { group: "hr", type: "introduction", text: "Introduce yourself.", ref: null, suggested_answer: [] },
        { group: "technical", text: "A rewritten question the AI should not have changed", ref: "B2", suggested_answer: [{ text: "I built a React app.", fact_ids: ["F1"] }] },
        { group: "technical", text: "The same bank question twice", ref: "B2", suggested_answer: [] },
        { group: "gap", type: "skill_gap", text: "Have you used Docker?", ref: "R1", suggested_answer: [] },
      ],
    });
    const questions = verifyQuestions(raw, OFFER, new Map([["F1", "fact-1"]]), new Set(["fact-1"]), { language: "fr", focus: "both", register: "casual" }, picks);

    expect(questions.map((q) => q.group)).toEqual(["hr", "technical", "technical", "technical", "gap"]);
    const bank = questions.filter((q) => q.bankId);
    expect(bank.map((q) => q.bankId)).toEqual(picks.map((p) => p.question.id)); // in the order chosen by code
    expect(bank[1].text).toBe(bankQuestionText(picks[1].question, "fr", "casual"));
    expect(bank[1].suggestedAnswer).toEqual([{ text: "I built a React app.", factIds: ["fact-1"] }]);
    expect(bank[0].suggestedAnswer).toEqual([]); // skipped by the AI, asked anyway
    expect(bank[0].source).toBe("Tirée de la stack de l'offre : React — « We use React »");
    expect(bank[0].techLabel).toBe("React");
  });

  it("cites the profile fact behind a question on the candidate's own technology", () => {
    const fromProfile = pickTechnicalQuestions({ stack: [], facts: ["Docker labs at school (Docker)"], count: 1, random: () => 0 });
    const [question] = verifyQuestions({ questions: [] }, OFFER, new Map(), new Set(), { language: "en", focus: "technical" }, fromProfile);
    expect(question.source).toBe("From your profile: “Docker labs at school (Docker)”");
    expect(question.type).toBe("experience");
  });
});

describe("dropOtherLanguage", () => {
  it("keeps only what is written in the interview's language, and every bank question", () => {
    const raw = questionsSchema.parse({
      questions: [
        { group: "hr", type: "motivation", text: "Why do you want to join our company?", ref: null, suggested_answer: [{ text: "Je veux apprendre dans une équipe solide.", fact_ids: ["F1"] }, { text: "I like building things with a team.", fact_ids: ["F1"] }] },
        { group: "hr", type: "strengths", text: "Quelles sont vos principales qualités ?", ref: null, suggested_answer: [] },
        { group: "technical", text: "Quelle est la différence entre un processus et un thread ?", ref: "B1", suggested_answer: [] },
        { group: "hr", type: "introduction", text: "Tell me about yourself.", ref: null, suggested_answer: [] },
      ],
    });
    const kept = dropOtherLanguage(raw, "en").questions;
    expect(kept.map((q) => q.text)).toEqual(["Why do you want to join our company?", "Quelle est la différence entre un processus et un thread ?", "Tell me about yourself."]);
    expect(kept[0].suggested_answer.map((a) => a.text)).toEqual(["I like building things with a team."]);
  });
});
