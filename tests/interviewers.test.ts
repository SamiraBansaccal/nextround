import { existsSync, readdirSync } from "node:fs";
import { PICTURES } from "@/lib/interviewers/pictures";
import { describe, expect, it } from "vitest";
import { DEFAULT_INTERVIEWER_ID, findInterviewer, getInterviewer, INTERVIEWERS, interviewersIn, listCategories } from "@/lib/interviewers";
import { initials, placeholderTone } from "@/lib/interviewers/avatar";
import { personaInstructions } from "@/lib/interviewers/persona";

// The interviewer catalog is data: these checks keep it consistent when characters are added or edited.

const TRAITS = ["severity", "warmth", "formality", "humour", "interruption", "questionLength", "pressure", "energy", "confidence", "unpredictability"];

describe("interviewer catalog", () => {
  it("has unique ids usable as file names (public/interviewers/<id>.webp)", () => {
    const ids = INTERVIEWERS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("puts every interviewer in a known category, and every category has interviewers", () => {
    const categories = new Set(listCategories().map((c) => c.id));
    for (const i of INTERVIEWERS) expect(categories.has(i.categoryId), `${i.id} -> ${i.categoryId}`).toBe(true);
    for (const c of listCategories()) expect(interviewersIn(c.id).length, c.id).toBeGreaterThan(0);
  });

  it("gives every interviewer all ten traits, from 1 to 5, and a complete profile", () => {
    for (const i of INTERVIEWERS) {
      expect(Object.keys(i.traits).sort(), i.id).toEqual([...TRAITS].sort());
      for (const value of Object.values(i.traits)) expect(Number.isInteger(value) && value >= 1 && value <= 5, i.id).toBe(true);
      for (const field of [i.name, i.personality, i.interviewStyle, i.vocabulary, i.voice.style]) expect(field.trim().length, i.id).toBeGreaterThan(0);
      for (const lang of ["en", "fr"] as const) {
        const copy = i.copy[lang];
        for (const field of [copy.name, copy.style, copy.description]) expect(field.trim().length, `${i.id} ${lang}`).toBeGreaterThan(0);
      }
    }
  });

  it("only points to pictures that exist", () => {
    for (const i of INTERVIEWERS) if (i.image) expect(existsSync(`public${i.image}`), i.image).toBe(true);
  });

  it("falls back to the default interviewer for an id that left the catalog", () => {
    expect(getInterviewer(DEFAULT_INTERVIEWER_ID).name).toBe("Marie");
    expect(getInterviewer("someone-removed").id).toBe(DEFAULT_INTERVIEWER_ID);
    expect(findInterviewer("someone-removed")).toBeNull();
  });
});

describe("personaInstructions", () => {
  it("describes the style and always adds the guardrails", () => {
    const text = personaInstructions(getInterviewer("margaret-thatcher"));
    expect(text).toContain('"Margaret Thatcher"');
    expect(text).toContain("Severity very high");
    expect(text).toContain("formality very high");
    expect(text).toContain("No political, religious or ideological opinions");
    expect(text).toContain("never present any opinion or statement as theirs");
  });

  it("marks fan parodies and keeps a character's extra notes", () => {
    const text = personaInstructions(getInterviewer("homer-simpson"));
    expect(text).toContain("fan parody");
    expect(text).toContain("Gets distracted easily");
    expect(personaInstructions(getInterviewer("marie"))).not.toContain("parody");
  });
});

describe("placeholders", () => {
  it("makes initials from the meaningful words", () => {
    expect(initials("Donald Trump")).toBe("DT");
    expect(initials("Mr. Burns")).toBe("B");
    expect(initials("The LinkedIn CEO")).toBe("LC");
    expect(initials("Luffy")).toBe("L");
    expect(initials("André 3000")).toBe("A3");
  });

  it("picks the same colour for the same id", () => {
    expect(placeholderTone("homer-simpson", 6)).toBe(placeholderTone("homer-simpson", 6));
    for (const i of INTERVIEWERS) {
      const tone = placeholderTone(i.id, 6);
      expect(tone >= 0 && tone < 6).toBe(true);
    }
  });
});

describe("interview style, shown before joining", () => {
  it("is part of the character, in both languages", () => {
    expect(getInterviewer("donald-trump").copy.en.style).toBe("High-energy, direct and confrontational");
    expect(getInterviewer("barack-obama").copy.en.style).toBe("Calm, diplomatic and thoughtful");
    expect(getInterviewer("margaret-thatcher").copy.en.style).toBe("Formal, demanding and uncompromising");
    expect(getInterviewer("homer-simpson").copy.en.style).toBe("Chaotic, distracted and humorous");
    expect(getInterviewer("mr-burns").copy.en.style).toBe("Cold, formal and extremely demanding");
    expect(getInterviewer("mr-burns").copy.fr.name).toBe("M. Burns");
    expect(getInterviewer("rick-sanchez").copy.fr.style).toBe("Génial, cynique et chaotique");
  });
});

describe("interviewer pictures", () => {
  it("lists exactly the pictures in public/interviewers (run node scripts/interviewer-pictures.mjs)", () => {
    const files = readdirSync("public/interviewers").filter((f) => /\.(webp|jpe?g|png)$/.test(f));
    expect(Object.values(PICTURES).sort()).toEqual(files.map((f) => `/interviewers/${f}`).sort());
  });

  it("only names pictures after interviewers of the catalog", () => {
    for (const id of Object.keys(PICTURES)) expect(findInterviewer(id), id).not.toBeNull();
  });
});
