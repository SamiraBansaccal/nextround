import { defineTech, same } from "./types";

// Web development: languages, front-end frameworks, back-end JavaScript, APIs, PHP.

export const javascript = defineTech(
  {
    id: "javascript",
    label: same("JavaScript"),
    family: "web",
    tool: true,
    aliases: ["javascript", "js", "ecmascript", "es6", "es2015", "vanilla js", "jquery"],
  },
  [
    [
      "var-let-const", "compare",
      "var, let, const: what is the difference?",
      "var, let, const : quelle est la différence ?",
      "var is scoped to the function and hoisted, so it can be used before its declaration, as undefined, and it ignores blocks. let and const are scoped to the block, and using them before their declaration is an error. const forbids reassigning the variable, but an object or an array declared with const can still be modified. I use const by default, let when the value changes, and never var.",
      "var a une portée de fonction et il est hissé, donc on peut l'utiliser avant sa déclaration, avec la valeur undefined, et il ignore les blocs. let et const ont une portée de bloc, et les utiliser avant leur déclaration est une erreur. const interdit de réaffecter la variable, mais un objet ou un tableau déclaré avec const peut quand même être modifié. J'utilise const par défaut, let quand la valeur change, et jamais var.",
    ],
    [
      "equality", "compare",
      "What is the difference between == and ===?",
      "Quelle est la différence entre == et === ?",
      "== compares after type conversion, which gives surprising results: 0 == '' and null == undefined are both true. === compares without conversion: the values and the types must be the same. I always use ===, except sometimes x == null to test null and undefined at once.",
      "== compare après conversion de type, ce qui donne des résultats surprenants : 0 == '' et null == undefined sont tous les deux vrais. === compare sans conversion : les valeurs et les types doivent être identiques. J'utilise toujours ===, sauf parfois x == null pour tester null et undefined en même temps.",
    ],
    [
      "closures", "concept",
      "What is a closure? Give an example of where you would use one.",
      "Qu'est-ce qu'une closure ? {Donnez|Donne} un exemple d'utilisation.",
      "A closure is a function that remembers the variables of the scope where it was created, even after that scope has finished. For example, a makeCounter function that declares count and returns a function that increments it: each counter keeps its own private count. Closures are behind callbacks, event handlers, and React hooks that capture state.",
      "Une closure est une fonction qui se souvient des variables de la portée où elle a été créée, même après la fin de cette portée. Par exemple, une fonction makeCounter qui déclare count et renvoie une fonction qui l'incrémente : chaque compteur garde son propre count privé. Les closures sont derrière les callbacks, les gestionnaires d'événements et les hooks React qui capturent l'état.",
    ],
    [
      "event-loop", "concept",
      "How does the event loop let JavaScript handle many things at once on a single thread?",
      "Comment la boucle d'événements (event loop) permet-elle à JavaScript de gérer plusieurs choses à la fois avec un seul thread ?",
      "JavaScript runs one task at a time on one thread, but slow operations, network, timers, files, are handed to the browser or to Node, which do them in the background. When one finishes, its callback is queued, and the event loop takes the next callback whenever the call stack is empty; promise callbacks, the microtasks, run before the next task. So the code never waits blocked, as long as no callback does heavy synchronous work.",
      "JavaScript exécute une tâche à la fois sur un seul thread, mais les opérations lentes, réseau, timers, fichiers, sont confiées au navigateur ou à Node, qui les font en arrière-plan. Quand l'une se termine, son callback est mis en file, et la boucle d'événements prend le callback suivant dès que la pile d'appels est vide ; les callbacks des promesses, les microtâches, passent avant la tâche suivante. Le code n'attend donc jamais bloqué, tant qu'aucun callback ne fait de gros travail synchrone.",
    ],
    [
      "promises", "practice",
      "Promises and async/await: how would you call two APIs in parallel and wait for both?",
      "Promesses et async/await : comment appeler deux API en parallèle et attendre les deux réponses ?",
      "A promise represents a value that arrives later, and async and await make asynchronous code read like synchronous code. To call two APIs in parallel, I start both requests and await Promise.all([fetchA(), fetchB()]), which resolves when both are done and rejects as soon as one fails; Promise.allSettled returns every result even if some fail. Awaiting them one after the other would double the waiting time.",
      "Une promesse représente une valeur qui arrive plus tard, et async et await permettent d'écrire du code asynchrone qui se lit comme du code synchrone. Pour appeler deux API en parallèle, je lance les deux requêtes et j'attends Promise.all([fetchA(), fetchB()]), qui se résout quand les deux sont terminées et échoue dès que l'une échoue ; Promise.allSettled renvoie tous les résultats même si certaines échouent. Les attendre l'une après l'autre doublerait le temps d'attente.",
    ],
    [
      "this", "concept",
      "What does this refer to in JavaScript, and what do arrow functions change?",
      "À quoi fait référence this en JavaScript, et qu'est-ce que les fonctions fléchées changent ?",
      "this depends on how a function is called: in a method call, obj.method(), it is obj; in a plain function call, it is undefined in strict mode; with new, it is the new object; call, apply and bind set it explicitly. Arrow functions have no this of their own: they use the this of the place where they are defined, which is handy for callbacks inside methods.",
      "this dépend de la façon dont la fonction est appelée : dans un appel de méthode, obj.method(), c'est obj ; dans un appel de fonction simple, c'est undefined en mode strict ; avec new, c'est le nouvel objet ; call, apply et bind le fixent explicitement. Les fonctions fléchées n'ont pas leur propre this : elles utilisent celui de l'endroit où elles sont définies, ce qui est pratique pour les callbacks dans des méthodes.",
    ],
    [
      "silent-async", "troubleshoot",
      "An async function fails silently and nothing shows in the console. What could be happening?",
      "Une fonction async échoue en silence et rien ne s'affiche dans la console. Que peut-il se passer ?",
      "Probably a rejected promise that nobody awaits or catches: an async function called without await, a then without a catch, or a try/catch around a call that is not awaited, so the error escapes it. Another classic is an empty catch block that swallows the error. I make sure every promise is awaited or caught, log errors in the catch, and listen to unhandledrejection to spot what slips through.",
      "Probablement une promesse rejetée que personne n'attend ni n'intercepte : une fonction async appelée sans await, un then sans catch, ou un try/catch autour d'un appel qui n'est pas attendu, si bien que l'erreur lui échappe. Autre classique : un bloc catch vide qui avale l'erreur. Je m'assure que chaque promesse est attendue ou interceptée, je journalise les erreurs dans le catch, et j'écoute unhandledrejection pour repérer ce qui passe entre les mailles.",
    ],
    [
      "dom-events", "concept",
      "What are event bubbling and event delegation in the DOM?",
      "Que sont la propagation des événements (bubbling) et la délégation d'événements dans le DOM ?",
      "When an event happens on an element, it first travels down from the document to the target, the capture phase, then bubbles back up through each parent, so a parent can react to a click on its children. Event delegation relies on this: one listener on a parent, for example a list, handles the events of all its items through event.target, including items added later, instead of one listener per item.",
      "Quand un événement se produit sur un élément, il descend d'abord du document jusqu'à la cible, la phase de capture, puis remonte à travers chaque parent, si bien qu'un parent peut réagir à un clic sur ses enfants. La délégation d'événements s'appuie là-dessus : un seul écouteur sur un parent, par exemple une liste, gère les événements de tous ses éléments grâce à event.target, y compris ceux ajoutés plus tard, au lieu d'un écouteur par élément.",
    ],
    [
      "immutability", "best_practice",
      "Why do people avoid mutating objects and arrays in modern JavaScript? How do you copy them?",
      "Pourquoi évite-t-on de modifier directement objets et tableaux en JavaScript moderne ? Comment les copier ?",
      "Mutating a shared object changes it for everyone who holds a reference, which causes bugs that are hard to trace, and frameworks like React detect changes by comparing references, so a mutated object looks unchanged. I create new values instead: the spread syntax, {...obj, name} or [...arr, item], map and filter, and structuredClone for a deep copy, because spread only copies the first level.",
      "Modifier un objet partagé le change pour tous ceux qui en ont une référence, ce qui crée des bugs difficiles à suivre, et des frameworks comme React détectent les changements en comparant les références, donc un objet modifié semble inchangé. Je crée plutôt de nouvelles valeurs : la syntaxe de décomposition, {...obj, name} ou [...arr, item], map et filter, et structuredClone pour une copie profonde, car la décomposition ne copie que le premier niveau.",
    ],
  ],
);

