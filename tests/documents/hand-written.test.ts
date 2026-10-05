import { describe, expect, it } from "vitest";
import { applyDocEdit } from "@/lib/documents/edit";
import { handWrittenFacts } from "@/lib/documents/hand-written";
import type { TailoredCv, TailoredLetter } from "@/lib/types";

// The candidate's own words in a document join the base; the AI's rewording of facts does not.

const cv: TailoredCv = {
  kind: "tailored_cv",
  language: "en",
  headline: "Junior DevOps Engineer",
  summary: [{ text: "Junior developer trained at 42.", factIds: ["f1"] }],
  skills: [],
  projects: [{ title: "ft_server", context: "42 Belgium · solo", link: null, tags: [], bullets: [{ text: "Docker image with Nginx.", factIds: ["f2"] }], factIds: ["f2"], aiAssisted: false }],
  moreProjects: [],
  education: [],
  experience: [{ title: "Java developer", context: null, link: null, tags: [], bullets: [{ text: "Built a REST API.", factIds: ["f3"] }], factIds: ["f3"], aiAssisted: false }],
  languages: [],
};

describe("hand-written sentences", () => {
  it("marks a sentence edited with the pencil", () => {
    const next = applyDocEdit(cv, { part: "bullet", section: "experience", entry: 0, index: 0 }, "Built a REST API used by 200 students.")!;
    expect(next.experience[0].bullets[0]).toEqual({ text: "Built a REST API used by 200 students.", factIds: ["f3"], edited: true });
    expect(cv.experience[0].bullets[0].edited).toBeUndefined(); // the original is not changed
  });

  it("turns only the edited sentences into facts, typed by where they sit, a bullet with its entry", () => {
    expect(handWrittenFacts(cv)).toEqual([]); // nothing edited: the AI's sentences only reword facts already in the base
    let next = applyDocEdit(cv, { part: "bullet", section: "experience", entry: 0, index: 0 }, "Built a REST API used by 200 students.")!;
    next = applyDocEdit(next, { part: "bullet", section: "projects", entry: 0, index: 0 }, "Docker image with Nginx and WordPress.")!;
    next = applyDocEdit(next, { part: "summary", index: 0 }, "Junior developer trained at 42, former maths teacher.")!;
    expect(handWrittenFacts(next)).toEqual([
      { type: "achievement", text: "Junior developer trained at 42, former maths teacher." },
      { type: "project", text: "ft_server (42 Belgium · solo): Docker image with Nginx and WordPress." },
      { type: "experience", text: "Java developer: Built a REST API used by 200 students." },
    ]);
  });

  it("never turns a letter's sentence about the company into a fact about the candidate", () => {
    const letter: TailoredLetter = {
      kind: "cover_letter",
      language: "fr",
      greeting: "Madame, Monsieur,",
      paragraphs: [[
        { text: "Votre équipe déploie sur Kubernetes.", factIds: [], fromOffer: true, edited: true },
        { text: "J'ai monté une chaîne CI avec GitHub Actions.", factIds: ["f4"], edited: true },
        { text: "J'ai appris Docker à 42.", factIds: ["f2"] },
      ]],
      closing: "Bien à vous,",
    };
    expect(handWrittenFacts(letter)).toEqual([{ type: "achievement", text: "J'ai monté une chaîne CI avec GitHub Actions." }]);
  });
});
