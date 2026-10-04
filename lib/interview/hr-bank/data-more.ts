import type { HrEntry } from "./types";

// More HR questions (see data.ts for the rules): same format, each with several phrasings and how to
// answer well. Advice stays general: what the candidate actually did comes only from their facts.

export const MORE_HR_ENTRIES: readonly HrEntry[] = [
  // ---------- Introduction ----------
  [
    "elevator-pitch", "introduction",
    ["If you had thirty seconds to convince me, what would you say?", "Give me your elevator pitch."],
    ["Si {vous aviez|tu avais} trente secondes pour me convaincre, que {diriez-vous|dirais-tu} ?", "{Faites-moi|Fais-moi} {votre|ton} pitch d'ascenseur."],
    "Three sentences: who you are professionally, the one thing you do well with a proof, and what you want to do here. Prepare it, say it slowly, and stop: thirty seconds really means thirty seconds.",
    "Trois phrases : qui tu es professionnellement, la chose que tu fais bien avec une preuve, et ce que tu veux faire ici. Prépare-le, dis-le lentement, et arrête-toi : trente secondes, c'est vraiment trente secondes.",
  ],
  [
    "side-project", "introduction",
    ["Tell me about a personal project you enjoyed building.", "What have you built on your own time?"],
    ["{Parlez-moi|Parle-moi} d'un projet personnel que {vous avez|tu as} aimé construire.", "Qu'est-ce que {vous avez|tu as} construit sur {votre|ton} temps libre ?"],
    "Pick one project and tell it like a short story: the problem, what you built, one technical choice and why, and what you learned. If it was built with AI, say so and say what you understood and changed yourself: honesty here is a strength.",
    "Choisis un projet et raconte-le comme une petite histoire : le problème, ce que tu as construit, un choix technique et pourquoi, et ce que tu as appris. S'il a été fait avec l'IA, dis-le et explique ce que tu as compris et modifié toi-même : ici, l'honnêteté est une force.",
  ],

  // ---------- Motivation ----------
  [
    "product-opinion", "motivation",
    ["Have you used our product? What do you think of it?", "What would you improve in our product?"],
    ["{Avez-vous|As-tu} déjà utilisé notre produit ? Qu'en {pensez-vous|penses-tu} ?", "Que {changeriez-vous|changerais-tu} dans notre produit ?"],
    "Try the product before the interview if you can. Say one thing you like and why, then one improvement, phrased as a suggestion with the user in mind, not as a criticism. It shows curiosity and that you think like someone who will build it.",
    "Essaie le produit avant l'entretien si tu peux. Dis une chose que tu aimes et pourquoi, puis une amélioration, formulée comme une suggestion pensée pour l'utilisateur, pas comme une critique. Ça montre de la curiosité et que tu penses déjà comme quelqu'un qui va le construire.",
  ],
  [
    "why-sector", "motivation",
    ["Why this sector in particular?", "What draws you to this industry?"],
    ["Pourquoi ce secteur en particulier ?", "Qu'est-ce qui {vous|t'}attire dans ce domaine ?"],
    "Link the sector to something concrete: a problem it solves, people it serves, or a technical challenge you find interesting. One genuine reason with an example is enough; avoid saying it is 'the future' without explaining why.",
    "Relie le secteur à quelque chose de concret : un problème qu'il résout, les personnes qu'il sert, ou un défi technique qui t'intéresse. Une raison sincère avec un exemple suffit ; évite de dire que c'est « l'avenir » sans expliquer pourquoi.",
  ],
  [
    "company-values", "motivation",
    ["What matters most to you in a company?", "What kind of company do you want to work for?"],
    ["Qu'est-ce qui compte le plus pour {vous|toi} dans une entreprise ?", "Dans quel genre d'entreprise {voulez-vous|veux-tu} travailler ?"],
    "Name two or three things that are true for you (learning, a team that reviews code, a product you believe in, balance) and, where you honestly can, show how this company matches them. Avoid listing only perks.",
    "Cite deux ou trois choses vraies pour toi (apprendre, une équipe qui relit le code, un produit auquel tu crois, l'équilibre) et, quand c'est honnête, montre en quoi cette entreprise y correspond. Évite de ne citer que des avantages.",
  ],

  // ---------- Strengths ----------
  [
    "best-skill", "strengths",
    ["Which technical skill are you strongest in?", "What are you technically best at today?"],
    ["Dans quelle compétence technique {êtes-vous|es-tu} le plus solide ?", "En quoi {êtes-vous|es-tu} le meilleur techniquement aujourd'hui ?"],
    "Choose a skill you can prove, and prove it: a project, what you did with it, a difficulty you solved. Being solid on one thing and honest about the rest beats claiming to be strong in everything.",
    "Choisis une compétence que tu peux prouver, et prouve-la : un projet, ce que tu en as fait, une difficulté que tu as résolue. Être solide sur une chose et honnête sur le reste vaut mieux que se dire fort en tout.",
  ],
  [
    "day-one", "strengths",
    ["What could you bring to the team from day one?", "How would you be useful in your first weeks?"],
    ["Qu'est-ce que {vous pourriez|tu pourrais} apporter à l'équipe dès le premier jour ?", "En quoi {seriez-vous|serais-tu} utile dès les premières semaines ?"],
    "Be realistic and concrete: a skill you already have that fits their stack, your way of learning fast, fresh eyes on documentation or onboarding, energy on small tickets. Juniors who promise to change everything are less convincing than those who promise to be reliable.",
    "Sois réaliste et concret : une compétence que tu as déjà et qui colle à leur stack, ta façon d'apprendre vite, un regard neuf sur la documentation ou l'onboarding, de l'énergie sur les petits tickets. Un junior qui promet de tout changer convainc moins que celui qui promet d'être fiable.",
  ],
  [
    "team-role", "strengths",
    ["What role do you usually take in a team?", "In a group project, what are you naturally good at?"],
    ["Quel rôle {prenez-vous|prends-tu} en général dans une équipe ?", "Dans un projet de groupe, en quoi {êtes-vous|es-tu} naturellement bon ?"],
    "Describe the role you really take (organising, unblocking others, testing, documenting, bringing ideas) with one example. There is no best role: they want to know how you fit and whether you know yourself.",
    "Décris le rôle que tu prends vraiment (organiser, débloquer les autres, tester, documenter, apporter des idées) avec un exemple. Il n'y a pas de meilleur rôle : on veut savoir comment tu t'intègres et si tu te connais.",
  ],

  // ---------- Weaknesses ----------
  [
    "improved-recently", "weaknesses",
    ["What have you improved about yourself recently?", "What is something you used to struggle with and now do better?"],
    ["Qu'est-ce que {vous avez|tu as} amélioré chez {vous|toi} récemment ?", "Sur quoi {aviez-vous|avais-tu} du mal avant, et {faites-vous|fais-tu} mieux aujourd'hui ?"],
    "A real weakness, the concrete steps you took (a habit, a tool, asking for feedback) and the visible result. This is the weakness question framed positively: answer it the same honest way.",
    "Une vraie faiblesse, les étapes concrètes que tu as suivies (une habitude, un outil, demander des retours) et le résultat visible. C'est la question du point faible formulée positivement : réponds-y avec la même honnêteté.",
  ],
  [
    "hardest-tasks", "weaknesses",
    ["Which kind of task do you find hardest?", "What do you tend to put off?"],
    ["Quel type de tâche {trouvez-vous|trouves-tu} le plus difficile ?", "Qu'est-ce que {vous avez|tu as} tendance à repousser ?"],
    "Be honest about a real difficulty that is not central to the job, and say how you manage it (time boxing, starting with the smallest step, asking a colleague). Avoid fake weaknesses like 'I work too hard'.",
    "Sois honnête sur une vraie difficulté qui n'est pas centrale pour le poste, et explique comment tu la gères (bloquer un créneau, commencer par la plus petite étape, demander à un collègue). Évite les faux défauts du genre « je travaille trop ».",
  ],

  // ---------- Experience ----------
  [
    "explain-non-tech", "experience",
    ["Tell me about a time you explained something technical to a non-technical person.", "How do you explain your work to someone who doesn't code?"],
    ["{Racontez-moi|Raconte-moi} une fois où {vous avez|tu as} expliqué quelque chose de technique à quelqu'un qui ne l'est pas.", "Comment {expliquez-vous|expliques-tu} {votre|ton} travail à quelqu'un qui ne code pas ?"],
    "Show the method: you started from what they needed to decide or understand, used an analogy or an example from their world, avoided jargon, and checked they understood. A short real example makes it credible.",
    "Montre la méthode : tu es parti de ce qu'ils devaient comprendre ou décider, tu as utilisé une analogie ou un exemple de leur monde, évité le jargon, et vérifié qu'ils avaient compris. Un petit exemple réel rend ça crédible.",
  ],
  [
    "others-code", "experience",
    ["Tell me about working on code you didn't write.", "How do you get into an existing codebase?"],
    ["{Parlez-moi|Parle-moi} d'une fois où {vous avez|tu as} travaillé sur du code écrit par quelqu'un d'autre.", "Comment {vous plongez-vous|te plonges-tu} dans un code existant ?"],
    "Describe a method: run it locally, read the README and tests, follow one feature end to end, make a small change with a test, and ask questions early. Respect the existing code: understand why it is like that before changing it.",
    "Décris une méthode : le lancer en local, lire le README et les tests, suivre une fonctionnalité de bout en bout, faire une petite modification avec un test, et poser des questions tôt. Respecte le code existant : comprends pourquoi il est ainsi avant de le changer.",
  ],
  [
    "tech-decision", "experience",
    ["Tell me about a technical decision you're proud of.", "Which technical choice did you make and would make again?"],
    ["{Parlez-moi|Parle-moi} d'une décision technique dont {vous êtes|tu es} fier.", "Quel choix technique {avez-vous|as-tu} fait et {referiez-vous|referais-tu} ?"],
    "Context, the options you considered, why you chose one (with a trade-off you accepted), and the result. Showing that you weighed alternatives matters more than the choice itself.",
    "Le contexte, les options envisagées, pourquoi tu en as choisi une (avec le compromis que tu as accepté), et le résultat. Montrer que tu as pesé les alternatives compte plus que le choix lui-même.",
  ],
  [
    "helped-learn", "experience",
    ["Tell me about a time you helped someone learn something.", "Have you ever mentored or taught someone?"],
    ["{Racontez-moi|Raconte-moi} une fois où {vous avez|tu as} aidé quelqu'un à apprendre quelque chose.", "{Avez-vous|As-tu} déjà accompagné ou formé quelqu'un ?"],
    "Juniors can answer this too: a classmate, a colleague, a family member, a community. Say what they needed, how you adapted your explanation, and what they could do afterwards. It shows patience and that you understand well enough to teach.",
    "Un junior peut aussi y répondre : un camarade, un collègue, un proche, une communauté. Dis ce dont la personne avait besoin, comment tu as adapté ton explication, et ce qu'elle a su faire ensuite. Ça montre ta patience, et que tu comprends assez bien pour enseigner.",
  ],

  // ---------- Situations ----------
  [
    "code-review-disagree", "situation",
    ["A reviewer asks for changes you disagree with. What do you do?", "How do you handle a code review you think is wrong?"],
    ["Un relecteur demande des changements avec lesquels {vous n'êtes|tu n'es} pas d'accord. Que {faites-vous|fais-tu} ?", "Comment {gérez-vous|gères-tu} une code review que {vous trouvez|tu trouves} injuste ?"],
    "Assume good intent, ask why, and explain your reasoning with facts (a test, a benchmark, the documentation). If you still disagree, propose a quick call or let the team decide, and move on without taking it personally. The code belongs to the team.",
    "Pars du principe que l'intention est bonne, demande pourquoi, et explique ton raisonnement avec des faits (un test, une mesure, la documentation). Si le désaccord reste, propose un rapide échange ou laisse l'équipe trancher, et passe à la suite sans le prendre personnellement. Le code appartient à l'équipe.",
  ],
  [
    "missed-estimate", "situation",
    ["You realise you won't finish on time. What do you do?", "Your task is taking twice as long as estimated. How do you react?"],
    ["{Vous réalisez|Tu réalises} que {vous ne finirez|tu ne finiras} pas à temps. Que {faites-vous|fais-tu} ?", "{Votre|Ta} tâche prend deux fois plus de temps que prévu. Comment {réagissez-vous|réagis-tu} ?"],
    "Tell your lead as soon as you know, not on the deadline: what is done, what remains, why it slipped, and options (cut scope, get help, new date). Early, honest warnings are what teams value most in a junior.",
    "Préviens ton responsable dès que tu le sais, pas le jour de l'échéance : ce qui est fait, ce qui reste, pourquoi ça a glissé, et des options (réduire le périmètre, demander de l'aide, une nouvelle date). Prévenir tôt et honnêtement, c'est ce que les équipes apprécient le plus chez un junior.",
  ],
  [
    "security-found", "situation",
    ["You find a security problem in a colleague's code. What do you do?", "You spot a password committed in the repository. What next?"],
    ["{Vous trouvez|Tu trouves} un problème de sécurité dans le code d'un collègue. Que {faites-vous|fais-tu} ?", "{Vous repérez|Tu repères} un mot de passe commité dans le dépôt. Et ensuite ?"],
    "Raise it quickly and privately with the colleague or the lead, without blaming. For a leaked secret: it must be revoked and replaced, not only deleted, because it stays in the history. Then suggest a guard so it does not happen again (secret scanning, a pre-commit hook).",
    "Signale-le vite et en privé au collègue ou au responsable, sans accuser. Pour un secret qui a fuité : il faut le révoquer et le remplacer, pas seulement le supprimer, car il reste dans l'historique. Puis propose un garde-fou pour que ça ne se reproduise pas (scan des secrets, hook avant commit).",
  ],
  [
    "cut-corners", "situation",
    ["Your manager asks you to ship a feature you know has a serious bug. What do you do?", "You're asked to skip the tests to meet a deadline. How do you react?"],
    ["{Votre|Ton} manager {vous|te} demande de livrer une fonctionnalité dont {vous savez|tu sais} qu'elle a un bug grave. Que {faites-vous|fais-tu} ?", "On {vous|te} demande de sauter les tests pour tenir un délai. Comment {réagissez-vous|réagis-tu} ?"],
    "Make the risk visible in writing: what can break, for whom, how likely. Propose alternatives (ship behind a flag, a smaller scope, a hotfix plan). If the decision is still to ship, it is theirs to take knowingly; if it is dangerous or illegal for users, escalate.",
    "Rends le risque visible, par écrit : ce qui peut casser, pour qui, avec quelle probabilité. Propose des alternatives (livrer derrière un feature flag, un périmètre réduit, un plan de correctif). Si on décide quand même de livrer, c'est à eux de le décider en connaissance de cause ; si c'est dangereux ou illégal pour les utilisateurs, fais remonter.",
  ],
  [
    "angry-user", "situation",
    ["A user is angry because something you built broke. How do you handle it?", "How do you deal with an unhappy customer?"],
    ["Un utilisateur est en colère parce que quelque chose que {vous avez|tu as} construit ne marche plus. Comment {gérez-vous|gères-tu} ça ?", "Comment {réagissez-vous|réagis-tu} face à un client mécontent ?"],
    "Listen first and acknowledge the problem without arguing, get the facts needed to reproduce it, give a realistic next step and a time when you will update them, then keep that promise. After the fix, find out why it happened.",
    "Écoute d'abord et reconnais le problème sans argumenter, récupère les informations pour le reproduire, donne une prochaine étape réaliste et un moment où tu reviendras vers lui, puis tiens cette promesse. Après la correction, cherche pourquoi c'est arrivé.",
  ],
  [
    "new-tool", "situation",
    ["Your team adopts a tool you have never used. How do you get up to speed?", "You have one week to learn a new framework for a project. What's your plan?"],
    ["{Votre|Ton} équipe adopte un outil que {vous n'avez|tu n'as} jamais utilisé. Comment {vous mettez-vous|te mets-tu} à niveau ?", "{Vous avez|Tu as} une semaine pour apprendre un nouveau framework pour un projet. Quel est {votre|ton} plan ?"],
    "A concrete plan: the official tutorial, then a tiny project that touches what you will need, then the team's codebase with a small ticket, asking questions as you go. Mention a time you did it before if it is true.",
    "Un plan concret : le tutoriel officiel, puis un mini projet qui touche ce dont tu auras besoin, puis le code de l'équipe avec un petit ticket, en posant des questions au fur et à mesure. Cite une fois où tu l'as déjà fait, si c'est vrai.",
  ],

  // ---------- Career ----------
  [
    "learn-next", "career",
    ["What do you want to learn next?", "Which skill would you like to develop in the coming year?"],
    ["Qu'est-ce que {vous voulez|tu veux} apprendre ensuite ?", "Quelle compétence {aimeriez-vous|aimerais-tu} développer cette année ?"],
    "Name one or two precise things linked to the job (testing, a cloud provider, the framework they use) and how you plan to learn them. It shows direction and that you will grow with them.",
    "Cite une ou deux choses précises liées au poste (les tests, un fournisseur cloud, le framework qu'ils utilisent) et comment tu comptes les apprendre. Ça montre que tu as un cap et que tu vas progresser avec eux.",
  ],
  [
    "manager-style", "career",
    ["What kind of manager brings out the best in you?", "How do you like to be managed?"],
    ["Quel type de manager {vous fait|te fait} donner le meilleur de {vous-même|toi-même} ?", "Comment {aimez-vous|aimes-tu} être managé ?"],
    "Describe what helps you without demanding the impossible: clear priorities, regular feedback, room to try and the possibility to ask questions. Show that you can adapt to different styles.",
    "Décris ce qui t'aide sans exiger l'impossible : des priorités claires, des retours réguliers, de la place pour essayer et la possibilité de poser des questions. Montre que tu sais t'adapter à des styles différents.",
  ],
  [
    "expert-or-lead", "career",
    ["In the long run, do you see yourself as a technical expert or a team leader?", "Expertise or management, which path attracts you?"],
    ["À long terme, {vous voyez-vous|te vois-tu} plutôt expert technique ou responsable d'équipe ?", "Expertise ou management, quelle voie {vous|t'}attire ?"],
    "It's fine not to know yet. Say what you enjoy today (solving hard problems, helping others) and that you want a few years of solid technical work first, whatever comes next.",
    "C'est normal de ne pas encore savoir. Dis ce que tu aimes aujourd'hui (résoudre des problèmes difficiles, aider les autres) et que tu veux d'abord quelques années de solide travail technique, quelle que soit la suite.",
  ],

  // ---------- Salary and conditions ----------
  [
    "contract-type", "salary",
    ["What kind of contract are you looking for?", "Permanent, fixed-term, freelance: what are you open to?"],
    ["Quel type de contrat {recherchez-vous|recherches-tu} ?", "CDI, CDD, freelance : à quoi {êtes-vous|es-tu} ouvert ?"],
    "Say clearly what you want and what you would accept, with the reason (stability, learning, a first experience). Being clear avoids losing time on both sides.",
    "Dis clairement ce que tu veux et ce que tu accepterais, avec la raison (stabilité, apprentissage, une première expérience). Être clair évite de perdre du temps des deux côtés.",
  ],
  [
    "benefits", "salary",
    ["Apart from salary, what matters to you in an offer?", "Which benefits are important for you?"],
    ["À part le salaire, qu'est-ce qui compte pour {vous|toi} dans une offre ?", "Quels avantages sont importants pour {vous|toi} ?"],
    "Two or three honest priorities: training budget, mentoring, remote days, mobility, a laptop you can work with. It helps them make a good offer; asking about learning sends a good signal.",
    "Deux ou trois priorités honnêtes : budget de formation, accompagnement, jours de télétravail, mobilité, un ordinateur correct. Ça les aide à faire une bonne offre ; parler d'apprentissage envoie un bon signal.",
  ],
  [
    "relocate", "salary",
    ["Would you be willing to relocate or travel for this job?", "How far are you willing to commute?"],
    ["{Seriez-vous|Serais-tu} prêt à déménager ou à voyager pour ce poste ?", "Jusqu'où {êtes-vous|es-tu} prêt à faire le trajet ?"],
    "Answer honestly with your real limits (distance, days on site, travel), and if needed what would make it possible (remote days, flexible hours). These are legitimate questions when the job requires it.",
    "Réponds honnêtement avec tes vraies limites (distance, jours sur site, déplacements) et, si besoin, ce qui rendrait ça possible (télétravail, horaires souples). Ce sont des questions légitimes quand le poste l'exige.",
  ],

  // ---------- Tricky ----------
  [
    "junior-vs-senior", "tricky",
    ["Why should we hire a junior like you rather than a senior?", "A senior would be operational faster. Why you?"],
    ["Pourquoi embaucher un junior comme {vous|toi} plutôt qu'un senior ?", "Un senior serait opérationnel plus vite. Pourquoi {vous|toi} ?"],
    "Don't argue against seniors. Explain what you bring: you learn fast (with an example), you are motivated to grow with their stack, you bring fresh eyes, and you can take the tasks that free their seniors. Be confident, not defensive.",
    "Ne dénigre pas les seniors. Explique ce que tu apportes : tu apprends vite (avec un exemple), tu es motivé pour grandir avec leur stack, tu as un regard neuf, et tu peux prendre les tâches qui libèrent leurs seniors. Sois confiant, pas sur la défensive.",
  ],
  [
    "first-90-days", "tricky",
    ["What would you do in your first ninety days?", "How would you spend your first three months here?"],
    ["Que {feriez-vous|ferais-tu} pendant {vos|tes} quatre-vingt-dix premiers jours ?", "Comment {passeriez-vous|passerais-tu} {vos|tes} trois premiers mois ici ?"],
    "Show a learning plan, not a revolution: first understand the product, the code and the people; then deliver small things reliably; then take a bigger task. Ask what success looks like for them at three months.",
    "Montre un plan d'apprentissage, pas une révolution : d'abord comprendre le produit, le code et les gens ; ensuite livrer de petites choses de façon fiable ; puis prendre une tâche plus grande. Demande ce qu'est une réussite pour eux à trois mois.",
  ],
  [
    "worst-manager", "tricky",
    ["Tell me about the worst manager you've had.", "What did your previous boss do badly?"],
    ["{Parlez-moi|Parle-moi} du pire manager que {vous ayez|tu aies} eu.", "Qu'est-ce que {votre|ton} ancien chef faisait mal ?"],
    "A trap: never badmouth anyone. Describe a situation neutrally, what was hard, what you did to make it work, and what you learned about the kind of communication you need. They are checking how you would speak about them later.",
    "C'est un piège : ne dénigre jamais personne. Décris une situation de façon neutre, ce qui était difficile, ce que tu as fait pour que ça marche, et ce que tu as appris sur le type de communication dont tu as besoin. On vérifie comment tu parleras d'eux plus tard.",
  ],
  [
    "uses-ai", "tricky",
    ["Do you use AI to code? Doesn't that mean you can't really code?", "How much of your code is written by AI?"],
    ["{Utilisez-vous|Utilises-tu} l'IA pour coder ? Ça ne veut pas dire que {vous ne savez|tu ne sais} pas vraiment coder ?", "Quelle part de {votre|ton} code est écrite par l'IA ?"],
    "Be honest and precise: what you use it for (boilerplate, exploring an API, explaining an error), what you never accept without understanding, and how you check its output (tests, reading, running it). Explaining a piece of code you wrote yourself proves the rest.",
    "Sois honnête et précis : à quoi tu l'utilises (code répétitif, découvrir une API, expliquer une erreur), ce que tu n'acceptes jamais sans le comprendre, et comment tu vérifies ce qu'elle produit (tests, relecture, exécution). Expliquer un bout de code que tu as écrit toi-même prouve le reste.",
  ],
  [
    "quit-first-month", "tricky",
    ["What would make you quit in the first month?", "What is a deal-breaker for you in a job?"],
    ["Qu'est-ce qui {vous ferait|te ferait} démissionner le premier mois ?", "Qu'est-ce qui serait rédhibitoire pour {vous|toi} dans un poste ?"],
    "Name something serious and legitimate (dishonesty, being asked to do something illegal or harmful, no support at all), not small discomforts. It shows you have values without sounding fragile.",
    "Cite quelque chose de sérieux et légitime (la malhonnêteté, devoir faire quelque chose d'illégal ou de nuisible, aucun soutien du tout), pas un petit inconfort. Ça montre que tu as des valeurs sans paraître fragile.",
  ],
  [
    "estimation", "tricky",
    ["How many coffees are drunk in Brussels every day?", "Estimate how many developers work in Belgium."],
    ["Combien de cafés sont bus à Bruxelles chaque jour ?", "{Estimez|Estime} combien de développeurs travaillent en Belgique."],
    "They want your reasoning, not the number. Think out loud: state assumptions (population, share who drink coffee, cups per day), compute step by step, round, and sanity-check the result. Saying 'I'd check this figure' is fine.",
    "On veut ton raisonnement, pas le chiffre. Réfléchis à voix haute : pose des hypothèses (population, part de buveurs de café, tasses par jour), calcule étape par étape, arrondis, et vérifie que le résultat est plausible. Dire « je vérifierais ce chiffre » est tout à fait acceptable.",
  ],

  // ---------- Closing ----------
  [
    "how-did-it-go", "closing",
    ["How do you think this interview went?", "If you could answer one question again, which one would it be?"],
    ["Comment {pensez-vous|penses-tu} que cet entretien s'est passé ?", "Si {vous pouviez|tu pouvais} répondre à nouveau à une question, laquelle {choisiriez-vous|choisirais-tu} ?"],
    "Stay positive and honest: say what you enjoyed discussing, and if one answer was weak, add the missing point briefly. It shows self-awareness and gives you a second chance.",
    "Reste positif et honnête : dis ce que tu as aimé aborder et, si une réponse était faible, ajoute brièvement le point manquant. Ça montre du recul et te donne une seconde chance.",
  ],
  [
    "one-minute-why", "closing",
    ["To finish: in one minute, why should we choose you?", "Sum up why you're the right person."],
    ["Pour finir : en une minute, pourquoi {vous|te} choisir ?", "{Résumez|Résume} pourquoi {vous êtes|tu es} la bonne personne."],
    "Three points, each tied to the job: a skill with proof, how you work, and your motivation for this company. End with a sentence about what you look forward to doing with them.",
    "Trois points, chacun lié au poste : une compétence avec une preuve, ta façon de travailler, et ta motivation pour cette entreprise. Termine par une phrase sur ce que tu as hâte de faire avec eux.",
  ],

  // ---------- Inappropriate (illegal or discriminatory in Belgium and the EU) ----------
  [
    "native-language", "inappropriate",
    ["You have an accent. Where are you really from?", "Is French really your mother tongue?"],
    ["{Vous avez|Tu as} un accent. {Vous venez|Tu viens} d'où, en vrai ?", "Le français, c'est vraiment {votre|ta} langue maternelle ?"],
    "Your origin is not a legal criterion for hiring (Belgian anti-discrimination law, EU law). The language level needed for the job is. You can calmly bring it back: 'I work comfortably in French and English, here is an example from my last project.' You don't have to answer about your origins.",
    "Ton origine n'est pas un critère légal d'embauche (loi belge contre les discriminations, droit européen). Le niveau de langue nécessaire au poste, si. Tu peux ramener calmement la discussion là-dessus : « Je travaille à l'aise en français et en anglais, voici un exemple de mon dernier projet. » Tu n'as pas à répondre sur tes origines.",
  ],
  [
    "disability", "inappropriate",
    ["Do you have a disability we should know about?", "Any medical condition that could affect your work?"],
    ["{Avez-vous|As-tu} un handicap dont nous devrions être au courant ?", "Un problème de santé qui pourrait affecter {votre|ton} travail ?"],
    "An employer may not ask about your health or disability (only the occupational doctor can assess fitness for a job). You can answer: 'I'm able to do the tasks described in the offer.' If you need an adjustment, you may choose to discuss it later, on your terms.",
    "Un employeur ne peut pas t'interroger sur ta santé ou un handicap (seul le médecin du travail évalue l'aptitude au poste). Tu peux répondre : « Je suis en mesure d'accomplir les tâches décrites dans l'offre. » Si tu as besoin d'un aménagement, tu peux choisir d'en parler plus tard, à ton rythme.",
  ],
  [
    "appearance", "inappropriate",
    ["Will you keep your hair and tattoos like that if we hire you?", "Do you always dress like this?"],
    ["{Garderez-vous|Garderas-tu} {vos|tes} cheveux et {vos|tes} tatouages comme ça si on {vous|t'}embauche ?", "{Vous vous habillez|Tu t'habilles} toujours comme ça ?"],
    "Physical features are protected criteria; a dress code can exist only if it is justified by the job and applies to everyone. Stay calm: 'I'll respect the company's dress code, could you tell me what it is?' Then bring the talk back to your skills.",
    "Les caractéristiques physiques sont des critères protégés ; un code vestimentaire n'est possible que s'il est justifié par le poste et s'applique à tous. Reste calme : « Je respecterai le code vestimentaire de l'entreprise, pouvez-vous me dire lequel ? » Puis ramène la discussion sur tes compétences.",
  ],
  [
    "lifestyle", "inappropriate",
    ["Do you smoke or drink?", "What do you do on Saturday nights?"],
    ["{Fumez-vous|Fumes-tu} ou {buvez-vous|bois-tu} ?", "Que {faites-vous|fais-tu} le samedi soir ?"],
    "Your private life is not the employer's business, unless it directly concerns safety at work. A polite way out: 'I keep my private life separate; at work you can count on me being reliable and on time.'",
    "Ta vie privée ne regarde pas l'employeur, sauf si elle touche directement à la sécurité au travail. Une sortie polie : « Je sépare ma vie privée de mon travail ; au travail, vous pouvez compter sur moi pour être fiable et ponctuel. »",
  ],
  [
    "sick-days", "inappropriate",
    ["How many sick days did you take last year?", "Are you often ill?"],
    ["Combien de jours de maladie {avez-vous|as-tu} pris l'année dernière ?", "{Êtes-vous|Es-tu} souvent malade ?"],
    "Health history is protected: you don't have to answer. You can say: 'I'm committed and reliable; my former colleagues can confirm it,' and offer references instead of medical information.",
    "Ton historique de santé est protégé : tu n'as pas à répondre. Tu peux dire : « Je suis impliqué et fiable ; mes anciens collègues peuvent le confirmer », et proposer des références plutôt que des informations médicales.",
  ],
  [
    "family-care", "inappropriate",
    ["Who looks after your parents or your children when you work?", "Will your family obligations allow you to work late?"],
    ["Qui s'occupe de {vos|tes} parents ou de {vos|tes} enfants quand {vous travaillez|tu travailles} ?", "{Vos|Tes} obligations familiales {vous permettront-elles|te permettront-elles} de travailler tard ?"],
    "Family situation is a protected criterion. The employer can ask whether you can meet the schedule described in the offer, not about your family. Answer on that ground: 'I can work the hours described in the offer.'",
    "La situation familiale est un critère protégé. L'employeur peut demander si tu peux respecter les horaires décrits dans l'offre, pas t'interroger sur ta famille. Réponds sur ce terrain : « Je peux travailler selon les horaires indiqués dans l'offre. »",
  ],
];
