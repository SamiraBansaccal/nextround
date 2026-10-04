import { defineTech } from "./types";

// Foundations asked in most junior interviews, whatever the stack.

export const algorithms = defineTech(
  {
    id: "algorithms",
    label: { en: "Algorithms and data structures", fr: "Algorithmes et structures de données" },
    family: "foundations",
    tool: false,
    aliases: [
      "algorithms", "algorithm", "algorithmique", "algorithmie", "algorithmics", "data structures", "data structure", "structures de donnees",
      "sorting", "sorting algorithms", "algorithmes de tri", "leetcode", "codewars", "competitive programming",
    ],
  },
  [
    [
      "big-o", "concept",
      "What is Big O notation? How fast is a search in an array, in a sorted array and in a hash table?",
      "Qu'est-ce que la notation grand O ? Quelle est la complexité d'une recherche dans un tableau, dans un tableau trié et dans une table de hachage ?",
      "Big O describes how the running time or the memory grows with the size of the input, ignoring constants: O(1) constant, O(log n), O(n) linear, O(n log n), O(n²). Searching an unsorted array is O(n), because every element may have to be checked; a sorted array allows a binary search in O(log n); a hash table finds a key in O(1) on average.",
      "La notation grand O décrit comment le temps d'exécution ou la mémoire augmentent avec la taille de l'entrée, sans tenir compte des constantes : O(1) constant, O(log n), O(n) linéaire, O(n log n), O(n²). Chercher dans un tableau non trié est en O(n), car il faut parfois regarder chaque élément ; un tableau trié permet une recherche dichotomique en O(log n) ; une table de hachage trouve une clé en O(1) en moyenne.",
    ],
    [
      "array-vs-list", "compare",
      "Array or linked list: what are the trade-offs?",
      "Tableau ou liste chaînée : quels sont les compromis ?",
      "An array stores its elements contiguously: access by index in O(1) and cache-friendly iteration, but inserting or removing in the middle shifts the elements, O(n), and growing may mean copying everything. A linked list stores nodes linked by pointers: inserting or removing at a known node is O(1), but access by index is O(n), each node costs extra memory, and iteration is slower. In practice, dynamic arrays win most of the time.",
      "Un tableau stocke ses éléments de façon contiguë : accès par indice en O(1) et parcours favorable au cache, mais insérer ou supprimer au milieu décale les éléments, en O(n), et l'agrandir peut demander de tout copier. Une liste chaînée stocke des nœuds reliés par des pointeurs : insérer ou supprimer à un nœud connu est en O(1), mais l'accès par indice est en O(n), chaque nœud coûte de la mémoire en plus, et le parcours est plus lent. En pratique, les tableaux dynamiques gagnent la plupart du temps.",
    ],
    [
      "hash-table", "concept",
      "How does a hash table work, and what happens on a collision?",
      "Comment fonctionne une table de hachage, et que se passe-t-il en cas de collision ?",
      "A hash function turns the key into an index in an array of buckets, so inserting and finding a key takes constant time on average. A collision is when two keys land in the same bucket: it is handled by chaining, a small list per bucket, or by open addressing, probing for the next free slot. When the table gets too full, it is resized and the keys are spread again; a bad hash function makes everything collide and degrades to O(n).",
      "Une fonction de hachage transforme la clé en indice dans un tableau de compartiments, donc insérer et retrouver une clé prend un temps constant en moyenne. Une collision, c'est quand deux clés tombent dans le même compartiment : on la gère par chaînage, une petite liste par compartiment, ou par adressage ouvert, en cherchant la case libre suivante. Quand la table devient trop pleine, on l'agrandit et on redistribue les clés ; une mauvaise fonction de hachage fait tout entrer en collision et dégrade en O(n).",
    ],
    [
      "stack-vs-queue", "compare",
      "Stack and queue: what is the difference, and where would you use each one?",
      "Pile et file : quelle est la différence, et où utiliser chacune ?",
      "A stack is last in, first out: you push and pop at the same end, like a pile of plates; it serves for function calls, undo, checking brackets or depth-first search. A queue is first in, first out: you add at the back and remove from the front, like a waiting line; it serves for job queues, buffers or breadth-first search.",
      "Une pile est en dernier entré, premier sorti : on empile et on dépile du même côté, comme une pile d'assiettes ; elle sert pour les appels de fonctions, l'annulation, la vérification de parenthèses ou le parcours en profondeur. Une file est en premier entré, premier sorti : on ajoute à la fin et on retire au début, comme une file d'attente ; elle sert pour les files de tâches, les tampons ou le parcours en largeur.",
    ],
    [
      "sorting", "compare",
      "Which sorting algorithms do you know, and why is quicksort usually faster than bubble sort?",
      "Quels algorithmes de tri {connaissez-vous|connais-tu}, et pourquoi le tri rapide est-il en général plus rapide que le tri à bulles ?",
      "Bubble, insertion and selection sort are simple but O(n²): they compare neighbours or every pair, which is fine for tiny or nearly sorted inputs. Merge sort and quicksort divide the problem: O(n log n), always for merge sort and on average for quicksort, whose O(n²) worst case is avoided with a good pivot. Quicksort is usually faster in practice because it sorts in place and uses the cache well; real libraries use hybrids like Timsort or introsort.",
      "Les tris à bulles, par insertion et par sélection sont simples mais en O(n²) : ils comparent des voisins ou toutes les paires, ce qui convient à de toutes petites entrées ou à des données presque triées. Le tri fusion et le tri rapide divisent le problème : O(n log n), toujours pour le tri fusion et en moyenne pour le tri rapide, dont le pire cas en O(n²) est évité avec un bon pivot. Le tri rapide est en général plus rapide en pratique, car il trie sur place et utilise bien le cache ; les vraies bibliothèques utilisent des hybrides comme Timsort ou introsort.",
    ],
    [
      "binary-search", "practice",
      "How does binary search work, and what does it need from the data?",
      "Comment fonctionne la recherche dichotomique, et qu'exige-t-elle des données ?",
      "On sorted data, compare the target with the middle element: if equal, found; if smaller, continue in the left half, otherwise in the right half; repeat until the range is empty. Each step halves the range, so it takes O(log n), about twenty steps for a million items. It needs sorted data and fast access by index; the classic bugs are off-by-one errors on the bounds and an overflow when computing the middle.",
      "Sur des données triées, on compare la cible à l'élément du milieu : si c'est égal, trouvé ; si c'est plus petit, on continue dans la moitié gauche, sinon dans la moitié droite ; on répète jusqu'à ce que l'intervalle soit vide. Chaque étape divise l'intervalle par deux, donc c'est en O(log n), une vingtaine d'étapes pour un million d'éléments. Elle exige des données triées et un accès rapide par indice ; les bugs classiques sont les erreurs de bornes d'une unité et le dépassement en calculant le milieu.",
    ],
    [
      "recursion", "concept",
      "What is recursion, and what can go wrong with it?",
      "Qu'est-ce que la récursivité, et qu'est-ce qui peut mal tourner ?",
      "Recursion is a function that calls itself on a smaller version of the problem, with a base case that stops it: factorial, tree traversal, merge sort. What can go wrong: a missing or unreachable base case gives infinite recursion and a stack overflow; very deep recursion overflows the stack even when it is correct; and naive recursion can compute the same things many times, as with Fibonacci, which memoisation or an iterative version fixes.",
      "La récursivité, c'est une fonction qui s'appelle elle-même sur une version plus petite du problème, avec un cas de base qui l'arrête : factorielle, parcours d'arbre, tri fusion. Ce qui peut mal tourner : un cas de base absent ou jamais atteint donne une récursion infinie et un dépassement de pile ; une récursion très profonde dépasse la pile même quand elle est correcte ; et une récursion naïve peut calculer plusieurs fois les mêmes choses, comme pour Fibonacci, ce que corrigent la mémoïsation ou une version itérative.",
    ],
    [
      "duplicates", "practice",
      "How would you find the duplicates in a list of a million numbers, and how fast would it be?",
      "Comment trouver les doublons dans une liste d'un million de nombres, et à quelle vitesse ?",
      "Go through the list once with a hash set: for each number, if it is already in the set, it is a duplicate, otherwise add it. That is O(n) time with O(n) extra memory, well under a second for a million numbers. Without extra memory, sorting first and then comparing neighbours takes O(n log n). Comparing every pair would be O(n²), about five hundred billion comparisons: far too slow.",
      "Parcourir la liste une fois avec un ensemble de hachage : pour chaque nombre, s'il est déjà dans l'ensemble, c'est un doublon, sinon on l'ajoute. C'est en O(n) avec O(n) de mémoire en plus, bien moins d'une seconde pour un million de nombres. Sans mémoire supplémentaire, trier d'abord puis comparer les voisins prend O(n log n). Comparer toutes les paires serait en O(n²), environ cinq cents milliards de comparaisons : beaucoup trop lent.",
    ],
    [
      "trees-graphs", "concept",
      "What is the difference between a tree and a graph? How would you explore a graph?",
      "Quelle est la différence entre un arbre et un graphe ? Comment parcourir un graphe ?",
      "A graph is a set of nodes connected by edges, possibly with cycles and several paths between two nodes. A tree is a special graph: connected, without cycles, with a root and exactly one path to each node, like a file system or the DOM. To explore a graph: breadth-first search with a queue, level by level, which also finds shortest paths in an unweighted graph, or depth-first search with recursion or a stack; either way, visited nodes are marked to avoid loops.",
      "Un graphe est un ensemble de nœuds reliés par des arêtes, avec éventuellement des cycles et plusieurs chemins entre deux nœuds. Un arbre est un graphe particulier : connexe, sans cycle, avec une racine et exactement un chemin vers chaque nœud, comme un système de fichiers ou le DOM. Pour parcourir un graphe : le parcours en largeur avec une file, niveau par niveau, qui trouve aussi les plus courts chemins dans un graphe non pondéré, ou le parcours en profondeur avec la récursion ou une pile ; dans les deux cas, on marque les nœuds visités pour éviter les boucles.",
    ],
  ],
);

