import { beforeAll, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/tests/helpers/test-db";
import { replaceFactIds, rewriteFactIds } from "@/lib/profile/merge-facts";
import type { Feedback, TailoredCv } from "@/lib/types";

// Merging duplicates for good: what cited a merged-away wording now cites the wording kept, then the
// other wordings are deleted. Same in-memory Postgres (PGlite) as tests/data.

let testDb: Awaited<ReturnType<typeof createTestDb>>;
vi.mock("@/lib/db", () => ({ getDb: () => testDb }));

const factsData = await import("@/lib/data/facts");
const offersData = await import("@/lib/data/offers");
const interviewsData = await import("@/lib/data/interviews");
const documentsData = await import("@/lib/data/documents");

const A = "user_alice";
const B = "user_bob";

describe("replacing fact ids in stored values", () => {
  const replace = new Map([["old", "kept"]]);

  it("swaps factIds arrays (deduplicated) and factId strings, at any depth", () => {
    const value = {
      summary: [{ text: "Built an API.", factIds: ["old", "kept", "other"] }],
      projects: [{ title: "x", factIds: ["old"], tags: [{ name: "Java", factIds: ["old"] }], bullets: [] }],
      claims: [{ quote: "I built it", factId: "old" }, { quote: "not in profile" }],
      text: "old", // not a fact reference: untouched
    };
    expect(replaceFactIds(value, replace)).toEqual({
      summary: [{ text: "Built an API.", factIds: ["kept", "other"] }],
      projects: [{ title: "x", factIds: ["kept"], tags: [{ name: "Java", factIds: ["kept"] }], bullets: [] }],
      claims: [{ quote: "I built it", factId: "kept" }, { quote: "not in profile" }],
      text: "old",
    });
  });

  it("says when nothing changes, so untouched rows are not written", () => {
    expect(rewriteFactIds([{ text: "a", factIds: ["other"] }], replace)).toBeNull();
    expect(rewriteFactIds([{ text: "a", factIds: ["old"] }], replace)).toEqual([{ text: "a", factIds: ["kept"] }]);
  });
});

describe("mergeFacts", () => {
  let kept = "";
  let dup = "";
  let other = "";
  let offerId = "";
  let questionId = "";
  let documentId = "";

  beforeAll(async () => {
    testDb = await createTestDb();
    kept = (await factsData.createFact(A, { type: "experience", text: "Développeuse Java – Collabr (2024), API REST Spring Boot", source: "cv_upload", validated: true })).id;
    dup = (await factsData.createFact(A, { type: "experience", text: "Développeuse Java chez Collabr, 2024", source: "cv_upload", validated: true })).id;
    other = (await factsData.createFact(A, { type: "skill", text: "Docker", source: "manual", validated: true })).id;
    const offer = await offersData.createOffer(A, {
      sourceUrl: null,
      sourceSite: "other",
      rawText: "We need Java. Docker is a plus.",
      extraction: {
        title: "Dev",
        company: null,
        location: null,
        contract: null,
        language: "en",
        stack: [],
        requirements: [
          { kind: "must", category: "tech", text: "Java", quote: "We need Java.", factIds: [dup] },
          { kind: "nice", category: "tech", text: "Docker", quote: "Docker is a plus.", factIds: [other] },
        ],
        contacts: [],
        dropped: 0,
      },
    });
    offerId = offer.id;
    const interviewId = await interviewsData.createInterview(A, offerId, [
      { group: "hr", type: "introduction", text: "Introduce yourself", source: "Standard HR question", suggestedAnswer: [{ text: "I worked at Collabr.", factIds: [dup] }] },
    ]);
    questionId = (await interviewsData.getInterview(A, interviewId))!.questions[0].id;
    const feedback: Feedback = {
      star: { rating: "good", comment: "ok" },
      relevance: { rating: "good", comment: "ok" },
      evidence: { rating: "good", comment: "ok", claims: [{ quote: "Collabr", factId: dup }] },
      improvedAnswer: [{ text: "At Collabr I built an API.", factIds: [dup, kept] }],
    };
    await interviewsData.saveAnswer(A, questionId, "I worked at Collabr.", feedback);
    const content: TailoredCv = {
      kind: "tailored_cv",
      language: "en",
      headline: null,
      summary: [{ text: "Java developer.", factIds: [dup] }],
      skills: [{ category: "Languages", items: [{ name: "Java", factIds: [dup] }] }],
      projects: [],
      moreProjects: [],
      education: [],
      experience: [{ title: "Java developer", context: "Collabr · 2024", link: null, tags: [], bullets: [{ text: "Built an API.", factIds: [dup] }], factIds: [dup], aiAssisted: false }],
      languages: [],
    };
    documentId = (await documentsData.saveDocumentVersion(A, offerId, "cv", [{ text: "Java developer.", factIds: [dup] }], { language: "en", content })).id;
  });

  it("another account cannot merge, nor touch, these facts", async () => {
    expect(await factsData.mergeFacts(B, kept, [dup])).toBe(0);
    expect(await factsData.getFact(A, dup)).not.toBeNull();
  });

  it("points every reference to the kept wording, then deletes the others", async () => {
    expect(await factsData.mergeFacts(A, kept, [dup, kept])).toBe(1);
    expect(await factsData.getFact(A, dup)).toBeNull();
    expect(await factsData.getFact(A, other)).not.toBeNull(); // not part of the merge

    const detail = await offersData.getOfferDetail(A, offerId);
    expect(detail!.requirements.map((r) => r.factIds)).toEqual(expect.arrayContaining([[kept], [other]])); // the offer keeps its proof
    const interview = await interviewsData.getInterview(A, (await interviewsData.getQuestionWithOffer(A, questionId))!.question.interviewId);
    expect(interview!.questions[0].suggestedAnswer[0].factIds).toEqual([kept]);
    const feedback = interview!.answers[0].feedback!;
    expect(feedback.evidence.claims[0].factId).toBe(kept);
    expect(feedback.improvedAnswer[0].factIds).toEqual([kept]); // deduplicated
    const document = await documentsData.getDocument(A, documentId);
    expect(document!.sentences[0].factIds).toEqual([kept]);
    const cv = document!.content as TailoredCv;
    expect(cv.summary[0].factIds).toEqual([kept]);
    expect(cv.skills[0].items[0].factIds).toEqual([kept]);
    expect(cv.experience[0].factIds).toEqual([kept]);
    expect(cv.experience[0].bullets[0].factIds).toEqual([kept]);
  });

  it("ignores ids that are not facts of this account", async () => {
    expect(await factsData.mergeFacts(A, kept, ["00000000-0000-4000-8000-000000000000"])).toBe(0);
    expect(await factsData.mergeFacts(A, "not-a-uuid", [other])).toBe(0);
  });
});
