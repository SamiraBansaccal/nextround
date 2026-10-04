import type { InterviewerCategory } from "./types";

// Categories shown as compact choices in the interviewer picker, in this order. `icon` is a key the
// UI maps to an icon; an unknown key falls back to a generic one.

export const CATEGORIES: InterviewerCategory[] = [
  { id: "classic", label: "Classic recruiters", description: "Realistic interviewers made for NextRound.", icon: "briefcase" },
  { id: "archetypes", label: "Workplace archetypes", description: "The bosses and recruiters everyone has met.", icon: "users" },
  { id: "politics", label: "Politics", description: "Politicians' speaking styles, as parodies.", icon: "landmark" },
  { id: "business", label: "Business & tech", description: "CEOs and founders, as parodies.", icon: "building" },
  { id: "film", label: "Film & TV", description: "Actors and iconic characters.", icon: "clapperboard" },
  { id: "music", label: "Music", description: "Artists' speaking styles, as parodies.", icon: "music" },
  { id: "simpsons", label: "The Simpsons", description: "Springfield's finest interviewers.", icon: "tv" },
  { id: "cartoons", label: "Cartoons", description: "Classic cartoon characters.", icon: "sparkles" },
  { id: "anime", label: "Anime & manga", description: "Heroes, rivals and mentors.", icon: "swords" },
];
