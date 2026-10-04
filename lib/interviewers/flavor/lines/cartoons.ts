import type { FlavorPack } from "../types";

// More lines for the cartoon characters (fan parodies), added after those in packs.ts.

export const CARTOONS_LINES: Record<string, FlavorPack> = {
  courage: {
    greetings: [{ en: "H-h-hello! Please don't be scary.", fr: "B-b-bonjour ! S'il te plaît, sois pas effrayant." }],
    interjections: [{ en: "Oh no, oh no, oh no…", fr: "Oh non, oh non, oh non…" }],
    openers: [{ en: "Okay… I'm brave. Next question.", fr: "D'accord… je suis courageux. Question suivante." }],
    topicOpeners: {
      situation: [{ en: "Something spooky happens at work…", fr: "Il se passe un truc effrayant au boulot…" }],
      troubleshoot: [{ en: "There's a monster in the code! Maybe a bug.", fr: "Il y a un monstre dans le code ! Ou un bug." }],
      weaknesses: [{ en: "I'm scared of everything. What about you?", fr: "Moi, j'ai peur de tout. Et toi ?" }],
    },
  },
  edd: {
    greetings: [{ en: "Greetings! I've labelled everything for our interview.", fr: "Bonjour ! J'ai tout étiqueté pour notre entretien." }],
    closers: [{ en: "Do be thorough, please.", fr: "{Soyez|Sois} rigoureux, je {vous|t'}en prie." }],
    topicOpeners: {
      best_practice: [{ en: "Cleanliness and order, my favourite topic!", fr: "L'ordre et la propreté, mon sujet préféré !" }],
      concept: [{ en: "A matter of science, how exciting!", fr: "Une question de science, quelle joie !" }],
      design: [{ en: "Let us plan this with a proper diagram.", fr: "Planifions cela avec un vrai schéma." }],
    },
  },
  plankton: {
    greetings: [{ en: "Welcome to the Chum Bucket! Customers are rare. So are candidates.", fr: "Bienvenue au Seau de l'Écume ! Les clients sont rares. Les candidats aussi." }],
    openers: [{ en: "Phase two of my plan: this question!", fr: "Phase deux de mon plan : cette question !" }],
    closers: [{ en: "I went to college!", fr: "J'ai fait des études, moi !" }],
    topicOpeners: {
      career: [{ en: "World domination is my career plan. Yours?", fr: "Dominer le monde, c'est mon plan de carrière. Et le tien ?" }],
      design: [{ en: "Design me a scheme to steal the formula. I mean, a system.", fr: "Conçois-moi un plan pour voler la formule. Enfin, un système." }],
      salary: [{ en: "Pay? You'll get a share of the secret formula. Someday.", fr: "Le salaire ? Tu auras une part de la formule secrète. Un jour." }],
    },
  },
  dexter: {
    greetings: [{ en: "Welcome to my secret laboratory. Touch nothing.", fr: "Bienvenue dans mon laboratoire secret. Ne {touchez|touche} à rien." }],
    interjections: [{ en: "Omelette du fromage!", fr: "Omelette du fromage !" }],
    techOpeners: [{ en: "Initiating {tech} analysis.", fr: "Lancement de l'analyse {tech}." }],
    closers: [{ en: "Precision, please. This is science.", fr: "De la précision. C'est de la science." }],
    topicOpeners: {
      troubleshoot: [{ en: "The experiment failed. Find out why.", fr: "L'expérience a échoué. {Trouvez|Trouve} pourquoi." }],
      design: [{ en: "Blueprint time. Show me your machine.", fr: "Place aux plans. {Montrez|Montre}-moi {votre|ta} machine." }],
    },
  },
  "johnny-bravo": {
    interjections: [{ en: "Whoa, mama!", fr: "Oh, la vache !" }],
    openers: [{ en: "Check out these questions. And these muscles.", fr: "Regarde ces questions. Et ces muscles." }],
    closers: [{ en: "Answer with style, baby.", fr: "Réponds avec style, bébé." }],
    topicOpeners: {
      strengths: [{ en: "My strength? Look at me. Now you.", fr: "Ma force ? Regarde-moi. À toi maintenant." }],
      introduction: [{ en: "Tell me about yourself. Not as cool as me, but go.", fr: "Parle-moi de toi. Moins cool que moi, mais vas-y." }],
    },
  },
  "samurai-jack": {
    greetings: [{ en: "I seek the path back to the past. You seek a job. Let us begin.", fr: "Je cherche le chemin du passé. {Vous cherchez|Tu cherches} un emploi. Commençons." }],
    interjections: [{ en: "…", fr: "…" }],
    topicOpeners: {
      weaknesses: [{ en: "A warrior knows his weakness.", fr: "Un guerrier connaît sa faiblesse." }],
      situation: [{ en: "A trial lies before you.", fr: "Une épreuve se dresse devant {vous|toi}." }],
      career: [{ en: "Every journey has a destination.", fr: "Tout voyage a une destination." }],
    },
  },
  billy: {
    greetings: [{ en: "Hi! I'm Billy! Do you like nachos?", fr: "Salut ! Moi c'est Billy ! T'aimes les nachos ?" }],
    openers: [
      { en: "Ooh, ooh, next question!", fr: "Oh, oh, question suivante !" },
      { en: "Mandy says I have to read this one.", fr: "Mandy dit que je dois lire celle-là." },
    ],
    closers: [{ en: "There's no wrong answer! Except some.", fr: "Y a pas de mauvaise réponse ! Sauf certaines." }],
    topicOpeners: {
      strengths: [{ en: "My strength is I can fit a whole pizza in my mouth. Yours?", fr: "Moi, ma force, c'est que je peux mettre une pizza entière dans ma bouche. Et toi ?" }],
      tricky: [{ en: "This one's tricky. Even for me!", fr: "Celle-là, elle est dure. Même pour moi !" }],
    },
  },
  mandy: {
    greetings: [{ en: "Sit down. I don't smile.", fr: "{Asseyez-vous|Assieds-toi}. Je ne souris pas." }],
    openers: [{ en: "Next.", fr: "Suivante." }],
    topicOpeners: {
      strengths: [{ en: "Strengths. Make them sound real.", fr: "Les qualités. {Rendez|Rends}-les crédibles." }],
      weaknesses: [{ en: "I already know your weaknesses. Confirm them.", fr: "Je connais déjà {vos|tes} faiblesses. {Confirmez|Confirme}-les." }],
      salary: [{ en: "Ask for what you're worth. I'll decide what that is.", fr: "{Demandez|Demande} ce que {vous valez|tu vaux}. Je déciderai combien c'est." }],
    },
  },
  "rick-sanchez": {
    greetings: [{ en: "*burp* Okay, let's get this over with, I've got a portal open.", fr: "*rot* Bon, finissons-en, j'ai un portail ouvert." }],
    interjections: [{ en: "*burp*", fr: "*rot*" }],
    techOpeners: [{ en: "In dimension C-137, {tech} is a sentient fungus. Here it's just tech.", fr: "Dans la dimension C-137, {tech} est un champignon conscient. Ici, c'est juste de la tech." }],
    topicOpeners: {
      design: [{ en: "Design me something that doesn't collapse into a black hole.", fr: "Conçois-moi un truc qui s'effondre pas en trou noir." }],
      troubleshoot: [{ en: "Something broke. Probably Jerry's fault. Find it anyway.", fr: "Un truc a cassé. Sûrement la faute de Jerry. Trouve quand même." }],
      motivation: [{ en: "Why this job? And don't say 'to make the world better', Morty.", fr: "Pourquoi ce boulot ? Et dis pas « pour rendre le monde meilleur », Morty." }],
    },
  },
};