export const typescript = defineTech(
  {
    id: "typescript",
    label: same("TypeScript"),
    family: "web",
    tool: true,
    exact: ["ts"],
    aliases: ["typescript"],
  },
  [
    [
      "why", "concept",
      "What does TypeScript bring compared with plain JavaScript?",
      "Qu'apporte TypeScript par rapport à JavaScript seul ?",
      "TypeScript adds static types to JavaScript: many errors, like a typo in a property name, a missing argument or a value that may be undefined, are caught while writing the code instead of in production. The types document the code, make autocompletion and refactoring reliable, and make large codebases easier to change. It compiles to plain JavaScript.",
      "TypeScript ajoute des types statiques à JavaScript : beaucoup d'erreurs, comme une faute dans un nom de propriété, un argument manquant ou une valeur peut-être undefined, sont détectées en écrivant le code plutôt qu'en production. Les types documentent le code, rendent fiables l'autocomplétion et le refactoring, et facilitent les modifications dans les grandes bases de code. Il se compile en JavaScript classique.",
    ],
    [
      "interface-vs-type", "compare",
      "interface or type: is there a difference, and which one do you use?",
      "interface ou type : y a-t-il une différence, et lequel {utilisez-vous|utilises-tu} ?",
      "Both describe the shape of an object and are mostly interchangeable. An interface can be extended with extends and is merged when declared twice, which suits public APIs and classes. A type alias can also express unions, intersections, tuples or mapped types, which an interface cannot. Many teams use interfaces for objects and type for the rest; consistency matters more than the choice.",
      "Les deux décrivent la forme d'un objet et sont en grande partie interchangeables. Une interface peut être étendue avec extends et elle est fusionnée si on la déclare deux fois, ce qui convient aux API publiques et aux classes. Un alias type peut aussi exprimer des unions, des intersections, des tuples ou des mapped types, ce qu'une interface ne peut pas. Beaucoup d'équipes utilisent les interfaces pour les objets et type pour le reste ; la cohérence compte plus que le choix.",
    ],
    [
      "any-vs-unknown", "compare",
      "What is the difference between any and unknown, and why avoid any?",
      "Quelle est la différence entre any et unknown, et pourquoi éviter any ?",
      "any turns type checking off: anything goes with the value, and the errors come back at runtime. unknown also accepts any value, but its type must be checked before it is used, with typeof, instanceof or a validation function. So unknown is the safe choice for data you do not control yet, and any should stay a rare, explicit exception.",
      "any désactive la vérification des types : tout est permis avec la valeur, et les erreurs reviennent à l'exécution. unknown accepte aussi n'importe quelle valeur, mais il faut vérifier son type avant de l'utiliser, avec typeof, instanceof ou une fonction de validation. unknown est donc le choix sûr pour des données qu'on ne contrôle pas encore, et any doit rester une exception rare et explicite.",
    ],
    [
      "generics", "practice",
      "What are generics for? How would you type a function that returns the first element of any array?",
      "À quoi servent les génériques ? Comment typer une fonction qui renvoie le premier élément de n'importe quel tableau ?",
      "Generics let a function or a type work with many types while keeping the link between them. For example: function first<T>(items: T[]): T | undefined { return items[0]; }. Called with a string[], it returns string | undefined, and with a User[], User | undefined, without losing the type the way any would.",
      "Les génériques permettent à une fonction ou un type de fonctionner avec de nombreux types tout en gardant le lien entre eux. Par exemple : function first<T>(items: T[]): T | undefined { return items[0]; }. Appelée avec un string[], elle renvoie string | undefined, et avec un User[], User | undefined, sans perdre le type comme le ferait any.",
    ],
    [
      "narrowing", "concept",
      "What is type narrowing? How does TypeScript know that a value is no longer null after an if?",
      "Qu'est-ce que le narrowing ? Comment TypeScript sait-il qu'une valeur n'est plus null après un if ?",
      "Narrowing is how TypeScript refines a type inside a branch, based on the checks in the code. After if (user !== null), the type of user inside the block no longer includes null. typeof, instanceof, the in operator, comparisons and discriminated unions with a kind field work the same way, and you can write your own type guards that return value is Type.",
      "Le narrowing, c'est la façon dont TypeScript affine un type dans une branche, à partir des vérifications du code. Après if (user !== null), le type de user dans le bloc n'inclut plus null. typeof, instanceof, l'opérateur in, les comparaisons et les unions discriminées avec un champ kind fonctionnent de la même manière, et on peut écrire ses propres gardes de type qui renvoient value is Type.",
    ],
    [
      "runtime-validation", "best_practice",
      "TypeScript types disappear at runtime. How do you validate data coming from an API?",
      "Les types TypeScript disparaissent à l'exécution. Comment valider les données qui viennent d'une API ?",
      "Types only exist at compile time, so data from an API, a form or a file is not guaranteed to match them. I validate it at the boundary with a schema library such as Zod: the schema checks the data at runtime and gives the TypeScript type at the same time, so the rest of the code can trust it. Invalid data is rejected with a clear error instead of crashing further away.",
      "Les types n'existent qu'à la compilation, donc les données venant d'une API, d'un formulaire ou d'un fichier ne sont pas garanties de les respecter. Je les valide à l'entrée avec une bibliothèque de schémas comme Zod : le schéma vérifie les données à l'exécution et fournit en même temps le type TypeScript, donc le reste du code peut s'y fier. Les données invalides sont rejetées avec une erreur claire au lieu de faire planter plus loin.",
    ],
  ],
);

