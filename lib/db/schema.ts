// Database schema (Drizzle ORM -> Postgres on Neon).
//
// Isolation rule: EVERY table has a user_id column (the Clerk user id), including
// child tables such as requirements or answers. Every query in lib/data/ filters on it,
// with the user id taken from the server-side session, never from the client.

import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { CvDocument, Feedback, Quoted, SourcedSentence } from "@/lib/types";

export const factType = pgEnum("fact_type", ["experience", "skill", "project", "education", "language", "achievement"]);
export const factSource = pgEnum("fact_source", ["github", "codewars", "cv_upload", "chat", "manual"]);
export const sourceSite = pgEnum("source_site", ["indeed", "actiris", "forem", "linkedin", "company", "other"]);
export const offerStatus = pgEnum("offer_status", ["saved", "applied", "interview", "offer", "rejected"]);
export const requirementKind = pgEnum("requirement_kind", ["must", "nice"]);
export const requirementCategory = pgEnum("requirement_category", ["tech", "soft", "language"]);
export const contactKind = pgEnum("contact_kind", ["email", "phone", "person", "apply_url"]);
export const interviewMode = pgEnum("interview_mode", ["text", "voice"]);
export const questionGroup = pgEnum("question_group", ["hr", "technical", "gap"]);
export const documentKind = pgEnum("document_kind", ["cv", "cover_letter"]);

const id = () => uuid("id").primaryKey().defaultRandom();
const userId = () => text("user_id").notNull();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// ---------- Phase 3: profile (source of truth) ----------

export const profileFacts = pgTable(
  "profile_facts",
  {
    id: id(),
    userId: userId(),
    type: factType("type").notNull(),
    text: text("text").notNull(),
    source: factSource("source").notNull(),
    sourceRef: text("source_ref"), // e.g. the GitHub repo URL
    quote: text("quote"), // verbatim evidence from the CV text or the chat answers
    validated: boolean("validated").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("profile_facts_user_idx").on(t.userId)],
);

export const sources = pgTable(
  "sources",
  {
    id: id(),
    userId: userId(),
    kind: text("kind").notNull(), // github | codewars | cv_upload | chat
    ref: text("ref").notNull(),
    importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
    // CVs only: the text read from the PDF (the file itself never reaches the server), and the CV
    // as a document, every string checked against that text (lib/profile/cv-document.ts).
    text: text("text"),
    document: jsonb("document").$type<CvDocument>(),
  },
  (t) => [index("sources_user_idx").on(t.userId)],
);

// ---------- Phase 4: saved offers ----------

export const offers = pgTable(
  "offers",
  {
    id: id(),
    userId: userId(),
    sourceUrl: text("source_url"),
    sourceSite: sourceSite("source_site").notNull().default("other"),
    title: text("title"),
    company: text("company"),
    location: text("location"),
    contract: text("contract"),
    language: text("language"),
    rawText: text("raw_text").notNull(),
    stack: jsonb("stack").$type<Quoted[]>().notNull().default([]),
    status: offerStatus("status").notNull().default("saved"),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    scannedAt: timestamp("scanned_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("offers_user_idx").on(t.userId)],
);

export const requirements = pgTable(
  "requirements",
  {
    id: id(),
    userId: userId(),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "cascade" }),
    kind: requirementKind("kind").notNull(),
    category: requirementCategory("category").notNull(),
    text: text("text").notNull(),
    quote: text("quote").notNull(),
    factIds: jsonb("fact_ids").$type<string[]>().notNull().default([]), // checked by code; empty = gap
  },
  (t) => [index("requirements_user_idx").on(t.userId), index("requirements_offer_idx").on(t.offerId)],
);

export const offerContacts = pgTable(
  "offer_contacts",
  {
    id: id(),
    userId: userId(),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "cascade" }),
    kind: contactKind("kind").notNull(),
    value: text("value").notNull(),
    quote: text("quote").notNull(),
  },
  (t) => [index("offer_contacts_user_idx").on(t.userId)],
);

// ---------- Phase 5: interview simulation ----------

export const interviews = pgTable(
  "interviews",
  {
    id: id(),
    userId: userId(),
    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "cascade" }),
    mode: interviewMode("mode").notNull().default("text"),
    // Who asks the questions: an id of the catalog in lib/interviewers/ (code data, so no foreign key).
    interviewerId: text("interviewer_id").notNull().default("marie"),
    // Session settings chosen before the call (lib/interview/session.ts): the whole interview runs in
    // `language`, and `focus` says which questions it asks (general, technical or both).
    language: text("language").notNull().default("en"),
    focus: text("focus").notNull().default("both"),
    createdAt: createdAt(),
  },
  (t) => [index("interviews_user_idx").on(t.userId)],
);

export const questions = pgTable(
  "questions",
  {
    id: id(),
    userId: userId(),
    interviewId: uuid("interview_id")
      .notNull()
      .references(() => interviews.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    group: questionGroup("group").notNull(),
    type: text("type"), // finer label (introduction, motivation…), see lib/interview/question-types.ts
    text: text("text").notNull(),
    source: text("source").notNull(), // why this question was asked (offer quote, gap…)
    suggestedAnswer: jsonb("suggested_answer").$type<SourcedSentence[]>().notNull().default([]),
    // Technical questions drawn from the question bank (lib/interview/bank): their id, to find their
    // model answer and technology again, and to vary the questions from one interview to the next.
    bankId: text("bank_id"),
    // What the interviewer says before and after the question (lib/interviewers/flavor); null = nothing.
    intro: text("intro"),
    outro: text("outro"),
  },
  (t) => [index("questions_user_idx").on(t.userId)],
);

export const answers = pgTable(
  "answers",
  {
    id: id(),
    userId: userId(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    answer: text("answer").notNull(),
    feedback: jsonb("feedback").$type<Feedback>(),
    createdAt: createdAt(),
  },
  (t) => [index("answers_user_idx").on(t.userId)],
);

// ---------- Phase 6: CV and cover letter (versioned) ----------

export const documents = pgTable(
  "documents",
  {
    id: id(),
    userId: userId(),
    offerId: uuid("offer_id").references(() => offers.id, { onDelete: "cascade" }), // null = base CV
    kind: documentKind("kind").notNull(),
    version: integer("version").notNull(),
    sentences: jsonb("sentences").$type<SourcedSentence[]>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("documents_user_idx").on(t.userId)],
);

// ---------- Phase 2: bring your own AI ----------

export const aiSettings = pgTable("ai_settings", {
  userId: text("user_id").primaryKey(), // one row per user
  provider: text("provider").notNull(), // preset id (openrouter, openai, mistral, groq, custom)
  baseUrl: text("base_url").notNull(),
  model: text("model").notNull(),
  apiKeyEncrypted: text("api_key_encrypted"), // AES-256-GCM, never sent to the browser
  apiKeyLast4: text("api_key_last4"), // only for the masked display
  elevenlabsKeyEncrypted: text("elevenlabs_key_encrypted"),
  elevenlabsKeyLast4: text("elevenlabs_key_last4"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Daily counters for calls made with the INSTANCE keys (rate limit + daily cap). */
export const usageCounters = pgTable(
  "usage_counters",
  {
    userId: userId(),
    day: date("day").notNull(),
    kind: text("kind").notNull(), // llm | tts | scrape
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day, t.kind] })],
);