export const oop = defineTech(
  {
    id: "oop",
    label: { en: "Object-oriented programming", fr: "Programmation orientée objet" },
    family: "foundations",
    tool: false,
    aliases: [
      "oop", "poo", "object-oriented", "object oriented", "object-oriented programming", "programmation orientee objet", "programmation objet",
      "oriente objet", "orientee objet", "design patterns", "design pattern", "solid principles", "principes solid", "uml",
    ],
  },
  [
    [
      "pillars", "concept",
      "What are encapsulation, inheritance and polymorphism? Give an example of each.",
      "Que sont l'encapsulation, l'héritage et le polymorphisme ? {Donnez|Donne} un exemple de chaque.",
      "Encapsulation hides an object's internal state behind methods: a BankAccount keeps its balance private and changes it only through deposit and withdraw, which check the rules. Inheritance lets a class reuse and specialise another: SavingsAccount extends BankAccount. Polymorphism lets code use different types through the same interface: in a list of Shape objects, each call to draw runs the right version for a Circle or a Square.",
      "L'encapsulation cache l'état interne d'un objet derrière des méthodes : un CompteBancaire garde son solde privé et ne le modifie qu'avec deposer et retirer, qui vérifient les règles. L'héritage permet à une classe de réutiliser et de spécialiser une autre classe : CompteEpargne étend CompteBancaire. Le polymorphisme permet d'utiliser des types différents via la même interface : dans une liste de Forme, chaque appel à dessiner exécute la bonne version pour un Cercle ou un Carré.",
    ],
    [
      "inheritance-vs-composition", "compare",
      "Inheritance or composition: how do you choose?",
      "Héritage ou composition : comment choisir ?",
      "Inheritance expresses an is-a relationship and shares code, but it ties the subclass closely to its parent, and deep hierarchies become rigid. Composition builds an object from other objects it has, has-a, and delegates work to them: more flexible, easier to test, and the behaviour can change at runtime. Inheritance fits a true and stable is-a relationship; otherwise, composition is usually the better choice.",
      "L'héritage exprime une relation « est un » et partage du code, mais il lie étroitement la sous-classe à son parent, et les hiérarchies profondes deviennent rigides. La composition construit un objet à partir d'autres objets qu'il possède, « a un », et leur délègue le travail : plus souple, plus facile à tester, et le comportement peut changer à l'exécution. L'héritage convient à une vraie relation « est un » stable ; sinon, la composition est en général le meilleur choix.",
    ],
    [
      "solid", "concept",
      "Do you know the SOLID principles? Explain one that you have actually applied.",
      "{Connaissez-vous|Connais-tu} les principes SOLID ? {Expliquez|Explique} celui que {vous avez|tu as} vraiment appliqué.",
      "SOLID: single responsibility, open-closed, Liskov substitution, interface segregation and dependency inversion. Single responsibility is the easiest to illustrate: a class should have one reason to change. A class that computes an invoice and also sends it by e-mail is better split into a calculator and a sender, each easier to test and to change; dependency inversion then makes the invoice code depend on a sender interface, not on the e-mail library. Then give a real case from your own code.",
      "SOLID : responsabilité unique, ouvert-fermé, substitution de Liskov, ségrégation des interfaces et inversion des dépendances. La responsabilité unique est la plus simple à illustrer : une classe ne doit avoir qu'une raison de changer. Une classe qui calcule une facture et l'envoie aussi par e-mail gagne à être découpée en un calculateur et un expéditeur, chacun plus facile à tester et à modifier ; l'inversion des dépendances fait ensuite dépendre le code de facturation d'une interface d'envoi, pas de la bibliothèque d'e-mail. Donne ensuite un cas réel tiré de ton propre code.",
    ],
    [
      "design-patterns", "concept",
      "Which design patterns do you know? Describe one and the problem it solves.",
      "Quels design patterns {connaissez-vous|connais-tu} ? {Décrivez|Décris}-en un et le problème qu'il résout.",
      "Common ones: Factory, Singleton, Strategy, Observer, Adapter, Decorator. Strategy, for example, solves the problem of a growing chain of if statements choosing an algorithm: each variant becomes a class implementing the same interface, like different payment or sorting methods, and the code receives the strategy to use, so a new variant is added without touching existing code. Observer lets objects subscribe to events from another, like listeners in a UI.",
      "Les plus courants : Factory, Singleton, Strategy, Observer, Adapter, Decorator. Strategy, par exemple, résout le problème d'une suite de if qui grandit pour choisir un algorithme : chaque variante devient une classe qui implémente la même interface, comme différents moyens de paiement ou méthodes de tri, et le code reçoit la stratégie à utiliser, donc on ajoute une variante sans toucher au code existant. Observer permet à des objets de s'abonner aux événements d'un autre, comme les listeners d'une interface.",
    ],
    [
      "program-to-interface", "concept",
      "Why program against an interface rather than a concrete class?",
      "Pourquoi programmer en s'appuyant sur une interface plutôt que sur une classe concrète ?",
      "Code that depends on an interface, like a PaymentGateway or a UserRepository, does not care which implementation it gets. So the implementation can change, a new provider, a database instead of files, without touching the code that uses it, and tests can pass a fake implementation. It reduces coupling; the interface should stay small and describe what the caller needs.",
      "Un code qui dépend d'une interface, comme une PaymentGateway ou un UserRepository, ne se soucie pas de l'implémentation qu'il reçoit. On peut donc changer l'implémentation, un nouveau fournisseur, une base de données au lieu de fichiers, sans toucher au code qui l'utilise, et les tests peuvent passer une fausse implémentation. Ça réduit le couplage ; l'interface doit rester petite et décrire ce dont l'appelant a besoin.",
    ],
    [
      "parking-lot", "design",
      "How would you model a parking lot with cars, motorbikes and spots in classes?",
      "Comment {modéliseriez-vous|modéliserais-tu} en classes un parking avec des voitures, des motos et des places ?",
      "An abstract Vehicle with a licence plate and a size, extended by Car and Motorbike; a ParkingSpot with a number, a size and the vehicle parked in it, if any; and a ParkingLot that holds the spots and offers park and leave, finding a free spot that fits the vehicle's size. A Ticket can record the entry time to compute the price. The rules stay in ParkingLot, and each class has one clear job.",
      "Une classe abstraite Vehicule avec une plaque et une taille, étendue par Voiture et Moto ; une PlaceParking avec un numéro, une taille et le véhicule qui l'occupe, s'il y en a un ; et un Parking qui contient les places et propose garer et partir, en cherchant une place libre adaptée à la taille du véhicule. Un Ticket peut enregistrer l'heure d'entrée pour calculer le prix. Les règles restent dans Parking, et chaque classe a un rôle clair.",
    ],
    [
      "coupling-cohesion", "best_practice",
      "What do low coupling and high cohesion mean, and why do they matter?",
      "Que signifient faible couplage et forte cohésion, et pourquoi est-ce important ?",
      "Cohesion is how closely the things inside one module belong together: high cohesion means a class does one job and everything in it serves that job. Coupling is how much modules depend on each other's details: low coupling means they talk through small, stable interfaces. Together, they make code easier to understand, to test and to change, because a change stays local instead of spreading everywhere.",
      "La cohésion mesure à quel point les éléments d'un module vont ensemble : une forte cohésion signifie qu'une classe fait un seul travail et que tout ce qu'elle contient sert ce travail. Le couplage mesure à quel point les modules dépendent des détails des autres : un faible couplage signifie qu'ils communiquent via des interfaces petites et stables. Ensemble, ils rendent le code plus facile à comprendre, à tester et à modifier, car une modification reste locale au lieu de se propager partout.",
    ],
  ],
);