export const react = defineTech(
  {
    id: "react",
    label: same("React"),
    family: "web",
    tool: true,
    aliases: ["react", "reactjs", "react.js", "react js", "react native", "redux", "jsx", "react hooks"],
  },
  [
    [
      "props-vs-state", "compare",
      "What is the difference between props and state?",
      "Quelle est la différence entre les props et le state ?",
      "Props are the inputs a component receives from its parent, and they are read-only for that component. State is data the component owns and can change, with useState; when it changes, React renders the component again. If two components need the same data, the state lives in their common parent and goes down as props.",
      "Les props sont les entrées qu'un composant reçoit de son parent, en lecture seule pour ce composant. Le state est une donnée que le composant possède et peut modifier, avec useState ; quand il change, React refait le rendu du composant. Si deux composants ont besoin de la même donnée, le state vit dans leur parent commun et descend sous forme de props.",
    ],
    [
      "use-effect", "concept",
      "What is useEffect for, and what does its dependency array do?",
      "À quoi sert useEffect, et à quoi sert son tableau de dépendances ?",
      "useEffect runs code after the render to synchronise the component with something outside React: a subscription, a timer, a request, the page title. The dependency array says when to run it again: only when those values change, and an empty array means once after the first render. The function it returns cleans up, before the next run and when the component disappears. Missing dependencies give stale values, and many effects are not needed at all.",
      "useEffect exécute du code après le rendu pour synchroniser le composant avec quelque chose d'extérieur à React : un abonnement, un timer, une requête, le titre de la page. Le tableau de dépendances dit quand le relancer : seulement quand ces valeurs changent, et un tableau vide signifie une fois après le premier rendu. La fonction qu'il renvoie fait le nettoyage, avant la relance suivante et quand le composant disparaît. Des dépendances manquantes donnent des valeurs périmées, et beaucoup d'effets ne sont en fait pas nécessaires.",
    ],
    [
      "keys", "troubleshoot",
      "React warns about missing keys in a list. Why do keys matter, and why is the index a poor key?",
      "React signale des keys manquantes dans une liste. Pourquoi les keys comptent-elles, et pourquoi l'index est-il une mauvaise key ?",
      "Keys let React recognise each item from one render to the next, so it keeps, moves or removes the right elements and their state. With the index as key, inserting, removing or reordering items shifts the keys, and React attaches the wrong state to the wrong item, for example an input keeping the text of another line. A stable id from the data is the right key.",
      "Les keys permettent à React de reconnaître chaque élément d'un rendu à l'autre, pour garder, déplacer ou supprimer les bons éléments et leur state. Avec l'index comme key, insérer, supprimer ou réordonner des éléments décale les keys, et React associe le mauvais state au mauvais élément, par exemple un champ qui garde le texte d'une autre ligne. Un identifiant stable venant des données est la bonne key.",
    ],
    [
      "rerenders", "troubleshoot",
      "A component re-renders far too often and the page feels slow. How do you investigate?",
      "Un composant refait son rendu bien trop souvent et la page rame. Comment {enquêtez-vous|enquêtes-tu} ?",
      "I measure first with the Profiler of the React DevTools, to see which components render, how often and why. Common causes: a parent that re-renders everything below it, new objects or functions created at each render and passed as props, a context whose value changes too often, or state kept too high. Fixes: move the state down, split components, and use memo, useMemo and useCallback where the measurement shows they help.",
      "Je mesure d'abord avec le Profiler des React DevTools, pour voir quels composants se rendent, à quelle fréquence et pourquoi. Causes courantes : un parent qui refait le rendu de tout ce qui est en dessous, de nouveaux objets ou fonctions créés à chaque rendu et passés en props, un contexte dont la valeur change trop souvent, ou un state placé trop haut. Corrections : descendre le state, découper les composants, et utiliser memo, useMemo et useCallback là où la mesure montre qu'ils aident.",
    ],
    [
      "shared-state", "design",
      "Two sibling components need the same data. Where do you put the state?",
      "Deux composants frères ont besoin des mêmes données. Où {mettez-vous|mets-tu} le state ?",
      "In their closest common parent: the state lives there and goes down to both children as props, with a callback to change it, so there is a single source of truth. If many distant components need the data, a context or a state library avoids passing props through every level, and for server data, a data-fetching library caches it for everyone.",
      "Dans leur parent commun le plus proche : le state vit là et descend vers les deux enfants sous forme de props, avec un callback pour le modifier, ce qui garde une seule source de vérité. Si beaucoup de composants éloignés ont besoin de la donnée, un contexte ou une bibliothèque de gestion d'état évite de passer les props à travers chaque niveau, et pour les données serveur, une bibliothèque de chargement de données les met en cache pour tout le monde.",
    ],
    [
      "controlled-input", "concept",
      "What is a controlled input in React?",
      "Qu'est-ce qu'un champ contrôlé (controlled input) en React ?",
      "A controlled input gets its value from React state, value={name}, and every change goes through onChange, which updates the state. React is the single source of truth, so the field is easy to validate, format or reset. An uncontrolled input keeps its own value in the DOM, read with a ref or from the form when it is submitted.",
      "Un champ contrôlé reçoit sa valeur du state React, value={name}, et chaque modification passe par onChange, qui met à jour le state. React est la seule source de vérité, donc le champ est facile à valider, formater ou réinitialiser. Un champ non contrôlé garde sa propre valeur dans le DOM, qu'on lit avec une ref ou depuis le formulaire à l'envoi.",
    ],
    [
      "reconciliation", "concept",
      "What does React do when state changes? What is reconciliation?",
      "Que fait React quand le state change ? Qu'est-ce que la réconciliation ?",
      "When state changes, React calls the component again to get a new description of the UI, then compares it with the previous one: that is reconciliation. It only applies the differences to the real DOM, which is the slow part. Elements of a different type are recreated, elements of the same type are updated, and in lists the keys tell React which item is which.",
      "Quand le state change, React rappelle le composant pour obtenir une nouvelle description de l'interface, puis la compare à la précédente : c'est la réconciliation. Il n'applique au vrai DOM, la partie lente, que les différences. Les éléments d'un type différent sont recréés, ceux du même type sont mis à jour, et dans les listes, les keys indiquent à React quel élément est lequel.",
    ],
    [
      "loading-data", "practice",
      "How would you load data from an API in a component, with a loading state and an error state?",
      "Comment charger des données depuis une API dans un composant, avec un état de chargement et un état d'erreur ?",
      "Three pieces of state, data, loading and error, and an effect that starts the request, sets loading, then stores the data or the error, and ignores the answer if the component disappeared or the input changed, with an AbortController. The render shows a loader, an error message with a retry button, or the data. In a real project I would rather use a library like TanStack Query, or load the data on the server, which handles caching and retries.",
      "Trois états, les données, le chargement et l'erreur, et un effet qui lance la requête, active le chargement, puis stocke les données ou l'erreur, et ignore la réponse si le composant a disparu ou si l'entrée a changé, avec un AbortController. Le rendu affiche un indicateur de chargement, un message d'erreur avec un bouton pour réessayer, ou les données. Dans un vrai projet, j'utiliserais plutôt une bibliothèque comme TanStack Query, ou un chargement côté serveur, qui gèrent le cache et les nouvelles tentatives.",
    ],
  ],
);

