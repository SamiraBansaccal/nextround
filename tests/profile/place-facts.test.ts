import { describe, expect, it } from "vitest";
import { placeFacts } from "@/lib/profile/place-facts";
import type { CvDocument } from "@/lib/types";

// Facts proposed from a CV are reviewed inside that CV: each one sits under the entry its quote comes from.

const CV: CvDocument = {
  language: "fr",
  name: "Sam",
  headline: null,
  contacts: [],
  experiences: [
    { title: "Bénévole", organisation: "42 Belgium", location: "Bruxelles", period: "janvier 2025 - Juin 2025", details: ["Soutien administratif au secrétariat (accueil, mailing)"] },
    { title: "Professeur chargé de cours de français", organisation: "College Roi Baudouin", location: "Bruxelles", period: "Avril 2023 - Juillet 2023", details: [] },
  ],
  education: [{ title: "Formation programmation", organisation: "42 Belgium", location: "Bruxelles", period: "2023 à aujourd'hui", details: ["Développement système en C et programmation objet en C++"] }],
  languages: [{ name: "Anglais", level: "B2", listening: null, reading: null, spoken: null, interaction: null, writing: null }],
  skills: ["Docker", "Linux"],
};

const fact = (type: string, quote: string | null, text = quote ?? "") => ({ type, text, quote });

describe("placeFacts", () => {
  it("puts each fact under the job or the training its quote comes from", () => {
    const facts = [
      fact("experience", "janvier 2025 - Juin 2025\nBénévole\n42 Belgium\nSoutien administratif au secrétariat (accueil, mailing)"),
      fact("experience", "Professeur chargé de cours de français\nCollege Roi Baudouin"),
      fact("skill", "Développement système en C"),
    ];
    const places = placeFacts(CV, facts);
    expect(places.get("experiences:0")).toEqual([facts[0]]);
    expect(places.get("experiences:1")).toEqual([facts[1]]);
    expect(places.get("education:0")).toEqual([facts[2]]);
  });

  it("puts languages, skills and the rest in their own place", () => {
    const facts = [fact("language", "Anglais B2"), fact("skill", "Docker"), fact("achievement", "Something not in the layout"), fact("skill", null, "")];
    const places = placeFacts(CV, facts);
    expect(places.get("languages")).toEqual([facts[0]]);
    expect(places.get("skills")).toEqual([facts[1]]);
    expect(places.get("other")).toEqual([facts[2], facts[3]]);
  });
});
