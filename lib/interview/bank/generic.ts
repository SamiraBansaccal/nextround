import type { QuestionEntry } from "./types";

// Questions that fit any tool or language ({tech} is filled with its name): the candidate's own
// experience with it. Their "answer" is a way to build the answer, since only the candidate's
// validated facts can say what they did.

export const TOOL_QUESTIONS: readonly QuestionEntry[] = [
  [
    "your-project", "experience",
    "Tell me about a project where you used {tech}. What was your part, and what was the hardest?",
    "{Parlez-moi|Parle-moi} d'un projet où {vous avez|tu as} utilisé {tech}. Quelle était {votre|ta} part du travail, et qu'est-ce qui a été le plus difficile ?",
    "Pick one real project and tell it as a short story: the context and the goal, what you did yourself, the hardest problem and how you solved it, then the result or what you learned. Concrete details, a command, a bug, a number, make it credible; your validated facts give the material.",
    "Choisis un vrai projet et raconte-le comme une courte histoire : le contexte et l'objectif, ce que tu as fait toi-même, le problème le plus difficile et la façon dont tu l'as résolu, puis le résultat ou ce que tu en as retenu. Des détails concrets, une commande, un bug, un chiffre, rendent le récit crédible ; tes faits validés en donnent la matière.",
  ],
  [
    "hard-way", "experience",
    "What have you learned the hard way with {tech}? A bug, a mistake, a surprise?",
    "Qu'{avez-vous|as-tu} appris à {vos|tes} dépens avec {tech} : un bug, une erreur, une surprise ?",
    "Choose a real mistake or bug: what happened, how you found the cause, how you fixed it, and what you do differently since. Admitting a mistake calmly and showing what it taught you is exactly what this question looks for.",
    "Choisis une vraie erreur ou un vrai bug : ce qui s'est passé, comment tu as trouvé la cause, comment tu l'as corrigé, et ce que tu fais différemment depuis. Reconnaître une erreur calmement et montrer ce qu'elle t'a appris, c'est exactement ce que cette question cherche à voir.",
  ],
  [
    "explain-simply", "concept",
    "How would you explain what {tech} is for to someone who does not code?",
    "Comment {expliqueriez-vous|expliquerais-tu} à quoi sert {tech} à une personne qui ne code pas ?",
    "Start from the problem {tech} solves, in everyday words, then give one simple analogy and one concrete example of what it does in a project. Avoid jargon, and if a technical term is needed, explain it in one sentence: being clear here shows you can talk to colleagues outside the tech team.",
    "Pars du problème que {tech} résout, avec des mots de tous les jours, puis donne une analogie simple et un exemple concret de ce que ça fait dans un projet. Évite le jargon, et si un terme technique est nécessaire, explique-le en une phrase : être clair ici montre que tu sais parler à des collègues hors de l'équipe technique.",
  ],
  [
    "how-you-learned", "experience",
    "How did you learn {tech}, and what would you work on next to get better at it?",
    "Comment {avez-vous|as-tu} appris {tech}, et sur quoi {travailleriez-vous|travaillerais-tu} ensuite pour progresser ?",
    "Say honestly how you learned it, courses, projects, documentation, then show a plan: one or two precise things you want to master next, why they matter for this job, and how you will practise them. A concrete plan matters more than claiming to know everything.",
    "Dis honnêtement comment tu l'as appris, cours, projets, documentation, puis montre un plan : une ou deux choses précises que tu veux maîtriser ensuite, pourquoi elles comptent pour ce poste, et comment tu vas t'y entraîner. Un plan concret compte plus que prétendre tout savoir.",
  ],
];