export const node = defineTech(
  {
    id: "node",
    label: same("Node.js"),
    family: "web",
    tool: true,
    exact: ["node"],
    aliases: ["node.js", "nodejs", "node js", "express.js", "expressjs", "express js", "nestjs", "nest.js", "npm", "fastify"],
  },
  [
    [
      "non-blocking", "concept",
      "What does non-blocking I/O mean in Node.js, and what happens if you run heavy CPU work in a request?",
      "Que signifie I/O non bloquante en Node.js, et que se passe-t-il si on fait un gros calcul CPU dans une requête ?",
      "Node runs JavaScript on a single thread with an event loop: input and output operations, reading a file, querying a database, calling an API, are started and the thread moves on, then their callbacks run when the results arrive. So one process can serve thousands of concurrent requests. But heavy CPU work inside a request blocks that single thread, and every other request waits: it belongs in worker threads, a separate service or a job queue.",
      "Node exécute le JavaScript sur un seul thread avec une boucle d'événements : les opérations d'entrée-sortie, lire un fichier, interroger une base, appeler une API, sont lancées et le thread passe à la suite, puis leurs callbacks s'exécutent à l'arrivée des résultats. Un seul processus peut ainsi servir des milliers de requêtes simultanées. Mais un gros calcul CPU dans une requête bloque ce thread unique, et toutes les autres requêtes attendent : il faut l'envoyer vers des worker threads, un service séparé ou une file de tâches.",
    ],
    [
      "package-json", "concept",
      "What are package.json and package-lock.json for?",
      "À quoi servent package.json et package-lock.json ?",
      "package.json describes the project: its name, scripts like start or test, and the dependencies with the version ranges allowed. package-lock.json records the exact version of every installed package, including the dependencies of dependencies, so every machine and the CI install exactly the same tree; it must be committed, and npm ci installs from it.",
      "package.json décrit le projet : son nom, des scripts comme start ou test, et les dépendances avec les plages de versions autorisées. package-lock.json enregistre la version exacte de chaque paquet installé, y compris les dépendances des dépendances, pour que chaque machine et la CI installent exactement le même arbre ; il doit être commité, et npm ci installe à partir de lui.",
    ],
    [
      "middleware", "concept",
      "What is a middleware in Express? Give two examples.",
      "Qu'est-ce qu'un middleware dans Express ? {Donnez|Donne} deux exemples.",
      "A middleware is a function that receives the request, the response and next, and runs before the route handlers: it can modify the request, answer directly, or call next to pass control on. Examples: express.json to parse JSON bodies, a logger, an authentication check that returns 401 without a valid token, CORS headers, and an error-handling middleware with four parameters at the end.",
      "Un middleware est une fonction qui reçoit la requête, la réponse et next, et s'exécute avant les gestionnaires de routes : il peut modifier la requête, répondre directement, ou appeler next pour passer la main. Exemples : express.json pour lire les corps JSON, un logger, une vérification d'authentification qui renvoie 401 sans jeton valide, des en-têtes CORS, et un middleware de gestion d'erreurs à quatre paramètres à la fin.",
    ],
    [
      "async-errors", "best_practice",
      "How do you handle errors in an async route so the server neither crashes nor hangs?",
      "Comment gérer les erreurs d'une route async pour que le serveur ne plante pas et ne reste pas bloqué ?",
      "I wrap the awaited code in try/catch, or use a small wrapper, or Express 5, which passes rejected promises to next, so every error reaches a central error-handling middleware that logs it and returns a clean status, 400 or 500, without leaking details. Without that, an unhandled rejection can leave the request hanging until a timeout, or crash the process. I also listen to unhandledRejection to log anything that slips through.",
      "J'entoure le code attendu d'un try/catch, ou j'utilise un petit wrapper, ou Express 5, qui transmet les promesses rejetées à next, pour que chaque erreur arrive à un middleware central de gestion d'erreurs qui la journalise et renvoie un statut propre, 400 ou 500, sans divulguer de détails. Sans ça, une promesse rejetée non gérée peut laisser la requête en attente jusqu'au délai maximal, ou faire planter le processus. J'écoute aussi unhandledRejection pour journaliser ce qui passerait entre les mailles.",
    ],
    [
      "configuration", "best_practice",
      "How do you manage configuration and secrets in a Node.js application?",
      "Comment gérer la configuration et les secrets d'une application Node.js ?",
      "Configuration and secrets come from environment variables, read once at startup into a validated config object, for example with Zod, so the app stops right away if something is missing. In development an .env file listed in .gitignore provides them; in production, the platform's environment settings or a secret manager. Secrets never go into the code, the repository or the logs.",
      "La configuration et les secrets viennent de variables d'environnement, lues une fois au démarrage dans un objet de configuration validé, par exemple avec Zod, pour que l'application s'arrête tout de suite s'il manque quelque chose. En développement, un fichier .env listé dans .gitignore les fournit ; en production, les réglages d'environnement de la plateforme ou un gestionnaire de secrets. Les secrets ne vont jamais dans le code, le dépôt ou les logs.",
    ],
    [
      "todo-api", "practice",
      "How would you build a small REST API for a to-do list with Node.js? Which routes and status codes?",
      "Comment {construiriez-vous|construirais-tu} une petite API REST de liste de tâches avec Node.js ? Quelles routes et quels codes de statut ?",
      "With Express: GET /todos to list, with optional filters and pagination, returning 200; GET /todos/:id returning 200 or 404; POST /todos to create, validating the body and returning 201 with the new item, or 400 if the input is invalid; PATCH /todos/:id to update, and DELETE /todos/:id returning 204. The routes call a service that uses the database, and a central middleware turns errors into consistent JSON responses.",
      "Avec Express : GET /todos pour lister, avec des filtres et une pagination optionnels, qui renvoie 200 ; GET /todos/:id qui renvoie 200 ou 404 ; POST /todos pour créer, en validant le corps, qui renvoie 201 avec l'élément créé, ou 400 si l'entrée est invalide ; PATCH /todos/:id pour modifier, et DELETE /todos/:id qui renvoie 204. Les routes appellent un service qui utilise la base de données, et un middleware central transforme les erreurs en réponses JSON cohérentes.",
    ],
  ],
);

