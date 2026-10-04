import { describe, expect, it } from "vitest";
import { findHrQuestion, HR_BANK, HR_PLANS, hrAskedId, hrQuestionText, HR_TYPES, pickHrQuestions } from "@/lib/interview/hr-bank";
import { HR_ENTRIES } from "@/lib/interview/hr-bank/data";
import { MORE_HR_ENTRIES } from "@/lib/interview/hr-bank/data-more";
import { inRegister } from "@/lib/interview/register";

const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

describe("HR question bank (data)", () => {
  it("has unique ids, a known type, the same number of phrasings in English and French", () => {
    const ids = HR_BANK.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [slug, type, en, fr] of [...HR_ENTRIES, ...MORE_HR_ENTRIES]) {
      expect(HR_TYPES, slug).toContain(type);
      expect(en.length, slug).toBeGreaterThan(0);
      expect(fr.length, slug).toBe(en.length);
    }
  });

  it("is well stocked: every type has questions, at least 90 questions in all", () => {
    expect(HR_BANK.length).toBeGreaterThanOrEqual(90);
    for (const type of HR_TYPES) expect(HR_BANK.filter((q) => q.type === type).length, type).toBeGreaterThan(0);
  });

  it("says vous or tu consistently in French, with no placeholder left", () => {
    for (const q of HR_BANK) {
      for (const v of q.variants) {
        const formal = inRegister(v.fr, "formal");
        const casual = inRegister(v.fr, "casual");
        expect(formal, q.id).not.toMatch(/(?<!\p{L})(tu|ton|ta|tes|toi)(?!\p{L})|(?<!\p{L})t'/iu);
        expect(casual, q.id).not.toMatch(/(?<!\p{L})(vous|votre|vos)(?!\p{L})/iu);
        for (const text of [formal, casual, v.en]) expect(text, q.id).not.toMatch(/[{}|]/);
      }
      expect(q.answer.en.length, q.id).toBeGreaterThan(60);
      expect(q.answer.fr.length, q.id).toBeGreaterThan(60);
    }
  });
});

describe("picking HR questions", () => {
  it("fills every slot of a plan with a different question of the right type", () => {
    const picks = pickHrQuestions(HR_PLANS.general, new Set(), seeded(3));
    expect(picks).toHaveLength(HR_PLANS.general.length);
    expect(new Set(picks.map((p) => p.question.id)).size).toBe(picks.length);
    expect(picks[0].question.type).toBe("introduction");
    expect(picks.at(-1)!.question.type).toBe("closing");
  });

  it("prefers questions the candidate has not had yet, and keeps the phrasing in the stored id", () => {
    const first = pickHrQuestions(["introduction"], new Set(), seeded(5))[0];
    const asked = new Set([hrAskedId(first.question, first.variant)]);
    const next = pickHrQuestions(["introduction"], asked, seeded(5))[0];
    expect(next.question.id).not.toBe(first.question.id);
    const id = hrAskedId(first.question, first.variant);
    expect(findHrQuestion(id)?.id).toBe(first.question.id);
    expect(hrQuestionText(id, "fr", "casual")).toBe(inRegister(first.question.variants[first.variant].fr, "casual"));
  });
});
