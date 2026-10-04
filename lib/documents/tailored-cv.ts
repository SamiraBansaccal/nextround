import "server-only";
import { z } from "zod";
import { type AiContext, aiJson } from "@/lib/ai";
import { lenientArray } from "@/lib/ai/lenient";
import { canProve } from "@/lib/offers/coverage";
import { factAliases, type FactForPrompt } from "@/lib/ai/prompt-facts";
import type { DocumentLanguage, SourcedSentence, TailoredCv, TailoredEntry, TailoredItem } from "@/lib/types";
import { keepValidFactIds } from "@/lib/ai/verify";

// A CV written for ONE offer, with the structure of a tech CV: headline, summary, skills table, projects
// (tags and a few lines each), education, experience, languages. The profile holds everything the
// candidate did; this CV keeps only what serves the offer, and condenses the non-technical past into
// transferable skills. The AI selects and phrases; the code checks every item against the validated
// facts: a skill needs a fact that can prove a technology (never a vibe-coded project), an entry needs
// at least one fact, a link must come from the facts, and a line without facts is shown "Unsupported".

const sentence = z.object({ text: z.string().trim().min(1).max(400), fact_ids: z.array(z.string()).max(8).default([]) });
const item = z.object({ name: z.string().trim().min(1).max(80), fact_ids: z.array(z.string()).max(8).default([]) });
const entry = z.object({
  title: z.string().trim().min(1).max(140),
  context: z.string().trim().max(180).nullish(),
  link: z.string().trim().max(300).nullish(),
  fact_ids: z.array(z.string()).max(10).default([]),
  tags: lenientArray(item, 10).default([]),
  bullets: lenientArray(sentence, 5).default([]),
});

export const tailoredCvSchema = z.object({
  headline: z.string().trim().max(90).nullish(),
  summary: lenientArray(sentence, 5).default([]),
  skills: lenientArray(z.object({ category: z.string().trim().min(1).max(40), items: lenientArray(item, 14) }), 7).default([]),
  projects: lenientArray(entry, 5).default([]),
  more_projects: lenientArray(item, 12).default([]),
  education: lenientArray(entry, 6).default([]),
  experience: lenientArray(entry, 6).default([]),
  languages: lenientArray(item.extend({ level: z.string().trim().min(1).max(60) }), 6).default([]),
});

/** What the verification needs to know about each fact of the profile. */
export interface ProfileFact {
  id: string;
  validated: boolean;
  aiAssisted: boolean;
  sourceRef: string | null;
}

const sameUrl = (a: string | null | undefined, b: string) => !!a && a.replace(/\/+$/, "").toLowerCase() === b.replace(/\/+$/, "").toLowerCase();

/** Pure: aliases back to ids, then the rules above. */
export function verifyTailoredCv(
  raw: z.infer<typeof tailoredCvSchema>,
  aliasToId: ReadonlyMap<string, string>,
  facts: ReadonlyMap<string, ProfileFact>,
  language: DocumentLanguage,
  fallbackHeadline: string | null,
): TailoredCv {
  const validIds = new Set([...facts.values()].filter((f) => f.validated).map((f) => f.id));
  const ids = (aliases: readonly string[]) => keepValidFactIds(aliases.map((a) => aliasToId.get(a.trim()) ?? ""), validIds);
  const proveTech = (aliases: readonly string[]) => ids(aliases).filter((id) => canProve(facts.get(id), "tech"));
  const lines = (raw: readonly z.infer<typeof sentence>[]): SourcedSentence[] => raw.map((s) => ({ text: s.text, factIds: ids(s.fact_ids) }));
  const backed = (raw: readonly z.infer<typeof item>[]): TailoredItem[] =>
    raw.map((i) => ({ name: i.name, factIds: ids(i.fact_ids) })).filter((i) => i.factIds.length > 0);

  const toEntry = (raw: z.infer<typeof entry>, isProject: boolean): TailoredEntry | null => {
    const own = ids(raw.fact_ids);
    const bullets = lines(raw.bullets);
    const all = [...new Set([...own, ...bullets.flatMap((b) => b.factIds)])];
    if (all.length === 0) return null; // nothing in the profile proves this entry exists
    const aiAssisted = isProject && all.some((id) => facts.get(id)?.aiAssisted);
    return {
      title: raw.title,
      context: raw.context || null,
      link: raw.link && all.some((id) => sameUrl(facts.get(id)?.sourceRef, raw.link!)) ? raw.link : null,
      // A vibe-coded project claims no stack; otherwise each tag needs a fact that can prove a technology.
      tags: aiAssisted ? [] : raw.tags.map((t) => ({ name: t.name, factIds: proveTech(t.fact_ids) })).filter((t) => t.factIds.length > 0),
      bullets,
      factIds: own,
      aiAssisted,
    };
  };
  const entries = (raw: readonly z.infer<typeof entry>[], isProject: boolean) =>
    raw.map((e) => toEntry(e, isProject)).filter((e): e is TailoredEntry => e !== null);

  return {
    kind: "tailored_cv",
    language,
    headline: raw.headline || fallbackHeadline,
    summary: lines(raw.summary),
    skills: raw.skills
      .map((group) => ({
        category: group.category,
        items: group.items.map((i) => ({ name: i.name, factIds: proveTech(i.fact_ids) })).filter((i) => i.factIds.length > 0),
      }))
      .filter((group) => group.items.length > 0),
    projects: entries(raw.projects, true),
    moreProjects: backed(raw.more_projects),
    education: entries(raw.education, false),
    experience: entries(raw.experience, false),
    languages: raw.languages.map((l) => ({ name: l.name, level: l.level, factIds: ids(l.fact_ids) })).filter((l) => l.factIds.length > 0),
  };
}

