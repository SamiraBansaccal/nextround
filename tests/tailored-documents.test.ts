import { describe, expect, it } from "vitest";
import { letterSchema, verifyLetter } from "@/lib/documents/cover-letter";
import { documentFactIds, documentSentences, tailoredCvText } from "@/lib/documents/render";
import { tailoredCvSchema, verifyTailoredCv } from "@/lib/documents/tailored-cv";

// CVs and letters written for an offer: every item is checked against the validated facts, and a
// vibe-coded project never claims its stack.

const ALIASES = new Map([
  ["F1", "inception"],
  ["F2", "nextround"],
  ["F3", "teacher"],
  ["F4", "english"],
  ["F5", "draft"],
]);
const FACTS = new Map([
  ["inception", { id: "inception", validated: true, aiAssisted: false, sourceRef: "https://github.com/me/inception" }],
  ["nextround", { id: "nextround", validated: true, aiAssisted: true, sourceRef: "https://github.com/me/nextround" }],
  ["teacher", { id: "teacher", validated: true, aiAssisted: false, sourceRef: null }],
  ["english", { id: "english", validated: true, aiAssisted: false, sourceRef: null }],
  ["draft", { id: "draft", validated: false, aiAssisted: false, sourceRef: null }],
]);

const raw = tailoredCvSchema.parse({
  headline: "",
  summary: [{ text: "Junior engineer with an affinity for infrastructure.", fact_ids: ["F1"] }, { text: "Ten years of Kubernetes.", fact_ids: [] }],
  skills: [
    { category: "Infrastructure", items: [{ name: "Docker", fact_ids: ["F1"] }, { name: "Next.js", fact_ids: ["F2"] }] },
    { category: "Web", items: [{ name: "TypeScript", fact_ids: ["F2"] }] },
  ],
  projects: [
    {
      title: "inception",
      context: "42 Belgium · solo",
      link: "https://github.com/me/inception",
      fact_ids: ["F1"],
      tags: [{ name: "Docker", fact_ids: ["F1"] }, { name: "Kubernetes", fact_ids: ["F9"] }],
      bullets: [{ text: "Eight services, every image built by hand.", fact_ids: ["F1"] }],
    },
    {
      title: "NextRound",
      context: "hackathon",
      link: "https://example.com/not-in-the-facts",
      fact_ids: ["F2"],
      tags: [{ name: "TypeScript", fact_ids: ["F2"] }],
      bullets: [{ text: "Interview coach built with AI assistants.", fact_ids: ["F2"] }],
    },
    { title: "Invented project", fact_ids: ["F9"], tags: [], bullets: [{ text: "Never happened.", fact_ids: [] }] },
  ],
  more_projects: [{ name: "minishell", fact_ids: ["F5"] }],
  education: [],
  experience: [{ title: "Secondary school teacher", fact_ids: ["F3"], bullets: [{ text: "Took over classes mid-year.", fact_ids: ["F3"] }] }],
  languages: [{ name: "English", level: "B2", fact_ids: ["F4"] }, { name: "German", level: "C2", fact_ids: [] }],
});

describe("verifyTailoredCv", () => {
  const cv = verifyTailoredCv(raw, ALIASES, FACTS, "fr", "Junior DevOps Engineer");

  it("keeps only skills a hand-written project proves", () => {
    expect(cv.skills).toEqual([{ category: "Infrastructure", items: [{ name: "Docker", factIds: ["inception"] }] }]);
  });

  it("shows a vibe-coded project as such, without its stack, and links only to repositories of the profile", () => {
    const [inception, nextround] = cv.projects;
    expect(inception).toMatchObject({ link: "https://github.com/me/inception", aiAssisted: false, tags: [{ name: "Docker", factIds: ["inception"] }] });
    expect(nextround).toMatchObject({ link: null, aiAssisted: true, tags: [] });
    expect(cv.projects).toHaveLength(2); // nothing in the profile proves the invented project
  });

  it("keeps unproven lines visible as unsupported, and drops unproven languages and unvalidated facts", () => {
    expect(cv.summary[1]).toEqual({ text: "Ten years of Kubernetes.", factIds: [] });
    expect(cv.languages).toEqual([{ name: "English", level: "B2", factIds: ["english"] }]);
    expect(cv.moreProjects).toEqual([]);
    expect(cv.headline).toBe("Junior DevOps Engineer"); // the offer's title when the AI gives none
  });

  it("renders as plain text with headings in the CV's language", () => {
    const text = tailoredCvText(cv, { name: "Sam B.", contacts: ["sam@example.com"] });
    expect(text.split("\n").slice(0, 3)).toEqual(["Sam B.", "Junior DevOps Engineer", "sam@example.com"]);
    expect(text).toContain("COMPÉTENCES TECHNIQUES\nInfrastructure: Docker");
    expect(text).toContain("NextRound · hackathon · réalisé avec l'aide de l'IA");
    expect(documentSentences(cv).map((s) => s.section)).toContain("Projets · inception");
    expect(documentFactIds(cv).sort()).toEqual(["english", "inception", "nextround", "teacher"]);
  });
});

describe("verifyLetter", () => {
  it("tells sentences about the offer from claims about the candidate", () => {
    const letter = verifyLetter(
      letterSchema.parse({
        greeting: "Madame, Monsieur,",
        paragraphs: [
          [{ text: "Le poste de DevOps junior chez Smals m'intéresse.", fact_ids: ["OFFER"] }],
          [
            { text: "J'ai construit une infrastructure de huit services.", fact_ids: ["F1"] },
            { text: "J'ai dix ans d'expérience.", fact_ids: [] },
          ],
          [],
        ],
        closing: "Bien à vous,\nSam",
      }),
      ALIASES,
      new Set(["inception"]),
      "fr",
    );
    expect(letter.paragraphs).toEqual([
      [{ text: "Le poste de DevOps junior chez Smals m'intéresse.", factIds: [], fromOffer: true }],
      [
        { text: "J'ai construit une infrastructure de huit services.", factIds: ["inception"] },
        { text: "J'ai dix ans d'expérience.", factIds: [] },
      ],
    ]);
  });
});
