import type { FlavorPack } from "./types";

// Lines per category, then per character. Characters are fan parodies of FICTIONAL characters, invented
// archetypes or NextRound's own recruiters; real people never get a pack here (see registers.ts).
// Each piece is said around a question, so it stays short, kind to the candidate and fit for a job
// interview. Adding a character's lines = one entry below, keyed by its catalog id.

export const CATEGORY_PACKS: Record<string, FlavorPack> = {
  anime: {
    interjections: [
      { en: "Yosh!", fr: "Yosh !" },
      { en: "Ikuzo!", fr: "Ikuzo !" },
    ],
    techOpeners: [{ en: "Next challenge: {tech}!", fr: "Prochain défi : {tech} !" }],
    closers: [{ en: "Show me what you've got!", fr: "{Montrez-moi|Montre-moi} ce que {vous avez|tu as} dans le ventre !" }],
  },
  simpsons: {
    techOpeners: [{ en: "Springfield wants to know about {tech}.", fr: "Springfield veut tout savoir sur {tech}." }],
  },
  cartoons: {
    interjections: [{ en: "Whoa!", fr: "Waouh !" }],
    openers: [{ en: "And now, a word from our sponsor: the next question.", fr: "Et maintenant, un mot de notre sponsor : la question suivante." }],
  },
  film: {
    interjections: [{ en: "Action!", fr: "Action !" }],
    openers: [
      { en: "Take {n}.", fr: "Prise {n}." },
      { en: "Scene {n}.", fr: "Scène {n}." },
    ],
    techOpeners: [{ en: "Tonight's feature: {tech}.", fr: "À l'affiche ce soir : {tech}." }],
  },
  music: {
    openers: [
      { en: "Next track.", fr: "Morceau suivant." },
      { en: "Track {n}.", fr: "Piste {n}." },
    ],
    techOpeners: [{ en: "Now playing: {tech}.", fr: "À l'antenne : {tech}." }],
  },
  politics: {
    openers: [{ en: "Next question, please.", fr: "Question suivante, s'il vous plaît." }],
    techOpeners: [{ en: "On the {tech} file:", fr: "Sur le dossier {tech} :" }],
    closers: [{ en: "The floor is yours.", fr: "{Vous avez|Tu as} la parole." }],
  },
  business: {
    openers: [{ en: "Let's be efficient.", fr: "Soyons efficaces." }],
    techOpeners: [{ en: "{tech}: show me the impact.", fr: "{tech} : {montrez-moi|montre-moi} l'impact." }],
    closers: [{ en: "Think impact.", fr: "{Pensez|Pense} impact." }],
  },
};

