Design a UI prototype for **NextRound**, a coach that helps junior tech job seekers prepare for job interviews.

This is a **design-only prototype**: no backend, no Supabase, no authentication, no AI calls, no network requests. All data comes from one typed mock file. The components will later be ported into a separate Next.js app, so they must stay purely presentational.

## The product
Users build a profile once (imported from GitHub, Codewars, a CV PDF and a short chat), save links to job offers, and for each offer see how well they match, get a tailored CV and cover letter, and **practise an HR + technical interview on that company's tech stack** (the main feature).

Core promise: **the AI never invents anything.** Every AI-generated sentence is linked to a validated profile fact, and every item extracted from an offer is shown with the verbatim quote it came from. Anything unsupported is flagged in red, never hidden. Make this "every claim has a source" idea visible everywhere.

## Feel
- A calm, encouraging **coach**, not an admin tool. Professional, clean, generous whitespace, warm microcopy (e.g. "Nice — this answer is backed by 3 facts from your profile").
- Light and dark mode, with a toggle in the header.
- Laptop first (1280–1440px), still readable on mobile (single column, no horizontal scroll).
- React + TypeScript + Tailwind + shadcn/ui + lucide-react icons. Use shadcn components (Card, Badge, Button, Tabs, Dialog, Sheet, Progress, Textarea, Tooltip, Accordion, Skeleton).
- One calm accent color (teal or indigo), plus semantic green (covered / supported), red (gap / unsupported) and amber (to improve). **Never rely on color alone**: always pair it with an icon and a text label.

## Shared "source" components (reuse them everywhere)
- **FactChip**: small pill with a fact's short text and its source icon (GitHub, Codewars, CV, Chat, Manual). Hover or click shows the full fact.
- **QuoteChip**: quote icon; hover shows the verbatim quote from the offer page.
- **Unsupported marker**: red underline + "Unsupported" label + tooltip "Not in your profile – add it as a fact if true, otherwise don't say it".
- **SourcedText**: renders a list of sentences, each followed by its FactChips, or by the Unsupported marker when it has no fact.

## Screens, by priority

### 1. Interview session (`/interview/:id`), the most important screen
- Header: offer title + company, mode (Text / Voice), "Question 3 of 10" with a progress bar, a soft 2-minute timer (turns amber after 2:00, never blocks).
- 10 questions: 4 HR, 4 Technical (from the offer's stack, junior level, answerable orally), 2 Gap (from requirements the user doesn't cover).
- Question card: group badge (HR / Technical / Gap), the question in large type, and a "Why this question" line (e.g. "From the offer's stack" + QuoteChip, or "From a gap: Docker").
- Answer: Textarea with a character counter (max 3000). Voice mode: large mic button, "Read the question aloud" button, live transcript.
- A collapsed "Show suggested answer" section (hidden by default), rendered with SourcedText.
- After submitting, a feedback panel:
  - criteria rows: STAR structure, Relevance, Evidence, Honesty (gap questions only). Each is "Good" (green check) or "To improve" (amber), plus one sentence;
  - Evidence list: each claim is an exact quote from the user's answer, followed by a FactChip (supported) or the red "Not in your profile" flag;
  - gap questions: a "Learning plan" with 3 concrete steps;
  - "Improved answer", built only from facts (SourcedText) with a Copy button;
  - buttons: "Retry this question", "Next question".
- End-of-interview summary (`/interview/:id/summary`): strengths, top 3 things to work on, questions to retry. Retrying shows the previous answer next to the new one (two columns).

### 2. Offer view (`/offers/:id`)
- Header: title, company, location, contract, language, source-site badge (Indeed, Actiris, Le Forem, LinkedIn, company site), match score ring ("7 of 10 requirements covered"), status badge.
- Tech stack chips, each with a QuoteChip.
- Main column: the offer text with requirement phrases highlighted inline, green (covered) or red (gap), with an icon. Clicking a highlight opens a Sheet: the requirement, must/nice, category, the verbatim quote, and the proving FactChips, or "Gap — nothing in your profile proves this yet" + "Add a fact" button.
- Side column: requirements grouped Must / Nice, with filters All / Covered / Gaps.
- "Apply" card:
  - verified contact details (email, phone, contact person, application link), each with a QuoteChip. Empty state: "No contact details in this offer". Never show a contact that is not in the offer;
  - "Open the original posting" button;
  - tailored CV and cover letter: Copy and Download buttons, version selector;
  - "I applied" button → confirmation dialog → status becomes Applied with the date. No automatic applying.
- Primary call to action: "Practise an interview for this offer".

### 3. Profile (`/profile`)
- First-run state: a prominent "Import from GitHub" card ("Fills your profile in seconds"), then a Codewars username field, a CV / LinkedIn PDF dropzone (PDF only, max 5 MB), "Answer 5 quick questions" (chat), and "Add a fact manually" (e.g. LeetCode).
- Review queue of proposed facts: each card shows the type, the text, a source badge, and the evidence (repo link for GitHub, or the quote from the CV or chat). Actions: Validate / Edit / Reject. Bulk "Validate all from GitHub".
- Validated facts grouped by type: Experience, Projects, Skills, Education, Languages, Achievements.
- Onboarding chat: 5 questions (target roles, stack, proudest projects, languages, availability) as chat bubbles, then the proposed facts, each with a quote from the user's answers.

