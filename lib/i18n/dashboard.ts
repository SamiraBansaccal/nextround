import type { UiLang } from "./ui";

// Dashboard (greeting, pipeline, first steps) and the "AI in use" card, in the SITE's language.

const en = {
  greetingMorning: "Good morning, {name}",
  greetingAfternoon: "Good afternoon, {name}",
  greetingEvening: "Good evening, {name}",
  illustration: "Illustration of job applications being reviewed",
  momentumTitle: "Your next round is taking shape.",
  momentumBody: "Keep the momentum going, one thoughtful step at a time.",
  inProgress: "opportunities in progress",
  factBase: "Your fact base",
  validatedOne: "1 validated fact",
  validatedMany: "{count} validated facts",
  allFromThese: "Every CV, letter and practice answer is written only from these.",
  waitingOne: "1 proposed fact waiting for your review.",
  waitingMany: "{count} proposed facts waiting for your review.",
  importProfile: "Import your CVs and GitHub",
  openProfile: "Open my profile",
  // Pipeline
  yourOpportunities: "Your opportunities",
  tracked: "{count} tracked",
  filterLabel: "Filter offers by track",
  tabAll: "All",
  tabOther: "Other",
  stage: "Stage",
  noOffersYet: "No offers saved yet — paste a link above: NextRound reads it and shows how well you match.",
  // First steps
  startHere: "Start here",
  fillProfile: "Fill your profile in seconds",
  startGithub:
    "Import the public projects of @{login}: one proposed fact per project, linked to its repository. You keep only what is true — everything NextRound writes later comes from these facts.",
  startNoGithub:
    "Add your CVs (PDF) or answer 5 quick questions: NextRound proposes facts, each with a quote from your own words, and you keep only what is true.",
  importGithub: "Import from GitHub",
  orAddCvs: "Or add your CVs",
  addCvs: "Add your CVs",
  // AI in use
  addAiKey: "Add your AI key in Settings to use AI features.",
  openSettings: "Open Settings",
  aiInUse: "AI in use",
  ownKey: "Your own key: your provider bills you directly, NextRound adds no limit.",
  instanceKey: "The instance key (you are the owner): limited to 8 requests per minute and 40 per day.",
  voice: "Voice: {voice}",
  voiceOwn: "your ElevenLabs key",
  voiceInstance: "ElevenLabs (instance key)",
  voiceBrowser: "your browser (free)",
};

export type DashboardCopy = typeof en;

const fr: DashboardCopy = {
  greetingMorning: "Bonjour {name}",
  greetingAfternoon: "Bon après-midi {name}",
  greetingEvening: "Bonsoir {name}",
  illustration: "Illustration de candidatures passées en revue",
  momentumTitle: "Ton prochain entretien se prépare.",
  momentumBody: "Garde le rythme, une étape réfléchie à la fois.",
  inProgress: "opportunités en cours",
  factBase: "Ta base de faits",
  validatedOne: "1 fait validé",
  validatedMany: "{count} faits validés",
  allFromThese: "Chaque CV, lettre et réponse d'entraînement est écrit uniquement à partir de ces faits.",
  waitingOne: "1 fait proposé attend ta relecture.",
  waitingMany: "{count} faits proposés attendent ta relecture.",
  importProfile: "Importer tes CV et GitHub",
  openProfile: "Ouvrir mon profil",
  yourOpportunities: "Tes opportunités",
  tracked: "{count} suivies",
  filterLabel: "Filtrer les offres par parcours",
  tabAll: "Toutes",
  tabOther: "Autres",
  stage: "Étape",
  noOffersYet: "Aucune offre enregistrée : colle un lien ci-dessus, NextRound la lit et te montre à quel point ton profil correspond.",
  startHere: "Pour commencer",
  fillProfile: "Remplis ton profil en quelques secondes",
  startGithub:
    "Importe les projets publics de @{login} : un fait proposé par projet, lié à son dépôt. Tu ne gardes que ce qui est vrai, et tout ce que NextRound écrit ensuite vient de ces faits.",
  startNoGithub:
    "Ajoute tes CV (PDF) ou réponds à 5 questions rapides : NextRound propose des faits, chacun avec une citation de tes propres mots, et tu ne gardes que ce qui est vrai.",
  importGithub: "Importer depuis GitHub",
  orAddCvs: "Ou ajouter tes CV",
  addCvs: "Ajouter tes CV",
  addAiKey: "Ajoute ta clé d'IA dans les réglages pour utiliser les fonctions d'IA.",
  openSettings: "Ouvrir les réglages",
  aiInUse: "IA utilisée",
  ownKey: "Ta propre clé : ton fournisseur te facture directement, NextRound n'ajoute aucune limite.",
  instanceKey: "La clé de l'instance (tu en es propriétaire) : limitée à 8 requêtes par minute et 40 par jour.",
  voice: "Voix : {voice}",
  voiceOwn: "ta clé ElevenLabs",
  voiceInstance: "ElevenLabs (clé de l'instance)",
  voiceBrowser: "ton navigateur (gratuit)",
};

export const DASHBOARD_COPY: Record<UiLang, DashboardCopy> = { en, fr };
