import { defineTech, same } from "./types";

// Other languages and platforms often asked of junior developers.

export const python = defineTech(
  {
    id: "python",
    label: same("Python"),
    family: "language",
    tool: true,
    aliases: ["python", "python3", "python 3", "django", "flask", "fastapi", "pandas", "numpy", "pip"],
  },
  [
    [
      "collections", "compare",
      "List, tuple, set, dict: when do you use each one?",
      "Liste, tuple, set, dict : quand utiliser chacun ?",
      "A list is an ordered, mutable sequence: the default for a collection of items. A tuple is ordered but immutable: fixed records, like coordinates, and it can be a dictionary key. A set holds unique items, with fast membership tests and set operations. A dict maps keys to values with fast lookups by key, and keeps the insertion order.",
      "Une liste est une séquence ordonnée et modifiable : le choix par défaut pour une collection d'éléments. Un tuple est ordonné mais immuable : des enregistrements fixes, comme des coordonnées, et il peut servir de clé de dictionnaire. Un set contient des éléments uniques, avec des tests d'appartenance rapides et des opérations d'ensemble. Un dict associe des clés à des valeurs avec une recherche rapide par clé, et garde l'ordre d'insertion.",
    ],
    [
      "mutable-default", "troubleshoot",
      "A function with a list as a default argument keeps remembering old values. Why?",
      "Une fonction qui a une liste comme argument par défaut garde en mémoire d'anciennes valeurs. Pourquoi ?",
      "Default values are evaluated once, when the function is defined, not at each call. So a list given as default is the same object for every call, and items appended in one call are still there in the next. The fix: use None as the default and create the list inside the function, if items is None: items = [].",
      "Les valeurs par défaut sont évaluées une seule fois, à la définition de la fonction, pas à chaque appel. Une liste donnée par défaut est donc le même objet pour tous les appels, et les éléments ajoutés lors d'un appel sont encore là au suivant. La correction : mettre None par défaut et créer la liste dans la fonction, if items is None: items = [].",
    ],
    [
      "virtual-env", "best_practice",
      "Why use a virtual environment, and how do you pin a project's dependencies?",
      "Pourquoi utiliser un environnement virtuel, et comment figer les dépendances d'un projet ?",
      "A virtual environment gives each project its own packages, so projects that need different versions of a library do not conflict, and the system's Python stays clean. It is created with python -m venv .venv, and the dependencies are pinned to exact versions, in a requirements.txt generated with pip freeze, or better with a tool like Poetry or uv and its lock file, so every machine installs the same versions.",
      "Un environnement virtuel donne à chaque projet ses propres paquets, pour que des projets qui ont besoin de versions différentes d'une bibliothèque n'entrent pas en conflit, et le Python du système reste propre. On le crée avec python -m venv .venv, et on fige les dépendances à des versions exactes, dans un requirements.txt généré avec pip freeze, ou mieux avec un outil comme Poetry ou uv et son fichier de verrouillage, pour que chaque machine installe les mêmes versions.",
    ],
    [
      "decorators", "concept",
      "What is a decorator in Python? Give an example where it is useful.",
      "Qu'est-ce qu'un décorateur en Python ? {Donnez|Donne} un exemple où c'est utile.",
      "A decorator is a function that takes a function and returns a new one that adds behaviour around it, applied with the @ syntax. Useful examples: measuring execution time, logging calls, caching results with functools.lru_cache, checking permissions before a view runs, or retrying on failure. functools.wraps keeps the name and the docstring of the original function.",
      "Un décorateur est une fonction qui prend une fonction et en renvoie une nouvelle qui ajoute un comportement autour, appliquée avec la syntaxe @. Exemples utiles : mesurer le temps d'exécution, journaliser les appels, mettre en cache les résultats avec functools.lru_cache, vérifier les droits avant une vue, ou réessayer en cas d'échec. functools.wraps garde le nom et la docstring de la fonction d'origine.",
    ],
    [
      "generators", "concept",
      "What is a generator, and why can it save memory?",
      "Qu'est-ce qu'un générateur, et pourquoi peut-il économiser de la mémoire ?",
      "A generator is a function that uses yield to produce values one at a time, on demand, keeping its state between them; a generator expression in parentheses does the same in one line. Instead of building a whole list in memory, it hands over each item when the loop asks for it, so a huge file can be processed line by line, or even an infinite sequence, with constant memory.",
      "Un générateur est une fonction qui utilise yield pour produire des valeurs une à une, à la demande, en gardant son état entre elles ; une expression génératrice entre parenthèses fait la même chose en une ligne. Au lieu de construire toute une liste en mémoire, il fournit chaque élément quand la boucle le demande, ce qui permet de traiter un énorme fichier ligne par ligne, ou même une suite infinie, avec une mémoire constante.",
    ],
    [
      "gil", "concept",
      "What is the GIL, and when are threads, processes or asyncio the right choice in Python?",
      "Qu'est-ce que le GIL, et quand choisir les threads, les processus ou asyncio en Python ?",
      "In CPython, the global interpreter lock lets only one thread run Python bytecode at a time. So threads do not speed up CPU-bound work, but they are fine for I/O-bound work, like network calls, because the lock is released while waiting. For heavy computation, multiprocessing or libraries written in C like NumPy; for many concurrent network tasks, asyncio is light and efficient.",
      "Dans CPython, le verrou global de l'interpréteur ne laisse qu'un thread à la fois exécuter du bytecode Python. Les threads n'accélèrent donc pas le travail limité par le CPU, mais ils conviennent au travail limité par les entrées-sorties, comme les appels réseau, car le verrou est relâché pendant l'attente. Pour du calcul lourd, multiprocessing ou des bibliothèques écrites en C comme NumPy ; pour beaucoup de tâches réseau simultanées, asyncio est léger et efficace.",
    ],
    [
      "exceptions", "best_practice",
      "How do you handle errors in Python? When is catching every exception a bad idea?",
      "Comment gérer les erreurs en Python ? Pourquoi attraper toutes les exceptions est-il souvent une mauvaise idée ?",
      "With try, except for the specific exceptions that can be handled, else for the code that runs when nothing failed, and finally, or a with block, for cleanup. Catching everything with a bare except, or except Exception without re-raising, hides real bugs, even typos, and a bare except even swallows KeyboardInterrupt. Catch what you can handle, log the rest and let it propagate, and define your own exception classes for business errors.",
      "Avec try, except pour les exceptions précises qu'on sait traiter, else pour le code qui s'exécute quand rien n'a échoué, et finally, ou un bloc with, pour le nettoyage. Tout attraper avec un except nu, ou except Exception sans relancer, masque de vrais bugs, même des fautes de frappe, et un except nu avale même KeyboardInterrupt. On attrape ce qu'on sait traiter, on journalise le reste et on le laisse remonter, et on définit ses propres classes d'exception pour les erreurs métier.",
    ],
    [
      "comprehension", "practice",
      "How would you keep only the even numbers of a list and square them, in one line?",
      "Comment ne garder que les nombres pairs d'une liste et les mettre au carré, en une ligne ?",
      "With a list comprehension: [n * n for n in numbers if n % 2 == 0]. It reads: for each n in numbers, keep it if it is even, and take its square. It is shorter and usually faster than a loop with append; for very large data, the same thing in parentheses gives a generator that does not build the whole list.",
      "Avec une compréhension de liste : [n * n for n in numbers if n % 2 == 0]. Elle se lit : pour chaque n de numbers, le garder s'il est pair, et prendre son carré. C'est plus court et en général plus rapide qu'une boucle avec append ; pour de très grandes données, la même chose entre parenthèses donne un générateur qui ne construit pas toute la liste.",
    ],
    [
      "is-vs-equals", "compare",
      "What is the difference between == and is in Python?",
      "Quelle est la différence entre == et is en Python ?",
      "== compares values, through the __eq__ method: two different lists with the same items are equal. is compares identity: whether both names point to the very same object in memory. Use is for singletons, like x is None, and == for everything else; CPython sometimes shares small integers and some strings, which makes is seem to work where it must not be relied on.",
      "== compare les valeurs, via la méthode __eq__ : deux listes différentes qui ont les mêmes éléments sont égales. is compare l'identité : si les deux noms désignent exactement le même objet en mémoire. On utilise is pour les singletons, comme x is None, et == pour tout le reste ; CPython partage parfois les petits entiers et certaines chaînes, ce qui donne l'impression que is fonctionne là où il ne faut pas s'y fier.",
    ],
  ],
);