### 4. Dashboard (`/dashboard`)
- "Add an offer" bar: paste a URL + "Scan" button, a scanning state, and a fallback "This page blocks access — paste the offer text instead".
- Kanban pipeline: Saved → Applied → Interview → Offer / Rejected.
- Card: company, role, source-site badge, match score, number of interviews practised, applied date, and a follow-up badge 7 days after applying ("Follow up today").

### 5. CV and cover letter (`/offers/:id/cv`)
- Printable CV page (print-friendly styles) built with SourcedText; any unsupported sentence is shown in red as "Unsupported". Gaps are worded honestly ("currently learning Docker").
- Side panel: requirements covered, gaps, relevant facts not used. Version history.
- Cover letter with a Copy button.

### 6. Landing (`/`) and Settings (`/settings`)
- Landing: the name NextRound, the pitch "Your coach to reach the next interview round — without inventing anything.", "Continue with GitHub" (primary) and "Continue with Google" buttons, and 3 short value props: interview practice on the company's stack / every claim traced to your profile / bring your own AI, free models welcome.
- Settings:
  - AI provider presets (OpenRouter, OpenAI, Mistral, Groq), a model field or select, and an API key input that only shows a masked value once saved (e.g. "sk-…a3F9");
  - a "Test connection" button with success and error states;
  - a Voice section: optional ElevenLabs key, otherwise "Browser voice (free)".
- Banner shown on AI features when no key is set: "Add your AI key in Settings to use AI features".
- App shell: left sidebar (Dashboard, Offers, Profile, Interviews, Settings) and a user avatar menu.
- Every screen has empty, loading (skeleton) and error states, with short, human, generic error copy.

## Code constraints (important: the components will be ported)
- Presentational components only: data comes in through typed props, actions go out through callbacks (`onSubmitAnswer`, `onValidateFact`, `onScanUrl`…). No fetch, no global store, no business logic inside components.
- Put all types in `src/types.ts` and all fake data in `src/mock-data.ts`. Use exactly these types:

```ts
export type FactType = 'experience' | 'skill' | 'project' | 'education' | 'language' | 'achievement';
export type FactSource = 'github' | 'codewars' | 'cv_upload' | 'chat' | 'manual';
export interface ProfileFact { id: string; type: FactType; text: string; source: FactSource; sourceRef?: string; quote?: string; validated: boolean }

export type SourceSite = 'indeed' | 'actiris' | 'forem' | 'linkedin' | 'company' | 'other';
export type OfferStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
export interface Quoted { value: string; quote: string }
export interface Offer {
  id: string; sourceUrl: string; sourceSite: SourceSite; title: string; company: string;
  location?: string; contract?: string; language?: string; rawText: string; stack: Quoted[];
  status: OfferStatus; appliedAt?: string; matchScore: number /* 0..1 */; interviewsCount: number;
}
export interface Requirement { id: string; offerId: string; kind: 'must' | 'nice'; category: 'tech' | 'soft' | 'language'; text: string; quote: string; factIds: string[] /* empty = gap */ }
export interface OfferContact { id: string; offerId: string; kind: 'email' | 'phone' | 'person' | 'apply_url'; value: string; quote: string }

export interface SourcedSentence { text: string; factIds: string[] /* empty = Unsupported */ }
export interface Question { id: string; group: 'hr' | 'technical' | 'gap'; text: string; source: string; suggestedAnswer: SourcedSentence[] }
export type Rating = 'good' | 'to_improve';
export interface Criterion { rating: Rating; comment: string }
export interface Claim { quote: string; factId?: string /* undefined = not in profile */ }
export interface Feedback {
  star: Criterion; relevance: Criterion; evidence: Criterion & { claims: Claim[] };
  honesty?: Criterion & { learningPlan: string[] }; improvedAnswer: SourcedSentence[];
}
export interface Answer { id: string; questionId: string; answer: string; feedback?: Feedback; createdAt: string }
export interface Interview { id: string; offerId: string; mode: 'text' | 'voice'; createdAt: string; questions: Question[]; answers: Answer[] }
export interface TailoredDoc { id: string; offerId: string; kind: 'cv' | 'cover_letter'; version: number; sentences: SourcedSentence[]; createdAt: string }
```

- The mock data is placeholder content for the design only: a fictional junior developer, 3 offers (one in French from Actiris, one in English from LinkedIn, one from a company site), and one interview in progress whose feedback includes at least one unsupported claim.
- Do not add authentication, a database or Supabase.

Start with the Interview session screen and the shared source components, then the Offer view, Profile, Dashboard, CV, Landing and Settings.
