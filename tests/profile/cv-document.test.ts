import { describe, expect, it } from "vitest";
import { appearsIn, cvDocumentSchema, isEmptyCvDocument, verifyCvDocument } from "@/lib/profile/cv-document";

// A CV laid out as a document: every string must be written in the CV text; anything else is dropped.

const CV = `Samira Exemple
Développeuse web junior
E-mail : samira@example.com   Téléphone : 0470 12 34 56
EXPÉRIENCES
Bruxelles   Janvier 2025 – Juin 2025
Bénévole — 42 Belgium
Soutien administratif au secrétariat : accueil, mailing,
gestion des inscriptions.
FORMATIONS
Bruxelles   2023 à aujourd'hui
Formation programmation — 42 Belgium
LANGUES
Anglais B2 B2 B2 B2 B1
Français Langue maternelle
COMPÉTENCES
React, TypeScript, Node.js`;

const empty = { listening: null, reading: null, spoken: null, interaction: null, writing: null };

describe("verifyCvDocument", () => {
  it("keeps what the CV says and drops what it does not", () => {
    const raw = cvDocumentSchema.parse({
      language: "fr",
      name: "Samira Exemple",
      headline: "Développeuse web junior",
      contacts: [
        { kind: "email", label: "E-mail", value: "samira@example.com" },
        { kind: "phone", label: "Téléphone", value: "0470 12 34 56" },
        { kind: "linkedin", label: null, value: "linkedin.com/in/samira" }, // not in the CV
      ],
      experiences: [
        {
          title: "Bénévole",
          organisation: "42 Belgium",
          location: "Bruxelles",
          period: "Janvier 2025 - Juin 2025", // hyphen instead of the CV's en dash: tolerated
          details: [
            "Soutien administratif au secrétariat : accueil, mailing, gestion des inscriptions.", // line break in the CV: tolerated
            "Gestion d'une équipe de 10 personnes.", // invented
          ],
        },
        { title: "Lead developer", organisation: "Google", location: null, period: null, details: [] }, // invented
      ],
      education: [{ title: "Formation programmation", organisation: "42 Belgium", location: "Bruxelles", period: "2023 à aujourd'hui", details: [] }],
      languages: [
        { name: "Anglais", level: null, listening: "B2", reading: "B2", spoken: "B2", interaction: "B2", writing: "B1" },
        { name: "Français", level: "Langue maternelle", ...empty },
        { name: "Japonais", level: "C1", ...empty }, // invented
      ],
      skills: ["React", "typescript", "Kubernetes"], // case tolerated; Kubernetes invented
    });

    const { document, dropped } = verifyCvDocument(raw, CV);

    expect(document.name).toBe("Samira Exemple");
    expect(document.headline).toBe("Développeuse web junior");
    expect(document.contacts.map((c) => c.value)).toEqual(["samira@example.com", "0470 12 34 56"]);
    expect(document.experiences).toEqual([
      {
        title: "Bénévole",
        organisation: "42 Belgium",
        location: "Bruxelles",
        period: "Janvier 2025 - Juin 2025",
        details: ["Soutien administratif au secrétariat : accueil, mailing, gestion des inscriptions."],
      },
    ]);
    expect(document.education[0].period).toBe("2023 à aujourd'hui");
    expect(document.languages.map((l) => l.name)).toEqual(["Anglais", "Français"]);
    expect(document.languages[0].writing).toBe("B1");
    expect(document.skills).toEqual(["React", "typescript"]);
    expect(dropped).toBe(5);
  });

  it("drops a reworded value instead of showing it", () => {
    const raw = cvDocumentSchema.parse({
      experiences: [
        { title: "Volunteer", organisation: "42 Belgium", location: null, period: null, details: [] }, // translated title
        { title: "Bénévole", organisation: "École 42", location: null, period: null, details: [] }, // reworded organisation
      ],
    });
    const { document, dropped } = verifyCvDocument(raw, CV);
    expect(document.experiences).toEqual([{ title: "Bénévole", organisation: null, location: null, period: null, details: [] }]);
    expect(dropped).toBe(2);
  });

  it("survives a partly broken answer from a weak model", () => {
    const raw = cvDocumentSchema.parse({
      language: "xx",
      name: 42,
      experiences: [{ organisation: "no title" }, { title: "Bénévole" }],
      skills: ["React", 42, null],
    });
    expect(raw.experiences).toHaveLength(1);
    expect(raw.skills).toEqual(["React"]);
    const { document } = verifyCvDocument(raw, CV);
    expect(document.language).toBe("en");
    expect(document.name).toBeNull();
    expect(isEmptyCvDocument(document)).toBe(false);
    expect(isEmptyCvDocument(verifyCvDocument(cvDocumentSchema.parse({ skills: ["Kubernetes"] }), CV).document)).toBe(true);
  });
});

describe("appearsIn", () => {
  it("matches short values as whole words only", () => {
    expect(appearsIn(CV, "B2")).toBe(true);
    expect(appearsIn(CV, "b1")).toBe(true);
    expect(appearsIn(CV, "C2")).toBe(false);
    expect(appearsIn(CV, "2")).toBe(false); // inside "B2", not a word of its own
    expect(appearsIn(CV, " ")).toBe(false);
  });
});
