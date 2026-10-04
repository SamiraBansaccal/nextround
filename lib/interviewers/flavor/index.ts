import { fill } from "@/lib/interview/copy";
import { inRegister, registerOf } from "@/lib/interview/register";
import type { Interviewer, Lang, Localized } from "../types";
import { CATEGORY_PACKS, CHARACTER_PACKS } from "./packs";
import { NEUTRAL, registerPacks } from "./registers";
import type { FlavorField, FlavorPack } from "./types";

// What an interviewer says around each question, assembled from small pieces: the character's own lines
// first, then its category's, then lines that fit its temperament (lib/interviewers/flavor/registers.ts).
// The question itself is never changed. How often the interviewer speaks follows the traits: a
// humorous, energetic character interjects often, a cold one rarely. Each piece is used at most once
// per interview. Pure once `random` is given (tests/interview/flavor.test.ts).

export type { FlavorPack } from "./types";
export { CATEGORY_PACKS, CHARACTER_PACKS } from "./packs";

export interface FlavorSlot {
  /** The technology of a technical question, already in the interview's language ("C++"); else null. */
  tech: string | null;
}

export interface Flavor {
  intro: string | null; // said before the question
  outro: string | null; // said after it
}

/** The packs that speak for this interviewer, with how strongly each one is preferred. */
export function flavorLayers(interviewer: Interviewer): { pack: FlavorPack; weight: number }[] {
  const layers: { pack: FlavorPack; weight: number }[] = [];
  const own = interviewer.kind === "real_person" ? undefined : CHARACTER_PACKS[interviewer.id]; // no words in real people's mouths
  if (own) layers.push({ pack: own, weight: 5 });
  const category = CATEGORY_PACKS[interviewer.categoryId];
  if (category) layers.push({ pack: category, weight: 2 });
  for (const pack of registerPacks(interviewer.traits)) layers.push({ pack, weight: 1 });
  layers.push({ pack: NEUTRAL, weight: 1 });
  return layers;
}

const clamp = (p: number) => Math.min(0.85, Math.max(0, p));

export function flavorInterview(interviewer: Interviewer, slots: readonly FlavorSlot[], lang: Lang, random: () => number = Math.random): Flavor[] {
  const layers = flavorLayers(interviewer);
  const register = registerOf(interviewer.traits);
  const t = interviewer.traits;
  const interjectionChance = clamp(0.1 + 0.08 * (t.humour - 1) + 0.05 * (t.energy - 1) + 0.05 * (t.unpredictability - 1));
  const closerChance = clamp(0.15 + 0.06 * (t.pressure - 1) + 0.04 * (t.warmth - 1));
  const used = new Set<string>();

  function take(field: FlavorField): Localized | null {
    const options: { key: string; piece: Localized; weight: number }[] = [];
    layers.forEach(({ pack, weight }, l) =>
      (pack[field] ?? []).forEach((piece, i) => {
        const key = `${l}:${field}:${i}`;
        if (!used.has(key)) options.push({ key, piece, weight });
      }),
    );
    const total = options.reduce((sum, o) => sum + o.weight, 0);
    if (!total) return null;
    let roll = random() * total;
    const chosen = options.find((o) => (roll -= o.weight) < 0) ?? options[options.length - 1];
    used.add(chosen.key);
    return chosen.piece;
  }

  return slots.map((slot, i) => {
    const say = (piece: Localized | null) => (piece ? fill(inRegister(piece[lang], register), { tech: slot.tech ?? "", n: i + 1 }) : null);
    const intro: (string | null)[] = [];
    if (i === 0) intro.push(say(take("greetings")));
    if (random() < interjectionChance) intro.push(say(take("interjections")));
    if (slot.tech && random() < 0.55) intro.push(say(take("techOpeners")));
    else if (i > 0 && random() < 0.35) intro.push(say(take("openers")));
    const outro = random() < closerChance ? say(take("closers")) : null;
    const lines = intro.filter((line): line is string => !!line);
    return { intro: lines.length ? lines.join(" ") : null, outro };
  });
}
