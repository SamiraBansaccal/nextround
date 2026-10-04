// The behaviour clip library of an interviewer, and how each character plays it.
// Every interviewer gets the same KINDS of clips (idle, listening, reactions, transitions, speaking), so an
// interview can be assembled from short pieces: [QUESTION] → [LISTEN] → [REACTION] → [THINK] → [NEXT].
// HOW a clip is played comes from the character's existing data (traits, personality, interview style in
// lib/interviewers/catalog) plus optional notes in assets/characters/<id>/performance.json (setting, mannerisms).
// Writes assets/characters/<id>/clip-plan.json; no generation, no credits.
// Usage: npm run avatars:plan [-- character-id …]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { findInterviewer } from "@/lib/interviewers";
import type { Interviewer } from "@/lib/interviewers/types";

type Category = "idle" | "listening" | "positive" | "negative" | "strong" | "transition" | "speaking";
interface Performance {
  setting?: string; // where the character sits, always the same for all clips
  mannerisms?: string[]; // signature gestures, used in idle and reactions
  look?: string; // canonical outfit and details to keep
}
export interface ClipPlan {
  id: string;
  category: Category;
  seconds: number;
  loop: boolean; // starts and ends on the same neutral pose (same frame), so it can repeat or chain
  voice: boolean;
  prompt: string;
}

/** How big this character plays emotions, from its traits (1–5). */
function temperament(i: Interviewer) {
  const t = i.traits;
  const expressiveness = (t.energy + t.humour + t.unpredictability) / 3;
  return {
    big: expressiveness >= 3.7,
    small: expressiveness <= 2.4 || t.formality >= 5,
    cold: t.warmth <= 2,
    warm: t.warmth >= 4,
    severe: t.severity >= 4,
    formal: t.formality >= 4,
    confident: t.confidence >= 4,
  };
}

/** Each emotion, played three ways; the character's temperament picks one. */
function play(i: Interviewer, emotion: string): string {
  const m = temperament(i);
  const pick = (big: string, cold: string, mid: string) => (m.big && !m.small ? big : m.cold || m.small ? cold : mid);
  const table: Record<string, string> = {
    interest: pick("leans in eagerly, eyes bright", "narrows the eyes slightly and tilts the head, calculating", "leans in a little, attentive"),
    approval: pick("big enthusiastic nod", "one slow, measured nod", "two small nods"),
    smile: pick("wide open smile", m.cold ? "a thin, condescending smile" : "a faint smile", "a warm smile"),
    amusement: pick("bursts out laughing, shoulders shaking, then settles", m.cold ? "a thin, condescending smile and a short silent chuckle" : "a small amused smile", "laughs softly"),
    enthusiasm: pick("excited, bouncing slightly, hands up", "a rare, slightly unsettling gleam of satisfaction", "brightens up, nods"),
    satisfaction: pick("pumps a fist", m.cold ? "steeples the fingers, a slow satisfied smile" : "a contented nod", "relaxed satisfied smile"),
    doubt: pick("exaggerated squint, head tilted", "one eyebrow raised, unimpressed", "slight frown, head tilted"),
    disapproval: pick("shakes the head dramatically", "cold stare, lips pressed thin", "small frown and a short head shake"),
    disappointment: pick("slumps, exaggerated sigh", "looks away briefly with contempt, then back", "sighs, small shrug"),
    scepticism: pick("squints, leans back, arms crossed", "looks down the nose, eyebrow raised", "raises an eyebrow"),
    confusion: pick("scratches the head, baffled face", "brief blank stare, slight head tilt", "puzzled look, head tilt"),
    irritation: pick("visible exasperation, hands thrown up, then settles", m.severe ? "icy irritation: jaw tightens, fingers drum once" : "a short sigh", "sighs, rolls the eyes slightly"),
    surprise: pick("eyes go wide, eyebrows shoot up, leans back", "a single raised eyebrow, otherwise perfectly still", "eyebrows lift, slight lean back"),
    shock: pick("jaw drops, freezes, then recovers", "stiffens, eyes widen slightly, composure regained at once", "gasps, hand to the chest"),
    disbelief: pick("blinks repeatedly, mouth open", "slow blink, unconvinced stare", "shakes the head slowly, half-smile"),
    laughter: pick("big belly laugh, nearly falls back", m.cold ? "a dry, wheezy chuckle, quickly suppressed" : "a short quiet laugh", "laughs openly"),
    anger: pick("red-faced outburst without words, then calms down", "cold fury: glares, clenches the hands, says nothing", "frowns hard, exhales sharply"),
    embarrassment: pick("covers the face, laughs nervously", "clears the throat, adjusts the collar, looks away", "blushes, small awkward smile"),
  };
  return table[emotion];
}

