// Visual-check fixtures: a dedicated Clerk TEST user ("+clerk_test" address of the dev instance)
// and fictional sample data for it, so that every screen can be captured with realistic content.
// Run through scripts/e2e.mjs, which ALWAYS calls cleanup at the end. Never touches other users:
// every table has a user_id, so cleanup deletes exactly this user's rows.
//
// Usage: tsx --conditions=react-server tests/e2e/fixtures.mts seed|cleanup

process.loadEnvFile(".env");

import { createClerkClient } from "@clerk/backend";
import type { CvSentence } from "@/lib/documents/generate";

export const E2E_EMAIL = "nextround-e2e+clerk_test@example.com";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function findUser() {
  const { data } = await clerk.users.getUserList({ emailAddress: [E2E_EMAIL] });
  return data[0] ?? null;
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
  const user = (await findUser()) ?? (await clerk.users.createUser({ emailAddress: [E2E_EMAIL], firstName: "Alex", lastName: "Tester", skipPasswordRequirement: true }));
  const userId = user.id;
  await cleanupData(userId); // start from a clean slate

  const { createFact } = await import("@/lib/data/facts");
  const { addSource, cvRef } = await import("@/lib/data/sources");
  const { createOffer, setOfferStatus } = await import("@/lib/data/offers");
  const { createInterview, saveAnswer, getInterview } = await import("@/lib/data/interviews");
  const { saveDocumentVersion } = await import("@/lib/data/documents");
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

  const cvSentences: CvSentence[] = [
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

  // Two more offers so that the pipeline tabs have content.
  const second = await createOffer(userId, { sourceUrl: null, sourceSite: "linkedin", rawText: OFFER_TEXT, extraction: { ...extraction, title: "Junior Front-end Developer", company: "Example Studio" } });
  await setOfferStatus(userId, second.id, "applied");
  const third = await createOffer(userId, { sourceUrl: null, sourceSite: "actiris", rawText: OFFER_TEXT, extraction: { ...extraction, title: "Développeur web junior", company: "Exemple ASBL" } });
  await setOfferStatus(userId, third.id, "interview");

  console.log(JSON.stringify({ userId, offerId: offer.id, interviewId }));
}

async function cleanupData(userId: string) {
  const { getDb } = await import("@/lib/db");
  const schema = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const db = getDb();
  // Children first is not required (cascades), but every table is cleared explicitly by user_id.
  for (const table of [schema.answers, schema.questions, schema.interviews, schema.documents, schema.offerContacts, schema.requirements, schema.offers, schema.profileFacts, schema.sources, schema.aiSettings, schema.usageCounters]) {
    await db.delete(table).where(eq(table.userId, userId));
  }
}

async function cleanup() {
  const user = await findUser();
  if (!user) return console.log("no e2e user");
  await cleanupData(user.id);
  await clerk.users.deleteUser(user.id);
  console.log(`cleaned: ${user.id} (data and Clerk user deleted)`);
}

const command = process.argv[2];
if (command === "seed") await seed();
else if (command === "cleanup") await cleanup();
else throw new Error("usage: seed | cleanup");
