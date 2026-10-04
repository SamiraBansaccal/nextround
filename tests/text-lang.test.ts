import { describe, expect, it } from "vitest";
import { guessLanguage, isOtherLanguage } from "@/lib/text-lang";

describe("guessLanguage", () => {
  it("recognises English and French questions", () => {
    expect(guessLanguage("Can you tell me about a project you are proud of?")).toBe("en");
    expect(guessLanguage("Pouvez-vous me parler d'un projet dont vous êtes fier ?")).toBe("fr");
    expect(guessLanguage("Quelle est la différence entre un processus et un thread ?")).toBe("fr");
    expect(guessLanguage("What is the difference between a process and a thread?")).toBe("en");
  });

  it("stays silent on short or technical text", () => {
    expect(guessLanguage("Docker Compose")).toBeNull();
    expect(guessLanguage("ls | wc -l")).toBeNull();
  });

  it("flags a question written in the wrong language", () => {
    expect(isOtherLanguage("Pourquoi voulez-vous rejoindre notre entreprise ?", "en")).toBe(true);
    expect(isOtherLanguage("Why do you want to join our company?", "en")).toBe(false);
  });
});