export function planFor(i: Interviewer, perf: Performance): ClipPlan[] {
  const m = temperament(i);
  const posture = m.formal ? "upright, professional posture" : "relaxed posture";
  const quirks = perf.mannerisms?.length ? ` Characteristic mannerisms when natural: ${perf.mannerisms.join("; ")}.` : "";
  const base =
    `${i.name} as a job interviewer in a video call, ${perf.setting ?? "seated at a desk in an office"}. ` +
    `Same character, same outfit${perf.look ? ` (${perf.look})` : ""}, same background, same framing and lighting as the reference: ` +
    `static webcam shot, chest-up, facing the camera, no camera movement, no cuts, no text. ` +
    `Canonical design and art style of the character, unchanged. Personality: ${i.personality}.`;
  const silent = " Mouth closed, no speech, no sound.";
  const loopEnd = " Starts and ends in the same neutral pose, looking at the camera.";
  const clip = (id: string, category: Category, seconds: number, loop: boolean, action: string, voice = false): ClipPlan => ({
    id,
    category,
    seconds,
    loop,
    voice,
    prompt: `${base} ${action}${voice ? "" : silent}${loop ? loopEnd : ""}`,
  });
  const reactions: [Category, string][] = [
    ["positive", "interest"], ["positive", "approval"], ["positive", "smile"], ["positive", "amusement"], ["positive", "enthusiasm"], ["positive", "satisfaction"],
    ["negative", "doubt"], ["negative", "disapproval"], ["negative", "disappointment"], ["negative", "scepticism"], ["negative", "confusion"], ["negative", "irritation"],
    ["strong", "surprise"], ["strong", "shock"], ["strong", "disbelief"], ["strong", "laughter"], ["strong", "anger"], ["strong", "embarrassment"],
  ];
  return [
    clip("idle-breathing", "idle", 5, true, `Waits for the candidate: natural breathing, blinks, ${posture}, tiny natural body movement, never frozen.${quirks}`),
    clip("idle-glance", "idle", 5, true, "Waits: eyes drift slightly to the side for a moment, then come back to the camera."),
    clip("listen-attentive", "listening", 5, true, `Listens to the candidate speaking: steady eye contact, ${m.cold ? "unreadable expression" : "attentive expression"}, a slight change of expression midway.`),
    clip("listen-nod", "listening", 4, true, `Listens and ${play(i, "approval")}.`),
    clip("listen-notes", "listening", 5, true, "Listens, glances down to write a short note, then looks back up at the camera."),
    ...reactions.map(([category, emotion]) => clip(`react-${emotion}`, category, 4, true, `Reacts to the candidate's answer: ${play(i, emotion)}.`)),
    clip("think", "transition", 4, true, `Thinks before replying: ${m.small ? "a brief, still pause, eyes narrowing" : "looks up and aside, considering"}, then back to the camera.`),
    clip("check-notes", "transition", 4, true, "Looks down at the notes on the desk, then raises the eyes back to the camera."),
    clip("prepare-question", "transition", 4, false, "Takes a breath and shifts posture slightly, about to ask the next question. Ends looking at the camera, lips about to part."),
    ...(["neutral", "interested", "serious", "amused", "sceptical", "irritated", "enthusiastic"] as const).map((tone) =>
      clip(`speak-${tone}`, "speaking", 5, false, `Speaks to the candidate, lip-synced to the audio, ${tone === "neutral" ? "in a normal tone" : `in a ${tone} tone`}, small natural head and hand movements, then stops and looks at the camera.`, true),
    ),
  ];
}

const sources: Record<string, unknown> = JSON.parse(readFileSync("assets/characters/sources.json", "utf8"));
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(sources);
for (const id of ids) {
  const interviewer = findInterviewer(id);
  if (!interviewer) throw new Error(`Unknown interviewer: ${id}`);
  const perfPath = `assets/characters/${id}/performance.json`;
  const perf: Performance = existsSync(perfPath) ? JSON.parse(readFileSync(perfPath, "utf8")) : {};
  const plan = planFor(interviewer, perf);
  writeFileSync(`assets/characters/${id}/clip-plan.json`, JSON.stringify(plan, null, 1) + "\n");
  console.log(`${id}: ${plan.length} clips planned`);
}