export const security = defineTech(
  {
    id: "security",
    label: { en: "Security", fr: "Sécurité" },
    family: "foundations",
    tool: false,
    aliases: [
      "security", "securite", "cybersecurity", "cybersecurite", "cyber security", "owasp", "devsecops", "secops", "pentest", "pentesting",
      "penetration testing", "authentication", "authentification", "oauth", "oauth2", "openid connect", "jwt", "encryption", "chiffrement",
      "cryptography", "cryptographie",
    ],
  },
  [
    [
      "passwords", "best_practice",
      "How should passwords be stored in a database?",
      "Comment faut-il stocker les mots de passe dans une base de données ?",
      "Never in plain text, and never with a fast hash like MD5 or SHA-256 alone: with a slow, salted password hashing algorithm, such as Argon2, bcrypt or scrypt. The salt, unique per user, defeats precomputed tables, and the slowness makes brute force expensive. At login, the password entered is hashed the same way and compared; the original can never be recovered, only reset.",
      "Jamais en clair, et jamais avec un hachage rapide comme MD5 ou SHA-256 seul : avec un algorithme de hachage de mots de passe lent et salé, comme Argon2, bcrypt ou scrypt. Le sel, unique par utilisateur, neutralise les tables précalculées, et la lenteur rend la force brute coûteuse. À la connexion, le mot de passe saisi est haché de la même façon et comparé ; l'original ne peut jamais être retrouvé, seulement réinitialisé.",
    ],
    [
      "xss", "concept",
      "What is XSS, and how do you prevent it?",
      "Qu'est-ce qu'une faille XSS, et comment l'éviter ?",
      "Cross-site scripting is when an attacker gets their JavaScript to run in other users' browsers, for example through a comment containing a script tag that the site displays as HTML; the script can steal session data or act on the user's behalf. Prevention: escape all user content on output, which frameworks like React do by default, avoid inserting raw HTML and sanitise it when unavoidable, add a Content Security Policy, and keep session cookies HttpOnly.",
      "Le cross-site scripting, c'est quand un attaquant fait exécuter son JavaScript dans le navigateur d'autres utilisateurs, par exemple via un commentaire contenant une balise script que le site affiche comme du HTML ; le script peut voler des données de session ou agir à la place de l'utilisateur. Prévention : échapper tout contenu utilisateur à l'affichage, ce que des frameworks comme React font par défaut, éviter d'insérer du HTML brut et le nettoyer quand c'est inévitable, ajouter une Content Security Policy, et garder les cookies de session en HttpOnly.",
    ],
    [
      "csrf", "concept",
      "What is a CSRF attack, and how do you protect a form against it?",
      "Qu'est-ce qu'une attaque CSRF, et comment protéger un formulaire ?",
      "Cross-site request forgery tricks the browser of a logged-in user into sending a request to a site that trusts it, for example a hidden form on another site that triggers a transfer, with the user's cookies attached automatically. Protections: SameSite cookies, a CSRF token, random and tied to the session, included in every form and checked by the server, and never changing state with GET requests.",
      "La falsification de requête intersite pousse le navigateur d'un utilisateur connecté à envoyer une requête à un site qui lui fait confiance, par exemple un formulaire caché sur un autre site qui déclenche un virement, avec les cookies de l'utilisateur joints automatiquement. Protections : des cookies SameSite, un jeton CSRF, aléatoire et lié à la session, inclus dans chaque formulaire et vérifié par le serveur, et jamais de modification d'état avec des requêtes GET.",
    ],
    [
      "least-privilege", "best_practice",
      "What does the principle of least privilege mean, in practice?",
      "Que signifie concrètement le principe du moindre privilège ?",
      "Every user, service and process gets only the permissions its task needs, and only for as long as it needs them. In practice: the application's database account cannot drop tables, a CI job can only deploy its own service, a container does not run as root, and admin rights are granted temporarily rather than by default. If something is compromised, the damage stays limited.",
      "Chaque utilisateur, service et processus ne reçoit que les droits nécessaires à sa tâche, et seulement le temps nécessaire. En pratique : le compte de base de données de l'application ne peut pas supprimer de tables, un job de CI ne peut déployer que son propre service, un conteneur ne tourne pas en root, et les droits d'administration sont accordés temporairement plutôt que par défaut. Si quelque chose est compromis, les dégâts restent limités.",
    ],
    [
      "hashing-vs-encryption", "compare",
      "What is the difference between hashing and encryption?",
      "Quelle est la différence entre hacher et chiffrer ?",
      "Hashing is one-way: it turns data into a fixed-size fingerprint that cannot be reversed, used to check integrity or to store passwords. Encryption is two-way: data encrypted with a key can be decrypted with the right key, to protect data that must be read again, like a file or network traffic. Symmetric encryption uses one shared key; asymmetric encryption uses a public key to encrypt and a private key to decrypt.",
      "Le hachage est à sens unique : il transforme des données en une empreinte de taille fixe qu'on ne peut pas inverser, utilisée pour vérifier l'intégrité ou stocker des mots de passe. Le chiffrement est réversible : des données chiffrées avec une clé peuvent être déchiffrées avec la bonne clé, pour protéger des données qu'on doit relire, comme un fichier ou le trafic réseau. Le chiffrement symétrique utilise une seule clé partagée ; l'asymétrique, une clé publique pour chiffrer et une clé privée pour déchiffrer.",
    ],
    [
      "owasp", "concept",
      "Which OWASP Top 10 risks do you know, and which one have you already taken into account in a project?",
      "Quels risques du Top 10 OWASP {connaissez-vous|connais-tu}, et lequel {avez-vous|as-tu} déjà pris en compte dans un projet ?",
      "The OWASP Top 10 lists the most critical web application risks, for example broken access control, cryptographic failures, injection such as SQL injection, insecure design, security misconfiguration, vulnerable and outdated components, and authentication failures. A good answer names a few and explains the protection for one of them, like parameterised queries against injection, or checking permissions on the server for every request. Then add a real case from your own projects.",
      "Le Top 10 de l'OWASP liste les risques les plus critiques des applications web, par exemple le contrôle d'accès défaillant, les défaillances cryptographiques, les injections comme l'injection SQL, la conception non sécurisée, les erreurs de configuration, les composants vulnérables ou obsolètes, et les défauts d'authentification. Une bonne réponse en cite quelques-uns et explique la protection pour l'un d'eux, comme les requêtes paramétrées contre l'injection, ou la vérification des droits côté serveur à chaque requête. Ajoute ensuite un cas réel tiré de tes propres projets.",
    ],
    [
      "leaked-key", "troubleshoot",
      "An API key has leaked on GitHub. What do you do, and in which order?",
      "Une clé d'API a fuité sur GitHub. Que {faites-vous|fais-tu}, et dans quel ordre ?",
      "First revoke or rotate the key at the provider immediately: it is compromised the moment it is public, and bots scan GitHub within minutes. Then check the provider's logs for any use of the key and limit the damage, remove the key from the code and the history, store the new one in a secret manager or environment variables, and add secret scanning so it cannot happen again.",
      "D'abord révoquer ou renouveler immédiatement la clé chez le fournisseur : elle est compromise dès qu'elle est publique, et des robots scannent GitHub en quelques minutes. Ensuite vérifier dans les logs du fournisseur toute utilisation de la clé et limiter les dégâts, retirer la clé du code et de l'historique, stocker la nouvelle dans un gestionnaire de secrets ou des variables d'environnement, et ajouter une détection de secrets pour que ça ne puisse pas se reproduire.",
    ],
  ],
);