export const csharp = defineTech(
  {
    id: "csharp",
    label: same("C# / .NET"),
    family: "language",
    tool: true,
    aliases: ["c#", "csharp", "c sharp", ".net", "dotnet", ".net core", "asp.net", "asp.net core", "blazor", "entity framework", "ef core", "winforms", "windows forms", "wpf"],
  },
  [
    [
      "value-vs-reference", "compare",
      "What is the difference between value types and reference types in C#?",
      "Quelle est la différence entre types valeur et types référence en C# ?",
      "Value types, like int, double, bool and structs, hold their data directly: assigning one copies the value, and they cannot be null unless declared nullable. Reference types, classes, strings, arrays, hold a reference to an object on the heap: assigning one copies the reference, so two variables can point to the same object and see each other's changes.",
      "Les types valeur, comme int, double, bool et les structs, contiennent directement leurs données : une affectation copie la valeur, et ils ne peuvent pas être null sauf s'ils sont déclarés nullables. Les types référence, classes, chaînes, tableaux, contiennent une référence vers un objet sur le tas : une affectation copie la référence, donc deux variables peuvent désigner le même objet et voir les modifications de l'autre.",
    ],
    [
      "linq", "practice",
      "What is LINQ, and how would you get the names of the adult users from a list?",
      "Qu'est-ce que LINQ, et comment obtenir les noms des utilisateurs majeurs d'une liste ?",
      "LINQ queries collections, databases or XML with one syntax, in C#, with type checking. For the adult users: users.Where(u => u.Age >= 18).Select(u => u.Name).ToList(). Queries are deferred: nothing runs until the result is enumerated or ToList is called, and with Entity Framework the query is translated into SQL.",
      "LINQ permet d'interroger des collections, des bases de données ou du XML avec une seule syntaxe, en C#, avec la vérification des types. Pour les utilisateurs majeurs : users.Where(u => u.Age >= 18).Select(u => u.Name).ToList(). Les requêtes sont différées : rien ne s'exécute avant qu'on parcoure le résultat ou qu'on appelle ToList, et avec Entity Framework la requête est traduite en SQL.",
    ],
    [
      "async-await", "concept",
      "How do async and await work in C#, and why should you avoid .Result?",
      "Comment fonctionnent async et await en C#, et pourquoi éviter .Result ?",
      "An async method returns a Task, and await pauses the method, without blocking the thread, until the awaited operation completes, then resumes it, so a web server can serve other requests meanwhile. .Result or .Wait() block the thread while waiting, which wastes threads and can cause deadlocks in some contexts; the rule is async all the way, with await from top to bottom.",
      "Une méthode async renvoie une Task, et await suspend la méthode, sans bloquer le thread, jusqu'à la fin de l'opération attendue, puis la reprend, donc un serveur web peut traiter d'autres requêtes pendant ce temps. .Result ou .Wait() bloquent le thread pendant l'attente, ce qui gaspille des threads et peut provoquer des interblocages dans certains contextes ; la règle, c'est async de bout en bout, avec await du haut en bas.",
    ],
    [
      "idisposable", "concept",
      "What is IDisposable for, and what does a using block do?",
      "À quoi sert IDisposable, et que fait un bloc using ?",
      "IDisposable is for objects that hold resources the garbage collector does not manage well, like files, database connections, sockets or streams: its Dispose method releases them right away. A using block, or a using declaration, calls Dispose automatically at the end of the scope, even if an exception is thrown, like RAII in C++.",
      "IDisposable sert aux objets qui détiennent des ressources que le ramasse-miettes gère mal, comme des fichiers, des connexions à une base, des sockets ou des flux : sa méthode Dispose les libère tout de suite. Un bloc using, ou une déclaration using, appelle Dispose automatiquement à la fin de la portée, même si une exception est levée, comme le RAII en C++.",
    ],
    [
      "di-testing", "design",
      "How do interfaces and dependency injection make ASP.NET Core code easier to test?",
      "Comment les interfaces et l'injection de dépendances rendent-elles le code ASP.NET Core plus facile à tester ?",
      "Classes depend on interfaces, like IUserRepository, received through the constructor, and the built-in container of ASP.NET Core provides the real implementations registered at startup, with a lifetime: singleton, scoped to the request, or transient. A unit test passes a fake or a mock of the interface instead, so the business logic is tested without a database or the network.",
      "Les classes dépendent d'interfaces, comme IUserRepository, reçues par le constructeur, et le conteneur intégré d'ASP.NET Core fournit les vraies implémentations enregistrées au démarrage, avec une durée de vie : singleton, limitée à la requête, ou transitoire. Un test unitaire passe à la place une fausse implémentation ou un mock de l'interface, donc la logique métier est testée sans base de données ni réseau.",
    ],
    [
      "entity-framework", "concept",
      "What does Entity Framework do, and what are migrations?",
      "Que fait Entity Framework, et que sont les migrations ?",
      "Entity Framework is the ORM of .NET: it maps C# classes to tables, translates LINQ queries into SQL, and tracks changes to save them with SaveChanges. Migrations version the database schema: when the model changes, a migration is generated with the SQL to go from the old schema to the new one, reviewed, committed, and applied in each environment.",
      "Entity Framework est l'ORM de .NET : il fait correspondre des classes C# à des tables, traduit les requêtes LINQ en SQL, et suit les modifications pour les enregistrer avec SaveChanges. Les migrations versionnent le schéma de la base : quand le modèle change, on génère une migration contenant le SQL pour passer de l'ancien schéma au nouveau, on la relit, on la commite, et on l'applique dans chaque environnement.",
    ],
  ],
);

