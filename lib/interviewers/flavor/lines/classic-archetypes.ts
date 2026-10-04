import type { FlavorPack } from "../types";

// More lines for NextRound's own recruiters and the workplace archetypes, added after those in packs.ts.
// topicOpeners react to what the question is about (lib/interviewers/flavor/types.ts).

export const CLASSIC_ARCHETYPE_LINES: Record<string, FlavorPack> = {
  marie: {
    greetings: [{ en: "Hello, and welcome. We'll keep this relaxed and concrete.", fr: "Bonjour et bienvenue. On va rester détendus et concrets." }],
    openers: [
      { en: "Let's move on.", fr: "Passons à la suite." },
      { en: "Here is the next one.", fr: "Voici la suivante." },
    ],
    closers: [
      { en: "Take a moment if you need it.", fr: "{Prenez|Prends} un instant si besoin." },
      { en: "An example always helps.", fr: "Un exemple aide toujours." },
    ],
    topicOpeners: {
      introduction: [{ en: "To start, I'd like to get to know you.", fr: "Pour commencer, j'aimerais {vous|te} connaître." }],
      motivation: [{ en: "Let's talk about what brings you here.", fr: "Parlons de ce qui {vous|t'}amène ici." }],
      weaknesses: [{ en: "No trap here, I promise.", fr: "Pas de piège ici, promis." }],
      salary: [{ en: "A practical question now.", fr: "Une question pratique maintenant." }],
      closing: [{ en: "We're nearly done.", fr: "Nous avons presque terminé." }],
      troubleshoot: [{ en: "A small real-life case.", fr: "Un petit cas concret." }],
    },
  },
  tom: {
    greetings: [{ en: "Grab a coffee if you like, we're just chatting.", fr: "Prends un café si tu veux, on discute juste." }],
    interjections: [{ en: "Cool.", fr: "Cool." }],
    openers: [
      { en: "Next one, easy.", fr: "La suivante, tranquille." },
      { en: "Alright, moving on.", fr: "Allez, on avance." },
    ],
    techOpeners: [{ en: "Let's geek out a bit on {tech}.", fr: "On parle un peu {tech} entre geeks." }],
    closers: [{ en: "No wrong answer here, just tell me how you'd do it.", fr: "Pas de mauvaise réponse, dis-moi juste comment tu ferais." }],
    topicOpeners: {
      motivation: [{ en: "Honest question, no corporate answer needed.", fr: "Question franche, pas besoin de langue de bois." }],
      salary: [{ en: "Let's talk money, no taboo.", fr: "On parle argent, sans tabou." }],
      troubleshoot: [{ en: "Classic Friday-afternoon bug:", fr: "Le bug classique du vendredi après-midi :" }],
      practice: [{ en: "Hands-on question:", fr: "Question pratique :" }],
    },
  },
  ines: {
    openers: [
      { en: "Next question.", fr: "Question suivante." },
      { en: "Let us continue.", fr: "Poursuivons." },
    ],
    closers: [
      { en: "Be precise.", fr: "{Soyez|Sois} précis." },
      { en: "Structure your answer.", fr: "{Structurez|Structure} {votre|ta} réponse." },
    ],
    topicOpeners: {
      experience: [{ en: "I would like facts, not intentions.", fr: "Je souhaite des faits, pas des intentions." }],
      situation: [{ en: "A situation. Context, action, result, please.", fr: "Une mise en situation. Contexte, action, résultat, s'il {vous|te} plaît." }],
      tricky: [{ en: "Take this one seriously.", fr: "{Prenez|Prends} celle-ci au sérieux." }],
      design: [{ en: "Explain your reasoning step by step.", fr: "{Expliquez|Explique} {votre|ton} raisonnement étape par étape." }],
    },
  },

  "linkedin-ceo": {
    greetings: [{ en: "Thrilled to announce this interview. 🚀", fr: "Ravi de vous annoncer cet entretien. 🚀" }],
    interjections: [
      { en: "Let that sink in.", fr: "Prenez un instant pour méditer ça." },
      { en: "Agree?", fr: "D'accord ?" },
    ],
    openers: [{ en: "Unpopular opinion: here is the next question.", fr: "Opinion impopulaire : voici la question suivante." }],
    techOpeners: [{ en: "5 lessons {tech} taught me about leadership. Lesson one:", fr: "5 leçons que {tech} m'a apprises sur le leadership. Leçon une :" }],
    closers: [{ en: "Repost if you agree.", fr: "Partagez si vous êtes d'accord." }],
    topicOpeners: {
      weaknesses: [{ en: "Vulnerability is a superpower. So:", fr: "La vulnérabilité est un super-pouvoir. Donc :" }],
      motivation: [{ en: "Purpose. Passion. Pivot. Tell me:", fr: "Sens. Passion. Pivot. {Dites|Dis}-moi :" }],
      career: [{ en: "Where do you see yourself on your growth journey?", fr: "Où {vous voyez-vous|te vois-tu} dans {votre|ton} parcours de croissance ?" }],
      salary: [{ en: "Money isn't everything. Equity is. But:", fr: "L'argent ne fait pas tout. Les parts, si. Mais :" }],
    },
  },
  "startup-founder": {
    greetings: [{ en: "Welcome to the rocket ship. Seats are limited.", fr: "Bienvenue dans la fusée. Les places sont limitées." }],
    interjections: [{ en: "Ship it!", fr: "On livre !" }],
    techOpeners: [{ en: "Our whole stack is {tech}. Mostly. Kind of.", fr: "Toute notre stack est en {tech}. Enfin presque. En gros." }],
    closers: [{ en: "Think like an owner.", fr: "Pense comme un fondateur." }],
    topicOpeners: {
      salary: [{ en: "We pay in equity, ping-pong and vision. And also:", fr: "On paie en parts, en ping-pong et en vision. Et aussi :" }],
      situation: [{ en: "It's 2 a.m., prod is down, investors are calling.", fr: "Il est 2 h du matin, la prod est tombée, les investisseurs appellent." }],
      design: [{ en: "We need it to scale to a billion users by Monday.", fr: "Il faut que ça tienne un milliard d'utilisateurs d'ici lundi." }],
      career: [{ en: "In five years, we'll be a unicorn. And you?", fr: "Dans cinq ans, on sera une licorne. Et toi ?" }],
    },
  },
  "toxic-hr": {
    interjections: [{ en: "Mm-hm.", fr: "Mm-hm." }],
    openers: [{ en: "We value work-life balance. Mostly work.", fr: "On tient à l'équilibre vie pro, vie perso. Surtout pro." }],
    closers: [{ en: "Take all the time you need. Within thirty seconds.", fr: "{Prenez|Prends} tout le temps nécessaire. Dans les trente secondes." }],
    topicOpeners: {
      salary: [{ en: "Before we talk numbers, remember: passion is priceless.", fr: "Avant de parler chiffres, n'oubliez pas : la passion n'a pas de prix." }],
      weaknesses: [{ en: "Be honest. It will be used for your growth. And your file.", fr: "Soyez honnête. Ça servira à votre évolution. Et à votre dossier." }],
      inappropriate: [{ en: "Just between us, off the record:", fr: "Juste entre nous, en off :" }],
      situation: [{ en: "Your manager emails you at 11 p.m.", fr: "Votre manager vous écrit à 23 h." }],
    },
  },
  "passive-aggressive-manager": {
    interjections: [{ en: "Interesting choice.", fr: "Intéressant comme choix." }],
    openers: [{ en: "Per my previous question, which I'm sure you remember…", fr: "Suite à ma question précédente, dont vous vous souvenez sûrement…" }],
    closers: [{ en: "Whenever you're ready. We're all waiting.", fr: "Quand vous voulez. On attend tous." }],
    topicOpeners: {
      situation: [{ en: "Hypothetically, if someone missed a deadline. Someone.", fr: "Hypothétiquement, si quelqu'un ratait une échéance. Quelqu'un." }],
      strengths: [{ en: "I'm sure you have many. Name one.", fr: "Vous en avez sûrement plein. Citez-en une." }],
      best_practice: [{ en: "Just a friendly reminder about best practices:", fr: "Petit rappel amical sur les bonnes pratiques :" }],
    },
  },
  "corporate-consultant": {
    interjections: [{ en: "Let me reframe that.", fr: "Je reformule." }],
    techOpeners: [{ en: "Let's build a {tech} roadmap, in three phases.", fr: "Construisons une feuille de route {tech}, en trois phases." }],
    closers: [{ en: "Answer in three bullet points, ideally.", fr: "Répondez en trois points, idéalement." }],
    topicOpeners: {
      design: [{ en: "Let's whiteboard the target architecture.", fr: "Posons l'architecture cible au tableau." }],
      compare: [{ en: "Quick benchmark, two options, one recommendation:", fr: "Benchmark rapide, deux options, une recommandation :" }],
      career: [{ en: "Let's align on your five-year value proposition.", fr: "Alignons-nous sur votre proposition de valeur à cinq ans." }],
    },
  },
  "family-recruiter": {
    interjections: [{ en: "Aww!", fr: "Ooooh !" }],
    openers: [{ en: "Come on, cousin, next one!", fr: "Allez, cousin, la suivante !" }],
    closers: [{ en: "You're one of us already, I can feel it.", fr: "Tu es déjà des nôtres, je le sens." }],
    topicOpeners: {
      salary: [{ en: "In a family, we don't talk about money… but let's try.", fr: "En famille, on ne parle pas d'argent… mais essayons." }],
      motivation: [{ en: "Why do you want to join the family?", fr: "Pourquoi tu veux rejoindre la famille ?" }],
      inappropriate: [{ en: "Since we're family now, tell me everything:", fr: "Comme on est de la famille maintenant, raconte-moi tout :" }],
    },
  },
  "five-years-junior": {
    interjections: [{ en: "Hmm. Junior, you said?", fr: "Hmm. Junior, vous disiez ?" }],
    closers: [{ en: "Entry-level position, expert answer expected.", fr: "Poste débutant, réponse d'expert attendue." }],
    techOpeners: [{ en: "We need ten years of {tech}. It's been around for five, so be creative.", fr: "Il nous faut dix ans de {tech}. Ça existe depuis cinq, donc soyez créatif." }],
    topicOpeners: {
      experience: [{ en: "Tell me about your fifteen years in the industry.", fr: "Parlez-moi de vos quinze ans dans le métier." }],
      salary: [{ en: "This junior role pays junior. Very junior.", fr: "Ce poste junior est payé junior. Très junior." }],
      skill_gap: [{ en: "Ah, a gap. On a junior. Shocking.", fr: "Ah, une lacune. Chez un junior. Quelle surprise." }],
    },
  },
  "buzzword-pm": {
    interjections: [{ en: "Love that energy!", fr: "J'adore cette énergie !" }],
    techOpeners: [{ en: "Let's unpack {tech} at a high level, then zoom in.", fr: "Décortiquons {tech} de haut, puis zoomons." }],
    closers: [{ en: "Let's take that offline. Kidding, answer now.", fr: "On en reparle en off. Je plaisante, réponds maintenant." }],
    topicOpeners: {
      situation: [{ en: "Quick alignment on a cross-functional scenario:", fr: "Petit alignement sur un scénario transverse :" }],
      compare: [{ en: "Let's do a quick trade-off matrix:", fr: "Faisons une rapide matrice de compromis :" }],
      closing: [{ en: "Before we wrap, any blockers on your side?", fr: "Avant de clôturer, des points bloquants de ton côté ?" }],
    },
  },
  "silent-interviewer": {
    openers: [{ en: "(writes something down)", fr: "(note quelque chose)" }],
    closers: [
      { en: "(stares)", fr: "(vous fixe)" },
      { en: "(nods slowly)", fr: "(hoche lentement la tête)" },
    ],
    topicOpeners: {
      tricky: [{ en: "(raises an eyebrow)", fr: "(hausse un sourcil)" }],
      salary: [{ en: "(slides a piece of paper across the table)", fr: "(fait glisser une feuille sur la table)" }],
    },
  },
};
