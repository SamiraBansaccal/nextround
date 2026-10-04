import { describe, expect, it } from "vitest";
import { documentPlainText } from "@/lib/documents/plain-text";
import { shorten } from "@/lib/text";

// Fact chips show a short label (the full fact is in the tooltip): never cut in the middle of a word.
// Generated documents are copied or downloaded as plain text.

describe("shorten", () => {
  it("keeps short labels as they are", () => {
    expect(shorten("React with TypeScript", 32)).toBe("React with TypeScript");
  });

  it("cuts at a word boundary and marks the cut", () => {
    expect(shorten("French (native), English (B2)", 26)).toBe("French (native), English…");
    expect(shorten("weather-app — weather dashboard in React and TypeScript", 26)).toBe("weather-app — weather…");
  });

  it("cuts a single long word when there is no better place", () => {
    expect(shorten("Supercalifragilisticexpialidocious", 10)).toBe("Supercalif…");
  });
});

describe("documentPlainText", () => {
  it("joins a cover letter into one paragraph", () => {
    expect(documentPlainText("cover_letter", [{ text: "Madame, Monsieur,", factIds: [] }, { text: "J'ai développé weather-app.", factIds: ["f1"] }])).toBe(
      "Madame, Monsieur, J'ai développé weather-app.",
    );
  });

  it("keeps the CV sections as titles", () => {
    const text = documentPlainText("cv", [
      { section: "Projets", text: "weather-app en React.", factIds: ["f1"] },
      { section: "Projets", text: "Une API REST en Node.js.", factIds: ["f2"] },
      { section: "Langues", text: "Français, anglais (B2).", factIds: ["f3"] },
    ]);
    expect(text).toBe("PROJETS\nweather-app en React.\nUne API REST en Node.js.\n\nLANGUES\nFrançais, anglais (B2).");
  });
});