export const go = defineTech(
  {
    id: "go",
    label: same("Go"),
    family: "language",
    tool: true,
    exact: ["go"],
    aliases: ["golang", "go lang"],
  },
  [
    [
      "goroutines", "concept",
      "What are goroutines and channels?",
      "Que sont les goroutines et les channels ?",
      "A goroutine is a very light thread managed by the Go runtime, started with the go keyword, and thousands can run at once. Channels let goroutines communicate safely by sending values to each other, which also synchronises them: the Go motto is to share memory by communicating. select waits on several channels, and sync.WaitGroup or a context coordinate and cancel them.",
      "Une goroutine est un thread très léger géré par le runtime Go, lancé avec le mot-clé go, et des milliers peuvent tourner en même temps. Les channels permettent aux goroutines de communiquer en sécurité en s'envoyant des valeurs, ce qui les synchronise aussi : la devise de Go est de partager la mémoire en communiquant. select attend sur plusieurs channels, et sync.WaitGroup ou un context les coordonnent et les annulent.",
    ],
    [
      "errors", "best_practice",
      "How are errors handled in Go, and why are there no exceptions?",
      "Comment gère-t-on les erreurs en Go, et pourquoi n'y a-t-il pas d'exceptions ?",
      "Functions return an error as their last value, and the caller checks it right away: if err != nil, return it or handle it. Errors are ordinary values, so the error path is explicit and visible in the code instead of hidden in exceptions. Context is added with fmt.Errorf and %w, errors.Is and errors.As check the cause, and panic is kept for truly unrecoverable situations.",
      "Les fonctions renvoient une erreur comme dernière valeur, et l'appelant la vérifie tout de suite : if err != nil, on la renvoie ou on la traite. Les erreurs sont des valeurs ordinaires, donc le chemin d'erreur est explicite et visible dans le code au lieu d'être caché dans des exceptions. On ajoute du contexte avec fmt.Errorf et %w, errors.Is et errors.As vérifient la cause, et panic est réservé aux situations vraiment irrécupérables.",
    ],
    [
      "interfaces", "concept",
      "How do interfaces work in Go, and what does implicit implementation mean?",
      "Comment fonctionnent les interfaces en Go, et que signifie l'implémentation implicite ?",
      "An interface is a set of method signatures, and a type implements it simply by having those methods: there is no implements keyword. So small interfaces can be defined where they are used, like io.Reader with its single Read method, and any type with that method fits, even one from another package. The code stays decoupled and easy to test with fakes.",
      "Une interface est un ensemble de signatures de méthodes, et un type l'implémente simplement en ayant ces méthodes : il n'y a pas de mot-clé implements. On peut donc définir de petites interfaces là où on les utilise, comme io.Reader et son unique méthode Read, et n'importe quel type qui a cette méthode convient, même s'il vient d'un autre package. Le code reste découplé et facile à tester avec de fausses implémentations.",
    ],
    [
      "pointers", "compare",
      "When do you pass a pointer rather than a value in Go?",
      "Quand passer un pointeur plutôt qu'une valeur en Go ?",
      "Go passes everything by value, so a function receives a copy. A pointer is passed when the function must modify the original, when the struct is large and copying it would be costly, or for consistency when the type's methods use pointer receivers. For small values and immutable data, passing by value is simpler and safer; slices, maps and channels already behave like references to shared data.",
      "Go passe tout par valeur, donc une fonction reçoit une copie. On passe un pointeur quand la fonction doit modifier l'original, quand la struct est grande et que la copier coûterait cher, ou par cohérence quand les méthodes du type utilisent des receivers pointeurs. Pour de petites valeurs et des données immuables, le passage par valeur est plus simple et plus sûr ; les slices, maps et channels se comportent déjà comme des références vers des données partagées.",
    ],
  ],
);

