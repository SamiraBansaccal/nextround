// Domain value types shared by the server logic and the UI. They have exactly the shapes given to
// the UI prototype (Lovable, see docs/prompts/lovable-prompt.md). Entity types (offers, facts,
// interviews…) come from the database schema instead: see lib/data/*.

export type FactType = "experience" | "skill" | "project" | "education" | "language" | "achievement";
export type FactSource = "github" | "codewars" | "cv_upload" | "chat" | "manual";

export type SourceSite = "indeed" | "actiris" | "forem" | "linkedin" | "company" | "other";
export type OfferStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

/** An item extracted from an offer, with the verbatim quote that proves it. */
export interface Quoted {
  value: string;
  quote: string;
}

/** A generated sentence and the validated profile facts that support it. Empty factIds = "Unsupported". */
export interface SourcedSentence {
  text: string;
  factIds: string[];
}

export type QuestionGroup = "hr" | "technical" | "gap";
export type Rating = "good" | "to_improve";

export interface Criterion {
  rating: Rating;
  comment: string;
}

/** A claim found in a practice answer: an exact quote from the answer, mapped to a fact (or not). */
export interface Claim {
  quote: string;
  factId?: string; // undefined = "Not in your profile"
}

export interface Feedback {
  star: Criterion;
  relevance: Criterion;
  evidence: Criterion & { claims: Claim[] };
  honesty?: Criterion & { learningPlan: string[] };
  improvedAnswer: SourcedSentence[];
}
