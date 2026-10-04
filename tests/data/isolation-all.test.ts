import { beforeAll, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/tests/helpers/test-db";

// Data isolation for every table added after Phase 1: user B, even knowing the ids of user A's
// rows, can neither read nor change them. Same in-memory Postgres (PGlite) as tests/isolation.

let testDb: Awaited<ReturnType<typeof createTestDb>>;
vi.mock("@/lib/db", () => ({ getDb: () => testDb }));

const A = "user_alice";
const B = "user_bob";

const offersData = await import("@/lib/data/offers");
const interviewsData = await import("@/lib/data/interviews");
const documentsData = await import("@/lib/data/documents");
const sourcesData = await import("@/lib/data/sources");
const factsData = await import("@/lib/data/facts");

const TEXT = "We need React. Docker is a plus. Write to jobs@example.com.";
let offerId = "";
let interviewId = "";
let questionId = "";

beforeAll(async () => {
  testDb = await createTestDb();
  const offer = await offersData.createOffer(A, {
    sourceUrl: "https://example.com/job",
    sourceSite: "company",
    rawText: TEXT,
    extraction: {
      title: "Dev",
      company: "Example",
      location: null,
      contract: null,
      language: "en",
      stack: [{ value: "React", quote: "React" }],
      requirements: [{ kind: "must", category: "tech", text: "React", quote: "We need React.", factIds: [] }],
      contacts: [{ kind: "email", value: "jobs@example.com", quote: "Write to jobs@example.com." }],
      dropped: 0,
    },
  });
  offerId = offer.id;
  interviewId = await interviewsData.createInterview(A, offerId, [{ group: "hr", type: "introduction", text: "Introduce yourself", source: "Standard HR question", suggestedAnswer: [] }], { interviewerId: "homer-simpson", language: "fr", focus: "general" });
  questionId = (await interviewsData.getInterview(A, interviewId))!.questions[0].id;
  await interviewsData.saveAnswer(A, questionId, "Hello", {
    star: { rating: "good", comment: "ok" },
    relevance: { rating: "good", comment: "ok" },
    evidence: { rating: "good", comment: "ok", claims: [] },
    improvedAnswer: [],
  });
  await documentsData.saveDocumentVersion(A, offerId, "cv", [{ text: "Built things.", factIds: [] }]);
});

describe("offers, requirements and contacts", () => {
  it("B cannot read A's offer, nor its requirements and contacts", async () => {
    expect(await offersData.getOffer(B, offerId)).toBeNull();
    expect(await offersData.getOfferDetail(B, offerId)).toBeNull();
    expect(await offersData.listOffers(B)).toEqual([]);
    expect(await offersData.listRequirementsForUser(B)).toEqual([]);
  });
  it("B cannot change the status of A's offer", async () => {
    expect(await offersData.setOfferStatus(B, offerId, "rejected")).toBe(false);
    expect(await offersData.markApplied(B, offerId)).toBe(false);
    expect((await offersData.getOffer(A, offerId))?.status).toBe("saved");
  });
  it("A can move their own offer, and 'applied' stamps the date once", async () => {
    expect(await offersData.setOfferStatus(A, offerId, "applied")).toBe(true);
    const applied = await offersData.getOffer(A, offerId);
    expect(applied?.appliedAt).toBeInstanceOf(Date);
    await offersData.setOfferStatus(A, offerId, "interview");
    await offersData.setOfferStatus(A, offerId, "applied");
    expect((await offersData.getOffer(A, offerId))?.appliedAt?.getTime()).toBe(applied?.appliedAt?.getTime());
  });
});

describe("interviews, questions and answers", () => {
  it("keeps the session's configuration and the question type", async () => {
    const own = await interviewsData.getInterview(A, interviewId);
    expect(own?.interview.interviewerId).toBe("homer-simpson");
    expect(own?.interview.language).toBe("fr");
    expect(own?.interview.focus).toBe("general");
    expect(own?.questions[0].type).toBe("introduction");
  });

  it("B cannot read A's interview, its questions or its answers", async () => {
    expect(await interviewsData.getInterview(B, interviewId)).toBeNull();
    expect(await interviewsData.getQuestionWithOffer(B, questionId)).toBeNull();
    expect(await interviewsData.listInterviewIdsForOffer(B, offerId)).toEqual([]);
    expect(await interviewsData.listInterviewsWithProgress(B)).toEqual([]);
    expect((await interviewsData.countInterviewsByOffer(B)).size).toBe(0);
  });
  it("A sees their progress", async () => {
    const [item] = await interviewsData.listInterviewsWithProgress(A);
    expect(item).toMatchObject({ id: interviewId, answered: 1, total: 1 });
  });
});

describe("documents (CV / cover letter versions)", () => {
  it("B cannot list A's documents; versions are numbered per user and offer", async () => {
    expect(await documentsData.listDocuments(B, offerId)).toEqual([]);
    await documentsData.saveDocumentVersion(A, offerId, "cv", [{ text: "v2", factIds: [] }]);
    const versions = (await documentsData.listDocuments(A, offerId)).filter((d) => d.kind === "cv").map((d) => d.version);
    expect(versions).toEqual([2, 1]);
    // B's own first CV for the same offer id starts at 1: counters are not shared.
    const own = await documentsData.saveDocumentVersion(B, offerId, "cv", [{ text: "x", factIds: [] }]);
    expect(own.version).toBe(1);
  });
});

describe("CV sources", () => {
  it("B cannot remove A's CV; removing one's own CV keeps the validated facts", async () => {
    const source = await sourcesData.addSource(A, "cv_upload", "cv.pdf");
    const kept = await factsData.createFact(A, { type: "skill", text: "React", source: "cv_upload", sourceRef: sourcesData.cvRef(source.id), validated: true });
    const dropped = await factsData.createFact(A, { type: "skill", text: "Vue", source: "cv_upload", sourceRef: sourcesData.cvRef(source.id), validated: false });
    expect(await sourcesData.removeCvSource(B, source.id)).toBe(false);
    expect(await sourcesData.listSources(B)).toEqual([]);
    expect(await sourcesData.removeCvSource(A, source.id)).toBe(true);
    expect(await factsData.getFact(A, kept.id)).not.toBeNull();
    expect(await factsData.getFact(A, dropped.id)).toBeNull();
  });

  it("B cannot read A's CV text and document, nor overwrite the document", async () => {
    const doc = { language: "fr", name: "Alice", headline: null, contacts: [], experiences: [], education: [], languages: [], skills: ["React"] };
    const source = await sourcesData.addSource(A, "cv_upload", "cv2.pdf", { text: "Alice — React", document: doc });
    expect(await sourcesData.getCvSource(B, source.id)).toBeNull();
    expect(await sourcesData.setCvDocument(B, source.id, { ...doc, skills: ["Changed by B"] })).toBe(false);
    const own = await sourcesData.getCvSource(A, source.id);
    expect(own?.text).toBe("Alice — React");
    expect(own?.document?.skills).toEqual(["React"]);
    expect(await sourcesData.setCvDocument(A, source.id, { ...doc, skills: ["React", "Node.js"] })).toBe(true);
    expect((await sourcesData.getCvSource(A, source.id))?.document?.skills).toEqual(["React", "Node.js"]);
    expect(await sourcesData.getCvSource(A, "not-a-uuid")).toBeNull();
  });
});

describe("switching interviewer and deleting an interview", () => {
  it("B cannot switch A's interviewer; A's switch only changes the lines of unanswered questions", async () => {
    const id = await interviewsData.createInterview(
      A,
      offerId,
      [
        { group: "hr", type: "introduction", text: "Q1", source: "HR", suggestedAnswer: [], intro: "old 1", outro: null },
        { group: "hr", type: "motivation", text: "Q2", source: "HR", suggestedAnswer: [], intro: "old 2", outro: null },
      ],
      { interviewerId: "homer-simpson", language: "en", focus: "general" },
    );
    const [q1, q2] = (await interviewsData.getInterview(A, id))!.questions;
    await interviewsData.saveAnswer(A, q1.id, "Hi", { star: { rating: "good", comment: "" }, relevance: { rating: "good", comment: "" }, evidence: { rating: "good", comment: "", claims: [] }, improvedAnswer: [] });
    const lines = new Map([
      [q1.id, { intro: "new 1", outro: null }],
      [q2.id, { intro: "new 2", outro: "bye" }],
    ]);
    expect(await interviewsData.switchInterviewer(B, id, "mr-burns", lines)).toBe(false);
    expect((await interviewsData.getInterview(A, id))!.interview.interviewerId).toBe("homer-simpson");
    expect(await interviewsData.switchInterviewer(A, id, "mr-burns", lines)).toBe(true);
    const after = (await interviewsData.getInterview(A, id))!;
    expect(after.interview.interviewerId).toBe("mr-burns");
    expect(after.questions.map((q) => [q.intro, q.outro])).toEqual([["old 1", null], ["new 2", "bye"]]);
  });

  it("B cannot delete A's interview; A's deletion removes its questions and answers", async () => {
    const id = await interviewsData.createInterview(A, offerId, [{ group: "hr", type: "introduction", text: "Q", source: "HR", suggestedAnswer: [] }], { interviewerId: "homer-simpson", language: "en", focus: "general" });
    expect(await interviewsData.deleteInterview(B, id)).toBe(false);
    expect(await interviewsData.getInterview(A, id)).not.toBeNull();
    expect(await interviewsData.deleteInterview(A, id)).toBe(true);
    expect(await interviewsData.getInterview(A, id)).toBeNull();
    expect(await interviewsData.deleteInterview(A, "not-a-uuid")).toBe(false);
  });
});
