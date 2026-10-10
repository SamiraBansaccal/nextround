// Visual-check fixtures, on the DISPOSABLE Neon branch that scripts/test/e2e.mjs creates and deletes: a test user
// signed up with email and password (enabled on that branch only, never on the live site), made the owner of that
// branch through a GitHub link with the id the run passes as OWNER_GITHUB_ID, and fictional sample data for it,
// so that every screen can be captured with realistic content. The live data is never touched.
//
// Usage (through scripts/test/e2e.mjs only): tsx --conditions=react-server tests/e2e/fixtures.mts seed

import { neon } from "@neondatabase/serverless";
import type { SourcedSentence, TailoredCv } from "@/lib/types";

// The run passes the branch's values (DATABASE_URL, NEON_AUTH_BASE_URL…); the other variables come from the env
// files. A variable already set wins over the files.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // No such file.
  }
}

export const E2E_EMAIL = "nextround-e2e@example.com";

/** Signs the test user up on the branch's Neon Auth (email and password are enabled there only). */
async function createTestUser(): Promise<string> {
  const response = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: process.env.E2E_ORIGIN! },
    body: JSON.stringify({ email: E2E_EMAIL, password: process.env.E2E_PASSWORD, name: "Alex Tester" }),
  });
  const body = (await response.json().catch(() => null)) as { user?: { id?: string } } | null;
  if (!response.ok || !body?.user?.id) throw new Error(`The test user could not be created (${response.status}).`);
  return body.user.id;
}

/** Makes the test user the owner of this branch only: a GitHub link whose id the run passes as OWNER_GITHUB_ID. */
async function linkTestGithubAccount(userId: string) {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`insert into neon_auth.account ("accountId", "providerId", "userId", "updatedAt") values (${process.env.E2E_GITHUB_ID!}, 'github', ${userId}, now())`;
}

const OFFER_TEXT = `Développeur·se Full Stack Junior (H/F) — Brussels Tech SRL
Lieu : Bruxelles. Contrat : CDI, temps plein.
Votre mission : développer et maintenir notre application web de réservation.
Profil recherché :
- Une première expérience avec React et TypeScript est indispensable.
- Connaissance de Node.js et des API REST.
- Une première expérience avec Docker est un atout.
- Bonne communication et esprit d'équipe.
- Français courant, anglais technique.
Pour postuler, envoyez votre CV à jobs@brusselstech.example avant le 30 octobre.`;

// A fictional CV: its text (as read from the PDF) and the document laid out from it.
const CV_TEXT = `Alex Tester
Développeur·se web junior
E-mail : alex.tester@example.com   Téléphone : 0470 00 00 00
EXPÉRIENCES
Bruxelles   Février 2025 – Juin 2025
Stagiaire développeuse front-end chez WebAgency SPRL, Bruxelles (février 2025 - juin 2025)
Intégration de maquettes en React et TypeScript.
Correction de bugs sur un portail client.
FORMATIONS
Bruxelles   2023 - 2025
42 Belgium, cursus de développement logiciel (2023 - 2025)
Pédagogie par projet, peer learning.
LANGUES
Français (langue maternelle), anglais (B2)
COMPÉTENCES
React, TypeScript, Node.js, Git`;

