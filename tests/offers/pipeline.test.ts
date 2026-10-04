import { describe, expect, it } from "vitest";
import { buildPipelineCards } from "@/lib/offers/pipeline";

const base = { userId: "u", sourceUrl: null, location: null, contract: null, language: "fr", rawText: "x", stack: [], scannedAt: null, createdAt: new Date() };
const NOW = new Date("2026-10-10T12:00:00Z").getTime();

describe("pipeline follow-up reminder", () => {
  it("is due 7 days after applying, only while waiting for an answer", () => {
    const cards = buildPipelineCards(
      [
        { ...base, id: "a", title: "Dev", company: "A", sourceSite: "company", status: "applied", appliedAt: new Date("2026-10-02T09:00:00Z") },
        { ...base, id: "b", title: "Dev", company: "B", sourceSite: "indeed", status: "applied", appliedAt: new Date("2026-10-08T09:00:00Z") },
        { ...base, id: "c", title: "Dev", company: "C", sourceSite: "linkedin", status: "rejected", appliedAt: new Date("2026-09-01T09:00:00Z") },
      ],
      [{ offerId: "a", category: "tech", factIds: ["f1"] }, { offerId: "a", category: "tech", factIds: [] }],
      new Map([["f1", { id: "f1", validated: true, aiAssisted: false }]]),
      new Map([["a", 2]]),
      NOW,
    );
    expect(cards[0]).toMatchObject({ covered: 1, total: 2, interviews: 2, followUp: { due: true, on: "2026-10-09" } });
    expect(cards[1].followUp).toEqual({ due: false, on: "2026-10-15" });
    expect(cards[2].followUp).toBeNull();
  });
});
