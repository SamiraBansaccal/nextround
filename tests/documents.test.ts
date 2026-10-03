import { describe, expect, it } from "vitest";
import { verifyDocuments } from "@/lib/documents/generate";

describe("CV / cover letter verifier", () => {
  it("keeps only validated fact ids; sentences without one become 'Unsupported'", () => {
    const { cv, coverLetter } = verifyDocuments(
      {
        cv: [{ section: "Projects", sentences: [{ text: "Built weather-app in React.", fact_ids: ["F1"] }, { text: "Led a team of 10.", fact_ids: ["F9"] }] }],
        cover_letter: [{ text: "I am applying for this role.", fact_ids: [] }],
      },
      new Map([["F1", "fact-1"]]),
      new Set(["fact-1"]),
    );
    expect(cv).toEqual([
      { section: "Projects", text: "Built weather-app in React.", factIds: ["fact-1"] },
      { section: "Projects", text: "Led a team of 10.", factIds: [] },
    ]);
    expect(coverLetter[0].factIds).toEqual([]);
  });
});