export const nextjs = defineTech(
  {
    id: "nextjs",
    label: same("Next.js"),
    family: "web",
    tool: true,
    aliases: ["next.js", "nextjs", "next js"],
  },
  [
    [
      "rendering", "compare",
      "Server-side rendering, static generation, client rendering: what is the difference in Next.js?",
      "Rendu côté serveur, génération statique, rendu côté client : quelle est la différence dans Next.js ?",
      "Static generation builds the HTML once, at build time, and serves it from a CDN: the fastest, for content that rarely changes, and it can be regenerated periodically. Server-side rendering builds the HTML on the server for each request: always fresh and personalised, but each request costs server time. Client rendering sends JavaScript that builds the page in the browser: good for very interactive parts, but slower to show content and weaker for SEO. Next.js lets you mix them per route.",
      "La génération statique construit le HTML une fois, au build, et le sert depuis un CDN : le plus rapide, pour un contenu qui change rarement, et il peut être régénéré périodiquement. Le rendu côté serveur construit le HTML sur le serveur à chaque requête : toujours à jour et personnalisé, mais chaque requête coûte du temps serveur. Le rendu côté client envoie du JavaScript qui construit la page dans le navigateur : bien pour les parties très interactives, mais plus lent à afficher le contenu et moins bon pour le SEO. Next.js permet de les combiner selon la route.",
    ],
    [
      "server-components", "concept",
      "What is a Server Component, and what can it do that a Client Component cannot?",
      "Qu'est-ce qu'un Server Component, et que peut-il faire qu'un Client Component ne peut pas ?",
      "A Server Component runs only on the server: it can read the database or files directly and use secrets, and its code is never sent to the browser, which keeps the JavaScript bundle small; it cannot use state, effects or event handlers. A Client Component, marked \"use client\", is rendered on the server first too, then hydrated in the browser, where it can use hooks and react to the user. Server Components are the default; client ones are the interactive leaves.",
      "Un Server Component ne s'exécute que sur le serveur : il peut lire directement la base de données ou des fichiers et utiliser des secrets, et son code n'est jamais envoyé au navigateur, ce qui garde le bundle JavaScript léger ; il ne peut pas utiliser de state, d'effets ni de gestionnaires d'événements. Un Client Component, marqué \"use client\", est lui aussi rendu d'abord sur le serveur, puis hydraté dans le navigateur, où il peut utiliser les hooks et réagir à l'utilisateur. Les Server Components sont le comportement par défaut ; les composants client sont les feuilles interactives.",
    ],
    [
      "routing", "concept",
      "How does file-based routing work in Next.js?",
      "Comment fonctionne le routage par fichiers dans Next.js ?",
      "In the App Router, the folders inside app define the URL segments, and a page.tsx file makes a segment a page: app/blog/page.tsx is /blog. A folder in square brackets is a dynamic segment, like app/blog/[slug]/page.tsx. layout.tsx wraps the pages below it and keeps its state between navigations, and files like loading.tsx, error.tsx and not-found.tsx handle those states for their segment.",
      "Avec l'App Router, les dossiers dans app définissent les segments de l'URL, et un fichier page.tsx fait d'un segment une page : app/blog/page.tsx correspond à /blog. Un dossier entre crochets est un segment dynamique, comme app/blog/[slug]/page.tsx. layout.tsx englobe les pages en dessous et garde son état entre les navigations, et des fichiers comme loading.tsx, error.tsx et not-found.tsx gèrent ces états pour leur segment.",
    ],
    [
      "secret-keys", "best_practice",
      "How do you make sure a secret API key never reaches the browser in a Next.js app?",
      "Comment s'assurer qu'une clé d'API secrète n'arrive jamais dans le navigateur avec Next.js ?",
      "Use the key only in server code: Server Components, server actions, route handlers, modules marked server-only. Environment variables without the NEXT_PUBLIC_ prefix are not exposed to the browser, while NEXT_PUBLIC_ ones are bundled into the client code, so a secret must never have that prefix. The browser calls my own server, which calls the third-party API with the key.",
      "N'utiliser la clé que dans du code serveur : Server Components, server actions, route handlers, modules marqués server-only. Les variables d'environnement sans le préfixe NEXT_PUBLIC_ ne sont pas exposées au navigateur, alors que celles en NEXT_PUBLIC_ sont intégrées au code client, donc un secret ne doit jamais avoir ce préfixe. Le navigateur appelle mon propre serveur, qui appelle l'API tierce avec la clé.",
    ],
  ],
);

export const angular = defineTech(
  {
    id: "angular",
    label: same("Angular"),
    family: "web",
    tool: true,
    aliases: ["angular", "angularjs", "angular.js", "rxjs"],
  },
  [
    [
      "building-blocks", "concept",
      "What are components, modules and services in Angular?",
      "Que sont les composants, les modules et les services dans Angular ?",
      "A component combines a TypeScript class, an HTML template and styles, and displays one part of the screen. Services hold the logic and data shared between components, like API calls, and are injected where needed. NgModules used to group components, services and imports; recent versions favour standalone components that declare their own imports, so modules are now optional.",
      "Un composant associe une classe TypeScript, un template HTML et des styles, et affiche une partie de l'écran. Les services contiennent la logique et les données partagées entre composants, comme les appels API, et sont injectés là où on en a besoin. Les NgModules servaient à regrouper composants, services et imports ; les versions récentes privilégient les composants standalone qui déclarent leurs propres imports, donc les modules sont désormais optionnels.",
    ],
    [
      "dependency-injection", "concept",
      "How does dependency injection work in Angular?",
      "Comment fonctionne l'injection de dépendances dans Angular ?",
      "A class declares what it needs, in its constructor or with the inject function, and Angular's injector provides the instance. A service marked @Injectable({ providedIn: 'root' }) is a single instance shared by the whole application; providers declared on a component create one instance per component. It decouples the code and makes testing easy, since a test can provide a fake service.",
      "Une classe déclare ce dont elle a besoin, dans son constructeur ou avec la fonction inject, et l'injecteur d'Angular fournit l'instance. Un service marqué @Injectable({ providedIn: 'root' }) est une instance unique partagée par toute l'application ; des providers déclarés sur un composant créent une instance par composant. Ça découple le code et facilite les tests, puisqu'un test peut fournir un faux service.",
    ],
    [
      "observables", "compare",
      "Observables or Promises: what is the difference, and why does Angular use RxJS?",
      "Observables ou Promises : quelle est la différence, et pourquoi Angular utilise-t-il RxJS ?",
      "A promise gives one value, once, and starts immediately. An observable can emit many values over time, starts only when subscribed, can be cancelled by unsubscribing, and comes with operators like map, filter, debounceTime or switchMap. Angular uses RxJS for streams such as HTTP calls, form value changes and router events; switchMap, for example, automatically cancels an outdated search request.",
      "Une promesse donne une seule valeur, une fois, et démarre immédiatement. Un observable peut émettre plusieurs valeurs dans le temps, ne démarre qu'à l'abonnement, peut être annulé en se désabonnant, et vient avec des opérateurs comme map, filter, debounceTime ou switchMap. Angular utilise RxJS pour des flux comme les appels HTTP, les changements de valeur des formulaires et les événements du routeur ; switchMap, par exemple, annule automatiquement une requête de recherche devenue obsolète.",
    ],
    [
      "change-detection", "concept",
      "What is change detection in Angular, and how can you make it cheaper?",
      "Qu'est-ce que la détection de changements dans Angular, et comment la rendre moins coûteuse ?",
      "Change detection is how Angular checks whether the data bound in the templates changed, and updates the DOM. By default it checks the whole component tree after every event, timer or HTTP response. To make it cheaper: the OnPush strategy, which only checks a component when its inputs change or an event happens inside it, immutable data, the async pipe, trackBy in lists, and signals in recent versions, which update precisely what depends on them.",
      "La détection de changements, c'est la façon dont Angular vérifie si les données liées dans les templates ont changé, et met à jour le DOM. Par défaut, il vérifie tout l'arbre de composants après chaque événement, timer ou réponse HTTP. Pour la rendre moins coûteuse : la stratégie OnPush, qui ne vérifie un composant que si ses entrées changent ou qu'un événement s'y produit, des données immuables, le pipe async, trackBy dans les listes, et les signals dans les versions récentes, qui mettent à jour précisément ce qui en dépend.",
    ],
  ],
);