export const testing = defineTech(
  {
    id: "testing",
    label: { en: "Testing", fr: "Tests" },
    family: "foundations",
    tool: false,
    aliases: [
      "testing", "unit testing", "unit tests", "unit test", "tests unitaires", "test unitaire", "integration tests", "tests d'integration", "junit",
      "jest", "vitest", "pytest", "mocha", "cypress", "selenium", "playwright", "tdd", "qa", "quality assurance", "test automation",
      "automatisation des tests",
    ],
  },
  [
    [
      "test-pyramid", "compare",
      "Unit, integration, end-to-end tests: what is the difference, and how many of each?",
      "Tests unitaires, d'intégration, de bout en bout : quelle est la différence, et combien de chaque ?",
      "A unit test checks one small piece of logic in isolation, in milliseconds. An integration test checks that several parts work together, like a service with a real database. An end-to-end test drives the whole application like a user, through the interface: the most realistic, but slow and more fragile. The usual balance is a pyramid: many unit tests, fewer integration tests, and a few end-to-end tests on the critical paths.",
      "Un test unitaire vérifie un petit morceau de logique isolé, en quelques millisecondes. Un test d'intégration vérifie que plusieurs parties fonctionnent ensemble, comme un service avec une vraie base de données. Un test de bout en bout pilote toute l'application comme un utilisateur, via l'interface : le plus réaliste, mais lent et plus fragile. L'équilibre habituel est une pyramide : beaucoup de tests unitaires, moins de tests d'intégration, et quelques tests de bout en bout sur les parcours critiques.",
    ],
    [
      "good-unit-test", "best_practice",
      "What makes a good unit test?",
      "Qu'est-ce qu'un bon test unitaire ?",
      "It is fast, independent of the other tests and of the outside world, and deterministic: the same result every time. It tests one behaviour, through the public interface rather than implementation details, with a name that says what is expected, and follows arrange, act, assert. It covers the edge cases, empty input, limits, errors, and it fails for the right reason when the code is broken.",
      "Il est rapide, indépendant des autres tests et du monde extérieur, et déterministe : le même résultat à chaque fois. Il teste un seul comportement, via l'interface publique plutôt que les détails d'implémentation, avec un nom qui dit ce qui est attendu, et suit le schéma préparer, agir, vérifier. Il couvre les cas limites, entrée vide, bornes, erreurs, et il échoue pour la bonne raison quand le code est cassé.",
    ],
    [
      "mocks", "concept",
      "What is a mock, and when is mocking a bad idea?",
      "Qu'est-ce qu'un mock, et quand est-ce une mauvaise idée d'en utiliser ?",
      "A mock is a fake object that replaces a real dependency, like a database, an e-mail service or an API, so the test is fast and isolated and can check how the dependency was called. It becomes a bad idea when everything is mocked: the test then checks the implementation rather than the behaviour, breaks at every refactoring, and can pass while the real integration is broken. Mock the outside world, not your own logic, and keep some integration tests.",
      "Un mock est un faux objet qui remplace une vraie dépendance, comme une base de données, un service d'e-mail ou une API, pour que le test soit rapide et isolé et puisse vérifier comment la dépendance a été appelée. Ça devient une mauvaise idée quand on simule tout : le test vérifie alors l'implémentation plutôt que le comportement, casse à chaque refactoring, et peut passer alors que la vraie intégration est cassée. On simule le monde extérieur, pas sa propre logique, et on garde des tests d'intégration.",
    ],
    [
      "tdd", "concept",
      "What is TDD? Have you tried it, and what did you think of it?",
      "Qu'est-ce que le TDD ? {L'avez-vous|L'as-tu} essayé, et qu'en {avez-vous|as-tu} pensé ?",
      "Test-driven development is a short cycle: write a failing test for the next small behaviour, write the minimum code to make it pass, then refactor while the tests stay green. It makes you think about the expected behaviour first, gives a safety net and tends to produce simpler, testable code; it can feel slow at first and is harder when requirements are unclear or for UI work. Then say honestly whether you have tried it, and what you noticed.",
      "Le développement piloté par les tests est un cycle court : écrire un test qui échoue pour le prochain petit comportement, écrire le minimum de code pour le faire passer, puis refactorer en gardant les tests au vert. Il oblige à penser d'abord au comportement attendu, donne un filet de sécurité et produit souvent un code plus simple et testable ; il peut sembler lent au début et il est plus difficile quand les besoins sont flous ou pour l'interface. Dis ensuite honnêtement si tu l'as essayé, et ce que tu as remarqué.",
    ],
    [
      "flaky", "troubleshoot",
      "A test fails one time in ten. How do you deal with it?",
      "Un test échoue une fois sur dix. Comment {gérez-vous|gères-tu} ça ?",
      "A flaky test destroys trust in the whole suite, so it must not be ignored. First reproduce it by running it many times, then look for the usual causes: timing and fixed waits instead of waiting for a condition, a dependence on the order of the tests or on shared data, the current date or time zone, randomness, or a real race condition in the code. It can be quarantined while it is being fixed, but with a ticket, not forgotten.",
      "Un test instable détruit la confiance dans toute la suite, donc il ne faut pas l'ignorer. D'abord le reproduire en le lançant de nombreuses fois, puis chercher les causes habituelles : timing et attentes fixes au lieu d'attendre une condition, dépendance à l'ordre des tests ou à des données partagées, la date ou le fuseau horaire courants, du hasard, ou une vraie race condition dans le code. On peut le mettre en quarantaine pendant la correction, mais avec un ticket, pas en l'oubliant.",
    ],
    [
      "regression-test", "practice",
      "You fix a bug. How do you make sure it never comes back?",
      "{Vous corrigez|Tu corriges} un bug. Comment s'assurer qu'il ne revienne jamais ?",
      "Before fixing, write a test that reproduces the bug and fails; then fix the code and watch the test pass. The test stays in the suite and runs in CI on every change, so if the bug comes back, the pipeline catches it before production. Then check whether the same mistake exists elsewhere in the code.",
      "Avant de corriger, écrire un test qui reproduit le bug et échoue ; puis corriger le code et voir le test passer. Le test reste dans la suite et tourne en CI à chaque modification, donc si le bug revient, le pipeline le détecte avant la production. Ensuite, vérifier si la même erreur existe ailleurs dans le code.",
    ],
  ],
);

