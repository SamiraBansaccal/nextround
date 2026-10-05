import type { CvDocument, CvEntry } from "@/lib/types";

// The dates of a CV ("janvier 2025 - Juin 2025", "2023 à aujourd’hui", "January – June 2025", "03/2024")
// written one way, in the CV's own language: month names spelled out (lowercase in French), an en dash
// between two dates, "aujourd’hui" / "present" for an ongoing period.
//
// Nothing is ever added: a year stays a year (never "janvier 2024"), a year shared by two months stays
// shared ("January – June 2025", whatever the months), "03/2024" only becomes "mars 2024". A period that
// cannot be read with certainty ("Bruxelles, 2019", "depuis 2023", "été 2022") is left exactly as written,
// and so is a CV in another language than French or English. Applied when a CV is shown; what is stored
// stays as read from the CV. Pure (tests/profile/cv-dates.test.ts).

type Lang = "fr" | "en";

const MONTHS: Record<Lang, readonly string[]> = {
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const PRESENT: Record<Lang, string> = { fr: "aujourd’hui", en: "present" };

/** Accents and case removed, for matching only. */
const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Month names and their usual short forms, in both languages (a CV may mix them).
const MONTH_WORDS: [string, number][] = [
  ["janvier", 1], ["janv", 1], ["january", 1], ["jan", 1],
  ["fevrier", 2], ["fevr", 2], ["fev", 2], ["february", 2], ["feb", 2],
  ["mars", 3], ["march", 3], ["mar", 3],
  ["avril", 4], ["avr", 4], ["april", 4], ["apr", 4],
  ["mai", 5], ["may", 5],
  ["juin", 6], ["june", 6], ["jun", 6],
  ["juillet", 7], ["juil", 7], ["july", 7], ["jul", 7],
  ["aout", 8], ["august", 8], ["aug", 8],
  ["septembre", 9], ["sept", 9], ["september", 9], ["sep", 9],
  ["octobre", 10], ["october", 10], ["oct", 10],
  ["novembre", 11], ["november", 11], ["nov", 11],
  ["decembre", 12], ["december", 12], ["dec", 12],
];
const MONTH_BY_WORD = new Map(MONTH_WORDS);

const PRESENT_WORDS = new Set(["aujourd'hui", "aujourdhui", "a ce jour", "ce jour", "present", "now", "today", "current", "ongoing", "en cours", "actuel", "actuellement", "maintenant"]);

/** One end of a period. `month` without `year` only exists as the start of a shared-year range. */
type Point = { kind: "date"; month: number | null; year: number | null } | { kind: "present" };

function readPoint(raw: string): Point | null {
  const s = plain(raw).replace(/[’`]/g, "'").replace(/\s+/g, " ").trim();
  if (PRESENT_WORDS.has(s)) return { kind: "present" };
  let m = s.match(/^((?:19|20)\d{2})$/);
  if (m) return { kind: "date", month: null, year: Number(m[1]) };
  m = s.match(/^(0?[1-9]|1[0-2])\s*[/.]\s*((?:19|20)\d{2})$/);
  if (m) return { kind: "date", month: Number(m[1]), year: Number(m[2]) };
  m = s.match(/^([a-z]+)\.?(?:\s+((?:19|20)\d{2}))?$/);
  const month = m ? MONTH_BY_WORD.get(m[1]) : undefined;
  if (m && month) return { kind: "date", month, year: m[2] ? Number(m[2]) : null };
  return null;
}

function writePoint(point: Point, lang: Lang): string {
  if (point.kind === "present") return PRESENT[lang];
  const month = point.month ? MONTHS[lang][point.month - 1] : null;
  return [month, point.year].filter((x) => x !== null).join(" ");
}

// Between two dates: a dash of any kind (spaces optional), "à", "au", "jusqu'à", "to", "until".
const SEPARATOR = /\s*[–—−-]\s*|\s+(?:à|au|jusqu['’]à|to|until)\s+/i;

/** The period written the CV's way, or exactly as given when it cannot be read with certainty. */
export function harmonizePeriod(period: string, language: string): string {
  const lang = language.slice(0, 2).toLowerCase();
  if (lang !== "fr" && lang !== "en") return period;
  const parts = period.trim().split(SEPARATOR);
  if (parts.length > 2) return period;
  const points = parts.map(readPoint);
  if (points.some((p) => p === null)) return period;
  const [start, end] = points as Point[];
  if (!end) return start.kind === "date" && start.year !== null ? writePoint(start, lang) : period;
  // A month without a year is only clear when the second date holds the year ("January – June 2025").
  if (end.kind === "date" && end.year === null) return period;
  if (start.kind === "present") return period;
  if (start.year === null && !(end.kind === "date" && end.month !== null)) return period;
  return `${writePoint(start, lang)} – ${writePoint(end, lang)}`;
}

/** The CV with every period harmonised (nothing else changes). */
export function harmonizeCvDates(document: CvDocument): CvDocument {
  const entry = (e: CvEntry): CvEntry => (e.period ? { ...e, period: harmonizePeriod(e.period, document.language) } : e);
  return { ...document, experiences: document.experiences.map(entry), education: document.education.map(entry) };
}