async function seed() {
  const userId = await createTestUser();
  await linkTestGithubAccount(userId);

  const { createFact } = await import("@/lib/data/facts");
  const { addSource, cvRef } = await import("@/lib/data/sources");
  const { createOffer, setOfferStatus } = await import("@/lib/data/offers");
  const { createInterview, saveAnswer, getInterview } = await import("@/lib/data/interviews");
  const { saveDocumentVersion, setDocumentKept } = await import("@/lib/data/documents");
  const { documentSentences } = await import("@/lib/documents/render");
  const { verifyExtraction } = await import("@/lib/offers/extract");
  const { cvDocumentSchema, verifyCvDocument } = await import("@/lib/profile/cv-document");

  const { document } = verifyCvDocument(
    cvDocumentSchema.parse({
      language: "fr",
      name: "Alex Tester",
      headline: "Développeur·se web junior",
      contacts: [
        { kind: "email", label: "E-mail", value: "alex.tester@example.com" },
        { kind: "phone", label: "Téléphone", value: "0470 00 00 00" },
      ],
      experiences: [
        {
          title: "Stagiaire développeuse front-end",
          organisation: "WebAgency SPRL",
          location: "Bruxelles",
          period: "Février 2025 – Juin 2025",
          details: ["Intégration de maquettes en React et TypeScript.", "Correction de bugs sur un portail client."],
        },
      ],
      education: [{ title: "cursus de développement logiciel", organisation: "42 Belgium", location: "Bruxelles", period: "2023 - 2025", details: ["Pédagogie par projet, peer learning."] }],
      languages: [
        { name: "Français", level: "langue maternelle" },
        { name: "anglais", level: "B2" },
      ],
      skills: ["React", "TypeScript", "Node.js", "Git"],
    }),
    CV_TEXT,
  );
  const cv = await addSource(userId, "cv_upload", "cv-frontend-2025.pdf", { text: CV_TEXT, document });
  const weather = await createFact(userId, { type: "project", text: "weather-app — weather dashboard in React and TypeScript fetching a REST API", source: "github", sourceRef: "https://github.com/example/weather-app", validated: true });
  const node = await createFact(userId, { type: "skill", text: "Node.js and Express: built a small REST API for a school project", source: "manual", validated: true });
  const lang = await createFact(userId, { type: "language", text: "French (native), English (B2)", source: "cv_upload", sourceRef: cvRef(cv.id), quote: "Français (langue maternelle), anglais (B2)", validated: true });
  await createFact(userId, { type: "education", text: "42 Belgium, software development curriculum (2023 - 2025)", source: "cv_upload", sourceRef: cvRef(cv.id), quote: "42 Belgium, cursus de développement logiciel (2023 - 2025)", validated: true });
  // The same training written a little differently by hand: folded under the line above, with "Merge".
  await createFact(userId, { type: "education", text: "42 Belgium software development curriculum, 2023 - 2025", source: "manual", validated: true });
  await createFact(userId, { type: "experience", text: "Front-end intern at WebAgency SPRL, Brussels (February 2025 - June 2025)", source: "cv_upload", sourceRef: cvRef(cv.id), quote: "Stagiaire développeuse front-end chez WebAgency SPRL, Bruxelles (février 2025 - juin 2025)", validated: false });

  const aliases = new Map([["F1", weather.id], ["F2", node.id], ["F3", lang.id]]);
  const extraction = verifyExtraction(
    {
      title: "Développeur·se Full Stack Junior (H/F)",
      company: "Brussels Tech SRL",
      location: "Bruxelles",
      contract: "CDI, temps plein",
      language: "fr",
      stack: [{ value: "React", quote: "React et TypeScript" }, { value: "TypeScript", quote: "React et TypeScript" }, { value: "Node.js", quote: "Node.js et des API REST" }, { value: "Docker", quote: "Une première expérience avec Docker est un atout." }],
      requirements: [
        { kind: "must", category: "tech", text: "First experience with React and TypeScript", quote: "Une première expérience avec React et TypeScript est indispensable.", fact_ids: ["F1"] },
        { kind: "must", category: "tech", text: "Node.js and REST APIs", quote: "Connaissance de Node.js et des API REST.", fact_ids: ["F2"] },
        { kind: "nice", category: "tech", text: "First experience with Docker", quote: "Une première expérience avec Docker est un atout.", fact_ids: [] },
        { kind: "must", category: "soft", text: "Communication and team spirit", quote: "Bonne communication et esprit d'équipe.", fact_ids: [] },
        { kind: "must", category: "language", text: "Fluent French, technical English", quote: "Français courant, anglais technique.", fact_ids: ["F3"] },
      ],
      contacts: [{ kind: "email", value: "jobs@brusselstech.example", quote: "envoyez votre CV à jobs@brusselstech.example" }],
    },
    OFFER_TEXT,
    aliases,
    new Set(aliases.values()),
  );
  const offer = await createOffer(userId, { sourceUrl: "https://www.example.com/jobs/full-stack-junior", sourceSite: "company", rawText: OFFER_TEXT, extraction });

  const interviewId = await createInterview(userId, offer.id, [
    { group: "hr", type: "introduction", text: "Pouvez-vous vous présenter brièvement ?", source: "Standard HR question", suggestedAnswer: [{ text: "J'ai développé weather-app, un tableau de bord météo en React et TypeScript.", factIds: [weather.id] }] },
    { group: "hr", type: "motivation", text: "Pourquoi souhaitez-vous rejoindre Brussels Tech SRL ?", source: "Standard HR question", suggestedAnswer: [] },
    { group: "technical", type: "technical", text: "Comment gérez-vous l'état dans une application React ?", source: "From the offer's stack: React — “React et TypeScript”", suggestedAnswer: [{ text: "Dans weather-app, j'utilise useState pour l'état local.", factIds: [weather.id] }] },
    { group: "technical", type: "technical", text: "Comment avez-vous structuré votre API REST avec Node.js ?", source: "From the offer's stack: Node.js — “Node.js et des API REST”", suggestedAnswer: [{ text: "J'ai construit une petite API REST avec Express pour un projet d'école.", factIds: [node.id] }] },
    { group: "gap", type: "skill_gap", text: "Avez-vous déjà travaillé avec Docker ?", source: "From a gap in your profile: First experience with Docker — “Une première expérience avec Docker est un atout.”", suggestedAnswer: [] },
  ], { interviewerId: "mr-burns", language: "fr", focus: "both" }); // no picture yet (placeholder), a parody notice, a French session
  const interview = await getInterview(userId, interviewId);
  const technical = interview!.questions.find((q) => q.group === "technical")!;
  await saveAnswer(userId, technical.id, "Dans mon projet weather-app en React et TypeScript, j'utilise useState pour l'état local. J'ai aussi utilisé Redux pendant 2 ans en entreprise.", {
    star: { rating: "to_improve", comment: "Ajoutez le résultat obtenu grâce à votre choix." },
    relevance: { rating: "good", comment: "Vous répondez à la question et citez React, au cœur de l'offre." },
    evidence: {
      rating: "to_improve",
      comment: "Une affirmation n'est pas dans votre profil.",
      claims: [{ quote: "Dans mon projet weather-app en React et TypeScript", factId: weather.id }, { quote: "J'ai aussi utilisé Redux pendant 2 ans en entreprise" }],
    },
    improvedAnswer: [
      { text: "Dans weather-app, en React et TypeScript, je gère l'état local avec useState.", factIds: [weather.id] },
      { text: "Je découvre encore les bibliothèques d'état globales.", factIds: [] },
    ],
  });

  const cvSentences: (SourcedSentence & { section: string })[] = [
    { section: "Projets", text: "weather-app : tableau de bord météo en React et TypeScript qui consomme une API REST.", factIds: [weather.id] },
    { section: "Compétences", text: "Node.js et Express : une API REST pour un projet d'école.", factIds: [node.id] },
    { section: "Langues", text: "Français (langue maternelle), anglais (B2).", factIds: [lang.id] },
    { section: "Compétences", text: "Docker en production.", factIds: [] }, // deliberately unsupported
  ];
  await saveDocumentVersion(userId, offer.id, "cv", cvSentences);
  await saveDocumentVersion(userId, offer.id, "cover_letter", [
    { text: "Madame, Monsieur, je souhaite rejoindre Brussels Tech SRL comme développeur·se full stack junior.", factIds: [] },
    { text: "J'ai développé weather-app en React et TypeScript, qui consomme une API REST.", factIds: [weather.id] },
  ]);

  // The same offer, in English, written with the tech-CV structure, and added to the profile.
  const tailored: TailoredCv = {
    kind: "tailored_cv",
    language: "en",
    headline: "Junior Full Stack Developer",
    summary: [
      { text: "Junior developer with a React and TypeScript project and a small Node.js API.", factIds: [weather.id, node.id] },
      { text: "Five years of production Kubernetes.", factIds: [] }, // deliberately unsupported
    ],
    skills: [
      { category: "Front end", items: [{ name: "React", factIds: [weather.id] }, { name: "TypeScript", factIds: [weather.id] }] },
      { category: "Back end", items: [{ name: "Node.js", factIds: [node.id] }, { name: "Express", factIds: [node.id] }] },
    ],
    projects: [
      {
        title: "weather-app",
        context: "Personal project · solo",
        link: null,
        tags: [{ name: "React", factIds: [weather.id] }, { name: "TypeScript", factIds: [weather.id] }],
        bullets: [{ text: "Weather dashboard that consumes a REST API.", factIds: [weather.id] }],
        factIds: [weather.id],
        aiAssisted: false,
      },
    ],
    moreProjects: [],
    education: [],
    experience: [],
    languages: [
      { name: "French", level: "native", factIds: [lang.id] },
      { name: "English", level: "B2", factIds: [lang.id] },
    ],
  };
  const tailoredCv = await saveDocumentVersion(userId, offer.id, "cv", documentSentences(tailored), { language: "en", content: tailored, title: "Full Stack Junior · Brussels Tech SRL (EN)" });
  await setDocumentKept(userId, tailoredCv.id, true);

  // Two more offers so that the pipeline tabs have content.
  const second = await createOffer(userId, { sourceUrl: null, sourceSite: "linkedin", rawText: OFFER_TEXT, extraction: { ...extraction, title: "Junior Front-end Developer", company: "Example Studio" } });
  await setOfferStatus(userId, second.id, "applied");
  const third = await createOffer(userId, { sourceUrl: null, sourceSite: "actiris", rawText: OFFER_TEXT, extraction: { ...extraction, title: "Développeur web junior", company: "Exemple ASBL" } });
  await setOfferStatus(userId, third.id, "interview");

  console.log(JSON.stringify({ userId, offerId: offer.id, interviewId, tailoredCvId: tailoredCv.id }));
}

if (process.argv[2] === "seed") await seed();
else throw new Error("usage: seed (the run deletes the whole branch afterwards)");
