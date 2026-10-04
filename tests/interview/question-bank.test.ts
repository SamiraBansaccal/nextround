import { describe, expect, it } from "vitest";
import { BANK, bankAnswerText, bankQuestionText, findBankQuestion, pickTechnicalQuestions, TECH_KINDS, TECHS, techsIn } from "@/lib/interview/bank";
import { fill } from "@/lib/interview/copy";
import { inRegister, registerOf } from "@/lib/interview/register";

// The technical question bank is app data: these checks keep it consistent when questions are added,
// and pin down how an interview draws from it.

const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

describe("question bank data", () => {
  it("has unique ids made of the technology and a slug", () => {
    const ids = BANK.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of BANK) expect(q.id.startsWith(`${q.tech}.`), q.id).toBe(true);
    expect(new Set(TECHS.map((t) => t.id)).size).toBe(TECHS.length);
  });

  it("covers many technologies, with several kinds of questions each", () => {
    expect(TECHS.length).toBeGreaterThanOrEqual(40);
    for (const id of ["c", "cpp", "java", "docker", "kubernetes", "linux", "bash", "cicd", "git", "terraform", "ansible", "cloud", "networking"]) {
      const questions = BANK.filter((q) => q.tech === id);
      expect(questions.length, id).toBeGreaterThanOrEqual(5);
      expect(new Set(questions.map((q) => q.kind)).size, id).toBeGreaterThanOrEqual(3);
    }
    for (const tech of TECHS) expect(BANK.filter((q) => q.tech === tech.id).length, tech.id).toBeGreaterThanOrEqual(8);
    expect(BANK.length).toBeGreaterThanOrEqual(450);
  });

  it("writes every question and model answer in both languages, with known kinds only", () => {
    for (const q of BANK) {
      expect(TECH_KINDS).toContain(q.kind);
      for (const lang of ["en", "fr"] as const) {
        expect(q.text[lang].trim().length, `${q.id} ${lang}`).toBeGreaterThan(10);
        expect(q.answer[lang].trim().length, `${q.id} ${lang}`).toBeGreaterThan(80);
      }
    }
  });

  it("leaves no placeholder behind once the register and the technology are applied", () => {
    const leftover = /\{tech\}|\{[^{}|]*\|[^{}|]*\}/; // braces in code examples ({} in find -exec) are fine
    for (const q of BANK) {
      for (const register of ["formal", "casual"] as const) {
        for (const lang of ["en", "fr"] as const) expect(bankQuestionText(q, lang, register), q.id).not.toMatch(leftover);
      }
      for (const lang of ["en", "fr"] as const) expect(bankAnswerText(q, lang), q.id).not.toMatch(leftover);
    }
  });

  it("says vous or tu in French according to the interviewer, never both", () => {
    for (const q of BANK) {
      const formal = inRegister(q.text.fr, "formal");
      const casual = inRegister(q.text.fr, "casual");
      expect(formal, q.id).not.toMatch(/(?<!\p{L})(tu|ton|ta|tes|toi)(?!\p{L})|(?<!\p{L})t'/iu);
      expect(casual, q.id).not.toMatch(/(?<!\p{L})(vous|votre|vos)(?!\p{L})/iu);
    }
    const debug = findBankQuestion("docker.exits-at-start")!;
    expect(bankQuestionText(debug, "fr", "formal")).toBe("Votre conteneur s'arrête juste après avoir démarré. Que vérifiez-vous ?");
    expect(bankQuestionText(debug, "fr", "casual")).toBe("Ton conteneur s'arrête juste après avoir démarré. Que vérifies-tu ?");
  });

  it("asks every tool about the candidate's own experience with it", () => {
    const project = findBankQuestion("docker.your-project")!;
    expect(project.kind).toBe("experience");
    expect(bankQuestionText(project, "en", "formal")).toBe("Tell me about a project where you used Docker. What was your part, and what was the hardest?");
    expect(findBankQuestion("networking.your-project")).toBeUndefined(); // a topic, not a tool
  });
});

describe("register", () => {
  it("follows the interviewer's formality", () => {
    expect(registerOf({ formality: 5 })).toBe("formal");
    expect(registerOf({ formality: 3 })).toBe("formal");
    expect(registerOf({ formality: 2 })).toBe("casual");
    expect(inRegister("{Pouvez-vous|Peux-tu} expliquer {tech} ?", "casual")).toBe("Peux-tu expliquer {tech} ?");
    expect(fill(inRegister("J'aimerais {vous |t'}entendre sur {tech}.", "formal"), { tech: "Git" })).toBe("J'aimerais vous entendre sur Git.");
  });
});

