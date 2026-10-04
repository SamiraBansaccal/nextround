import { describe, expect, it } from "vitest";
import { applyCvEdit } from "@/lib/profile/cv-edit";
import type { CvDocument } from "@/lib/types";

// Editing one line of a CV on the profile page.

const cv: CvDocument = {
  language: "fr",
  name: "Samira",
  headline: "Développeuse junior",
  contacts: [],
  experiences: [{ title: "Professeure", organisation: "Athénée", location: "Bruxelles", period: "09/2015", details: ["Cours de maths", "Projets"] }],
  education: [],
  languages: [{ name: "Anglais", level: "C1", listening: null, reading: null, spoken: null, interaction: null, writing: null }],
  skills: ["Java", "docker"],
};

describe("editing a CV line", () => {
  it("changes one field and leaves the original document untouched", () => {
    const next = applyCvEdit(cv, { part: "entry", section: "experiences", index: 0, field: "period" }, " sept. 2015 – juin 2019 ")!;
    expect(next.experiences[0].period).toBe("sept. 2015 – juin 2019");
    expect(cv.experiences[0].period).toBe("09/2015");
  });

  it("removes an emptied detail or skill, clears an emptied optional field", () => {
    expect(applyCvEdit(cv, { part: "detail", section: "experiences", index: 0, detail: 1 }, "")!.experiences[0].details).toEqual(["Cours de maths"]);
    expect(applyCvEdit(cv, { part: "skill", index: 1 }, "Docker")!.skills).toEqual(["Java", "Docker"]);
    expect(applyCvEdit(cv, { part: "skill", index: 1 }, " ")!.skills).toEqual(["Java"]);
    expect(applyCvEdit(cv, { part: "entry", section: "experiences", index: 0, field: "organisation" }, "")!.experiences[0].organisation).toBeNull();
  });

  it("refuses an empty title and a line that does not exist", () => {
    expect(applyCvEdit(cv, { part: "entry", section: "experiences", index: 0, field: "title" }, "")).toBeNull();
    expect(applyCvEdit(cv, { part: "entry", section: "education", index: 0, field: "title" }, "Master")).toBeNull();
    expect(applyCvEdit(cv, { part: "detail", section: "experiences", index: 0, detail: 5 }, "x")).toBeNull();
    expect(applyCvEdit(cv, { part: "language", index: 0, field: "name" }, "")).toBeNull();
  });
});
