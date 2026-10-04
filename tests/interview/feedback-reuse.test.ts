import { describe, expect, it } from "vitest";
import { isReusableFeedback } from "@/lib/interview/feedback";
import type { Feedback } from "@/lib/types";

// A feedback saved for the same answer is shown again only while the facts it relies on still hold.

const ok = { rating: "good" as const, comment: "" };
const feedback = (claims: Feedback["evidence"]["claims"], improved: string[][] = [["f1"]]): Feedback => ({
  star: ok,
  relevance: ok,
  evidence: { ...ok, claims },
  improvedAnswer: improved.map((factIds) => ({ text: "…", factIds })),
});

describe("feedback reuse", () => {
  it("reuses a feedback whose facts are all still validated", () => {
    expect(isReusableFeedback(feedback([{ quote: "I led", factId: "f1" }]), new Set(["f1"]))).toBe(true);
  });
  it("computes again when a cited fact was removed", () => {
    expect(isReusableFeedback(feedback([{ quote: "I led", factId: "f1" }]), new Set(["f2"]))).toBe(false);
    expect(isReusableFeedback(feedback([], [["gone"]]), new Set(["f1"]))).toBe(false);
  });
  it("computes again when a claim was flagged 'Not in your profile' (a fact may cover it now)", () => {
    expect(isReusableFeedback(feedback([{ quote: "I know Rust" }]), new Set(["f1"]))).toBe(false);
    expect(isReusableFeedback(feedback([], [["f1"], []]), new Set(["f1"]))).toBe(false); // an "unsupported" sentence
  });
});
