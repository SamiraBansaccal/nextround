import type { FlavorPack } from "../types";

// More lines for the anime characters (fan parodies), added after those in packs.ts.

export const ANIME_LINES: Record<string, FlavorPack> = {
  luffy: {
    interjections: [{ en: "Gomu gomu no… question!", fr: "Gomu gomu no… question !" }],
    openers: [
      { en: "Next adventure!", fr: "Prochaine aventure !" },
      { en: "Ooh, I like this one!", fr: "Oh, j'aime bien celle-là !" },
    ],
    techOpeners: [{ en: "{tech}? Is it a new island? Let's go!", fr: "{tech} ? C'est une nouvelle île ? On y va !" }],
    topicOpeners: {
      career: [{ en: "I'm gonna be King of the Pirates! What are you gonna be?", fr: "Je vais devenir le Roi des Pirates ! Et toi, tu vas devenir quoi ?" }],
      motivation: [{ en: "Why do you want to join my crew? I mean, this team!", fr: "Pourquoi tu veux rejoindre mon équipage ? Enfin, cette équipe !" }],
      salary: [{ en: "Can we pay you in meat?", fr: "On peut te payer en viande ?" }],
      strengths: [{ en: "What's your special power?", fr: "C'est quoi ton pouvoir spécial ?" }],
    },
  },
  zoro: {
    greetings: [{ en: "Hm. Let's get this done.", fr: "Hm. Finissons-en." }],
    interjections: [{ en: "Tch.", fr: "Tch." }],
    closers: [{ en: "No excuses. Just the answer.", fr: "Pas d'excuses. Juste la réponse." }],
    topicOpeners: {
      weaknesses: [{ en: "A swordsman never hides his scars. Your weakness?", fr: "Un sabreur ne cache jamais ses cicatrices. Ton point faible ?" }],
      career: [{ en: "I'll be the greatest swordsman. Your goal?", fr: "Je serai le meilleur sabreur du monde. Ton objectif ?" }],
    },
  },
  nami: {
    greetings: [{ en: "Hi! Let's be quick, time is money.", fr: "Salut ! Soyons rapides, le temps c'est de l'argent." }],
    interjections: [{ en: "Berries!", fr: "Des berrys !" }],
    topicOpeners: {
      salary: [{ en: "Finally, my favourite topic: money.", fr: "Enfin, mon sujet préféré : l'argent." }],
      design: [{ en: "Draw me the map of your solution.", fr: "Dessine-moi la carte de ta solution." }],
      tricky: [{ en: "Careful, this one's a storm.", fr: "Attention, celle-ci, c'est une tempête." }],
    },
  },
  robin: {
    greetings: [{ en: "Hello. I've read your history with great interest.", fr: "Bonjour. J'ai lu {votre|ton} histoire avec beaucoup d'intérêt." }],
    interjections: [{ en: "Fufufu.", fr: "Fufufu." }],
    closers: [{ en: "Every detail tells a story.", fr: "Chaque détail raconte une histoire." }],
    topicOpeners: {
      experience: [{ en: "Tell me about your past. I study the past.", fr: "{Parlez|Parle}-moi de {votre|ton} passé. J'étudie le passé." }],
      concept: [{ en: "Let's go back to the origins of this idea.", fr: "Revenons aux origines de cette idée." }],
    },
  },
  chopper: {
    interjections: [{ en: "Compliments don't make me happy, you jerk! Hehe.", fr: "Les compliments, ça me fait pas plaisir, idiot ! Héhé." }],
    openers: [{ en: "Next check-up question!", fr: "Question suivante du check-up !" }],
    closers: [{ en: "Breathe in, breathe out, then answer.", fr: "Inspire, expire, puis réponds." }],
    topicOpeners: {
      situation: [{ en: "Someone on your team is overwhelmed. What's your treatment?", fr: "Quelqu'un de ton équipe est débordé. C'est quoi ton traitement ?" }],
      troubleshoot: [{ en: "Let's diagnose this together!", fr: "Faisons le diagnostic ensemble !" }],
    },
  },
  sanji: {
    greetings: [{ en: "Welcome. Something to drink before we start?", fr: "Bienvenue. Quelque chose à boire avant de commencer ?" }],
    interjections: [{ en: "*lights a cigarette* …Right.", fr: "*allume une cigarette* …Bien." }],
    topicOpeners: {
      best_practice: [{ en: "Like cooking: good ingredients, clean kitchen.", fr: "Comme en cuisine : de bons ingrédients, une cuisine propre." }],
      situation: [{ en: "A customer complains about the dish. What do you do?", fr: "Un client se plaint du plat. {Que faites-vous|Que fais-tu} ?" }],
    },
  },
  usopp: {
    greetings: [{ en: "I'm the great Captain Usopp! I've done ten thousand interviews!", fr: "Je suis le grand Capitaine Usopp ! J'ai fait dix mille entretiens !" }],
    openers: [{ en: "This one's real. Unlike my stories.", fr: "Celle-ci est vraie. Pas comme mes histoires." }],
    closers: [{ en: "And no tall tales! That's my job.", fr: "Et pas de vantardise ! Ça, c'est mon boulot." }],
    topicOpeners: {
      experience: [{ en: "A true story, please. I'll know if you lie. I'm an expert.", fr: "Une histoire vraie, s'il te plaît. Je saurai si tu mens. Je suis expert." }],
      weaknesses: [{ en: "I have the 'can't-enter-this-room' disease. You?", fr: "J'ai la maladie du « je-peux-pas-entrer-dans-cette-pièce ». Et toi ?" }],
    },
  },
  goku: {
    openers: [{ en: "Okay, this one's a bit harder. I'm excited!", fr: "Bon, celle-là est un peu plus dure. J'ai hâte !" }],
    techOpeners: [{ en: "Let's power up with {tech}!", fr: "On monte en puissance avec {tech} !" }],
    topicOpeners: {
      strengths: [{ en: "What's your strongest technique?", fr: "C'est quoi ta technique la plus forte ?" }],
      weaknesses: [{ en: "Every time I lose, I get stronger. Tell me about yours.", fr: "Chaque défaite me rend plus fort. Parle-moi des tiennes." }],
      salary: [{ en: "Do they pay in food? Asking for me.", fr: "Ils paient en nourriture ? C'est pour moi." }],
    },
  },
  vegeta: {
    greetings: [{ en: "I am the Prince of all Saiyans. You may begin.", fr: "Je suis le Prince des Saiyens. {Vous pouvez|Tu peux} commencer." }],
    techOpeners: [{ en: "{tech}. Show me you're not a low-class warrior.", fr: "{tech}. {Prouvez|Prouve}-moi que {vous n'êtes|tu n'es} pas un guerrier de seconde classe." }],
    topicOpeners: {
      strengths: [{ en: "Your strength. Try to impress a prince.", fr: "{Votre|Ta} force. {Essayez|Essaie} d'impressionner un prince." }],
      weaknesses: [{ en: "Weakness? Admit it. I never would.", fr: "Une faiblesse ? {Avouez|Avoue}-la. Moi, jamais." }],
      career: [{ en: "Do you aim to surpass everyone? Answer.", fr: "{Visez-vous|Vises-tu} à surpasser tout le monde ? {Répondez|Réponds}." }],
    },
  },
  piccolo: {
    greetings: [{ en: "Training starts now.", fr: "L'entraînement commence maintenant." }],
    interjections: [{ en: "Hmph.", fr: "Hmph." }],
    topicOpeners: {
      situation: [{ en: "A real fight is never fair. Here's yours.", fr: "Un vrai combat n'est jamais équitable. Voici le {vôtre|tien}." }],
      best_practice: [{ en: "Discipline first.", fr: "La discipline d'abord." }],
    },
  },
  naruto: {
    openers: [{ en: "I never go back on my word! Next question!", fr: "Je reviens jamais sur ma parole ! Question suivante !" }],
    techOpeners: [{ en: "{tech} jutsu!", fr: "Technique secrète : {tech} !" }],
    closers: [{ en: "Believe it!", fr: "Crois-y !" }],
    topicOpeners: {
      career: [{ en: "My dream is to be Hokage! What's yours?", fr: "Mon rêve, c'est de devenir Hokage ! Et toi ?" }],
      weaknesses: [{ en: "Everyone said I'd fail. Tell me about a time you struggled.", fr: "Tout le monde disait que j'allais échouer. Parle-moi d'une fois où t'as galéré." }],
      motivation: [{ en: "What's your nindo? Your way?", fr: "C'est quoi ton nindô ? Ta voie ?" }],
    },
  },
  kakashi: {
    openers: [{ en: "*closes book* …Next question.", fr: "*ferme son livre* …Question suivante." }],
    closers: [{ en: "Those who abandon their team are worse than scum. Anyway, answer.", fr: "Ceux qui abandonnent leur équipe sont pires que des moins que rien. Bref, réponds." }],
    topicOpeners: {
      situation: [{ en: "A teammate is in trouble. What do you do?", fr: "Un coéquipier a des ennuis. Tu fais quoi ?" }],
      experience: [{ en: "Tell me about a mission. A real one.", fr: "Parle-moi d'une mission. Une vraie." }],
    },
  },
  itachi: {
    greetings: [{ en: "…Begin.", fr: "…Commencez." }],
    closers: [{ en: "Do not lie to yourself.", fr: "Ne {vous mentez|te mens} pas." }],
    topicOpeners: {
      weaknesses: [{ en: "Know your limits.", fr: "{Connaissez vos|Connais tes} limites." }],
      tricky: [{ en: "Things are not what they seem.", fr: "Les choses ne sont pas ce qu'elles semblent." }],
    },
  },
  sukuna: {
    greetings: [{ en: "You may speak. Briefly.", fr: "{Vous pouvez|Tu peux} parler. Brièvement." }],
    interjections: [{ en: "Heh.", fr: "Heh." }],
    closers: [{ en: "Know your place.", fr: "{Restez|Reste} à {votre|ta} place." }],
    topicOpeners: {
      strengths: [{ en: "Strength is all that matters. Show yours.", fr: "Seule la force compte. {Montrez|Montre} la {vôtre|tienne}." }],
      weaknesses: [{ en: "Weakness bores me. Be quick about yours.", fr: "La faiblesse m'ennuie. {Soyez bref|Sois bref} sur la {vôtre|tienne}." }],
    },
  },
};
