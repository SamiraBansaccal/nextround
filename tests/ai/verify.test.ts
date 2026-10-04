import { describe, expect, it } from "vitest";
import { findQuote, isContactInText, keepValidFactIds } from "@/lib/ai/verify";
import { verifyExtraction } from "@/lib/offers/extract";
import { verifyFeedback } from "@/lib/interview/feedback";
import { highlightSegments } from "@/lib/offers/segments";

// The core promise: whatever the model returns, only what the source text proves is kept.

const OFFER = `Développeur Full Stack Junior — Brussels Tech
- Une première expérience avec React et TypeScript est indispensable.
- Une première expérience avec Docker est un atout.
Pour postuler : jobs@brusselstech.example ou +32 2 123 45 67.`;

describe("findQuote", () => {
  it("finds a verbatim quote, tolerating line breaks, case and typographic quotes", () => {
    expect(findQuote(OFFER, "une première expérience avec   docker")).not.toBeNull();
    expect(findQuote("l’équipe", "l'équipe")).not.toBeNull();
  });
  it("rejects paraphrases and invented text", () => {
    expect(findQuote(OFFER, "Docker experience required")).toBeNull();
    expect(findQuote(OFFER, "5 years of Kubernetes")).toBeNull();
  });
});

describe("contacts are shown only if they are in the offer", () => {
  it("accepts an email and a phone that are in the quoted text", () => {
    expect(isContactInText(OFFER, "email", "jobs@brusselstech.example", "Pour postuler : jobs@brusselstech.example")).toBe(true);
    expect(isContactInText(OFFER, "phone", "+3221234567", "+32 2 123 45 67")).toBe(true);
  });
  it("rejects an invented email even with a real quote", () => {
    expect(isContactInText(OFFER, "email", "hr@brusselstech.example", "Pour postuler : jobs@brusselstech.example")).toBe(false);
  });
});

describe("verifyExtraction", () => {
  const aliases = new Map([["F1", "fact-1"]]);
  const valid = new Set(["fact-1"]);
  it("drops items whose quote is not in the offer and unknown fact ids", () => {
    const result = verifyExtraction(
      {
        title: "Développeur Full Stack Junior",
        company: "Invented Corp",
        stack: [{ value: "React", quote: "React et TypeScript" }, { value: "Kubernetes", quote: "Kubernetes in production" }],
        requirements: [
          { kind: "must", category: "tech", text: "React + TS", quote: "React et TypeScript est indispensable", fact_ids: ["F1", "F99"] },
          { kind: "must", category: "tech", text: "Invented", quote: "10 years of Java", fact_ids: [] },
        ],
        contacts: [{ kind: "email", value: "ceo@invented.example", quote: "jobs@brusselstech.example" }],
      },
      OFFER,
      aliases,
      valid,
    );
    expect(result.title).toBe("Développeur Full Stack Junior");
    expect(result.company).toBeNull(); // not in the offer
    expect(result.stack.map((s) => s.value)).toEqual(["React"]);
    expect(result.requirements).toHaveLength(1);
    expect(result.requirements[0].factIds).toEqual(["fact-1"]); // F99 does not exist
    expect(result.contacts).toEqual([]);
    expect(result.dropped).toBe(3);
  });
});

describe("verifyFeedback", () => {
  it("keeps only claims quoted from the answer and flags the ones without a valid fact", () => {
    const answer = "In my weather-app I used React. I also led a team of 10 people.";
    const fb = verifyFeedback(
      {
        star: { rating: "good", comment: "ok" },
        relevance: { rating: "good", comment: "ok" },
        evidence: {
          rating: "to_improve",
          comment: "ok",
          claims: [
            { quote: "In my weather-app I used React", fact_id: "F1" },
            { quote: "led a team of 10 people", fact_id: null },
            { quote: "I have a PhD", fact_id: "F1" }, // not in the answer
          ],
        },
        honesty: { rating: "good", comment: "ok", learning_plan: ["x"] },
        improved_answer: [{ text: "I built weather-app in React.", fact_ids: ["F1"] }, { text: "I am an expert.", fact_ids: [] }],
      },
      answer,
      "technical",
      new Map([["F1", "fact-1"]]),
      new Set(["fact-1"]),
    );
    expect(fb.evidence.claims).toEqual([
      { quote: "In my weather-app I used React", factId: "fact-1" },
      { quote: "led a team of 10 people", factId: undefined },
    ]);
    expect(fb.honesty).toBeUndefined(); // only for gap questions
    expect(fb.improvedAnswer[1].factIds).toEqual([]); // shown as "Unsupported"
  });

  it("keepValidFactIds removes unknown ids", () => {
    expect(keepValidFactIds(["a", "b", "a"], new Set(["a"]))).toEqual(["a"]);
  });
});

describe("highlightSegments", () => {
  it("splits the offer text around verified requirement quotes", () => {
    const segments = highlightSegments("Need React. Docker is a plus.", [
      { id: "r1", quote: "React" },
      { id: "r2", quote: "Docker is a plus" },
      { id: "r3", quote: "not in text" },
    ]);
    expect(segments.filter((s) => s.reqId).map((s) => s.reqId)).toEqual(["r1", "r2"]);
    expect(segments.map((s) => s.text).join("")).toBe("Need React. Docker is a plus.");
  });
});
