// The language of the site's interface (menus, pages), English by default. It is NOT the language of an
// interview: that one is chosen for each interview (lib/interview/copy.ts). Stored in a cookie.

export const UI_LANGS = ["en", "fr"] as const;
export type UiLang = (typeof UI_LANGS)[number];
export const UI_LANG_COOKIE = "nextround-ui-lang";

export function toUiLang(value: unknown): UiLang {
  return value === "fr" ? "fr" : "en";
}

const en = {
  // Shell
  navOffers: "Offers",
  navInterviews: "Interviews",
  navProfile: "Profile",
  navSettings: "Settings",
  navMenu: "Main navigation",
  openMenu: "Open menu",
  collapseMenu: "Collapse menu",
  expandMenu: "Expand menu",
  shellNote: "Every sentence NextRound writes points to a fact you validated.",
  siteLanguage: "Site language",
  // Interviews list
  practiceTitle: "Interview practice",
  practiceIntro: "One-to-one video calls with the interviewer you choose: on a job offer, on a technology, or on HR questions.",
  newInterview: "New interview",
  noPractice: "No practice yet: your interviews will be listed here.",
  withOn: "with {name}, {date}",
  statusReady: "Ready to practise",
  statusInProgress: "In progress",
  statusDone: "Completed",
  answeredOf: "{status}, {answered} of {total}",
  questionsAnswered: "Questions answered",
  delete: "Delete",
  deleteConfirm: "Delete the interview “{label}” and its answers? This cannot be undone.",
  deleteLabel: "Delete the interview “{label}”",
  // New interview
  back: "Back",
  whatToPractise: "What do you want to practise?",
  whatToPractiseIntro: "Then you choose your interviewer and check your camera and microphone.",
  kindOffer: "A job offer",
  kindOfferHint: "Questions on its stack, its requirements and your gaps.",
  kindTechnology: "A technology",
  kindTechnologyHint: "DevOps, web, Java, C and C++, embedded… one technology or a whole track.",
  kindHr: "HR questions",
  kindHrHint: "Motivation, strengths, tricky and even inappropriate questions, for any role.",
  whichOffer: "Which offer do you want to prepare for?",
  noOffer: "No saved offer yet",
  noOfferHint: "Save an offer first: the interview is built from its stack and requirements.",
  addOffer: "Add an offer",
  untitledOffer: "Untitled offer",
  choose: "Choose",
  whichTrack: "Which track?",
  whichTrackIntro: "Pick a field, then one technology or the whole track.",
  wholeTrack: "The whole track",
  wholeTrackHint: "Questions across all of {track}",
};

export type UiCopy = typeof en;

const fr: UiCopy = {
  navOffers: "Offres",
  navInterviews: "Entretiens",
  navProfile: "Profil",
  navSettings: "Réglages",
  navMenu: "Navigation principale",
  openMenu: "Ouvrir le menu",
  collapseMenu: "Réduire le menu",
  expandMenu: "Déplier le menu",
  shellNote: "Chaque phrase écrite par NextRound renvoie à un fait que tu as validé.",
  siteLanguage: "Langue du site",
  practiceTitle: "Entraînement aux entretiens",
  practiceIntro: "Des appels vidéo en tête-à-tête avec l'intervieweur de ton choix : sur une offre d'emploi, une technologie ou des questions RH.",
  newInterview: "Nouvel entretien",
  noPractice: "Pas encore d'entraînement : tes entretiens s'afficheront ici.",
  withOn: "avec {name}, le {date}",
  statusReady: "Prêt à commencer",
  statusInProgress: "En cours",
  statusDone: "Terminé",
  answeredOf: "{status}, {answered} sur {total}",
  questionsAnswered: "Questions répondues",
  delete: "Supprimer",
  deleteConfirm: "Supprimer l'entretien « {label} » et ses réponses ? C'est définitif.",
  deleteLabel: "Supprimer l'entretien « {label} »",
  back: "Retour",
  whatToPractise: "Sur quoi veux-tu t'entraîner ?",
  whatToPractiseIntro: "Ensuite, tu choisis ton intervieweur et tu vérifies ta caméra et ton micro.",
  kindOffer: "Une offre d'emploi",
  kindOfferHint: "Des questions sur sa stack, ses exigences et tes lacunes.",
  kindTechnology: "Une technologie",
  kindTechnologyHint: "DevOps, web, Java, C et C++, embarqué… une technologie ou toute une filière.",
  kindHr: "Questions RH",
  kindHrHint: "Motivation, qualités, questions pièges et même inappropriées, pour tout poste.",
  whichOffer: "Pour quelle offre veux-tu te préparer ?",
  noOffer: "Aucune offre enregistrée",
  noOfferHint: "Enregistre d'abord une offre : l'entretien est construit à partir de sa stack et de ses exigences.",
  addOffer: "Ajouter une offre",
  untitledOffer: "Offre sans titre",
  choose: "Choisir",
  whichTrack: "Quelle filière ?",
  whichTrackIntro: "Choisis un domaine, puis une technologie ou toute la filière.",
  wholeTrack: "Toute la filière",
  wholeTrackHint: "Des questions sur l'ensemble de {track}",
};

export const UI_COPY: Record<UiLang, UiCopy> = { en, fr };