export const vue = defineTech(
  {
    id: "vue",
    label: same("Vue.js"),
    family: "web",
    tool: true,
    exact: ["vue"],
    aliases: ["vue.js", "vuejs", "vue js", "vue 3", "nuxt", "nuxt.js", "pinia", "vuex"],
  },
  [
    [
      "reactivity", "concept",
      "How does reactivity work in Vue?",
      "Comment fonctionne la réactivité dans Vue ?",
      "Vue wraps the state in reactive proxies, created with ref or reactive: when a component renders, Vue records which reactive values it reads, and when one of them changes, it re-renders only the components and computed values that depend on it. That is why you change the state directly, count.value++, and the view follows; replacing a whole reactive object, or destructuring it, can lose that reactivity.",
      "Vue enveloppe l'état dans des proxys réactifs, créés avec ref ou reactive : quand un composant se rend, Vue enregistre quelles valeurs réactives il lit, et quand l'une d'elles change, il refait le rendu des seuls composants et valeurs calculées qui en dépendent. C'est pour ça qu'on modifie l'état directement, count.value++, et que la vue suit ; remplacer tout un objet réactif, ou le déstructurer, peut faire perdre cette réactivité.",
    ],
    [
      "computed-vs-watch", "compare",
      "computed or watch: when do you use each one?",
      "computed ou watch : quand utiliser l'un ou l'autre ?",
      "computed derives a value from other reactive values and caches it until they change: a full name, a filtered list, a total. watch runs a side effect when a value changes: calling an API when a search term changes, saving to local storage, logging. To compute a value to display, computed; to do something in reaction, watch.",
      "computed dérive une valeur d'autres valeurs réactives et la met en cache jusqu'à ce qu'elles changent : un nom complet, une liste filtrée, un total. watch exécute un effet de bord quand une valeur change : appeler une API quand un terme de recherche change, sauvegarder dans le stockage local, journaliser. Pour calculer une valeur à afficher, computed ; pour faire quelque chose en réaction, watch.",
    ],
    [
      "parent-child", "practice",
      "How do a parent and a child component communicate in Vue?",
      "Comment un composant parent et un composant enfant communiquent-ils dans Vue ?",
      "Data goes down through props: the parent binds values, and the child declares them with defineProps and does not modify them. Events go up: the child emits an event with defineEmits, and the parent listens to it with @; v-model is a shortcut for that pair. For deeply nested or distant components, provide and inject, or a store like Pinia, avoid passing everything through each level.",
      "Les données descendent par les props : le parent lie des valeurs, et l'enfant les déclare avec defineProps sans les modifier. Les événements remontent : l'enfant émet un événement avec defineEmits, et le parent l'écoute avec @ ; v-model est un raccourci pour ce couple. Pour des composants très imbriqués ou éloignés, provide et inject, ou un store comme Pinia, évitent de tout faire passer par chaque niveau.",
    ],
  ],
);

export const htmlCss = defineTech(
  {
    id: "html-css",
    label: same("HTML/CSS"),
    family: "web",
    tool: true,
    aliases: [
      "html", "html5", "css", "css3", "sass", "scss", "tailwind", "tailwindcss", "bootstrap", "responsive design", "web design", "integration web",
      "accessibility", "accessibilite", "wcag", "a11y",
    ],
  },
  [
    [
      "semantic", "best_practice",
      "Why use semantic HTML elements such as header, nav, main or button instead of divs?",
      "Pourquoi utiliser des balises HTML sémantiques comme header, nav, main ou button plutôt que des div ?",
      "Semantic elements say what the content is, not just how it looks. Screen readers use them to announce the structure of the page and let people jump between regions, search engines understand the page better, and a real button gets keyboard focus and works with the keyboard for free, unlike a div with a click handler. The code is also easier to read.",
      "Les balises sémantiques disent ce qu'est le contenu, pas seulement à quoi il ressemble. Les lecteurs d'écran s'en servent pour annoncer la structure de la page et permettre de sauter d'une zone à l'autre, les moteurs de recherche comprennent mieux la page, et un vrai button reçoit le focus et fonctionne au clavier sans effort, contrairement à une div avec un gestionnaire de clic. Le code est aussi plus lisible.",
    ],
    [
      "box-model", "concept",
      "What is the CSS box model, and what does box-sizing: border-box change?",
      "Qu'est-ce que le modèle de boîte en CSS, et que change box-sizing: border-box ?",
      "Every element is a box made of the content, the padding around it, the border, then the margin outside. By default width only sets the content, so the padding and the border are added on top and the element ends up wider than expected. With box-sizing: border-box, width includes the padding and the border, which makes sizes predictable; most projects apply it to every element.",
      "Chaque élément est une boîte composée du contenu, du padding autour, de la bordure, puis de la marge à l'extérieur. Par défaut, width ne fixe que le contenu, donc le padding et la bordure s'ajoutent et l'élément devient plus large que prévu. Avec box-sizing: border-box, width inclut le padding et la bordure, ce qui rend les tailles prévisibles ; la plupart des projets l'appliquent à tous les éléments.",
    ],
    [
      "flex-vs-grid", "compare",
      "Flexbox or Grid: how do you choose?",
      "Flexbox ou Grid : comment choisir ?",
      "Flexbox lays items out in one dimension, a row or a column: ideal for a navigation bar, buttons in a row, or centring something. Grid works in two dimensions, rows and columns together: ideal for the page layout, card galleries or forms aligned in columns. They combine well: a grid for the page, flexbox inside each component.",
      "Flexbox dispose les éléments sur une dimension, une ligne ou une colonne : idéal pour une barre de navigation, des boutons alignés ou centrer quelque chose. Grid travaille sur deux dimensions, lignes et colonnes à la fois : idéal pour la mise en page générale, des galeries de cartes ou des formulaires alignés en colonnes. Ils se combinent bien : une grille pour la page, flexbox dans chaque composant.",
    ],
    [
      "responsive", "practice",
      "How do you make a page work on a phone as well as on a large screen?",
      "Comment rendre une page utilisable sur un téléphone comme sur un grand écran ?",
      "Mobile first: a simple one-column layout, then media queries or container queries add columns when there is room. Flexible units, percentages, rem and fr in grids, and minimum or maximum widths instead of fixed pixels; images with max-width: 100% and srcset; the viewport meta tag; touch targets large enough. Then I test at real phone widths and on a real device.",
      "Mobile first : une mise en page simple sur une colonne, puis des media queries ou des container queries ajoutent des colonnes quand il y a de la place. Des unités souples, pourcentages, rem et fr dans les grilles, et des largeurs minimales ou maximales plutôt que des pixels fixes ; des images avec max-width: 100% et srcset ; la balise meta viewport ; des zones tactiles assez grandes. Ensuite je teste à de vraies largeurs de téléphone et sur un vrai appareil.",
    ],
    [
      "accessibility", "best_practice",
      "Which simple things make a web page accessible to someone using a screen reader or only a keyboard?",
      "Quelles choses simples rendent une page web accessible à une personne qui utilise un lecteur d'écran ou seulement le clavier ?",
      "Semantic HTML with real buttons and links; a text alternative on every meaningful image; a label linked to every form field; headings in a logical order; enough colour contrast, and information that does not rely on colour alone; everything reachable and usable with the keyboard, with a visible focus; and ARIA only when no native element fits. Testing with the keyboard and a screen reader reveals most problems.",
      "Du HTML sémantique avec de vrais boutons et liens ; une alternative textuelle sur chaque image porteuse de sens ; un label lié à chaque champ de formulaire ; des titres dans un ordre logique ; un contraste suffisant, et une information qui ne repose pas que sur la couleur ; tout atteignable et utilisable au clavier, avec un focus visible ; et ARIA seulement quand aucun élément natif ne convient. Tester au clavier et avec un lecteur d'écran révèle la plupart des problèmes.",
    ],
    [
      "rule-not-applied", "troubleshoot",
      "Your CSS rule is not applied. How do you find out why?",
      "{Votre|Ta} règle CSS ne s'applique pas. Comment trouver pourquoi ?",
      "I inspect the element in the browser's developer tools: they show every rule that applies, crossed out when overridden, and which one wins. Usual causes: a more specific selector or a later rule overriding mine, a typo in the selector or the property, a stylesheet that is not loaded, a property with no effect in that context, like width on an inline element, or an !important somewhere. I fix the selector rather than adding !important.",
      "J'inspecte l'élément dans les outils de développement du navigateur : ils montrent toutes les règles qui s'appliquent, barrées quand elles sont écrasées, et laquelle l'emporte. Causes habituelles : un sélecteur plus spécifique ou une règle plus tardive qui écrase la mienne, une faute dans le sélecteur ou la propriété, une feuille de style non chargée, une propriété sans effet dans ce contexte, comme width sur un élément inline, ou un !important quelque part. Je corrige le sélecteur plutôt que d'ajouter !important.",
    ],
  ],
);

