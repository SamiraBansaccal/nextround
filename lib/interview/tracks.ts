import type { Localized } from "@/lib/interviewers/types";
import { findTech, TECHS, type Tech } from "./bank";

// Practice interviews on a technology, organised by career track: pick a track (DevOps, web…) and
// either the whole track or one of its technologies. Every technology id is one of the question bank's
// (lib/interview/bank): adding a technology to a track is one id here.

export interface Track {
  id: string;
  label: Localized;
  description: Localized;
  techs: readonly string[];
}

export const TRACKS: readonly Track[] = [
  {
    id: "devops",
    label: { en: "DevOps & cloud", fr: "DevOps & cloud" },
    description: { en: "Containers, pipelines, Linux and infrastructure.", fr: "Conteneurs, pipelines, Linux et infrastructure." },
    techs: ["docker", "kubernetes", "cicd", "git", "linux", "bash", "terraform", "ansible", "cloud", "networking", "nginx", "monitoring", "windows"],
  },
  {
    id: "web",
    label: { en: "Web development", fr: "Développement web" },
    description: { en: "Front-end, back-end JavaScript, APIs and PHP.", fr: "Front-end, JavaScript côté serveur, API et PHP." },
    techs: ["javascript", "typescript", "react", "node", "nextjs", "angular", "vue", "html-css", "rest", "php", "odoo"],
  },
  {
    id: "java",
    label: { en: "Java", fr: "Java" },
    description: { en: "The language, the JVM and Spring.", fr: "Le langage, la JVM et Spring." },
    techs: ["java", "spring"],
  },
  {
    id: "c-cpp",
    label: { en: "C & C++", fr: "C & C++" },
    description: { en: "Memory, pointers, Unix system calls and threads.", fr: "Mémoire, pointeurs, appels système Unix et threads." },
    techs: ["c", "cpp", "posix", "concurrency"],
  },
  {
    id: "embedded",
    label: { en: "Embedded systems", fr: "Systèmes embarqués" },
    description: { en: "Microcontrollers, real time and low-level C.", fr: "Microcontrôleurs, temps réel et C bas niveau." },
    techs: ["embedded", "c", "cpp", "concurrency"],
  },
  {
    id: "languages",
    label: { en: "Python, .NET, Go, Rust", fr: "Python, .NET, Go, Rust" },
    description: { en: "Other languages asked of junior developers.", fr: "D'autres langages demandés aux juniors." },
    techs: ["python", "csharp", "go", "rust"],
  },
  {
    id: "data",
    label: { en: "Databases", fr: "Bases de données" },
    description: { en: "SQL, NoSQL and caches.", fr: "SQL, NoSQL et caches." },
    techs: ["sql", "nosql", "redis"],
  },
  {
    id: "foundations",
    label: { en: "Foundations", fr: "Fondamentaux" },
    description: { en: "Algorithms, OOP, security, testing, agile.", fr: "Algorithmes, POO, sécurité, tests, agilité." },
    techs: ["algorithms", "oop", "security", "testing", "agile", "architecture", "llm"],
  },
];

const TRACK_BY_ID = new Map(TRACKS.map((t) => [t.id, t]));

export function findTrack(id: string | null | undefined): Track | undefined {
  return id ? TRACK_BY_ID.get(id) : undefined;
}

export function techsOfTrack(track: Track): Tech[] {
  return track.techs.map((id) => findTech(id)).filter((t): t is Tech => !!t);
}

/** A practice topic: a whole track, or one technology. Stored as "track:<id>" or "tech:<id>". */
export type Topic = { kind: "track"; track: Track } | { kind: "tech"; tech: Tech };

export function parseTopic(value: string | null | undefined): Topic | null {
  const [kind, id] = (value ?? "").split(":");
  if (kind === "track") {
    const track = findTrack(id);
    return track ? { kind, track } : null;
  }
  if (kind === "tech") {
    const tech = findTech(id);
    return tech ? { kind, tech } : null;
  }
  return null;
}

export const topicValue = (topic: Topic) => (topic.kind === "track" ? `track:${topic.track.id}` : `tech:${topic.tech.id}`);

export function topicLabel(topic: Topic, lang: "en" | "fr"): string {
  return topic.kind === "track" ? topic.track.label[lang] : topic.tech.label[lang];
}

/** The technologies a topic covers. */
export function topicTechs(topic: Topic): Tech[] {
  return topic.kind === "track" ? techsOfTrack(topic.track) : [topic.tech];
}

/** Every technology of the bank is in at least one track (checked by tests). */
export const UNTRACKED = TECHS.filter((t) => !TRACKS.some((track) => track.techs.includes(t.id)));
