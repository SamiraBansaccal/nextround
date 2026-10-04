import type { HrEntry } from "./types";

// The HR question bank: the questions every junior candidate meets, each with several phrasings (an
// interviewer picks one), and how to answer well. Written once, reviewed, never generated during an
// interview. French texts carry "{vous form|tu form}" pairs (lib/interview/register.ts).
// Advice is general: what the candidate actually did comes only from their validated facts.

export const HR_ENTRIES: readonly HrEntry[] = [
  // ---------- Introduction ----------
  [
    "about-you", "introduction",
    ["Tell me about yourself.", "Could you introduce yourself in a few minutes?", "Walk me through who you are and what brings you here today."],
    ["{Présentez-vous|Présente-toi}, en quelques minutes.", "{Pouvez-vous|Peux-tu} me parler de {vous|toi} ?", "Qui {êtes-vous|es-tu}, et qu'est-ce qui {vous|t'}amène aujourd'hui ?"],
    "Two minutes, three parts: where you come from (training, previous job), what you do now and what you are proud of (one project, one result), and why this role is the logical next step. Keep it professional: no life story, no reading of the CV line by line. End on the job, so the conversation continues on what you can bring.",
    "Deux minutes, trois parties : d'où tu viens (formation, emploi précédent), ce que tu fais aujourd'hui et ce dont tu es fier (un projet, un résultat), puis pourquoi ce poste est la suite logique. Reste professionnel : pas de récit de vie, pas de lecture du CV ligne par ligne. Termine sur le poste, pour que la conversation continue sur ce que tu peux apporter.",
  ],
  [
    "walk-cv", "introduction",
    ["Walk me through your CV.", "Can you take me through your background, step by step?"],
    ["{Pouvez-vous|Peux-tu} me présenter {votre|ton} parcours, étape par étape ?", "{Parlez-moi|Parle-moi} de {votre|ton} CV."],
    "Tell your path as a story with a direction, not a list: for each step, one line on what you did and one on what it taught you, and the link to the next step. Spend most of the time on the recent and relevant parts. Prepare a calm, short explanation for any gap or change of direction.",
    "Raconte ton parcours comme une histoire qui a un sens, pas comme une liste : pour chaque étape, une phrase sur ce que tu as fait et une sur ce que ça t'a appris, et le lien avec l'étape suivante. Passe le plus de temps sur ce qui est récent et pertinent. Prépare une explication courte et sereine pour chaque trou ou changement de direction.",
  ],
  [
    "three-words", "introduction",
    ["How would you describe yourself in three words?", "If you had to sum yourself up in three words, which ones?"],
    ["Comment {vous décririez-vous|te décrirais-tu} en trois mots ?", "Si {vous deviez vous|tu devais te} résumer en trois mots, lesquels ?"],
    "Choose three words that matter for the job (for example curious, reliable, persistent) and back each one with a short, real example. Three words without proof sound rehearsed; one example each makes them believable.",
    "Choisis trois mots utiles pour le poste (par exemple curieux, fiable, persévérant) et appuie chacun sur un exemple court et réel. Trois mots sans preuve sonnent appris par cœur ; un exemple pour chacun les rend crédibles.",
  ],
  [
    "career-change", "introduction",
    ["What made you choose software development?", "Why did you move into tech?", "How did you get into programming?"],
    ["Pourquoi {avez-vous|as-tu} choisi le développement ?", "Qu'est-ce qui {vous|t'}a amené vers l'informatique ?", "Comment {êtes-vous venu|es-tu venu} à la programmation ?"],
    "Give the real trigger (a project, a problem you solved, a person, a course) and what keeps you in it now. If you changed careers, present your previous experience as an asset: customer sense, rigour, team work. Enthusiasm with a concrete example beats a generic 'I have always loved computers'.",
    "Donne le vrai déclic (un projet, un problème résolu, une personne, une formation) et ce qui t'y fait rester aujourd'hui. Si tu changes de carrière, présente ton expérience précédente comme un atout : sens du client, rigueur, travail d'équipe. Un enthousiasme appuyé par un exemple concret vaut mieux qu'un vague « j'ai toujours aimé l'informatique ».",
  ],
  [
    "outside-work", "introduction",
    ["What do you do outside of work or studies?", "What do you enjoy doing in your free time?"],
    ["Que {faites-vous|fais-tu} en dehors du travail ou des études ?", "Qu'est-ce qui {vous|te} plaît dans {votre|ton} temps libre ?"],
    "Short and genuine: one or two activities and what they say about you (team sport, a side project, volunteering, learning something). This question checks that you are a real person to work with, not a hidden test: no need to invent impressive hobbies.",
    "Court et sincère : une ou deux activités et ce qu'elles disent de toi (sport d'équipe, projet perso, bénévolat, apprentissage). Cette question vérifie que tu es une vraie personne avec qui travailler, ce n'est pas un piège : inutile d'inventer des loisirs impressionnants.",
  ],

  // ---------- Motivation ----------
  [
    "why-company", "motivation",
    ["Why do you want to join our company?", "What attracts you to us in particular?", "Why us, and not another company?"],
    ["Pourquoi {voulez-vous|veux-tu} nous rejoindre ?", "Qu'est-ce qui {vous|t'}attire chez nous en particulier ?", "Pourquoi nous, et pas une autre entreprise ?"],
    "Show that you looked: name something specific about the company (product, clients, tech stack, values, a recent project) and link it to what you want to do and learn. Avoid answers that fit any company, like 'you are a big company'. One precise reason is better than five generic ones.",
    "Montre que tu t'es renseigné : cite quelque chose de précis sur l'entreprise (produit, clients, stack technique, valeurs, projet récent) et relie-le à ce que tu veux faire et apprendre. Évite les réponses qui marchent pour n'importe quelle entreprise, comme « vous êtes une grande entreprise ». Une raison précise vaut mieux que cinq génériques.",
  ],
  [
    "why-role", "motivation",
    ["Why does this role interest you?", "What makes you want this position?"],
    ["Pourquoi ce poste {vous|t'}intéresse-t-il ?", "Qu'est-ce qui {vous|te} donne envie de ce poste ?"],
    "Connect two or three tasks of the role to things you have already done or want to grow in. Mention what you will learn and what you can already bring. Speaking about the daily work shows you understood the job, not just the title.",
    "Relie deux ou trois missions du poste à ce que tu as déjà fait ou veux développer. Dis ce que tu vas apprendre et ce que tu peux déjà apporter. Parler du travail au quotidien montre que tu as compris le poste, pas seulement son titre.",
  ],
  [
    "why-hire-you", "motivation",
    ["Why should we hire you?", "What would you bring to the team?", "Why are you the right person for this job?"],
    ["Pourquoi devrions-nous {vous|t'}embaucher ?", "Qu'{apporteriez-vous|apporterais-tu} à l'équipe ?", "Pourquoi {êtes-vous|es-tu} la bonne personne pour ce poste ?"],
    "Match the job's main needs with your evidence: two or three requirements, one proof each (project, result, skill), then one personal quality that makes you good to work with. Confident and factual, without putting other candidates down.",
    "Fais correspondre les besoins principaux du poste et tes preuves : deux ou trois exigences, une preuve pour chacune (projet, résultat, compétence), puis une qualité personnelle qui fait de toi un bon collègue. Confiant et factuel, sans dénigrer les autres candidats.",
  ],
  [
    "know-about-us", "motivation",
    ["What do you know about our company?", "What have you learned about us before this interview?"],
    ["Que {savez-vous|sais-tu} de notre entreprise ?", "Qu'{avez-vous|as-tu} appris sur nous avant cet entretien ?"],
    "Three facts are enough: what the company does and for whom, one recent piece of news or project, and something about its tech or way of working. Then say what interests you in it. Not knowing anything is a strong negative signal; ten minutes of preparation avoids it.",
    "Trois éléments suffisent : ce que fait l'entreprise et pour qui, une actualité ou un projet récent, et quelque chose sur sa technique ou sa façon de travailler. Dis ensuite ce qui t'y intéresse. Ne rien savoir est un signal très négatif ; dix minutes de préparation l'évitent.",
  ],
  [
    "why-leave", "motivation",
    ["Why are you leaving your current situation?", "Why did you leave your last job?"],
    ["Pourquoi {quittez-vous|quittes-tu} {votre|ta} situation actuelle ?", "Pourquoi {avez-vous|as-tu} quitté {votre|ton} dernier poste ?"],
    "Stay positive and turned to the future: what you are looking for (learning, a technical role, a team, a project) rather than what you are running from. Never criticise a former employer or colleague, even if it went badly: it is the answer interviewers remember most.",
    "Reste positif et tourné vers l'avenir : ce que tu cherches (apprendre, un rôle technique, une équipe, un projet) plutôt que ce que tu fuis. Ne critique jamais un ancien employeur ou collègue, même si ça s'est mal passé : c'est la réponse dont les recruteurs se souviennent le plus.",
  ],
  [
    "what-motivates", "motivation",
    ["What motivates you at work?", "What gets you out of bed on a Monday morning?"],
    ["Qu'est-ce qui {vous|te} motive au travail ?", "Qu'est-ce qui {vous|te} fait lever le lundi matin ?"],
    "Pick motivations that fit the job (solving problems, learning, seeing users use what you built, team work) and illustrate one with a moment you lived. Money can be part of it, but not the whole answer.",
    "Choisis des motivations qui collent au poste (résoudre des problèmes, apprendre, voir des utilisateurs se servir de ce que tu as construit, le travail d'équipe) et illustre-en une avec un moment vécu. L'argent peut en faire partie, mais pas toute la réponse.",
  ],
  [
    "junior-why-us", "motivation",
    ["What do you expect from your first job as a developer?", "What are you looking for in a junior position?"],
    ["Qu'{attendez-vous|attends-tu} de {votre|ton} premier poste de développeur ?", "Que {cherchez-vous|cherches-tu} dans un poste junior ?"],
    "Be honest and ambitious: learning from experienced people, code reviews, real projects in production, responsibility that grows. Show that you also give: reliability, curiosity, the will to take tasks off the team's plate.",
    "Sois honnête et ambitieux : apprendre auprès de personnes expérimentées, des revues de code, de vrais projets en production, des responsabilités qui grandissent. Montre aussi ce que tu donnes : fiabilité, curiosité, envie de soulager l'équipe.",
  ],

  // ---------- Strengths ----------
  [
    "strength", "strengths",
    ["What is your greatest strength?", "What are you particularly good at?", "What is the quality you are most proud of?"],
    ["Quelle est {votre|ta} plus grande qualité ?", "Dans quoi {êtes-vous|es-tu} particulièrement bon ?", "De quelle qualité {êtes-vous|es-tu} le plus fier ?"],
    "One strength that matters for the job, one real example where it made a difference, and the result. A strength proven by a story is worth more than a list of adjectives.",
    "Une qualité utile pour le poste, un exemple réel où elle a fait la différence, et le résultat. Une qualité prouvée par une histoire vaut plus qu'une liste d'adjectifs.",
  ],
  [
    "colleagues-say", "strengths",
    ["How would your colleagues or classmates describe you?", "What would your last manager say about you?"],
    ["Comment {vos|tes} collègues ou camarades {vous|te} décriraient-ils ?", "Que dirait {votre|ton} dernier responsable à {votre|ton} sujet ?"],
    "Quote what people actually told you, in a review, a feedback, a project: it is more credible than self-praise. Add one area where they would say you are still progressing: it shows self-awareness.",
    "Cite ce qu'on t'a vraiment dit, lors d'une évaluation, d'un retour, d'un projet : c'est plus crédible qu'un autoportrait flatteur. Ajoute un point sur lequel on dirait que tu progresses encore : ça montre que tu te connais.",
  ],
  [
    "proud-of", "strengths",
    ["What achievement are you most proud of?", "Tell me about something you built that you are proud of."],
    ["De quelle réalisation {êtes-vous|es-tu} le plus fier ?", "{Parlez-moi|Parle-moi} de quelque chose que {vous avez|tu as} construit et dont {vous êtes|tu es} fier."],
    "Pick one achievement and tell it with the STAR method: the Situation, the Task, the Actions you took yourself, the Result (a number, a user, a grade, what changed). Explain why it matters to you: it reveals what motivates you.",
    "Choisis une réalisation et raconte-la avec la méthode STAR : la Situation, la Tâche, les Actions que tu as menées toi-même, le Résultat (un chiffre, un utilisateur, une note, ce qui a changé). Explique pourquoi elle compte pour toi : ça révèle ce qui te motive.",
  ],
  [
    "different", "strengths",
    ["What makes you different from other candidates?", "What do you have that others might not?"],
    ["Qu'est-ce qui {vous|te} distingue des autres candidats ?", "Qu'{avez-vous|as-tu} que d'autres n'ont peut-être pas ?"],
    "Combine things: your path, a skill outside development, a project nobody else has. The point is not to be better than everyone, but to be memorable and useful. Stay factual and humble.",
    "Combine des éléments : ton parcours, une compétence hors développement, un projet que personne d'autre n'a. Le but n'est pas d'être meilleur que tout le monde, mais d'être mémorable et utile. Reste factuel et humble.",
  ],

  // ---------- Weaknesses ----------
  [
    "weakness", "weaknesses",
    ["What is your greatest weakness?", "What is something you are not good at yet?", "What would you like to improve about yourself?"],
    ["Quel est {votre|ton} plus grand défaut ?", "Dans quoi {n'êtes-vous|n'es-tu} pas encore bon ?", "Qu'{aimeriez-vous|aimerais-tu} améliorer chez {vous|toi} ?"],
    "A real weakness, not a disguised quality ('I am too perfectionist' fools nobody), that is not central to the job, and above all what you do about it: a habit, a tool, a progress you can measure. The answer is judged on self-awareness and the plan.",
    "Un vrai défaut, pas une qualité déguisée (« je suis trop perfectionniste » ne trompe personne), qui ne soit pas central pour le poste, et surtout ce que tu fais pour progresser : une habitude, un outil, un progrès mesurable. La réponse est jugée sur la lucidité et le plan.",
  ],
  [
    "failure", "weaknesses",
    ["Tell me about a failure.", "Tell me about a time something went wrong because of you."],
    ["{Parlez-moi|Parle-moi} d'un échec.", "{Racontez-moi|Raconte-moi} une fois où quelque chose a mal tourné à cause de {vous|toi}."],
    "Choose a real failure with a moderate impact, own your part without blaming others, explain what you did to fix it and what you changed since. The second half of the answer, the lesson and the change, matters more than the failure itself.",
    "Choisis un vrai échec à l'impact modéré, assume ta part sans accuser les autres, explique ce que tu as fait pour réparer et ce que tu as changé depuis. La seconde moitié de la réponse, la leçon et le changement, compte plus que l'échec lui-même.",
  ],
  [
    "feedback", "weaknesses",
    ["Tell me about a criticism or feedback you received.", "What is the most useful feedback you have ever received?"],
    ["{Parlez-moi|Parle-moi} d'une critique ou d'un retour que {vous avez|tu as} reçu.", "Quel est le retour le plus utile qu'on {vous|t'}ait jamais fait ?"],
    "Show that you can hear criticism without being defensive: what was said, how you reacted (listen, ask questions), and what you changed. Bonus if you can say the result of that change.",
    "Montre que tu sais entendre une critique sans te braquer : ce qu'on t'a dit, comment tu as réagi (écouter, poser des questions), et ce que tu as changé. Encore mieux si tu peux dire le résultat de ce changement.",
  ],
  [
    "not-know", "weaknesses",
    ["What will you need to learn to succeed in this role?", "Which parts of this job will be hardest for you at first?"],
    ["Que {devrez-vous|devras-tu} apprendre pour réussir à ce poste ?", "Quelles parties de ce poste seront les plus difficiles pour {vous|toi} au début ?"],
    "Be honest about one or two real gaps from the job description, then show how you are already closing them (course, project, documentation) and how fast you usually learn, with an example. Honesty plus a plan reassures more than pretending to know everything.",
    "Sois honnête sur une ou deux vraies lacunes par rapport au poste, puis montre comment tu es déjà en train de les combler (cours, projet, documentation) et à quelle vitesse tu apprends d'habitude, avec un exemple. L'honnêteté plus un plan rassurent davantage que prétendre tout savoir.",
  ],

  // ---------- Experience (behavioural, STAR) ----------
  [
    "conflict", "experience",
    ["Tell me about a conflict with a teammate and how you handled it.", "Have you ever disagreed with a colleague? What happened?"],
    ["{Parlez-moi|Parle-moi} d'un conflit avec un coéquipier et de la façon dont {vous l'avez|tu l'as} géré.", "{Avez-vous|As-tu} déjà été en désaccord avec un collègue ? Que s'est-il passé ?"],
    "STAR method: the situation, what the disagreement was about (the work, not the person), what you did to understand the other point of view and find a solution, and the outcome. Show that you stayed respectful and focused on the goal.",
    "Méthode STAR : la situation, le sujet du désaccord (le travail, pas la personne), ce que tu as fait pour comprendre l'autre point de vue et trouver une solution, et le résultat. Montre que tu es resté respectueux et concentré sur l'objectif.",
  ],
  [
    "deadline", "experience",
    ["Tell me about a time you had to deliver under a tight deadline.", "How did you handle a moment of strong pressure?"],
    ["{Racontez-moi|Raconte-moi} une fois où {vous avez|tu as} dû livrer avec un délai très court.", "Comment {avez-vous|as-tu} géré un moment de forte pression ?"],
    "STAR method: the deadline and why it was tight, how you prioritised (what you cut, what you kept), how you communicated with the people involved, and the result. Prioritising and warning early are what this question looks for, not working all night.",
    "Méthode STAR : l'échéance et pourquoi elle était serrée, comment tu as priorisé (ce que tu as coupé, ce que tu as gardé), comment tu as communiqué avec les personnes concernées, et le résultat. Prioriser et prévenir tôt, c'est ce que cette question cherche, pas travailler toute la nuit.",
  ],
  [
    "learned-fast", "experience",
    ["Tell me about a time you had to learn something new very quickly.", "How do you approach a technology you have never used?"],
    ["{Racontez-moi|Raconte-moi} une fois où {vous avez|tu as} dû apprendre quelque chose de nouveau très vite.", "Comment {abordez-vous|abordes-tu} une technologie que {vous n'avez|tu n'as} jamais utilisée ?"],
    "Give a real example and your method: official documentation and tutorials, a small throwaway project, asking the right person, reading existing code. Then the result and how long it took. A clear learning method is one of the best signals for a junior.",
    "Donne un exemple réel et ta méthode : documentation officielle et tutoriels, un petit projet jetable, demander à la bonne personne, lire le code existant. Puis le résultat et le temps que ça a pris. Une méthode d'apprentissage claire est l'un des meilleurs signaux pour un junior.",
  ],
  [
    "teamwork", "experience",
    ["Tell me about a team project. What was your role?", "Describe a time you worked well in a team."],
    ["{Parlez-moi|Parle-moi} d'un projet d'équipe. Quel était {votre|ton} rôle ?", "{Décrivez|Décris} un moment où {vous avez|tu as} bien travaillé en équipe."],
    "Be precise about YOUR part in the team (with 'I' for your actions and 'we' for the team's), how you coordinated (meetings, Git, task board), one difficulty and how the team solved it, and the result.",
    "Sois précis sur TA part dans l'équipe (« je » pour tes actions, « nous » pour celles de l'équipe), la façon dont vous vous êtes coordonnés (réunions, Git, tableau de tâches), une difficulté et la façon dont l'équipe l'a résolue, puis le résultat.",
  ],
  [
    "initiative", "experience",
    ["Tell me about a time you took the initiative.", "Have you ever improved something nobody asked you to?"],
    ["{Racontez-moi|Raconte-moi} une fois où {vous avez|tu as} pris une initiative.", "{Avez-vous|As-tu} déjà amélioré quelque chose sans qu'on {vous|te} le demande ?"],
    "STAR method: what you noticed (a slow process, a missing test, a confusing document), what you proposed or did, how you got the others on board, and the result. Show initiative that served the team, not a solo project behind everyone's back.",
    "Méthode STAR : ce que tu as remarqué (un processus lent, un test manquant, une documentation confuse), ce que tu as proposé ou fait, comment tu as embarqué les autres, et le résultat. Montre une initiative au service de l'équipe, pas un projet solo dans le dos de tout le monde.",
  ],
  [
    "mistake-work", "experience",
    ["Tell me about a mistake you made at work or in a project.", "What was your worst bug, and what did you learn from it?"],
    ["{Parlez-moi|Parle-moi} d'une erreur que {vous avez|tu as} faite au travail ou dans un projet.", "Quel a été {votre|ton} pire bug, et qu'en {avez-vous|as-tu} retenu ?"],
    "Own the mistake simply, explain how you noticed it, how you limited the damage and warned the people concerned, then what you put in place so it does not happen again (a test, a checklist, a review). Calm and responsibility are what count.",
    "Assume l'erreur simplement, explique comment tu l'as remarquée, comment tu as limité les dégâts et prévenu les personnes concernées, puis ce que tu as mis en place pour que ça ne se reproduise pas (un test, une checklist, une relecture). Le calme et le sens des responsabilités, c'est ce qui compte.",
  ],
  [
    "disagree-decision", "experience",
    ["Tell me about a time you disagreed with a decision from your manager or teacher.", "Have you ever had to defend an idea against your manager?"],
    ["{Racontez-moi|Raconte-moi} une fois où {vous n'étiez|tu n'étais} pas d'accord avec une décision de {votre|ton} responsable ou professeur.", "{Avez-vous|As-tu} déjà dû défendre une idée face à {votre|ton} responsable ?"],
    "Show that you can disagree respectfully: you raised it privately, with arguments and facts, you listened to the reasons, and once the decision was made you applied it fully (or it changed thanks to your arguments). Never present it as a fight you won.",
    "Montre que tu sais être en désaccord avec respect : tu l'as dit en privé, avec des arguments et des faits, tu as écouté les raisons, et une fois la décision prise tu l'as appliquée pleinement (ou elle a changé grâce à tes arguments). Ne la présente jamais comme un combat gagné.",
  ],
  [
    "difficult-person", "experience",
    ["Tell me about a time you worked with a difficult person.", "How did you deal with someone who was hard to work with?"],
    ["{Parlez-moi|Parle-moi} d'une fois où {vous avez|tu as} travaillé avec une personne difficile.", "Comment {avez-vous|as-tu} fait avec quelqu'un avec qui il était difficile de travailler ?"],
    "Describe the behaviour, not the person, then what you did: understand their constraints, clarify expectations, communicate in writing, ask for help if needed. End on the result and what you learned about working with different people. No gossip.",
    "Décris le comportement, pas la personne, puis ce que tu as fait : comprendre ses contraintes, clarifier les attentes, communiquer par écrit, demander de l'aide si nécessaire. Termine par le résultat et ce que ça t'a appris sur le travail avec des personnes différentes. Pas de commérage.",
  ],

  // ---------- Situations ----------
  [
    "dont-know", "situation",
    ["In a meeting, someone asks you a technical question you cannot answer. What do you do?", "What do you do when you don't know the answer to a question?"],
    ["En réunion, on {vous|te} pose une question technique à laquelle {vous ne savez|tu ne sais} pas répondre. Que {faites-vous|fais-tu} ?", "Que {faites-vous|fais-tu} quand {vous ne connaissez|tu ne connais} pas la réponse à une question ?"],
    "Say you don't know rather than inventing, say what you do know and how you would find the answer, and promise a follow-up you actually deliver. Interviewers sometimes test exactly this: honesty plus a method is the right answer.",
    "Dis que tu ne sais pas plutôt que d'inventer, dis ce que tu sais et comment tu trouverais la réponse, et promets un retour que tu fais vraiment. Les recruteurs testent parfois exactement ça : l'honnêteté plus une méthode, c'est la bonne réponse.",
  ],
  [
    "prod-bug-friday", "situation",
    ["It's Friday evening and a bug blocks users in production. What do you do?", "You discover a serious bug just after a release. Walk me through your reaction."],
    ["Vendredi soir, un bug bloque les utilisateurs en production. Que {faites-vous|fais-tu} ?", "{Vous découvrez|Tu découvres} un bug grave juste après une mise en production. Quelle est {votre|ta} réaction ?"],
    "Calm and method: warn the right people immediately, measure the impact, limit the damage first (roll back, disable the feature), then look for the cause, fix it with a test, and write a short post-mortem without blame. As a junior, warning early matters more than fixing alone.",
    "Calme et méthode : prévenir tout de suite les bonnes personnes, mesurer l'impact, limiter les dégâts d'abord (revenir en arrière, désactiver la fonctionnalité), puis chercher la cause, corriger avec un test, et écrire un court bilan sans chercher de coupable. En tant que junior, prévenir tôt compte plus que tout réparer seul.",
  ],
  [
    "unclear-request", "situation",
    ["You receive a task with very vague requirements. What do you do?", "What do you do when you don't understand what is expected of you?"],
    ["{Vous recevez|Tu reçois} une tâche aux consignes très floues. Que {faites-vous|fais-tu} ?", "Que {faites-vous|fais-tu} quand {vous ne comprenez|tu ne comprends} pas ce qu'on attend de {vous|toi} ?"],
    "Ask questions early: the goal, the users, what 'done' looks like, the deadline. Write down what you understood and have it confirmed, propose a small first version to check you are on track. Asking is a sign of professionalism, not of weakness.",
    "Pose des questions tôt : l'objectif, les utilisateurs, ce que « terminé » veut dire, l'échéance. Écris ce que tu as compris et fais-le valider, propose une petite première version pour vérifier que tu vas dans la bonne direction. Demander est un signe de professionnalisme, pas de faiblesse.",
  ],
  [
    "too-many-tasks", "situation",
    ["You have more tasks than you can finish this week. How do you decide?", "How do you organise yourself when everything is urgent?"],
    ["{Vous avez|Tu as} plus de tâches que {vous ne pouvez|tu ne peux} en finir cette semaine. Comment {décidez-vous|décides-tu} ?", "Comment {vous organisez-vous|t'organises-tu} quand tout est urgent ?"],
    "List the tasks, sort them by impact and urgency, and above all talk with your manager about the priorities instead of deciding alone what will be late. Mention a concrete tool or habit (board, short daily list).",
    "Liste les tâches, classe-les par impact et urgence, et surtout parle des priorités avec ton responsable au lieu de décider seul ce qui sera en retard. Cite un outil ou une habitude concrète (tableau, courte liste quotidienne).",
  ],
  [
    "colleague-not-working", "situation",
    ["A teammate is not doing their share on a project. What do you do?", "How would you react if a colleague kept missing deadlines that affect your work?"],
    ["Un coéquipier ne fait pas sa part sur un projet. Que {faites-vous|fais-tu} ?", "Comment {réagiriez-vous|réagirais-tu} si un collègue ratait sans cesse des échéances qui touchent {votre|ton} travail ?"],
    "First talk to the person privately, without accusing: maybe they are blocked or overloaded; offer help and agree on next steps. If nothing changes and the project suffers, inform the manager factually. Show empathy first, then responsibility towards the team.",
    "Parle d'abord à la personne en privé, sans accuser : elle est peut-être bloquée ou débordée ; propose ton aide et mettez-vous d'accord sur la suite. Si rien ne change et que le projet en souffre, informe le responsable de façon factuelle. Montre d'abord de l'empathie, puis le sens des responsabilités envers l'équipe.",
  ],
  [
    "wrong-instruction", "situation",
    ["Your manager asks you to do something you think is a bad idea. What do you do?", "What would you do if you were asked to ship code you think is not ready?"],
    ["{Votre|Ton} responsable {vous|te} demande de faire quelque chose qui {vous|te} semble être une mauvaise idée. Que {faites-vous|fais-tu} ?", "Que {feriez-vous|ferais-tu} si on {vous|te} demandait de livrer du code qui ne {vous|te} semble pas prêt ?"],
    "Explain your concern clearly with facts and risks, propose an alternative or a way to reduce the risk, then respect the decision if it is maintained, and keep a written trace. If it were unethical or illegal, you would refuse: say so calmly.",
    "Explique clairement ton inquiétude avec des faits et des risques, propose une alternative ou un moyen de réduire le risque, puis respecte la décision si elle est maintenue, et garde une trace écrite. Si c'était contraire à l'éthique ou illégal, tu refuserais : dis-le calmement.",
  ],

  // ---------- Career ----------
  [
    "five-years", "career",
    ["Where do you see yourself in five years?", "What are your career goals?", "How do you imagine your career evolving?"],
    ["Où {vous voyez-vous|te vois-tu} dans cinq ans ?", "Quels sont {vos|tes} objectifs de carrière ?", "Comment {imaginez-vous|imagines-tu} l'évolution de {votre|ta} carrière ?"],
    "Show a direction compatible with the company: grow technically, take more responsibility, maybe specialise or mentor others. Being ambitious is fine; saying you plan to leave in a year, or that you want your interviewer's job, is not.",
    "Montre une direction compatible avec l'entreprise : progresser techniquement, prendre plus de responsabilités, peut-être te spécialiser ou accompagner d'autres personnes. L'ambition est bienvenue ; dire que tu comptes partir dans un an, ou que tu veux le poste de ton interlocuteur, l'est moins.",
  ],
  [
    "keep-learning", "career",
    ["How do you keep your skills up to date?", "How do you keep learning outside of work?"],
    ["Comment {tenez-vous|tiens-tu} {vos|tes} compétences à jour ?", "Comment {continuez-vous|continues-tu} à apprendre en dehors du travail ?"],
    "Name concrete sources and habits: documentation, a newsletter or podcast, side projects, katas, meetups, a course in progress. One recent thing you learned and how you used it makes the answer real.",
    "Cite des sources et des habitudes concrètes : documentation, une newsletter ou un podcast, des projets perso, des katas, des meetups, une formation en cours. Une chose apprise récemment et la façon dont tu l'as utilisée rendent la réponse crédible.",
  ],
  [
    "ideal-job", "career",
    ["What would your ideal job look like?", "Describe the ideal team or manager for you."],
    ["À quoi ressemblerait {votre|ton} poste idéal ?", "{Décrivez|Décris} l'équipe ou le responsable idéal pour {vous|toi}."],
    "Describe it so it overlaps a lot with this job (without copying the ad word for word): the kind of work, the team culture, the support you value (feedback, code reviews). It is a compatibility check: be sincere, but stay close to what they offer.",
    "Décris-le de façon qu'il recoupe largement ce poste (sans recopier l'annonce mot pour mot) : le type de travail, la culture d'équipe, l'accompagnement qui compte pour toi (retours, revues de code). C'est un test de compatibilité : sois sincère, mais reste proche de ce qu'ils proposent.",
  ],

  // ---------- Salary and conditions ----------
  [
    "salary", "salary",
    ["What are your salary expectations?", "How much do you expect to earn in this role?"],
    ["Quelles sont {vos|tes} prétentions salariales ?", "Combien {souhaitez-vous|souhaites-tu} gagner à ce poste ?"],
    "Research the market range for a junior in this role and region beforehand, then give a range rather than a single number, gross per year or month as is usual in the country, and say that the whole package (training, remote work, benefits) matters too. Avoid saying 'whatever you offer'.",
    "Renseigne-toi avant sur la fourchette du marché pour un junior à ce poste et dans cette région, puis donne une fourchette plutôt qu'un chiffre, en brut annuel ou mensuel selon l'usage du pays, et précise que l'ensemble (formation, télétravail, avantages) compte aussi. Évite « ce que vous proposez ».",
  ],
  [
    "other-processes", "salary",
    ["Are you interviewing with other companies?", "Where are you in your job search?"],
    ["{Êtes-vous|Es-tu} en entretien avec d'autres entreprises ?", "Où en {êtes-vous|es-tu} dans {votre|ta} recherche d'emploi ?"],
    "Be honest without giving names: say whether you have other processes and how advanced they are, and that this role is a priority for you if it is. It helps them plan; lying about offers you do not have is risky.",
    "Sois honnête sans donner de noms : dis si tu as d'autres processus en cours et où ils en sont, et que ce poste est prioritaire pour toi si c'est le cas. Ça les aide à s'organiser ; mentir sur des offres que tu n'as pas est risqué.",
  ],
  [
    "availability", "salary",
    ["When could you start?", "What is your notice period or availability?"],
    ["Quand pourriez-{vous|tu} commencer ?", "Quelle est {votre|ta} disponibilité ou {votre|ton} préavis ?"],
    "Give a clear, true date and any constraint (notice period, end of training, holidays already booked). Being reliable on small facts like this one builds trust for the rest.",
    "Donne une date claire et vraie et les éventuelles contraintes (préavis, fin de formation, congés déjà prévus). Être fiable sur de petits faits comme celui-ci donne confiance pour le reste.",
  ],
  [
    "remote-hours", "salary",
    ["How do you feel about remote work, office days and working hours?", "Are you open to relocating or travelling for work?"],
    ["Que {pensez-vous|penses-tu} du télétravail, des jours au bureau et des horaires ?", "{Êtes-vous|Es-tu} prêt à déménager ou à {vous|te} déplacer pour le travail ?"],
    "State your preferences honestly but flexibly, and explain how you stay effective in each mode (communication, availability). For a first job, showing interest in time at the office with the team is usually appreciated.",
    "Exprime tes préférences honnêtement mais avec souplesse, et explique comment tu restes efficace dans chaque mode (communication, disponibilité). Pour un premier emploi, montrer de l'intérêt pour le temps au bureau avec l'équipe est généralement apprécié.",
  ],

  // ---------- Work style ----------
  [
    "stress", "situation",
    ["How do you handle stress?", "What do you do when you feel overwhelmed?"],
    ["Comment {gérez-vous|gères-tu} le stress ?", "Que {faites-vous|fais-tu} quand {vous vous sentez|tu te sens} débordé ?"],
    "Admit that stress exists, then show your tools: break the problem down, prioritise, ask for help in time, take a short break. One example where it worked makes the answer believable.",
    "Reconnais que le stress existe, puis montre tes outils : découper le problème, prioriser, demander de l'aide à temps, faire une courte pause. Un exemple où ça a marché rend la réponse crédible.",
  ],
  [
    "work-style", "situation",
    ["Do you prefer working alone or in a team?", "How do you like to work?"],
    ["{Préférez-vous|Préfères-tu} travailler seul ou en équipe ?", "Comment {aimez-vous|aimes-tu} travailler ?"],
    "Avoid extremes: show that you are comfortable in both and when each one fits (focus time to code, team time to design and review). Give an example of each.",
    "Évite les extrêmes : montre que tu es à l'aise dans les deux et quand chacun convient (temps de concentration pour coder, temps d'équipe pour concevoir et relire). Donne un exemple de chaque.",
  ],

  // ---------- Tricky ----------
  [
    "gap-cv", "tricky",
    ["I see a gap in your CV. What happened during that time?", "What did you do between these two experiences?"],
    ["Je vois un trou dans {votre|ton} CV. Que s'est-il passé pendant cette période ?", "Qu'{avez-vous|as-tu} fait entre ces deux expériences ?"],
    "Answer calmly and briefly, without excessive justification: the reason in one sentence (training, family, health, search, travel; you don't have to give private details), then what you did or learned during that time and why you are ready now.",
    "Réponds calmement et brièvement, sans te justifier à l'excès : la raison en une phrase (formation, famille, santé, recherche, voyage ; tu n'as pas à donner de détails privés), puis ce que tu as fait ou appris pendant cette période et pourquoi tu es prêt maintenant.",
  ],
  [
    "overqualified", "tricky",
    ["Don't you think you are overqualified, or under-qualified, for this job?", "Your profile does not exactly match what we are looking for. Why should we consider you?"],
    ["Ne {pensez-vous|penses-tu} pas être surqualifié, ou pas assez qualifié, pour ce poste ?", "{Votre|Ton} profil ne correspond pas exactement à ce que nous cherchons. Pourquoi devrions-nous {vous|te} retenir ?"],
    "Acknowledge the point without getting defensive, then turn it around: what in your profile matches the essential needs, how you are closing the gap (or why you want this role despite more experience), and your motivation for this precise job.",
    "Reconnais le point sans te braquer, puis retourne-le : ce qui dans ton profil répond aux besoins essentiels, comment tu combles l'écart (ou pourquoi tu veux ce poste malgré plus d'expérience), et ta motivation pour ce poste précis.",
  ],
  [
    "short-jobs", "tricky",
    ["You have changed jobs often. Why?", "How long do you plan to stay with us?"],
    ["{Vous avez|Tu as} souvent changé de poste. Pourquoi ?", "Combien de temps {comptez-vous|comptes-tu} rester chez nous ?"],
    "Explain the changes with a logic (contracts, learning, a career change), without criticising anyone, then show why you want to settle here: what this role offers that makes you want to stay and grow.",
    "Explique les changements par une logique (contrats, apprentissage, reconversion), sans critiquer personne, puis montre pourquoi tu veux t'installer ici : ce que ce poste t'offre qui te donne envie de rester et de progresser.",
  ],
  [
    "lower-salary", "tricky",
    ["Would you accept a lower salary than what you asked for?", "What if our budget is lower than your expectations?"],
    ["{Accepteriez-vous|Accepterais-tu} un salaire inférieur à {votre|ta} demande ?", "Et si notre budget est inférieur à {vos|tes} attentes ?"],
    "Stay calm and open but not desperate: ask what the whole package includes (training, bonus, remote work, review after a trial period), say what matters most to you, and if needed propose a review date. Never accept or refuse on the spot without knowing the full offer.",
    "Reste calme et ouvert sans paraître désespéré : demande ce que comprend l'ensemble (formation, prime, télétravail, révision après la période d'essai), dis ce qui compte le plus pour toi, et si besoin propose une date de révision. N'accepte ni ne refuse sur le moment sans connaître l'offre complète.",
  ],
  [
    "sell-pen", "tricky",
    ["Sell me this pen.", "Convince me in one minute that I should use your favourite tool."],
    ["{Vendez|Vends}-moi ce stylo.", "{Convainquez|Convaincs}-moi en une minute d'utiliser {votre|ton} outil préféré."],
    "The trap is to list features. Ask first what the person needs (what do they use, what bothers them), then present the one benefit that answers that need, and close by asking for a decision. It tests listening and structure, not sales talent.",
    "Le piège est d'énumérer des caractéristiques. Demande d'abord ce dont la personne a besoin (ce qu'elle utilise, ce qui la gêne), puis présente le bénéfice qui répond à ce besoin, et termine en demandant une décision. Ça teste l'écoute et la structure, pas le talent de vendeur.",
  ],
  [
    "not-hired", "tricky",
    ["What would you do if you don't get this job?", "What is a question you hoped we would not ask?"],
    ["Que {ferez-vous|feras-tu} si {vous n'obtenez|tu n'obtiens} pas ce poste ?", "Quelle question {espériez-vous|espérais-tu} qu'on ne {vous|te} pose pas ?"],
    "Stay composed and constructive: you would ask for feedback, keep improving and keep applying, while saying that this role really interests you. For the second version, pick a real but manageable topic and answer it well: it shows maturity.",
    "Reste posé et constructif : tu demanderais un retour, tu continuerais à progresser et à postuler, tout en disant que ce poste t'intéresse vraiment. Pour la seconde version, choisis un sujet réel mais gérable et réponds-y bien : ça montre de la maturité.",
  ],
  [
    "silence", "tricky",
    ["Is that all you have to say?", "I'm not convinced. Can you do better?"],
    ["C'est tout ce que {vous avez|tu as} à dire ?", "Je ne suis pas convaincu. {Pouvez-vous|Peux-tu} faire mieux ?"],
    "A pressure test. Stay calm, do not panic or over-apologise: take a second, add one concrete example or clarify your main point, or ask what they would like to know more about. Composure is the answer they are testing.",
    "Un test de pression. Reste calme, sans paniquer ni t'excuser à l'excès : prends une seconde, ajoute un exemple concret ou précise ton point principal, ou demande sur quoi ils aimeraient en savoir plus. Le sang-froid, c'est la réponse qu'ils testent.",
  ],

  // ---------- Closing ----------
  [
    "questions-for-us", "closing",
    ["Do you have any questions for us?", "Is there anything you would like to ask me?"],
    ["{Avez-vous|As-tu} des questions à nous poser ?", "Y a-t-il quelque chose que {vous aimeriez|tu aimerais} me demander ?"],
    "Always have two or three questions ready: about the team and the daily work, how juniors are supported (onboarding, code reviews, mentoring), the next steps of the process. 'No, everything is clear' wastes your last chance to show interest. Leave salary for later unless they bring it up.",
    "Prépare toujours deux ou trois questions : sur l'équipe et le travail au quotidien, l'accompagnement des juniors (intégration, revues de code, mentorat), les prochaines étapes du processus. « Non, tout est clair » gâche ta dernière occasion de montrer ton intérêt. Garde le salaire pour plus tard, sauf s'ils en parlent.",
  ],
  [
    "anything-to-add", "closing",
    ["Is there anything you would like to add?", "Anything we have not talked about that you would like us to know?"],
    ["{Souhaitez-vous|Souhaites-tu} ajouter quelque chose ?", "Y a-t-il un point dont nous n'avons pas parlé et que {vous aimeriez|tu aimerais} que nous sachions ?"],
    "Use it for a 30-second closing: one strength or project you have not mentioned, a short recap of why you fit, and a thank you. Do not reopen a long topic.",
    "Utilise-la pour une conclusion de 30 secondes : une qualité ou un projet que tu n'as pas mentionné, un court rappel de pourquoi tu corresponds au poste, et un remerciement. Ne relance pas un long sujet.",
  ],

  // ---------- Inappropriate or unlawful questions ----------
  // In Belgium and the EU, anti-discrimination law forbids basing a hiring decision on these personal
  // characteristics. They are still asked sometimes: practising a calm answer is useful. Asked with a
  // short notice on the call, never as if they were acceptable.
  [
    "children", "inappropriate",
    ["Do you have children, or are you planning to have any soon?", "Are you planning to start a family?"],
    ["{Avez-vous|As-tu} des enfants, ou {comptez-vous|comptes-tu} en avoir bientôt ?", "{Envisagez-vous|Envisages-tu} de fonder une famille ?"],
    "This question is not allowed in a hiring process in Belgium and the EU (discrimination based on family situation, pregnancy or sex). You do not have to answer. A calm way out: 'I prefer to keep my private life separate; what I can tell you is that I am fully available for this role.' You may also note it as a signal about the company's culture.",
    "Cette question n'est pas autorisée dans un recrutement en Belgique et dans l'UE (discrimination liée à la situation familiale, à la grossesse ou au sexe). Tu n'as pas à répondre. Une sortie calme : « Je préfère garder ma vie privée à part ; ce que je peux vous dire, c'est que je suis pleinement disponible pour ce poste. » Tu peux aussi le noter comme un signal sur la culture de l'entreprise.",
  ],
  [
    "age", "inappropriate",
    ["How old are you exactly?", "Don't you think you are a bit old, or young, for a junior position?"],
    ["Quel âge {avez-vous|as-tu} exactement ?", "Ne {pensez-vous|penses-tu} pas être un peu âgé, ou jeune, pour un poste junior ?"],
    "Age is a protected characteristic: a hiring decision may not be based on it. You can redirect to what matters: 'What counts for this role is my skills and my motivation; let me give you an example of what I can bring.' Stay courteous, without lecturing the interviewer.",
    "L'âge est un critère protégé : une décision d'embauche ne peut pas se fonder dessus. Tu peux recentrer sur ce qui compte : « Ce qui compte pour ce poste, ce sont mes compétences et ma motivation ; laissez-moi vous donner un exemple de ce que je peux apporter. » Reste courtois, sans faire la leçon.",
  ],
  [
    "origin", "inappropriate",
    ["Where are you really from?", "What is your nationality, your origin?"],
    ["{Vous venez|Tu viens} d'où, vraiment ?", "Quelle est {votre|ta} nationalité, {votre|ton} origine ?"],
    "Origin and so-called race are protected characteristics; only the right to work in the country can be asked, and in neutral terms. You can answer only that: 'I am allowed to work in Belgium without restriction', and bring the conversation back to the role.",
    "L'origine et la prétendue race sont des critères protégés ; seul le droit de travailler dans le pays peut être demandé, en termes neutres. Tu peux répondre uniquement à cela : « Je suis autorisé à travailler en Belgique sans restriction », puis ramener la conversation sur le poste.",
  ],
  [
    "religion", "inappropriate",
    ["Do you practise a religion?", "Will you need time off for religious holidays?"],
    ["{Pratiquez-vous|Pratiques-tu} une religion ?", "{Aurez-vous|Auras-tu} besoin de congés pour des fêtes religieuses ?"],
    "Religious and philosophical beliefs are protected: you do not have to answer. If you want, answer the practical side only: 'I will organise my leave like everyone, within the company's rules.'",
    "Les convictions religieuses et philosophiques sont protégées : tu n'as pas à répondre. Si tu le souhaites, réponds seulement sur le plan pratique : « J'organiserai mes congés comme tout le monde, dans le cadre des règles de l'entreprise. »",
  ],
  [
    "health", "inappropriate",
    ["Do you have any health problems?", "Have you been on sick leave a lot?"],
    ["{Avez-vous|As-tu} des problèmes de santé ?", "{Avez-vous|As-tu} souvent été en congé maladie ?"],
    "Health and disability are protected; your fitness for a job is assessed by the occupational doctor, not in the interview. You can say: 'I am able to do the work this role requires.' If you need a workplace adjustment, you decide if and when to mention it.",
    "La santé et le handicap sont protégés ; l'aptitude à un poste est évaluée par le médecin du travail, pas en entretien. Tu peux dire : « Je suis en mesure d'effectuer le travail que demande ce poste. » Si tu as besoin d'un aménagement, c'est toi qui décides si et quand en parler.",
  ],
  [
    "partner", "inappropriate",
    ["Are you married? What does your partner do?", "Is your partner OK with you working long hours?"],
    ["{Êtes-vous|Es-tu} marié ? Que fait {votre|ton} conjoint ?", "{Votre|Ton} conjoint est-il d'accord pour que {vous travailliez|tu travailles} tard ?"],
    "Civil status is a protected characteristic and your partner is not part of the application. A neutral answer: 'My private situation will not affect my work; I am available for the schedule of this role.'",
    "L'état civil est un critère protégé et ton conjoint ne fait pas partie de la candidature. Une réponse neutre : « Ma situation privée n'aura pas d'impact sur mon travail ; je suis disponible pour les horaires de ce poste. »",
  ],
  [
    "politics-union", "inappropriate",
    ["Who did you vote for in the last elections?", "Are you a member of a trade union?"],
    ["Pour qui {avez-vous|as-tu} voté aux dernières élections ?", "{Êtes-vous|Es-tu} syndiqué ?"],
    "Political opinions and union membership are protected. Decline politely: 'I keep my political and union choices private; I am happy to talk about how I work in a team.'",
    "Les opinions politiques et l'appartenance syndicale sont protégées. Décline poliment : « Je garde mes choix politiques et syndicaux pour moi ; je parle volontiers de ma façon de travailler en équipe. »",
  ],
  [
    "orientation", "inappropriate",
    ["Do you have a boyfriend or a girlfriend?", "Are you gay?"],
    ["{Avez-vous|As-tu} un copain ou une copine ?", "{Êtes-vous|Es-tu} homosexuel ?"],
    "Sexual orientation is protected and this question has no place in an interview. You can refuse calmly: 'That is personal and not related to the job.' If the process continues like this, it is useful information about the workplace; in Belgium, Unia can advise you.",
    "L'orientation sexuelle est protégée et cette question n'a pas sa place en entretien. Tu peux refuser calmement : « C'est personnel et sans lien avec le poste. » Si le processus continue ainsi, c'est une information utile sur l'entreprise ; en Belgique, Unia peut te conseiller.",
  ],
];
