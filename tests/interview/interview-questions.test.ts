import { describe, expect, it } from "vitest";
import { findBankQuestion } from "@/lib/interview/bank";
import { buildQuestions, type OfferForInterview } from "@/lib/interview/generate";
import { findHrQuestion } from "@/lib/interview/hr-bank";
import { practiceOffer } from "@/lib/interview/practice";
import { questionLabel, questionType } from "@/lib/interview/question-types";
import { PLANS } from "@/lib/interview/session";
import { parseTopic } from "@/lib/interview/tracks";

// Interview questions are built by code from the question banks: no AI, always in the session's language.

const OFFER: OfferForInterview = {
  title: "Junior developer",
  company: "Example",
  language: "en",
  stack: [{ value: "React", quote: "We use React" }],
  requirements: [
    { text: "React", quote: "We use React", covered: true },
    { text: "Docker", quote: "Docker is a plus", covered: false },
    { text: "Team spirit", quote: "You enjoy working in a team", covered: false },
  ],
};

const seeded = (seed = 7) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

describe("buildQuestions", () => {
  it("follows the session's plan: HR, then technical from the stack, then the offer's gaps", () => {
    const qs = buildQuestions(OFFER, [], { language: "en", focus: "both", random: seeded() });
    const groups = qs.map((q) => q.group);
    expect(groups.filter((g) => g === "hr")).toHaveLength(PLANS.both.hr);
    expect(groups.filter((g) => g === "gap")).toHaveLength(2);
    expect(groups.indexOf("technical")).toBeGreaterThan(groups.lastIndexOf("hr"));
    for (const q of qs.filter((x) => x.group === "hr")) expect(findHrQuestion(q.bankId)).toBeDefined();
    for (const q of qs.filter((x) => x.group === "technical")) expect(findBankQuestion(q.bankId)?.tech).toBe("react");
  });

  it("writes everything in the interview's language and register, with no placeholder left", () => {
    const fr = buildQuestions(OFFER, [], { language: "fr", focus: "both", register: "casual", random: seeded(3) });
    for (const q of fr) {
      expect(q.text).not.toMatch(/[{}]/);
      expect(q.text).not.toMatch(/(?<!\p{L})(vous|votre|vos)(?!\p{L})/iu);
    }
    const gap = fr.find((q) => q.group === "gap" && q.techLabel === "Docker");
    expect(gap?.text).toContain("Docker");
    expect(fr.find((q) => q.group === "gap" && !q.techLabel)?.text).toContain("You enjoy working in a team"); // a quote stays as written
  });

  it("asks only HR questions for a general interview, only technical ones for a technical one", () => {
    expect(new Set(buildQuestions(OFFER, [], { language: "en", focus: "general", random: seeded() }).map((q) => q.group))).toEqual(new Set(["hr"]));
    expect(buildQuestions(OFFER, [], { language: "en", focus: "technical", random: seeded() }).some((q) => q.group === "hr")).toBe(false);
  });

  it("keeps a practice interview on its topic, whatever the profile", () => {
    const topic = parseTopic("tech:docker")!;
    const qs = buildQuestions(practiceOffer(topic), ["Built a React app (React)"], { language: "en", focus: "technical", stackOnly: true, random: seeded() });
    expect(qs.length).toBeGreaterThan(3);
    for (const q of qs) expect(findBankQuestion(q.bankId)?.tech).toBe("docker");
    expect(qs[0].source).toBe("Practice on Docker");
  });

  it("falls back on the foundations when nothing in the offer or the profile is known to the bank", () => {
    const qs = buildQuestions({ ...OFFER, stack: [], requirements: [] }, [], { language: "en", focus: "technical", random: seeded() });
    expect(qs.length).toBeGreaterThan(0);
    expect(new Set(qs.map((q) => q.bankId)).size).toBe(qs.length);
  });
});

describe("question types", () => {
  it("keeps a type only when it fits the group", () => {
    expect(questionType("hr", "motivation")).toBe("motivation");
    expect(questionType("hr", "inappropriate")).toBe("inappropriate");
    expect(questionType("technical", "motivation")).toBeNull();
    expect(questionType("gap", "Skill gap")).toBe("skill_gap");
  });

  it("labels a question by its type, else by its group", () => {
    expect(questionLabel("hr", "tricky", "fr")).toBe("Question piège");
    expect(questionLabel("hr", null)).toBe("General");
  });
});