export const rest = defineTech(
  {
    id: "rest",
    label: { en: "REST APIs", fr: "API REST" },
    family: "web",
    tool: false,
    exact: ["rest", "api", "apis"],
    aliases: [
      "rest api", "rest apis", "api rest", "apis rest", "restful", "rest/json", "openapi", "swagger", "web services", "webservices", "web service",
      "graphql", "api design",
    ],
  },
  [
    [
      "principles", "concept",
      "What makes an API RESTful?",
      "Qu'est-ce qui rend une API RESTful ?",
      "A RESTful API exposes resources identified by URLs, like /users/42, and uses the HTTP methods to act on them: GET to read, POST to create, PUT or PATCH to update, DELETE to remove, with meaningful status codes. It is stateless: each request carries everything needed, including authentication, and responses say whether they can be cached. Representations are usually JSON.",
      "Une API RESTful expose des ressources identifiées par des URL, comme /users/42, et utilise les méthodes HTTP pour agir dessus : GET pour lire, POST pour créer, PUT ou PATCH pour modifier, DELETE pour supprimer, avec des codes de statut parlants. Elle est sans état : chaque requête contient tout le nécessaire, y compris l'authentification, et les réponses indiquent si elles peuvent être mises en cache. Les représentations sont en général en JSON.",
    ],
    [
      "methods", "compare",
      "GET, POST, PUT, PATCH, DELETE: what is each one for, and which ones are idempotent?",
      "GET, POST, PUT, PATCH, DELETE : à quoi sert chacune, et lesquelles sont idempotentes ?",
      "GET reads a resource without changing anything; POST creates one or triggers an action; PUT replaces a resource entirely; PATCH modifies part of it; DELETE removes it. GET, PUT and DELETE are idempotent: sending the same request twice leaves the same state as sending it once. POST is not, so a retried POST can create a duplicate, unless the API accepts an idempotency key.",
      "GET lit une ressource sans rien modifier ; POST en crée une ou déclenche une action ; PUT remplace entièrement une ressource ; PATCH en modifie une partie ; DELETE la supprime. GET, PUT et DELETE sont idempotentes : envoyer deux fois la même requête laisse le même état qu'une seule fois. POST ne l'est pas, donc un POST relancé peut créer un doublon, sauf si l'API accepte une clé d'idempotence.",
    ],
    [
      "status-codes", "concept",
      "Which HTTP status codes do you use most, and what is the difference between 401 and 403?",
      "Quels codes de statut HTTP {utilisez-vous|utilises-tu} le plus, et quelle est la différence entre 401 et 403 ?",
      "200 OK, 201 Created after a creation, 204 No Content when there is nothing to return; 400 for invalid input, 404 when the resource does not exist, 409 for a conflict, 422 for valid JSON that breaks business rules, and 500 for a server error. 401 means not authenticated: no valid credentials, so log in. 403 means authenticated but not allowed: the server knows who is asking, and the answer is still no.",
      "200 OK, 201 Created après une création, 204 No Content quand il n'y a rien à renvoyer ; 400 pour une entrée invalide, 404 quand la ressource n'existe pas, 409 pour un conflit, 422 pour un JSON valide qui enfreint des règles métier, et 500 pour une erreur serveur. 401 signifie non authentifié : pas d'identifiants valides, il faut se connecter. 403 signifie authentifié mais pas autorisé : le serveur sait qui fait la demande, et la réponse reste non.",
    ],
    [
      "sessions-vs-jwt", "compare",
      "Session cookies or JWT tokens: how do they differ for authenticating users?",
      "Cookies de session ou jetons JWT : en quoi diffèrent-ils pour authentifier des utilisateurs ?",
      "With a session, the server stores the session and gives the browser a random id in a cookie, which should be HttpOnly, Secure and SameSite; logging out is easy because the server deletes the session. A JWT is a signed token carrying the user's claims, checked without a database lookup, which suits several services or APIs; but it is hard to revoke before it expires, so it must be short-lived, with a refresh token, and stored carefully.",
      "Avec une session, le serveur stocke la session et donne au navigateur un identifiant aléatoire dans un cookie, qui doit être HttpOnly, Secure et SameSite ; la déconnexion est simple, car le serveur supprime la session. Un JWT est un jeton signé qui porte les informations de l'utilisateur, vérifié sans consulter de base, ce qui convient à plusieurs services ou API ; mais il est difficile à révoquer avant son expiration, donc il doit être de courte durée, avec un refresh token, et stocké avec soin.",
    ],
    [
      "pagination", "design",
      "An endpoint returns 100,000 records. How would you paginate it?",
      "Un endpoint renvoie 100 000 enregistrements. Comment le paginer ?",
      "Never return everything at once. Offset pagination, limit=50 and offset=100, is simple and allows jumping to a page, but it gets slow with large offsets and can skip or repeat items when the data changes. Cursor pagination, limit=50 and after the last id seen, relies on an indexed column and stays fast and stable, which suits infinite scroll and big tables. The response holds the items and the cursor or the link to the next page, with a maximum limit enforced by the server.",
      "Ne jamais tout renvoyer d'un coup. La pagination par offset, limit=50 et offset=100, est simple et permet d'aller à une page précise, mais elle ralentit avec les grands offsets et peut sauter ou répéter des éléments quand les données changent. La pagination par curseur, limit=50 et après le dernier identifiant vu, s'appuie sur une colonne indexée et reste rapide et stable, ce qui convient au défilement infini et aux grosses tables. La réponse contient les éléments et le curseur ou le lien vers la page suivante, avec une limite maximale imposée par le serveur.",
    ],
    [
      "versioning", "best_practice",
      "How do you change an API without breaking the clients that already use it?",
      "Comment faire évoluer une API sans casser les clients qui l'utilisent déjà ?",
      "Additions are safe: new endpoints and new optional fields, and clients must ignore fields they do not know. Breaking changes, removing or renaming a field or changing its type, go into a new version, for example /v2 in the URL or a header, while the old version keeps working during a deprecation period announced to the clients. Contract tests and a documented schema, like OpenAPI, catch accidental breaks.",
      "Les ajouts sont sans risque : nouveaux endpoints et nouveaux champs optionnels, et les clients doivent ignorer les champs qu'ils ne connaissent pas. Les changements cassants, supprimer ou renommer un champ ou changer son type, vont dans une nouvelle version, par exemple /v2 dans l'URL ou un en-tête, pendant que l'ancienne version continue de fonctionner le temps d'une période de dépréciation annoncée aux clients. Des tests de contrat et un schéma documenté, comme OpenAPI, détectent les cassures accidentelles.",
    ],
    [
      "cors", "troubleshoot",
      "The browser blocks your front-end's calls to your API with a CORS error. What is going on?",
      "Le navigateur bloque les appels de {votre|ton} front-end vers {votre|ton} API avec une erreur CORS. Que se passe-t-il ?",
      "The browser prevents a page from reading the response of a request to another origin, another domain, port or protocol, unless that server allows it with CORS headers; for requests with JSON or credentials, it first sends a preflight OPTIONS request. The fix is on the API: answer with Access-Control-Allow-Origin set to the front-end's origin, the allowed methods and headers, and Allow-Credentials if cookies are used, rather than allowing every origin.",
      "Le navigateur empêche une page de lire la réponse d'une requête vers une autre origine, un autre domaine, port ou protocole, sauf si ce serveur l'autorise avec des en-têtes CORS ; pour les requêtes avec du JSON ou des identifiants, il envoie d'abord une requête préalable OPTIONS. La correction se fait côté API : répondre avec Access-Control-Allow-Origin indiquant l'origine du front-end, les méthodes et en-têtes autorisés, et Allow-Credentials si des cookies sont utilisés, plutôt que d'autoriser toutes les origines.",
    ],
  ],
);

