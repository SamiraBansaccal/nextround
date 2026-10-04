import type { InterviewerCategory } from "./types";

// Categories shown as compact choices when choosing an interviewer, in this order. `icon` is a key the
// UI maps to an icon; an unknown key falls back to a generic one.

export const CATEGORIES: InterviewerCategory[] = [
  {
    id: "classic",
    label: { en: "Classic recruiters", fr: "Recruteurs classiques" },
    description: { en: "Realistic interviewers made for NextRound.", fr: "Des recruteurs réalistes, créés pour NextRound." },
    icon: "briefcase",
  },
  {
    id: "archetypes",
    label: { en: "Workplace archetypes", fr: "Archétypes du bureau" },
    description: { en: "The bosses and recruiters everyone has met.", fr: "Les patrons et recruteurs que tout le monde a croisés." },
    icon: "users",
  },
  {
    id: "politics",
    label: { en: "Politics", fr: "Politique" },
    description: { en: "Politicians' speaking styles, as parodies.", fr: "Le style oratoire de politiques, en parodie." },
    icon: "landmark",
  },
  {
    id: "business",
    label: { en: "Business & tech", fr: "Business & tech" },
    description: { en: "CEOs and founders, as parodies.", fr: "Des CEO et fondateurs, en parodie." },
    icon: "building",
  },
  {
    id: "film",
    label: { en: "Film & TV", fr: "Cinéma & séries" },
    description: { en: "Actors and iconic characters.", fr: "Des acteurs et des personnages cultes." },
    icon: "clapperboard",
  },
  {
    id: "music",
    label: { en: "Music", fr: "Musique" },
    description: { en: "Artists' speaking styles, as parodies.", fr: "Le style d'artistes, en parodie." },
    icon: "music",
  },
  {
    id: "simpsons",
    label: { en: "The Simpsons", fr: "Les Simpson" },
    description: { en: "Springfield's finest interviewers.", fr: "Les meilleurs recruteurs de Springfield." },
    icon: "tv",
  },
  {
    id: "cartoons",
    label: { en: "Cartoons", fr: "Dessins animés" },
    description: { en: "Classic cartoon characters.", fr: "Des personnages de dessins animés cultes." },
    icon: "sparkles",
  },
  {
    id: "anime",
    label: { en: "Anime & manga", fr: "Anime & manga" },
    description: { en: "Heroes, rivals and mentors.", fr: "Des héros, des rivaux et des mentors." },
    icon: "swords",
  },
  {
    id: "games",
    label: { en: "Video games", fr: "Jeux vidéo" },
    description: { en: "Heroes and legends from video games.", fr: "Des héros et des légendes du jeu vidéo." },
    icon: "gamepad",
  },
];
