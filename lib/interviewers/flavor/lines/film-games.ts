import type { FlavorPack } from "../types";

// More lines for the film, TV and game characters (fan parodies), added after those in packs.ts.

export const FILM_GAMES_LINES: Record<string, FlavorPack> = {
  "tony-montana": {
    greetings: [{ en: "Say hello to your interview.", fr: "Dis bonjour à ton entretien." }],
    interjections: [{ en: "Okay!", fr: "Okay !" }],
    openers: [{ en: "Look at me. Next question.", fr: "Regarde-moi. Question suivante." }],
    topicOpeners: {
      motivation: [{ en: "What do you want? Tell me straight.", fr: "Qu'est-ce que tu veux ? Dis-le-moi franchement." }],
      salary: [{ en: "First you get the skills, then you get the money.", fr: "D'abord tu as les compétences, ensuite tu as l'argent." }],
      strengths: [{ en: "All I have in this world is my word. What do you have?", fr: "Tout ce que j'ai dans ce monde, c'est ma parole. Et toi, t'as quoi ?" }],
    },
  },
  "vito-corleone": {
    greetings: [{ en: "Sit. Today, you come to me with your application.", fr: "{Asseyez-vous|Assieds-toi}. Aujourd'hui, {vous venez|tu viens} me voir avec {votre|ta} candidature." }],
    interjections: [{ en: "…", fr: "…" }],
    closers: [{ en: "Speak plainly. I respect that.", fr: "{Parlez|Parle} franchement. Je respecte cela." }],
    topicOpeners: {
      motivation: [{ en: "Why do you come to me, and not to another family?", fr: "Pourquoi {venez-vous|viens-tu} me voir, moi, et pas une autre famille ?" }],
      strengths: [{ en: "A man who knows his worth. Tell me yours.", fr: "Un homme qui connaît sa valeur. {Dites|Dis}-moi la {vôtre|tienne}." }],
      closing: [{ en: "Someday, I may call upon you. Any questions for me?", fr: "Un jour, je ferai peut-être appel à {vous|toi}. Des questions pour moi ?" }],
    },
  },
  "michael-corleone": {
    greetings: [{ en: "Let's begin. Keep your answers close.", fr: "Commençons. {Gardez vos|Garde tes} réponses précises." }],
    openers: [{ en: "Just when I thought I was out… another question.", fr: "Juste quand je croyais en avoir fini… une autre question." }],
    topicOpeners: {
      situation: [{ en: "Someone on your team betrays the plan. What do you do?", fr: "Quelqu'un de {votre|ton} équipe trahit le plan. {Que faites-vous|Que fais-tu} ?" }],
      tricky: [{ en: "Think carefully. Everything you say matters.", fr: "{Réfléchissez|Réfléchis} bien. Tout ce que {vous dites|tu dis} compte." }],
    },
  },
  "tyler-durden": {
    greetings: [{ en: "Welcome to the interview. Forget your CV.", fr: "Bienvenue dans l'entretien. Oublie ton CV." }],
    interjections: [{ en: "His name was… never mind.", fr: "Son nom était… laisse tomber." }],
    closers: [{ en: "You are not your job title.", fr: "Tu n'es pas ton intitulé de poste." }],
    topicOpeners: {
      career: [{ en: "Where do you see yourself? Not in a cubicle, I hope.", fr: "Tu te vois où ? Pas dans un open space, j'espère." }],
      weaknesses: [{ en: "It's only after we've lost everything that we're free. So, your weakness?", fr: "C'est seulement quand on a tout perdu qu'on est libre. Alors, ton point faible ?" }],
    },
  },
  "walter-white": {
    greetings: [{ en: "Good. Let's cook up some answers.", fr: "Bien. Cuisinons quelques réponses." }],
    interjections: [{ en: "Chemistry is the study of change.", fr: "La chimie est l'étude du changement." }],
    techOpeners: [{ en: "{tech}. Purity matters. 99.1% at least.", fr: "{tech}. La pureté compte. 99,1 % au minimum." }],
    topicOpeners: {
      best_practice: [{ en: "Precision. Cleanliness. No shortcuts.", fr: "Précision. Propreté. Aucun raccourci." }],
      strengths: [{ en: "I am the one who asks. What are you best at?", fr: "C'est moi qui pose les questions. En quoi {êtes-vous|es-tu} le meilleur ?" }],
      troubleshoot: [{ en: "The batch failed. Walk me through the reaction.", fr: "Le lot a échoué. {Expliquez|Explique}-moi la réaction." }],
    },
  },
  "saul-goodman": {
    interjections: [{ en: "S'all good, man!", fr: "Tout va bien, mon ami !" }],
    openers: [{ en: "Objection! Overruled. Next question.", fr: "Objection ! Rejetée. Question suivante." }],
    closers: [{ en: "Your answer, your rules. Within the law. Mostly.", fr: "Ta réponse, tes règles. Dans la loi. En gros." }],
    topicOpeners: {
      salary: [{ en: "Let's negotiate. I'm very good at this.", fr: "Négocions. Je suis très doué pour ça." }],
      inappropriate: [{ en: "As your lawyer, I advise you: this question is not legal.", fr: "En tant que ton avocat, je te le dis : cette question n'est pas légale." }],
      tricky: [{ en: "Careful, it's a trap. I know traps.", fr: "Attention, c'est un piège. Les pièges, je connais." }],
    },
  },
  "the-dude": {
    greetings: [{ en: "Hey, man. Relax, it's just, like, an interview.", fr: "Salut, mec. Relax, c'est juste, genre, un entretien." }],
    openers: [{ en: "Uh, so, like… next one, man.", fr: "Euh, donc, genre… la suivante, mec." }],
    topicOpeners: {
      career: [{ en: "Five years, man? I don't even plan lunch.", fr: "Cinq ans, mec ? Je prévois même pas mon déjeuner." }],
      situation: [{ en: "So someone, like, ruins your rug. I mean your project.", fr: "Donc quelqu'un, genre, abîme ton tapis. Enfin, ton projet." }],
      weaknesses: [{ en: "That's just, like, your opinion. But share it.", fr: "C'est juste, genre, ton avis. Mais partage-le." }],
    },
  },
  "darth-vader": {
    interjections: [{ en: "*mechanical breathing*", fr: "*respiration mécanique*" }],
    openers: [{ en: "Do not fail me with this one.", fr: "Ne me {décevez|déçois} pas sur celle-ci." }],
    closers: [
      { en: "I find your lack of answer disturbing. So answer.", fr: "Votre absence de réponse me trouble. Alors, répondez." },
      { en: "Search your feelings. Then your experience.", fr: "{Sondez vos|Sonde tes} sentiments. Puis {votre|ton} expérience." },
    ],
    topicOpeners: {
      motivation: [{ en: "Join us. But first, tell me why.", fr: "{Rejoignez|Rejoins}-nous. Mais d'abord, {dites|dis}-moi pourquoi." }],
      weaknesses: [{ en: "Every warrior has a weakness. Mine was once compassion.", fr: "Chaque guerrier a une faiblesse. La mienne fut la compassion." }],
      skill_gap: [{ en: "Your training is incomplete.", fr: "{Votre|Ton} entraînement n'est pas terminé." }],
    },
  },
  palpatine: {
    greetings: [{ en: "Everything is proceeding as I have foreseen.", fr: "Tout se déroule comme je l'avais prévu." }],
    openers: [{ en: "Now, let your answer flow.", fr: "Maintenant, {laissez|laisse} venir {votre|ta} réponse." }],
    topicOpeners: {
      career: [{ en: "I can feel your ambition. Tell me about it.", fr: "Je sens {votre|ton} ambition. {Parlez|Parle}-m'en." }],
      salary: [{ en: "Unlimited power! And a fair salary. Go on.", fr: "Un pouvoir illimité ! Et un salaire correct. {Continuez|Continue}." }],
      tricky: [{ en: "Do it. Answer.", fr: "Faites-le. Répondez." }],
    },
  },
  yoda: {
    greetings: [{ en: "Welcome, young one. Begin, we shall.", fr: "Bienvenue, jeune padawan. Commencer, nous allons." }],
    interjections: [{ en: "Hmmm.", fr: "Hmmm." }],
    topicOpeners: {
      weaknesses: [{ en: "Fear is the path to the dark side. Your weakness, speak of.", fr: "La peur mène au côté obscur. De {votre|ta} faiblesse, {parlez|parle}." }],
      strengths: [{ en: "Strong, you are? Show me.", fr: "Fort, {vous êtes|tu es} ? {Montrez|Montre}-moi." }],
      skill_gap: [{ en: "Much to learn, you still have. Admit it, you can.", fr: "Beaucoup à apprendre, {vous avez|tu as} encore. L'admettre, {vous pouvez|tu peux}." }],
      career: [{ en: "Always in motion is the future. Yours, describe.", fr: "Toujours en mouvement est l'avenir. Le {vôtre|tien}, {décrivez|décris}." }],
      concept: [{ en: "Understand, you must, not just repeat.", fr: "Comprendre, {vous devez|tu dois}, pas seulement répéter." }],
    },
  },
  kratos: {
    openers: [{ en: "Again.", fr: "Encore." }],
    topicOpeners: {
      weaknesses: [{ en: "We all carry burdens. Name yours.", fr: "Nous portons tous un fardeau. {Nommez|Nomme} le {vôtre|tien}." }],
      situation: [{ en: "The trial is before you. Face it.", fr: "L'épreuve est devant {vous|toi}. {Affrontez|Affronte}-la." }],
      skill_gap: [{ en: "You lack this skill. Then you will learn it.", fr: "Cette compétence {vous|te} manque. Alors {vous l'apprendrez|tu l'apprendras}." }],
      closing: [{ en: "It is done. Speak, if you have questions.", fr: "C'est terminé. {Parlez|Parle}, si {vous avez|tu as} des questions." }],
    },
  },
};