export const CHARACTER_PACKS: Record<string, FlavorPack> = {
  // ---------- NextRound's own recruiters ----------
  marie: { greetings: [{ en: "Hello, I'm Marie. Thank you for your time.", fr: "Bonjour, je suis Marie. Merci pour {votre|ton} temps." }] },
  tom: { greetings: [{ en: "Hi, I'm Tom. No stress, it's a conversation.", fr: "Salut, moi c'est Tom. Pas de stress, on discute." }] },
  ines: { greetings: [{ en: "Good morning. Let us begin.", fr: "Bonjour. Commençons." }] },

  // ---------- Archetypes ----------
  "linkedin-ceo": {
    openers: [{ en: "I'm humbled to ask this question.", fr: "Humblement, je pose cette question." }],
    closers: [{ en: "Thoughts? Agree?", fr: "Des avis ? D'accord ?" }],
  },
  "startup-founder": {
    openers: [{ en: "We're disrupting interviews. Question.", fr: "On disrupte le recrutement. Question." }],
    closers: [{ en: "Move fast, answer faster.", fr: "{Bougez vite, répondez|Bouge vite, réponds} plus vite." }],
  },
  "toxic-hr": {
    openers: [{ en: "We're like a family here. Anyway.", fr: "Ici, on est comme une famille. Bref." }],
    closers: [{ en: "No pressure. (There is pressure.)", fr: "Aucune pression. (Il y a de la pression.)" }],
  },
  "passive-aggressive-manager": {
    openers: [{ en: "As per my last question…", fr: "Comme indiqué dans ma question précédente…" }],
    closers: [{ en: "No rush. Well, some rush.", fr: "Rien ne presse. Enfin, un peu quand même." }],
  },
  "corporate-consultant": {
    openers: [{ en: "Let's leverage some synergies.", fr: "Capitalisons sur nos synergies." }],
    closers: [{ en: "Think outside the box, but inside the scope.", fr: "{Sortez|Sors} du cadre, mais pas du périmètre." }],
  },
  "family-recruiter": { greetings: [{ en: "Welcome to the family!", fr: "Bienvenue dans la famille !" }] },
  "five-years-junior": { openers: [{ en: "For this junior role, ten years of experience required:", fr: "Pour ce poste junior, dix ans d'expérience exigés :" }] },
  "buzzword-pm": {
    openers: [{ en: "Let's circle back and deep-dive.", fr: "Faisons un point et un deep dive." }],
    closers: [{ en: "Let's keep it agile.", fr: "Restons agiles." }],
  },
  "silent-interviewer": { interjections: [{ en: "…", fr: "…" }] },

  // ---------- The Simpsons ----------
  "homer-simpson": {
    greetings: [{ en: "Hi! Don't worry, I'm not judging. Much.", fr: "Salut ! T'inquiète, je juge pas. Enfin, pas trop." }],
    interjections: [
      { en: "D'oh!", fr: "D'oh !" },
      { en: "Mmm… donuts.", fr: "Mmm… des donuts." },
      { en: "Woo-hoo!", fr: "Woo-hoo !" },
    ],
    openers: [{ en: "Okay, focus, Homer… Here it is.", fr: "Bon, concentre-toi, Homer… Voilà." }],
    techOpeners: [{ en: "{tech}? Is that something you eat? Anyway.", fr: "{tech} ? Ça se mange ? Bref." }],
    closers: [{ en: "Take your time, I'll grab a donut.", fr: "Prends ton temps, je vais chercher un donut." }],
  },
  "marge-simpson": {
    greetings: [{ en: "Hello. Make yourself comfortable.", fr: "Bonjour. {Installez-vous|Installe-toi} confortablement." }],
    interjections: [{ en: "Hmmmm…", fr: "Hmmmm…" }],
    closers: [{ en: "Don't worry, you're doing fine.", fr: "Ne {vous inquiétez|t'inquiète} pas, tout se passe bien." }],
  },
  "bart-simpson": {
    greetings: [{ en: "Yo! I'm Bart Simpson. Who the heck are you?", fr: "Salut ! Moi, c'est Bart Simpson. Et toi, t'es qui ?" }],
    interjections: [
      { en: "Ay caramba!", fr: "Ay caramba !" },
      { en: "Cowabunga!", fr: "Cowabunga !" },
    ],
    closers: [{ en: "Don't have a cow, man.", fr: "Relax, mec." }],
  },
  "lisa-simpson": {
    openers: [{ en: "Interesting. Let's go deeper.", fr: "Intéressant. Allons plus loin." }],
    techOpeners: [{ en: "I've read a lot about {tech}.", fr: "J'ai beaucoup lu sur {tech}." }],
  },
  "mr-burns": {
    greetings: [{ en: "Smithers, who is this?", fr: "Smithers, qui est-ce ?" }],
    interjections: [{ en: "Excellent…", fr: "Excellent…" }],
    openers: [{ en: "Let's see what you're worth.", fr: "Voyons ce que {vous valez|tu vaux}." }],
    closers: [{ en: "Smithers, take note.", fr: "Smithers, notez ça." }],
  },
  "waylon-smithers": {
    openers: [{ en: "Mr. Burns would like to know:", fr: "M. Burns aimerait savoir :" }],
    closers: [{ en: "Mr. Burns is watching.", fr: "M. Burns {vous|t'}observe." }],
  },
  "moe-szyslak": {
    interjections: [{ en: "Yeah, yeah…", fr: "Ouais, ouais…" }],
    openers: [{ en: "Listen, pal.", fr: "Écoute, mon pote." }],
  },
  "krusty-the-clown": {
    greetings: [{ en: "Hey hey! It's Krusty!", fr: "Hé hé ! C'est Krusty !" }],
    interjections: [{ en: "Hey hey!", fr: "Hé hé !" }],
  },
  "ned-flanders": {
    greetings: [{ en: "Hi-diddly-ho!", fr: "Salut-salut !" }],
    interjections: [{ en: "Okily-dokily!", fr: "Okidoki !" }],
  },
  "comic-book-guy": {
    interjections: [{ en: "Ahem.", fr: "Hum hum." }],
    openers: [{ en: "Rest assured, I shall judge harshly.", fr: "{Sachez|Sache} que je jugerai sévèrement." }],
    closers: [{ en: "Worst. Answer. Ever? We shall see.", fr: "Pire. Réponse. De tous les temps ? Nous verrons." }],
  },
  "chief-wiggum": {
    openers: [{ en: "Alright, let's see here…", fr: "Bon, voyons voir…" }],
    closers: [{ en: "Nobody move. Except to answer.", fr: "Que personne ne bouge. Sauf pour répondre." }],
  },
  "professor-frink": {
    interjections: [
      { en: "Glavin!", fr: "Glavin !" },
      { en: "Hoyvin-mayvin!", fr: "Hoyvin-mayvin !" },
    ],
    techOpeners: [{ en: "With the {tech}, and the science, and the glavin!", fr: "Avec le {tech}, et la science, et le glavin !" }],
  },

  // ---------- Cartoons ----------
  courage: {
    interjections: [{ en: "Aaaaah!", fr: "Aaaaah !" }],
    closers: [{ en: "The things I do for this job…", fr: "Ce qu'il ne faut pas faire pour ce boulot…" }],
  },
  edd: {
    interjections: [{ en: "Good lord!", fr: "Grand Dieu !" }],
    openers: [{ en: "Let us proceed methodically.", fr: "Procédons avec méthode." }],
  },
  plankton: {
    interjections: [{ en: "Mwahahaha!", fr: "Mwahahaha !" }],
    techOpeners: [{ en: "The secret formula of {tech}…", fr: "La formule secrète de {tech}…" }],
  },
  dexter: {
    interjections: [{ en: "Dee Dee! Get out of my laboratory!", fr: "Dee Dee ! Sors de mon laboratoire !" }],
    openers: [{ en: "Computer, next question!", fr: "Ordinateur, question suivante !" }],
  },
  "johnny-bravo": {
    greetings: [{ en: "Man, I'm pretty. Oh, hi.", fr: "Qu'est-ce que je suis beau. Oh, salut." }],
    interjections: [{ en: "Hoo-hah!", fr: "Hou-ha !" }],
  },
  "samurai-jack": {
    openers: [{ en: "Let us begin.", fr: "Commençons." }],
    closers: [{ en: "Patience is a weapon.", fr: "La patience est une arme." }],
  },
  billy: { interjections: [{ en: "Yaaay!", fr: "Ouaiiis !" }] },
  mandy: { closers: [{ en: "I'm not impressed. Yet.", fr: "Je ne suis pas impressionnée. Pour l'instant." }] },
  "rick-sanchez": {
    interjections: [{ en: "Wubba lubba dub dub!", fr: "Wubba lubba dub dub !" }],
    openers: [{ en: "Listen, Morty— I mean, you.", fr: "Écoute, Morty… enfin, toi." }],
    techOpeners: [{ en: "Infinite universes, and I get the one where we talk {tech}.", fr: "Une infinité d'univers, et je tombe sur celui où on parle de {tech}." }],
    closers: [{ en: "Don't overthink it. Actually, do.", fr: "Réfléchis pas trop. Enfin si, réfléchis." }],
  },

  // ---------- Anime ----------
  luffy: {
    greetings: [{ en: "I'm Luffy! Let's go!", fr: "Moi, c'est Luffy ! On y va !" }],
    interjections: [{ en: "Shishishi!", fr: "Shishishi !" }],
    closers: [{ en: "Meat break after this one!", fr: "Pause viande après celle-là !" }],
  },
  zoro: { openers: [{ en: "I got lost on the way here. Anyway.", fr: "Je me suis perdu en venant. Bref." }] },
  nami: { closers: [{ en: "And that answer had better be worth gold.", fr: "Et cette réponse a intérêt à valoir de l'or." }] },
  robin: { openers: [{ en: "How interesting.", fr: "Comme c'est intéressant." }] },
  chopper: { greetings: [{ en: "Doctor Chopper is listening!", fr: "Docteur Chopper {vous|t'}écoute !" }] },
  sanji: { closers: [{ en: "Answer well and I'll cook you something.", fr: "{Répondez bien et je vous cuisine|Réponds bien et je te cuisine} quelque chose." }] },
  usopp: { interjections: [{ en: "I have eight thousand followers! …Anyway.", fr: "J'ai huit mille hommes sous mes ordres ! …Bref." }] },
  goku: {
    greetings: [{ en: "Hi, I'm Goku!", fr: "Salut, c'est Goku !" }],
    interjections: [{ en: "Kamehameha!", fr: "Kamehameha !" }],
    closers: [{ en: "I can't wait to see how strong you are!", fr: "J'ai hâte de voir {votre|ta} force !" }],
  },
  vegeta: {
    interjections: [{ en: "Hmph!", fr: "Hmph !" }],
    openers: [{ en: "Listen well, Kakarot— I mean, you.", fr: "Écoute bien, Kakarot… enfin, {vous|toi}." }],
    closers: [{ en: "Your level had better be over nine thousand.", fr: "{Votre|Ton} niveau a intérêt à dépasser les huit mille." }],
  },
  piccolo: {
    openers: [{ en: "Focus.", fr: "Concentration." }],
    closers: [{ en: "Don't waste my time.", fr: "Ne me {faites|fais} pas perdre mon temps." }],
  },
  naruto: {
    greetings: [{ en: "I'm gonna be Hokage! But first, your turn!", fr: "Je vais devenir Hokage ! Mais d'abord, à toi !" }],
    interjections: [{ en: "Dattebayo!", fr: "Dattebayo !" }],
  },
  kakashi: {
    greetings: [{ en: "Sorry I'm late. I got lost on the path of life.", fr: "Désolé du retard, je me suis perdu sur le chemin de la vie." }],
    interjections: [{ en: "Yo.", fr: "Yo." }],
  },
  itachi: { openers: [{ en: "Look closely.", fr: "{Regardez|Regarde} bien." }] },
  sukuna: { openers: [{ en: "Entertain me.", fr: "{Divertissez|Divertis}-moi." }] },

  // ---------- Film and TV characters ----------
  "tony-montana": { closers: [{ en: "The world is yours.", fr: "Le monde est à {vous|toi}." }] },
  "vito-corleone": {
    openers: [{ en: "I'm going to ask you a question you can't refuse.", fr: "Je vais {vous|te} poser une question que {vous ne pourrez|tu ne pourras} pas refuser." }],
  },
  "michael-corleone": { closers: [{ en: "It's not personal. It's strictly business.", fr: "Ce n'est pas personnel, ce sont les affaires." }] },
  "tyler-durden": { openers: [{ en: "The first rule of this interview: you answer the question.", fr: "Première règle de cet entretien : on répond à la question." }] },
  "walter-white": {
    openers: [{ en: "Say my name. …Never mind. Question.", fr: "Dis mon nom. …Laisse tomber. Question." }],
    closers: [{ en: "Apply yourself.", fr: "{Appliquez-vous|Applique-toi}." }],
  },
  "saul-goodman": { greetings: [{ en: "Better call Saul! Well, you're already here.", fr: "Better call Saul ! Bon, {vous êtes|tu es} déjà là." }] },
  "the-dude": {
    interjections: [{ en: "Yeah, well…", fr: "Ouais, enfin…" }],
    closers: [{ en: "The Dude abides.", fr: "Le Duc reste zen." }],
  },
  "darth-vader": {
    greetings: [{ en: "I have been expecting you.", fr: "Je {vous|t'}attendais." }],
    techOpeners: [{ en: "The power of {tech} is insignificant next to the power of the Force.", fr: "La puissance de {tech} est insignifiante face à la puissance de la Force." }],
  },
  palpatine: {
    interjections: [{ en: "Good… good…", fr: "Bien… bien…" }],
    closers: [{ en: "Let the questions flow through you.", fr: "{Laissez|Laisse} les questions {vous|te} traverser." }],
  },
  yoda: {
    openers: [{ en: "Begin, we must.", fr: "Commencer, nous devons." }],
    techOpeners: [{ en: "{tech}, the question is about. Hmm.", fr: "Sur {tech}, la question porte. Hmm." }],
    closers: [{ en: "Do or do not. There is no try.", fr: "Fais-le ou ne le fais pas. Il n'y a pas d'essai." }],
  },
  kratos: {
    greetings: [{ en: "Sit. We begin.", fr: "{Asseyez-vous|Assieds-toi}. Nous commençons." }],
    interjections: [{ en: "Hm.", fr: "Hm." }],
    openers: [{ en: "Next. Focus.", fr: "Suivant. {Concentrez-vous|Concentre-toi}." }],
    techOpeners: [{ en: "{tech}. Show me what you know.", fr: "{tech}. {Montrez|Montre}-moi ce que {vous savez|tu sais}." }],
    closers: [{ en: "Do not be sorry. Be better.", fr: "Ne {soyez|sois} pas désolé. {Soyez|Sois} meilleur." }],
  },
};
