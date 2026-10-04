import { describe, expect, it } from "vitest";
import { applyDocEdit, docEditPathSchema } from "@/lib/documents/edit";
import type { TailoredCv, TailoredLetter } from "@/lib/types";

const cv: TailoredCv = {
  kind: "tailored_cv",
  language: "en",
  headline: "Junior developer",
  summary: [{ text: "Java developer.", factIds: ["f1"] }],
  skills: [],
  projects: [
    {
      title: "App",
      context: null,
      link: null,
      tags: [],
      bullets: [
        { text: "Built an app.", factIds: ["f2"] },
        { text: "Tested it.", factIds: [] },
      ],
      factIds: ["f2"],
      aiAssisted: false,
    },
  ],
  moreProjects: [],
  education: [],
  experience: [],
  languages: [],
};

const letter: TailoredLetter = {
  kind: "cover_letter",
  language: "fr",
  greeting: "Madame, Monsieur,",
  paragraphs: [[{ text: "Je code en Java.", factIds: ["f1"] }], [{ text: "Votre offre me plaît.", factIds: [], fromOffer: true }]],
  closing: "Cordialement",
};

describe("applyDocEdit", () => {
  it("changes one sentence and keeps the facts it cites", () => {
    const next = applyDocEdit(cv, { part: "bullet", section: "projects", entry: 0, index: 0 }, "  Built a Spring app. ");
    expect(next?.projects[0].bullets[0]).toEqual({
      text: "Built a Spring app.",
      factIds: ["f2"],
    });
    expect(cv.projects[0].bullets[0].text).toBe("Built an app."); // the original is untouched
    expect(applyDocEdit(cv, { part: "summary", index: 0 }, "Java and Python developer.")?.summary[0].factIds).toEqual(["f1"]);
  });

  it("removes an emptied sentence, and an emptied paragraph", () => {
    expect(applyDocEdit(cv, { part: "bullet", section: "projects", entry: 0, index: 1 }, " ")?.projects[0].bullets).toHaveLength(1);
    expect(applyDocEdit(letter, { part: "sentence", paragraph: 1, index: 0 }, "")?.paragraphs).toHaveLength(1);
    expect(applyDocEdit(cv, { part: "headline" }, "")?.headline).toBeNull();
  });

  it("refuses paths that do not exist and an empty greeting", () => {
    expect(applyDocEdit(cv, { part: "bullet", section: "experience", entry: 0, index: 0 }, "x")).toBeNull();
    expect(applyDocEdit(cv, { part: "greeting" }, "Hi")).toBeNull();
    expect(applyDocEdit(letter, { part: "summary", index: 0 }, "x")).toBeNull();
    expect(applyDocEdit(letter, { part: "closing" }, " ")).toBeNull();
    expect(applyDocEdit(letter, { part: "greeting" }, "Bonjour,")?.greeting).toBe("Bonjour,");
    expect(
      docEditPathSchema.safeParse({
        part: "bullet",
        section: "hobbies",
        entry: 0,
        index: 0,
      }).success,
    ).toBe(false);
  });
});
