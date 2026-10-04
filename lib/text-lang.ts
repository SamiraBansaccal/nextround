import type { Lang } from "@/lib/interviewers/types";

// Which of the app's languages a short text is written in, from its most common words. Pure and cheap:
// used to check that the AI wrote in the interview's language (lib/interview/generate.ts).

const WORDS: Record<Lang, ReadonlySet<string>> = {
  en: new Set("the a an and or of to in on for with is are was were be been you your yours we our it its this that these those what which who how why when where do does did have has had can could would should will not about from at by as if than then there their they them my me i".split(" ")),
  fr: new Set("le la les un une des et ou de du au aux en dans sur pour avec est sont était étaient être été vous votre vos tu ton ta tes nous notre nos il elle ils elles ce cette ces qui que quoi comment pourquoi quand où avez avoir pouvez pourriez faites fait pas ne plus je mon ma mes son sa ses leur leurs d l qu".split(" ")),
};

/** "en" or "fr" when the text clearly is one of them; null when it is too short or mixed. */
export function guessLanguage(text: string): Lang | null {
  const words = text.toLowerCase().normalize("NFC").split(/[^\p{L}]+/u).filter(Boolean);
  if (words.length < 4) return null;
  const en = words.filter((w) => WORDS.en.has(w)).length;
  const fr = words.filter((w) => WORDS.fr.has(w)).length;
  if (en + fr < 2) return null;
  if (en >= fr * 2 && en >= 2) return "en";
  if (fr >= en * 2 && fr >= 2) return "fr";
  return null;
}

/** True when the text is clearly written in another language than `lang`. */
export function isOtherLanguage(text: string, lang: Lang): boolean {
  const guess = guessLanguage(text);
  return guess !== null && guess !== lang;
}
