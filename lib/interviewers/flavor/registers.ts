import type { InterviewerTraits } from "../types";
import type { FlavorPack } from "./types";

// Lines that fit any interviewer with a given temperament, derived from the traits. They are the only
// lines of a real person's parody: catchphrases are never put in a real person's mouth.

export const NEUTRAL: FlavorPack = {
  greetings: [
    { en: "Hello, thanks for joining. Let's begin.", fr: "Bonjour, merci d'être là. Commençons." },
    { en: "Hello! Let's get started.", fr: "Bonjour ! On commence ?" },
  ],
  openers: [
    { en: "Next question.", fr: "Question suivante." },
    { en: "Let's move on.", fr: "Passons à la suite." },
    { en: "Here is the next one.", fr: "Voici la suivante." },
    { en: "I'd like to hear about this.", fr: "J'aimerais {vous |t'}entendre là-dessus." },
  ],
  techOpeners: [
    { en: "Let's talk {tech}.", fr: "Parlons {tech}." },
    { en: "A {tech} question now.", fr: "Une question sur {tech}, maintenant." },
    { en: "On to {tech}.", fr: "Côté {tech} :" },
  ],
  closers: [
    { en: "Take your time.", fr: "{Prenez votre|Prends ton} temps." },
    { en: "Whenever you're ready.", fr: "Quand {vous voulez|tu veux}." },
  ],
};

const WARM: FlavorPack = {
  greetings: [{ en: "Welcome! No trap here, just a conversation.", fr: "Bienvenue ! Pas de piège ici, juste une conversation." }],
  openers: [
    { en: "No trick in this one.", fr: "Pas de piège dans celle-ci." },
    { en: "This one is a chance to shine.", fr: "Celle-ci, c'est l'occasion de briller." },
  ],
  closers: [
    { en: "Think out loud if it helps.", fr: "{N'hésitez|N'hésite} pas à réfléchir à voix haute." },
    { en: "There's no wrong way to start.", fr: "Il n'y a pas de mauvaise façon de commencer." },
  ],
};

const STRICT: FlavorPack = {
  greetings: [{ en: "Let's not waste any time.", fr: "Ne perdons pas de temps." }],
  openers: [
    { en: "Next.", fr: "Suivante." },
    { en: "Let's see.", fr: "Voyons voir." },
    { en: "Precisely, now.", fr: "Avec précision, maintenant." },
  ],
  closers: [
    { en: "Be precise.", fr: "De la précision, s'il {vous|te} plaît." },
    { en: "Briefly, please.", fr: "En bref, s'il {vous|te} plaît." },
    { en: "I'm listening.", fr: "J'écoute." },
  ],
};

const PLAYFUL: FlavorPack = {
  interjections: [
    { en: "Alright!", fr: "Bon !" },
    { en: "Okay, okay…", fr: "Allez, allez…" },
    { en: "Ooh, I like this one.", fr: "Oh, j'aime bien celle-là." },
  ],
  openers: [
    { en: "Plot twist.", fr: "Rebondissement." },
    { en: "Brace yourself.", fr: "{Accrochez-vous|Accroche-toi}." },
  ],
  closers: [{ en: "No pressure. Well… a little.", fr: "Pas de pression. Enfin… un peu." }],
};

const ENERGETIC: FlavorPack = {
  interjections: [
    { en: "Let's go!", fr: "C'est parti !" },
    { en: "Boom!", fr: "Boum !" },
  ],
  openers: [{ en: "Quick one!", fr: "Une rapide !" }],
};

const CALM: FlavorPack = {
  closers: [{ en: "No rush.", fr: "Rien ne presse." }],
};

/** The temperament packs that fit these traits, most specific first. */
export function registerPacks(t: InterviewerTraits): FlavorPack[] {
  const packs: FlavorPack[] = [];
  if (t.severity >= 4 || t.pressure >= 4) packs.push(STRICT);
  if (t.warmth >= 4) packs.push(WARM);
  if (t.humour >= 4) packs.push(PLAYFUL);
  if (t.energy >= 4) packs.push(ENERGETIC);
  if (t.energy <= 2 && t.pressure <= 2) packs.push(CALM);
  return packs;
}