export const agile = defineTech(
  {
    id: "agile",
    label: { en: "Agile and Scrum", fr: "Agilité et Scrum" },
    family: "foundations",
    tool: false,
    aliases: ["agile", "scrum", "kanban", "jira", "sprint", "sprints", "methode agile", "methodes agiles", "methodologie agile", "methodologies agiles"],
  },
  [
    [
      "sprint", "concept",
      "How does a Scrum sprint work, from planning to retrospective?",
      "Comment se déroule un sprint Scrum, de la planification à la rétrospective ?",
      "A sprint is a fixed period, often two weeks. Sprint planning picks, from the prioritised product backlog, the items the team commits to, and splits them into tasks. Every day, a short daily scrum synchronises the team and brings blockers to light. At the end, the sprint review shows the working increment to the stakeholders for feedback, and the retrospective looks at how the team worked and what to improve.",
      "Un sprint est une période fixe, souvent de deux semaines. La planification du sprint choisit, dans le backlog produit priorisé, les éléments sur lesquels l'équipe s'engage, et les découpe en tâches. Chaque jour, un court daily scrum synchronise l'équipe et fait remonter les blocages. À la fin, la revue de sprint montre l'incrément fonctionnel aux parties prenantes pour avoir leur avis, et la rétrospective examine la façon de travailler de l'équipe et ce qu'il faut améliorer.",
    ],
    [
      "user-story", "concept",
      "What makes a good user story?",
      "Qu'est-ce qu'une bonne user story ?",
      "It describes a need from the user's point of view: as a type of user, I want something, so that I get a benefit. It is small enough to finish within a sprint, valuable on its own, testable, and open to discussion rather than a detailed specification. Above all, it has clear acceptance criteria, for example in the form given, when, then, so everyone agrees on what done means.",
      "Elle décrit un besoin du point de vue de l'utilisateur : en tant que type d'utilisateur, je veux quelque chose, afin d'obtenir un bénéfice. Elle est assez petite pour être terminée dans un sprint, utile à elle seule, testable, et ouverte à la discussion plutôt qu'une spécification détaillée. Surtout, elle a des critères d'acceptation clairs, par exemple sous la forme étant donné, quand, alors, pour que tout le monde s'accorde sur ce que « terminé » veut dire.",
    ],
    [
      "estimating", "practice",
      "How do you estimate a task you have never done before?",
      "Comment estimer une tâche qu'on n'a jamais faite ?",
      "Split it into smaller pieces that are understood, and compare them with similar tasks done before; for the unknown part, a short time-boxed spike, an experiment to learn, reduces the uncertainty. Give a range or relative points rather than a precise number, state the main risks and assumptions clearly, and update the estimate as soon as something learned changes it.",
      "La découper en morceaux plus petits qu'on comprend, et les comparer à des tâches similaires déjà réalisées ; pour la partie inconnue, un court spike limité dans le temps, une expérimentation pour apprendre, réduit l'incertitude. Donner une fourchette ou des points relatifs plutôt qu'un nombre précis, énoncer clairement les principaux risques et hypothèses, et mettre à jour l'estimation dès qu'on apprend quelque chose qui la change.",
    ],
    [
      "stuck", "troubleshoot",
      "You are stuck on a task halfway through the sprint. What do you do?",
      "{Vous bloquez|Tu bloques} sur une tâche au milieu du sprint. Que {faites-vous|fais-tu} ?",
      "First try alone for a reasonable, time-boxed moment: documentation, logs, a minimal reproduction. Then ask for help rather than going round in circles, with a precise question that says what was already tried, and mention it at the daily scrum so the team can react. If the task is blocked by something outside the team, warn the Scrum Master or the product owner early, since it may change the sprint's plan, and take another task meanwhile.",
      "D'abord chercher seul pendant un temps raisonnable et limité : documentation, logs, reproduction minimale. Ensuite demander de l'aide plutôt que de tourner en rond, avec une question précise qui dit ce qui a déjà été essayé, et le signaler au daily scrum pour que l'équipe puisse réagir. Si la tâche est bloquée par quelque chose d'extérieur à l'équipe, prévenir tôt le Scrum Master ou le product owner, car ça peut changer le plan du sprint, et prendre une autre tâche en attendant.",
    ],
    [
      "scrum-vs-kanban", "compare",
      "Scrum or Kanban: what is the difference?",
      "Scrum ou Kanban : quelle est la différence ?",
      "Scrum works in fixed sprints with defined roles, product owner, Scrum Master and developers, and ceremonies: planning, daily scrum, review and retrospective; the scope of a sprint is fixed once it starts. Kanban is a continuous flow: tasks move across a board with limits on work in progress, without sprints or required roles, and the team improves by measuring the flow. Many teams mix the two.",
      "Scrum fonctionne en sprints fixes avec des rôles définis, product owner, Scrum Master et développeurs, et des cérémonies : planification, daily scrum, revue et rétrospective ; le contenu d'un sprint est figé une fois qu'il a commencé. Kanban est un flux continu : les tâches avancent sur un tableau avec des limites de travail en cours, sans sprints ni rôles obligatoires, et l'équipe s'améliore en mesurant le flux. Beaucoup d'équipes mélangent les deux.",
    ],
  ],
);