export interface OfferForDocuments {
  title: string | null;
  company: string | null;
  stack: string[];
  requirements: { text: string; covered: boolean }[];
}

const LANGUAGE_NAME: Record<DocumentLanguage, string> = { en: "English", fr: "French" };

const SYSTEM = (language: DocumentLanguage) => `You write the CV of a junior tech candidate for ONE job offer, in ${LANGUAGE_NAME[language]}, whatever the language of the facts.
The candidate's profile holds EVERYTHING they did. Keep only what serves this offer, in this structure:
- "headline": the role sought, from the offer's title (e.g. "Junior DevOps Engineer").
- "summary": 3 to 5 sentences: who the candidate is for THIS role, the most relevant training and projects, at most one sentence on transferable strengths from an earlier career, what they are looking for.
- "skills": 3 to 6 categories (e.g. Infrastructure, Systems, Languages, Databases, Tooling), the most relevant to the offer first. Only technologies the facts prove.
- "projects": the 2 to 4 projects most relevant to the offer, each with "context" (school or event, solo or team, scope), "link" (only a repository link written in the facts), technology "tags", and 2 to 4 "bullets" on what was built and decided. Other projects go to "more_projects" as short one-line items.
- A project marked "built with AI assistance (vibe coding)" appears only as a side project showing interest in AI and creativity (hackathons): no technology tags for it, and its stack is never a skill.
- "education": technical trainings with 1 or 2 bullets; older or unrelated degrees in one entry each, without bullets.
- "experience": the non-technical past in a few lines, as transferable skills (explaining, deadlines, taking over quickly…): at most 2 bullets per job; group short similar jobs into one entry.
- "languages": each language with its level, as written in the facts.
Rules:
- Use ONLY the candidate facts. Every summary sentence, bullet, tag, skill, project, entry and language lists in "fact_ids" the F# ids of the facts it relies on.
- Never invent dates, numbers, employers, schools, degrees, technologies or levels. Never claim a requirement listed under GAPS.
- Short, concrete, active sentences. No first person in bullets.
Output format: {"headline": "...", "summary": [{"text": "...", "fact_ids": ["F1"]}], "skills": [{"category": "...", "items": [{"name": "Docker", "fact_ids": ["F2"]}]}], "projects": [{"title": "...", "context": "...", "link": null, "fact_ids": ["F3"], "tags": [{"name": "...", "fact_ids": ["F3"]}], "bullets": [{"text": "...", "fact_ids": ["F3"]}]}], "more_projects": [{"name": "...", "fact_ids": ["F4"]}], "education": [same as projects], "experience": [same as projects], "languages": [{"name": "English", "level": "B2", "fact_ids": ["F5"]}]}`;

export interface TailoredCvInput {
  offer: OfferForDocuments;
  facts: (FactForPrompt & ProfileFact)[];
  language: DocumentLanguage;
  /** A CV the candidate kept for a similar job: its selection and wording are reused where they fit. */
  base?: TailoredCv | null;
}

export async function generateTailoredCv(ctx: AiContext, input: TailoredCvInput): Promise<TailoredCv> {
  const validated = input.facts.filter((f) => f.validated);
  // Repository links are given with the facts, so the AI can only link to what the profile holds.
  const { aliasToId, listing } = factAliases(
    validated.map((f) => ({ ...f, text: f.sourceRef?.startsWith("http") ? `${f.text} (link: ${f.sourceRef})` : f.text })),
  );
  const { offer } = input;
  const raw = await aiJson(ctx, {
    schema: tailoredCvSchema,
    system: SYSTEM(input.language),
    user: `OFFER: ${offer.title ?? "(untitled)"} at ${offer.company ?? "(company not stated)"}
STACK: ${offer.stack.join(", ") || "(none listed)"}
REQUIREMENTS THE CANDIDATE COVERS:\n${offer.requirements.filter((r) => r.covered).map((r) => `- ${r.text}`).join("\n") || "(none)"}
GAPS (never claim these):\n${offer.requirements.filter((r) => !r.covered).map((r) => `- ${r.text}`).join("\n") || "(none)"}
${input.base ? `BASE CV (kept by the candidate for a similar job: reuse its selection and wording where they fit this offer, and check everything again against the facts):\n${JSON.stringify(baseForPrompt(input.base))}\n` : ""}CANDIDATE FACTS (validated):\n${listing || "(none)"}`,
  });
  return verifyTailoredCv(raw, aliasToId, new Map(input.facts.map((f) => [f.id, f])), input.language, offer.title);
}

/** A kept CV as the AI may read it: its text only (fact ids are this database's, not the prompt's aliases). */
function baseForPrompt(cv: TailoredCv) {
  const text = (lines: SourcedSentence[]) => lines.map((l) => l.text);
  const entryText = (e: TailoredEntry) => ({ title: e.title, context: e.context, tags: e.tags.map((t) => t.name), bullets: text(e.bullets) });
  return {
    headline: cv.headline,
    summary: text(cv.summary),
    skills: cv.skills.map((s) => ({ category: s.category, items: s.items.map((i) => i.name) })),
    projects: cv.projects.map(entryText),
    education: cv.education.map(entryText),
    experience: cv.experience.map(entryText),
  };
}