export const rust = defineTech(
  {
    id: "rust",
    label: same("Rust"),
    family: "language",
    tool: true,
    aliases: ["rust", "rustlang"],
  },
  [
    [
      "ownership", "concept",
      "What are ownership and borrowing in Rust?",
      "Que sont l'ownership et l'emprunt (borrowing) en Rust ?",
      "Each value has a single owner, a variable, and it is freed automatically when the owner goes out of scope; assigning it to another variable or passing it to a function moves the ownership. Borrowing uses a value through references without taking ownership: either many immutable references, or exactly one mutable reference at a time. The compiler checks these rules, so there is no garbage collector and no dangling pointer.",
      "Chaque valeur a un seul propriétaire, une variable, et elle est libérée automatiquement quand ce propriétaire sort de sa portée ; l'affecter à une autre variable ou la passer à une fonction déplace la propriété. L'emprunt utilise une valeur via des références sans en prendre la propriété : soit plusieurs références immuables, soit une seule référence modifiable à la fois. Le compilateur vérifie ces règles, donc il n'y a ni ramasse-miettes ni pointeur pendant.",
    ],
    [
      "vs-c", "compare",
      "How does Rust avoid the memory bugs common in C, without a garbage collector?",
      "Comment Rust évite-t-il les bugs mémoire fréquents en C, sans ramasse-miettes ?",
      "The ownership and borrowing rules are checked at compile time: no use after free, no double free, no unprotected data race between threads, and references always point to valid data. Array accesses are bounds-checked, there is no null, Option replaces it, and memory is freed automatically at the end of the owner's scope. Unsafe code is still possible, but explicit and confined to unsafe blocks.",
      "Les règles de propriété et d'emprunt sont vérifiées à la compilation : pas d'utilisation après libération, pas de double libération, pas d'accès concurrent non protégé entre threads, et les références pointent toujours vers des données valides. Les accès aux tableaux sont vérifiés, il n'y a pas de null, Option le remplace, et la mémoire est libérée automatiquement à la fin de la portée du propriétaire. Le code non sûr reste possible, mais explicite et limité aux blocs unsafe.",
    ],
    [
      "result-option", "best_practice",
      "How are errors handled with Result and Option, and what does the ? operator do?",
      "Comment gère-t-on les erreurs avec Result et Option, et que fait l'opérateur ? ?",
      "Option<T> is Some(value) or None, in place of null; Result<T, E> is Ok(value) or Err(error), for operations that can fail. The compiler forces both cases to be handled, with match, if let, or methods like map and unwrap_or. The ? operator returns the error to the caller right away if there is one, and otherwise unwraps the value, which keeps the code short.",
      "Option<T> vaut Some(valeur) ou None, à la place de null ; Result<T, E> vaut Ok(valeur) ou Err(erreur), pour les opérations qui peuvent échouer. Le compilateur oblige à traiter les deux cas, avec match, if let, ou des méthodes comme map et unwrap_or. L'opérateur ? renvoie tout de suite l'erreur à l'appelant s'il y en a une, et sinon extrait la valeur, ce qui garde le code court.",
    ],
    [
      "borrow-checker", "troubleshoot",
      "The borrow checker refuses your code. How do you usually get out of it?",
      "Le borrow checker refuse {votre|ton} code. Comment {vous en sortez-vous|t'en sors-tu} en général ?",
      "Read the error message carefully: it usually says which borrow conflicts with which, and suggests a fix. Common solutions: shorten the life of a borrow by reorganising the code, clone when the cost is acceptable, pass references instead of moving values, split a struct so that its fields are borrowed separately, or use Rc and RefCell, or Arc and Mutex across threads, when shared ownership is really needed.",
      "Lire attentivement le message d'erreur : il indique en général quel emprunt entre en conflit avec lequel, et propose une correction. Solutions courantes : raccourcir la durée d'un emprunt en réorganisant le code, cloner quand le coût est acceptable, passer des références au lieu de déplacer des valeurs, découper une struct pour emprunter ses champs séparément, ou utiliser Rc et RefCell, ou Arc et Mutex entre threads, quand une propriété partagée est vraiment nécessaire.",
    ],
  ],
);