export const php = defineTech(
  {
    id: "php",
    label: same("PHP"),
    family: "web",
    tool: true,
    aliases: ["php", "php 8", "laravel", "symfony", "wordpress", "drupal", "php-fpm"],
  },
  [
    [
      "request-lifecycle", "concept",
      "How does PHP handle a web request, from Nginx or Apache to the response?",
      "Comment PHP traite-t-il une requête web, de Nginx ou Apache jusqu'à la réponse ?",
      "The web server, Nginx or Apache, receives the request and passes it to PHP, usually PHP-FPM through FastCGI. PHP starts a fresh execution for that request: it loads the script, often a single front controller like index.php, runs it, sends the output as the response, then frees everything. Nothing stays in memory between requests, apart from the code compiled by OPcache, so state goes in sessions, a database or a cache.",
      "Le serveur web, Nginx ou Apache, reçoit la requête et la transmet à PHP, en général PHP-FPM via FastCGI. PHP démarre une exécution neuve pour cette requête : il charge le script, souvent un contrôleur frontal unique comme index.php, l'exécute, envoie la sortie comme réponse, puis libère tout. Rien ne reste en mémoire entre les requêtes, à part le code compilé par OPcache, donc l'état va dans les sessions, une base de données ou un cache.",
    ],
    [
      "safe-queries", "best_practice",
      "How do you query a database safely in PHP?",
      "Comment interroger une base de données en toute sécurité en PHP ?",
      "With PDO or mysqli and prepared statements: the query has placeholders and the values are bound separately, so user input can never change the SQL. I turn on exceptions for errors, use a database account with limited rights, validate the input, and escape the output with htmlspecialchars when displaying data, against XSS. Laravel or Symfony with Doctrine do this through their query builders and ORMs.",
      "Avec PDO ou mysqli et des requêtes préparées : la requête a des paramètres et les valeurs sont liées séparément, donc une saisie ne peut jamais modifier le SQL. J'active les exceptions pour les erreurs, j'utilise un compte de base de données aux droits limités, je valide les entrées, et j'échappe la sortie avec htmlspecialchars à l'affichage, contre le XSS. Laravel ou Symfony avec Doctrine le font via leurs query builders et ORM.",
    ],
    [
      "sessions", "concept",
      "How do sessions work in PHP?",
      "Comment fonctionnent les sessions en PHP ?",
      "session_start gives the browser a session id in a cookie and stores the data on the server, in files by default or in Redis; on the next requests, PHP reads the id from the cookie and loads $_SESSION. For security: regenerate the id after login, make the cookie HttpOnly, Secure and SameSite, set an expiry, and destroy the session at logout.",
      "session_start donne au navigateur un identifiant de session dans un cookie et stocke les données sur le serveur, dans des fichiers par défaut ou dans Redis ; aux requêtes suivantes, PHP lit l'identifiant dans le cookie et charge $_SESSION. Pour la sécurité : régénérer l'identifiant après la connexion, mettre le cookie en HttpOnly, Secure et SameSite, fixer une expiration, et détruire la session à la déconnexion.",
    ],
    [
      "composer", "concept",
      "What is Composer for, and what does autoloading do?",
      "À quoi sert Composer, et que fait l'autoloading ?",
      "Composer is PHP's dependency manager: composer.json lists the libraries and version constraints, composer.lock records the exact versions installed, and composer install reproduces them. Autoloading, usually PSR-4, maps namespaces to folders, so classes load automatically the first time they are used: one require of vendor/autoload.php replaces all the manual require statements.",
      "Composer est le gestionnaire de dépendances de PHP : composer.json liste les bibliothèques et les contraintes de version, composer.lock enregistre les versions exactes installées, et composer install les reproduit. L'autoloading, en général PSR-4, associe les namespaces aux dossiers, donc les classes se chargent automatiquement à leur première utilisation : un seul require de vendor/autoload.php remplace tous les require manuels.",
    ],
    [
      "wordpress", "concept",
      "How is a WordPress site built: themes, plugins, database?",
      "Comment un site WordPress est-il construit : thèmes, plugins, base de données ?",
      "WordPress is a PHP application with a MySQL or MariaDB database that stores the posts, pages, users and settings. Themes control the display with PHP templates, and a child theme lets you customise without losing updates; plugins add features through hooks, actions and filters, without touching the core. Keeping the core, the themes and the plugins up to date is the first security rule.",
      "WordPress est une application PHP avec une base MySQL ou MariaDB qui stocke les articles, les pages, les utilisateurs et les réglages. Les thèmes gèrent l'affichage avec des templates PHP, et un thème enfant permet de personnaliser sans perdre les mises à jour ; les plugins ajoutent des fonctionnalités grâce aux hooks, actions et filtres, sans toucher au cœur. Garder le cœur, les thèmes et les plugins à jour est la première règle de sécurité.",
    ],
  ],
);