describe("techsIn", () => {
  const ids = (text: string) => techsIn(text).map((t) => t.id);

  it("recognises technologies by their names and aliases, as whole words", () => {
    expect(ids("C")).toEqual(["c"]);
    expect(ids("C/C++")).toEqual(["c", "cpp"]);
    expect(ids("C#")).toEqual(["csharp"]);
    expect(ids("Java 17")).toEqual(["java"]);
    expect(ids("JavaScript")).toEqual(["javascript"]);
    expect(ids("Kubernetes (K8s)")).toEqual(["kubernetes"]);
    expect(ids("MariaDB")).toEqual(["sql"]);
    expect(ids("Docker Compose")).toEqual(["docker"]);
    expect(ids("CI/CD")).toEqual(["cicd"]);
    expect(ids("Spring")).toEqual(["spring"]);
  });

  it("does not see a technology in ordinary words", () => {
    expect(ids("Objective-C")).toEqual([]);
    expect(ids("go-to-market strategy")).toEqual([]);
    expect(ids("de mon point de vue")).toEqual([]);
    expect(ids("the rest of the team")).toEqual([]);
  });

  it("finds the technologies of a profile written in French or English", () => {
    expect(ids("développement système en C et programmation objet en C++, infrastructure web conteneurisée")).toEqual(["posix", "c", "oop", "cpp", "docker"]);
    expect(ids("pipex — a deep dive into UNIX mechanisms (C)")).toEqual(["posix", "c"]);
    expect(ids("Front-end (ReactJS) et back-end (NodeJS)")).toEqual(["react", "node"]);
  });
});

describe("pickTechnicalQuestions", () => {
  const stack = [
    { value: "Java", quote: "Java 17" },
    { value: "Spring Boot", quote: "Spring Boot" },
    { value: "Docker", quote: "Docker" },
  ];

  it("takes the offer's technologies in turn, with varied kinds and no repeat", () => {
    const picks = pickTechnicalQuestions({ stack, facts: [], count: 6, random: seeded() });
    expect(picks.map((p) => p.tech.id)).toEqual(["java", "spring", "docker", "java", "spring", "docker"]);
    expect(new Set(picks.map((p) => p.question.id)).size).toBe(6);
    expect(new Set(picks.map((p) => p.question.kind)).size).toBeGreaterThanOrEqual(4);
    expect(picks[0].origin).toEqual({ kind: "stack", value: "Java", quote: "Java 17" });
    // The candidate never used these: no "tell me about your project with Java".
    expect(picks.some((p) => p.question.kind === "experience")).toBe(false);
  });

  it("adds one question on a technology of the profile that the offer does not mention", () => {
    const facts = ["pipex — UNIX pipes and processes (C)", "push_swap — sorting on a stack (C)"];
    const picks = pickTechnicalQuestions({ stack, facts, count: 6, random: seeded() });
    const last = picks[picks.length - 1];
    expect(last.tech.id).toBe("c");
    expect(last.question.kind).toBe("experience");
    expect(last.origin).toEqual({ kind: "profile", fact: "pipex — UNIX pipes and processes (C)" });
  });

  it("asks about the profile only when the offer names no known technology", () => {
    const picks = pickTechnicalQuestions({ stack: [{ value: "SAP ABAP", quote: "SAP" }], facts: ["Docker and Kubernetes labs"], count: 4, random: seeded() });
    expect(picks.map((p) => p.tech.id)).toEqual(["docker", "kubernetes", "docker", "kubernetes"]);
    expect(pickTechnicalQuestions({ stack: [{ value: "SAP ABAP", quote: "SAP" }], facts: [], count: 4 })).toEqual([]);
    expect(pickTechnicalQuestions({ stack, facts: [], count: 0 })).toEqual([]);
  });

  it("prefers questions not asked before, and is repeatable with the same random source", () => {
    const first = pickTechnicalQuestions({ stack, facts: [], count: 6, random: seeded(7) });
    const again = pickTechnicalQuestions({ stack, facts: [], count: 6, random: seeded(7) });
    expect(again.map((p) => p.question.id)).toEqual(first.map((p) => p.question.id));
    const next = pickTechnicalQuestions({ stack, facts: [], count: 6, askedBefore: new Set(first.map((p) => p.question.id)), random: seeded(7) });
    for (const p of next) expect(first.map((f) => f.question.id)).not.toContain(p.question.id);
  });
});
