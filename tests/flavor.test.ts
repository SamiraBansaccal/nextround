import { describe, expect, it } from "vitest";
import { inRegister } from "@/lib/interview/register";
import { findInterviewer, getInterviewer, listCategories } from "@/lib/interviewers";
import { CATEGORY_PACKS, CHARACTER_PACKS, flavorInterview, flavorLayers, type FlavorPack } from "@/lib/interviewers/flavor";
import { NEUTRAL } from "@/lib/interviewers/flavor/registers";
import { FLAVOR_FIELDS } from "@/lib/interviewers/flavor/types";

// What interviewers say around the questions: data checks, and how the lines are assembled.

const pieces = (pack: FlavorPack) => FLAVOR_FIELDS.flatMap((field) => pack[field] ?? []);
const always = (value: number) => () => value;

describe("interviewer lines (data)", () => {
  it("only gives lines to characters of the catalog, never to real people", () => {
    for (const id of Object.keys(CHARACTER_PACKS)) {
      const interviewer = findInterviewer(id);
      expect(interviewer, id).toBeDefined();
      expect(interviewer!.kind, id).not.toBe("real_person");
    }
    const categories = new Set(listCategories().map((c) => c.id));
    for (const id of Object.keys(CATEGORY_PACKS)) expect(categories.has(id), id).toBe(true);
  });

  it("writes every line in both languages, with valid placeholders only", () => {
    const packs = [NEUTRAL, ...Object.values(CATEGORY_PACKS), ...Object.values(CHARACTER_PACKS)];
    for (const piece of packs.flatMap(pieces)) {
      for (const lang of ["en", "fr"] as const) {
        expect(piece[lang].trim().length, piece.en).toBeGreaterThan(0);
        for (const register of ["formal", "casual"] as const) {
          const said = inRegister(piece[lang], register).replace(/\{(tech|n)\}/g, "");
          expect(said, piece[lang]).not.toMatch(/[{}|]/);
        }
      }
    }
  });
});

describe("flavorInterview", () => {
  const homer = getInterviewer("homer-simpson");

  it("greets on the first question and names the technology of a technical one", () => {
    const [first, second] = flavorInterview(homer, [{ tech: null }, { tech: "C++" }], "en", always(0));
    expect(first.intro).toBe("Hi! Don't worry, I'm not judging. Much. D'oh!");
    expect(second.intro).toBe("Mmm… donuts. C++? Is that something you eat? Anyway.");
    expect(first.outro).toBe("Take your time, I'll grab a donut.");
  });

  it("never says the same line twice in one interview", () => {
    const lines = flavorInterview(homer, Array.from({ length: 10 }, () => ({ tech: "Docker" })), "fr", always(0));
    const said = lines.flatMap((l) => [l.intro, l.outro]).filter(Boolean);
    expect(said.length).toBeGreaterThan(5);
    expect(new Set(said).size).toBe(said.length);
  });

  it("says vous or tu in French like the interviewer", () => {
    const burns = getInterviewer("mr-burns");
    const lines = flavorInterview(burns, Array.from({ length: 8 }, () => ({ tech: null })), "fr", always(0));
    const said = lines.flatMap((l) => [l.intro, l.outro]).filter(Boolean).join(" ");
    expect(said).toContain("Voyons ce que vous valez.");
    expect(said).not.toMatch(/(?<!\p{L})(tu|ton|ta|tes|toi)(?!\p{L})/iu);
  });

  it("stays quiet when chance says so, and keeps the question itself out of it", () => {
    const lines = flavorInterview(homer, [{ tech: null }, { tech: null }], "en", always(0.99));
    expect(lines[1]).toEqual({ intro: null, outro: null });
    expect(lines[0].intro).not.toBeNull(); // the greeting is always said
  });

  it("puts no catchphrase in a real person's mouth", () => {
    const trump = getInterviewer("donald-trump");
    expect(trump.kind).toBe("real_person");
    expect(flavorLayers(trump).some((layer) => layer.weight === 5)).toBe(false);
    expect(flavorLayers(homer)[0].weight).toBe(5);
  });
});