export const odoo = defineTech(
  {
    id: "odoo",
    label: same("Odoo"),
    family: "web",
    tool: true,
    aliases: ["odoo", "openerp"],
  },
  [
    [
      "module-structure", "concept",
      "How is an Odoo module organised: models, views, security, data?",
      "Comment un module Odoo est-il organisé : modèles, vues, sécurité, données ?",
      "An Odoo module is a Python package with a __manifest__.py that describes its name, dependencies and data files. models holds the Python classes that define the business objects and their fields; views holds the XML for forms, lists and menus; security holds the access rights, ir.model.access.csv, and the record rules; data holds default records. Installing the module creates the tables and loads the views.",
      "Un module Odoo est un package Python avec un __manifest__.py qui décrit son nom, ses dépendances et ses fichiers de données. models contient les classes Python qui définissent les objets métier et leurs champs ; views contient le XML des formulaires, listes et menus ; security contient les droits d'accès, ir.model.access.csv, et les règles d'enregistrement ; data contient des enregistrements par défaut. Installer le module crée les tables et charge les vues.",
    ],
    [
      "orm", "concept",
      "How does the Odoo ORM work? What are computed fields?",
      "Comment fonctionne l'ORM d'Odoo ? Que sont les champs calculés ?",
      "Models inherit from models.Model and declare fields, Char, Many2one, One2many and so on; the ORM creates the PostgreSQL tables and provides search, create, write and unlink on recordsets. A computed field gets its value from a method decorated with @api.depends, which lists the fields it depends on, so Odoo recomputes it when they change; with store=True it is saved in the database and becomes searchable.",
      "Les modèles héritent de models.Model et déclarent des champs, Char, Many2one, One2many, etc. ; l'ORM crée les tables PostgreSQL et fournit search, create, write et unlink sur des recordsets. Un champ calculé tire sa valeur d'une méthode décorée par @api.depends, qui liste les champs dont il dépend, pour qu'Odoo le recalcule quand ils changent ; avec store=True, il est enregistré en base et devient cherchable.",
    ],
    [
      "extend-model", "practice",
      "How would you add a field to an existing Odoo model and show it in a form view?",
      "Comment {ajouteriez-vous|ajouterais-tu} un champ à un modèle Odoo existant pour l'afficher dans une vue formulaire ?",
      "In my own module, which depends on the original one, a class with _inherit set to the existing model, for example _inherit = 'res.partner', adds the new field. Then an XML view inherits the existing form view, with inherit_id, and an xpath expression places the field after an existing one. Once the module is upgraded, the field appears without modifying Odoo's code.",
      "Dans mon propre module, qui dépend du module d'origine, une classe avec _inherit égal au modèle existant, par exemple _inherit = 'res.partner', ajoute le nouveau champ. Ensuite, une vue XML hérite de la vue formulaire existante, avec inherit_id, et une expression xpath place le champ après un champ existant. Une fois le module mis à jour, le champ apparaît sans modifier le code d'Odoo.",
    ],
    [
      "access-rights", "best_practice",
      "How do you control who can read or edit records in Odoo?",
      "Comment contrôler qui peut lire ou modifier des enregistrements dans Odoo ?",
      "With groups and two layers of rules. Access rights, in ir.model.access.csv, give each group read, write, create or delete permission on a whole model. Record rules then restrict which records a group sees, with a domain: for example, each member of the sales team only sees their own leads, or users only see their company's records. Field-level access uses the groups attribute on fields and views.",
      "Avec des groupes et deux niveaux de règles. Les droits d'accès, dans ir.model.access.csv, donnent à chaque groupe la lecture, l'écriture, la création ou la suppression sur un modèle entier. Les règles d'enregistrement limitent ensuite les enregistrements qu'un groupe voit, avec un domaine : par exemple, chaque membre de l'équipe commerciale ne voit que ses propres pistes, ou chaque personne ne voit que les enregistrements de sa société. L'accès au niveau des champs passe par l'attribut groups sur les champs et les vues.",
    ],
  ],
);
