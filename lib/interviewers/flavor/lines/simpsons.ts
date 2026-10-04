import type { FlavorPack } from "../types";

// More lines for The Simpsons characters (fan parodies), added after those in packs.ts.

export const SIMPSONS_LINES: Record<string, FlavorPack> = {
  "homer-simpson": {
    greetings: [{ en: "Hi! I'm Homer. I work at the nuclear plant, so I know about pressure.", fr: "Salut ! Moi c'est Homer. Je bosse à la centrale nucléaire, alors la pression, je connais." }],
    interjections: [
      { en: "Mmm… free coffee.", fr: "Mmm… du café gratuit." },
      { en: "Why you little…! Sorry, wrong person.", fr: "Espèce de petit… ! Pardon, pas la bonne personne." },
    ],
    openers: [
      { en: "Okay, this one's from the card. I didn't write it.", fr: "Bon, celle-là est sur la fiche. C'est pas moi qui l'ai écrite." },
      { en: "Next! Then lunch.", fr: "Suivante ! Et après, le déjeuner." },
    ],
    techOpeners: [{ en: "My son says {tech} is cool. My son also eats paste.", fr: "Mon fils dit que {tech}, c'est cool. Mon fils mange aussi de la colle." }],
    closers: [
      { en: "Trying is the first step towards failure. Kidding! Go.", fr: "Essayer, c'est le premier pas vers l'échec. Je rigole ! Vas-y." },
      { en: "If it's boring, I might nap. Not a judgment.", fr: "Si c'est ennuyeux, je fais peut-être une sieste. C'est pas un jugement." },
    ],
    topicOpeners: {
      salary: [{ en: "Money! Mmm… money. Okay, serious face:", fr: "L'argent ! Mmm… l'argent. Bon, tête sérieuse :" }],
      weaknesses: [{ en: "Mine is donuts. Yours?", fr: "Le mien, c'est les donuts. Et toi ?" }],
      strengths: [{ en: "I'm great at napping. What are you great at?", fr: "Moi, je suis super fort en sieste. Et toi, t'es fort en quoi ?" }],
      motivation: [{ en: "I'm here for the free donuts. Why are you here?", fr: "Moi, je suis là pour les donuts gratuits. Et toi, pourquoi t'es là ?" }],
      troubleshoot: [{ en: "Something blew up. Not at the plant this time. Probably.", fr: "Un truc a explosé. Pas à la centrale cette fois. Sûrement." }],
      career: [{ en: "In five years I'll be… at Moe's. And you?", fr: "Dans cinq ans je serai… chez Moe. Et toi ?" }],
      inappropriate: [{ en: "Marge says I shouldn't ask this, but…", fr: "Marge dit que je devrais pas demander ça, mais…" }],
    },
  },
  "marge-simpson": {
    greetings: [{ en: "Hello, dear. Would you like a glass of water first?", fr: "Bonjour. {Voulez-vous|Veux-tu} un verre d'eau d'abord ?" }],
    openers: [
      { en: "Let's take this one calmly.", fr: "Prenons celle-ci calmement." },
      { en: "Here's the next question, no rush.", fr: "Voici la question suivante, rien ne presse." },
    ],
    closers: [{ en: "Just be yourself. Well, your professional self.", fr: "{Soyez vous-même|Sois toi-même}. Enfin, en version professionnelle." }],
    topicOpeners: {
      weaknesses: [{ en: "Everybody has something to work on. Even Homer. Especially Homer.", fr: "Tout le monde a quelque chose à travailler. Même Homer. Surtout Homer." }],
      situation: [{ en: "Imagine a stressful day. I have a few of those.", fr: "{Imaginez|Imagine} une journée stressante. J'en connais quelques-unes." }],
      inappropriate: [{ en: "Hmmm… I'm not sure this one should be asked, but here it is.", fr: "Hmmm… je ne suis pas sûre qu'on devrait poser celle-là, mais la voici." }],
      closing: [{ en: "You did well. One last thing:", fr: "{Vous vous en êtes|Tu t'en es} bien sorti. Une dernière chose :" }],
    },
  },
  "bart-simpson": {
    interjections: [
      { en: "Eat my shorts! …Sorry, reflex.", fr: "Mange mon short ! …Pardon, réflexe." },
      { en: "Whoa, mama!", fr: "Oh la vache !" },
    ],
    openers: [
      { en: "Okay, next. I'm missing skateboard time.", fr: "Bon, la suivante. Je rate mon heure de skate." },
      { en: "This one's a real question, I swear.", fr: "Celle-là, c'est une vraie question, je jure." },
    ],
    techOpeners: [{ en: "Lisa would know about {tech}. Your turn.", fr: "Lisa saurait pour {tech}. À toi." }],
    closers: [{ en: "I didn't do it. Your turn to do it.", fr: "C'est pas moi. À toi de jouer." }],
    topicOpeners: {
      weaknesses: [{ en: "Mine? Detention. Many detentions. Yours?", fr: "Mon point faible ? Les heures de colle. Beaucoup. Et toi ?" }],
      tricky: [{ en: "This one's a prank question. Or is it?", fr: "Celle-là, c'est une question farce. Ou pas ?" }],
      situation: [{ en: "Say Principal Skinner catches you. I mean, your boss.", fr: "Imagine que Skinner te chope. Enfin, ton chef." }],
      salary: [{ en: "How many comic books are we talking?", fr: "On parle de combien de BD ?" }],
    },
  },
  "lisa-simpson": {
    greetings: [{ en: "Hello. I've prepared notes. Colour-coded.", fr: "Bonjour. J'ai préparé des notes. Avec un code couleur." }],
    interjections: [{ en: "Fascinating.", fr: "Fascinant." }],
    closers: [
      { en: "Please cite your sources. Kidding. Mostly.", fr: "{Citez vos|Cite tes} sources. Je plaisante. Presque." },
      { en: "Ethics count too.", fr: "L'éthique compte aussi." },
    ],
    topicOpeners: {
      motivation: [{ en: "Does this job match your values?", fr: "Ce poste correspond-il à {vos|tes} valeurs ?" }],
      concept: [{ en: "Let's check your understanding, from first principles.", fr: "Vérifions {votre|ta} compréhension, depuis les bases." }],
      design: [{ en: "Think about the long term. And the planet.", fr: "{Pensez|Pense} au long terme. Et à la planète." }],
      inappropriate: [{ en: "This question is questionable. Literally. Spot why.", fr: "Cette question est discutable. Littéralement. {Repérez|Repère} pourquoi." }],
    },
  },
  "mr-burns": {
    greetings: [{ en: "Ahh, a new employee. Or should I say, a new asset.", fr: "Ahh, un nouvel employé. Ou devrais-je dire, un nouvel actif." }],
    interjections: [{ en: "Release the hounds! …Not yet.", fr: "Lâchez les chiens ! …Pas encore." }],
    openers: [{ en: "Proceed.", fr: "Continuez." }],
    techOpeners: [{ en: "In my day, {tech} was done with steam and child labour.", fr: "De mon temps, {tech}, on faisait ça à la vapeur." }],
    closers: [{ en: "Choose your words wisely. I have a trapdoor.", fr: "{Choisissez|Choisis} bien {vos|tes} mots. J'ai une trappe." }],
    topicOpeners: {
      salary: [{ en: "Salary? Smithers, what is this 'salary'?", fr: "Un salaire ? Smithers, qu'est-ce donc qu'un « salaire » ?" }],
      weaknesses: [{ en: "Weakness is a luxury I've never afforded.", fr: "La faiblesse est un luxe que je ne me suis jamais offert." }],
      motivation: [{ en: "Why do you crave employment at my plant?", fr: "Pourquoi convoitez-vous un poste dans ma centrale ?" }],
      inappropriate: [{ en: "Smithers says I'm not allowed to ask this. Bah.", fr: "Smithers dit que je n'ai pas le droit de demander ça. Peuh." }],
    },
  },
  "waylon-smithers": {
    greetings: [{ en: "Good morning. Mr. Burns will be with us in spirit.", fr: "Bonjour. M. Burns sera parmi nous en pensée." }],
    interjections: [{ en: "Excellent, sir. I mean… go on.", fr: "Excellent, monsieur. Enfin… {continuez|continue}." }],
    openers: [{ en: "Next, as Mr. Burns requested:", fr: "Ensuite, à la demande de M. Burns :" }],
    topicOpeners: {
      strengths: [{ en: "Loyalty is a strength. Just saying.", fr: "La loyauté est une qualité. Je dis ça comme ça." }],
      salary: [{ en: "Between us, Mr. Burns thinks a dime is generous.", fr: "Entre nous, M. Burns trouve qu'une pièce de dix cents, c'est généreux." }],
    },
  },
  "moe-szyslak": {
    greetings: [{ en: "Moe's Tavern, Moe speaking. Oh, it's an interview. Fine.", fr: "Taverne de Moe, Moe à l'appareil. Ah, c'est un entretien. Bon." }],
    interjections: [{ en: "Aw, geez.", fr: "Oh, misère." }],
    closers: [{ en: "And don't make me come over there.", fr: "Et m'oblige pas à venir là-bas." }],
    topicOpeners: {
      salary: [{ en: "Money talk. My favourite and my saddest topic.", fr: "On parle fric. Mon sujet préféré et le plus triste." }],
      weaknesses: [{ en: "Weaknesses? Pal, I wrote the book.", fr: "Des points faibles ? Mon pote, j'ai écrit le bouquin." }],
      situation: [{ en: "Picture a customer who won't pay his tab.", fr: "Imagine un client qui veut pas payer son ardoise." }],
    },
  },
  "krusty-the-clown": {
    interjections: [{ en: "Ha-ha-ha! …Ahem.", fr: "Ha-ha-ha ! …Hum." }],
    openers: [
      { en: "And now, for my next trick: a question!", fr: "Et maintenant, mon prochain numéro : une question !" },
      { en: "Don't touch the button. Answer this:", fr: "Touche pas au bouton. Réponds à ça :" },
    ],
    closers: [{ en: "Make it funny. Or at least short.", fr: "Rends ça drôle. Ou au moins court." }],
    topicOpeners: {
      salary: [{ en: "Money! I love money! I've lent it to everyone.", fr: "L'argent ! J'adore l'argent ! J'en dois à tout le monde." }],
      tricky: [{ en: "Pie in the face if you get this wrong. Kidding!", fr: "Tarte à la crème si tu te trompes. Je rigole !" }],
      closing: [{ en: "That's our show, folks! Almost.", fr: "C'est la fin du spectacle ! Presque." }],
    },
  },
  "ned-flanders": {
    interjections: [{ en: "Gosh darn diddly!", fr: "Saperlipopette-pette !" }],
    openers: [{ en: "Okily-dokily, here's the next-erino!", fr: "Okidoki, voici la suivante-ette !" }],
    closers: [{ en: "No pressure-ino, neighborino!", fr: "Aucune pression-ette, voisin !" }],
    topicOpeners: {
      weaknesses: [{ en: "We all have a little something to fix-a-roo.", fr: "On a tous un petit quelque chose à réparer-ette." }],
      inappropriate: [{ en: "Hmm, that's not a very neighbourly question… but here it is.", fr: "Hum, c'est pas une question très voisine-ette… mais la voici." }],
      motivation: [{ en: "What's got you all fired-up-diddly about this job?", fr: "Qu'est-ce qui {vous|te} motive-ette autant pour ce poste ?" }],
    },
  },
  "comic-book-guy": {
    greetings: [{ en: "Welcome. You have exactly one chance to impress me.", fr: "Bienvenue. Vous avez exactement une chance de m'impressionner." }],
    interjections: [{ en: "Oh, I've waited my whole life for this answer.", fr: "Oh, j'ai attendu toute ma vie cette réponse." }],
    techOpeners: [{ en: "I have strong, well-documented opinions on {tech}.", fr: "J'ai des avis tranchés et documentés sur {tech}." }],
    topicOpeners: {
      compare: [{ en: "A classic debate. Choose wisely.", fr: "Un débat classique. Choisissez bien." }],
      best_practice: [{ en: "There is a canon. Respect the canon.", fr: "Il existe un canon. Respectez le canon." }],
      strengths: [{ en: "Your greatest strength. Prove it.", fr: "Votre plus grande force. Prouvez-la." }],
    },
  },
  "chief-wiggum": {
    interjections: [{ en: "Bake 'em away, toys!", fr: "Embarquez-les, les gars !" }],
    closers: [{ en: "Do I look like I know what I'm doing? Your turn.", fr: "J'ai l'air de savoir ce que je fais ? À toi." }],
    topicOpeners: {
      situation: [{ en: "Okay, picture this: a crime. No, a bug.", fr: "Bon, imagine : un crime. Non, un bug." }],
      troubleshoot: [{ en: "We've got a suspect: the code. Investigate.", fr: "On a un suspect : le code. Enquête." }],
      inappropriate: [{ en: "This one might be illegal. I'd know, I'm the police.", fr: "Celle-là est peut-être illégale. Je suis bien placé, je suis la police." }],
    },
  },
  "professor-frink": {
    greetings: [{ en: "Welcome to my laboratory, with the questions and the answering!", fr: "Bienvenue dans mon laboratoire, avec les questions et les réponses !" }],
    interjections: [{ en: "Mm-hey!", fr: "Mm-hé !" }],
    closers: [{ en: "Explain it with the clarity and the precision, mm-hey!", fr: "Explique avec la clarté et la précision, mm-hé !" }],
    topicOpeners: {
      concept: [{ en: "A fundamental question, with the theory and the basics!", fr: "Une question fondamentale, avec la théorie et les bases !" }],
      design: [{ en: "Design me a machine! Well, a system. With the boxes and arrows!", fr: "Conçois-moi une machine ! Enfin, un système. Avec les boîtes et les flèches !" }],
      troubleshoot: [{ en: "Something has exploded, with the smoke and the error messages!", fr: "Quelque chose a explosé, avec la fumée et les messages d'erreur !" }],
    },
  },
};
