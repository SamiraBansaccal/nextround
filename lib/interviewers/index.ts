import { CATEGORIES } from "./categories";
import { anime } from "./catalog/anime";
import { archetypes } from "./catalog/archetypes";
import { business } from "./catalog/business";
import { cartoons } from "./catalog/cartoons";
import { classic } from "./catalog/classic";
import { film } from "./catalog/film";
import { music } from "./catalog/music";
import { politics } from "./catalog/politics";
import { simpsons } from "./catalog/simpsons";
import type { Interviewer, InterviewerCategory } from "./types";

// The interviewer catalog. Adding a character = adding an entry to one of the catalog files; adding a
// category = one line in categories.ts plus a catalog file imported here. No component changes.

export const INTERVIEWERS: Interviewer[] = [...classic, ...archetypes, ...politics, ...business, ...film, ...music, ...simpsons, ...cartoons, ...anime];

export const DEFAULT_INTERVIEWER_ID = "marie";

const byId = new Map(INTERVIEWERS.map((i) => [i.id, i]));

export function findInterviewer(id: string | null | undefined): Interviewer | null {
  return (id && byId.get(id)) || null;
}

/** The interviewer of a stored interview; falls back to the default if the id left the catalog. */
export function getInterviewer(id: string | null | undefined): Interviewer {
  return findInterviewer(id) ?? byId.get(DEFAULT_INTERVIEWER_ID)!;
}

export function listCategories(): InterviewerCategory[] {
  return CATEGORIES;
}

export function interviewersIn(categoryId: string): Interviewer[] {
  return INTERVIEWERS.filter((i) => i.categoryId === categoryId);
}

export type { Interviewer, InterviewerCategory } from "./types";
