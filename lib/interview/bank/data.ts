import { defineTech, same } from "./types";

// Databases: SQL, NoSQL, caches.

export const sql = defineTech(
  {
    id: "sql",
    label: same("SQL"),
    family: "data",
    tool: true,
    exact: ["oracle"],
    aliases: [
      "sql", "mysql", "mariadb", "postgresql", "postgres", "sql server", "mssql", "sqlite", "t-sql", "pl/sql", "plsql", "oracle database", "oracle db",
      "relational database", "relational databases", "base de donnees relationnelle", "bases de donnees relationnelles", "rdbms", "sgbd", "sgbdr",
    ],
  },
  [
    [
      "joins", "compare",
      "INNER JOIN or LEFT JOIN: what is the difference? Give an example with customers and orders.",
      "INNER JOIN ou LEFT JOIN : quelle est la différence ? {Donnez|Donne} un exemple avec des clients et des commandes.",
      "INNER JOIN keeps only the rows that match on both sides: the customers who have at least one order, with their orders. LEFT JOIN keeps every row of the left table and fills the right side with NULL when nothing matches: all the customers, including those who never ordered. A LEFT JOIN with WHERE orders.id IS NULL finds the customers without any order.",
      "INNER JOIN ne garde que les lignes qui correspondent des deux côtés : les clients qui ont au moins une commande, avec leurs commandes. LEFT JOIN garde toutes les lignes de la table de gauche et complète le côté droit avec NULL quand rien ne correspond : tous les clients, y compris ceux qui n'ont jamais commandé. Un LEFT JOIN avec WHERE commandes.id IS NULL trouve les clients sans aucune commande.",
    ],
    [
      "keys", "concept",
      "What are primary keys and foreign keys for?",
      "À quoi servent les clés primaires et les clés étrangères ?",
      "A primary key uniquely identifies each row of a table: unique, never null, and usually indexed. A foreign key is a column that references the primary key of another table, like orders.customer_id pointing to customers.id: the database then guarantees that every order belongs to an existing customer, and can refuse or cascade deletions.",
      "Une clé primaire identifie de façon unique chaque ligne d'une table : unique, jamais nulle, et en général indexée. Une clé étrangère est une colonne qui référence la clé primaire d'une autre table, comme commandes.client_id qui pointe vers clients.id : la base garantit alors que chaque commande appartient à un client existant, et peut refuser ou propager les suppressions.",
    ],
    [
      "indexes", "concept",
      "What is an index, why does it speed up reads, and what does it cost?",
      "Qu'est-ce qu'un index, pourquoi accélère-t-il les lectures, et quel est son coût ?",
      "An index is a separate structure, usually a B-tree, that keeps the values of one or more columns sorted with a pointer to the rows, like the index of a book: the database finds the rows without scanning the whole table. The cost: more disk space, and slower inserts, updates and deletes, because every index must be updated too. So I index the columns used in frequent WHERE, JOIN and ORDER BY clauses, not everything.",
      "Un index est une structure à part, souvent un arbre B, qui garde les valeurs d'une ou plusieurs colonnes triées avec un pointeur vers les lignes, comme l'index d'un livre : la base trouve les lignes sans parcourir toute la table. Le coût : plus d'espace disque, et des insertions, mises à jour et suppressions plus lentes, car chaque index doit aussi être mis à jour. J'indexe donc les colonnes utilisées dans les WHERE, JOIN et ORDER BY fréquents, pas tout.",
    ],
    [
      "group-by", "practice",
      "How would you list the customers who placed more than five orders? What is the difference between WHERE and HAVING?",
      "Comment lister les clients qui ont passé plus de cinq commandes ? Quelle est la différence entre WHERE et HAVING ?",
      "SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING COUNT(*) > 5, with a join to customers if I need their names. WHERE filters the rows before grouping, so it cannot use an aggregate; HAVING filters the groups after aggregation, so that is where COUNT(*) > 5 goes.",
      "SELECT client_id, COUNT(*) FROM commandes GROUP BY client_id HAVING COUNT(*) > 5, avec une jointure sur les clients si j'ai besoin de leurs noms. WHERE filtre les lignes avant le regroupement, donc il ne peut pas utiliser un agrégat ; HAVING filtre les groupes après l'agrégation, c'est donc là que va COUNT(*) > 5.",
    ],
    [
      "normalisation", "concept",
      "What is normalisation, and when is it acceptable to denormalise?",
      "Qu'est-ce que la normalisation, et quand est-il acceptable de dénormaliser ?",
      "Normalisation organises tables so that each piece of information is stored once: no repeated groups, every column depends on the whole key and only on the key, up to the third normal form. It avoids inconsistencies, like a customer's address updated in one row but not in another. Denormalising, duplicating data on purpose, can be acceptable for read performance, in reporting tables or caches, as long as the duplication is under control.",
      "La normalisation organise les tables pour que chaque information ne soit stockée qu'une fois : pas de groupes répétés, chaque colonne dépend de toute la clé et seulement de la clé, jusqu'à la troisième forme normale. Elle évite les incohérences, comme l'adresse d'un client modifiée sur une ligne mais pas sur une autre. Dénormaliser, dupliquer volontairement des données, peut être acceptable pour les performances en lecture, dans des tables de reporting ou des caches, tant que la duplication est maîtrisée.",
    ],
    [
      "transactions", "concept",
      "What is a transaction, and what do the four letters of ACID mean?",
      "Qu'est-ce qu'une transaction, et que signifient les quatre lettres d'ACID ?",
      "A transaction groups several operations that must succeed or fail together, like debiting one account and crediting another. ACID: Atomicity, all or nothing; Consistency, the constraints still hold afterwards; Isolation, concurrent transactions do not see each other's intermediate states, depending on the isolation level; Durability, once committed, the change survives a crash.",
      "Une transaction regroupe plusieurs opérations qui doivent réussir ou échouer ensemble, comme débiter un compte et en créditer un autre. ACID : Atomicité, tout ou rien ; Cohérence, les contraintes restent respectées après ; Isolation, les transactions concurrentes ne voient pas les états intermédiaires des autres, selon le niveau d'isolation ; Durabilité, une fois validée, la modification survit à une panne.",
    ],
    [
      "injection", "best_practice",
      "What is SQL injection, and how do you protect an application against it?",
      "Qu'est-ce qu'une injection SQL, et comment en protéger une application ?",
      "SQL injection happens when user input is pasted into the text of a query: an attacker can change the query, for example with ' OR '1'='1, and read or delete data. The protection is parameterised queries, or prepared statements, where the input is always sent as a value and never read as SQL; ORMs do it for you. Add input validation, and a database account with only the rights it needs.",
      "Une injection SQL se produit quand une saisie de l'utilisateur est collée dans le texte d'une requête : un attaquant peut modifier la requête, par exemple avec ' OR '1'='1, et lire ou supprimer des données. La protection, ce sont les requêtes paramétrées, ou requêtes préparées, où la saisie est toujours envoyée comme valeur et jamais lue comme du SQL ; les ORM le font pour nous. On ajoute la validation des entrées, et un compte de base de données qui n'a que les droits nécessaires.",
    ],
    [
      "slow-query", "troubleshoot",
      "A query that used to be fast now takes ten seconds. How do you investigate?",
      "Une requête qui était rapide prend maintenant dix secondes. Comment {enquêtez-vous|enquêtes-tu} ?",
      "I run EXPLAIN, or EXPLAIN ANALYZE, to see the execution plan: a full table scan where an index was used before, a bad join order or a huge sort. Then I look for what changed: the data volume grew, an index was dropped, the statistics are outdated, or the query itself changed. The usual fixes: add or adapt an index, refresh the statistics, rewrite the query, or paginate the results.",
      "Je lance EXPLAIN, ou EXPLAIN ANALYZE, pour voir le plan d'exécution : un parcours complet de la table là où un index servait avant, un mauvais ordre de jointure ou un tri énorme. Ensuite je cherche ce qui a changé : le volume de données a grossi, un index a été supprimé, les statistiques sont périmées, ou la requête elle-même a changé. Les corrections habituelles : ajouter ou adapter un index, mettre à jour les statistiques, réécrire la requête, ou paginer les résultats.",
    ],
    [
      "shop-schema", "design",
      "How would you design the tables of a small online shop: customers, products, orders?",
      "Comment {concevriez-vous|concevrais-tu} les tables d'une petite boutique en ligne : clients, produits, commandes ?",
      "A customers table with an id, a name and a unique e-mail; a products table with an id, a name, a price and a stock; an orders table with an id, a customer_id foreign key, a date and a status; and an order_items table linking an order to products, with the quantity and the unit price at the time of purchase, because prices change. Indexes on the foreign keys, and constraints such as a quantity above zero.",
      "Une table clients avec un identifiant, un nom et un e-mail unique ; une table produits avec un identifiant, un nom, un prix et un stock ; une table commandes avec un identifiant, une clé étrangère client_id, une date et un statut ; et une table lignes_commande qui relie une commande aux produits, avec la quantité et le prix unitaire au moment de l'achat, car les prix changent. Des index sur les clés étrangères, et des contraintes comme une quantité supérieure à zéro.",
    ],
    [
      "delete-truncate-drop", "compare",
      "What is the difference between DELETE, TRUNCATE and DROP?",
      "Quelle est la différence entre DELETE, TRUNCATE et DROP ?",
      "DELETE removes the rows matching a WHERE clause, one by one: it can filter, triggers run, and it can be rolled back. TRUNCATE empties the whole table at once, much faster, with no WHERE, and resets the auto-increment counter in many databases. DROP removes the table itself, structure and data. And with DELETE, never forget the WHERE.",
      "DELETE supprime les lignes qui correspondent à une clause WHERE, une par une : on peut filtrer, les triggers s'exécutent, et on peut annuler. TRUNCATE vide toute la table d'un coup, beaucoup plus vite, sans WHERE, et remet à zéro le compteur d'auto-incrément dans beaucoup de bases. DROP supprime la table elle-même, structure et données. Et avec DELETE, ne jamais oublier le WHERE.",
    ],
  ],
);

export const nosql = defineTech(
  {
    id: "nosql",
    label: same("NoSQL"),
    family: "data",
    tool: true,
    aliases: ["nosql", "mongodb", "mongo", "mongoose", "cassandra", "dynamodb", "couchdb", "couchbase", "firestore", "neo4j", "elasticsearch"],
  },
  [
    [
      "vs-sql", "compare",
      "SQL or NoSQL: how do you choose for a new project?",
      "SQL ou NoSQL : comment choisir pour un nouveau projet ?",
      "SQL databases suit structured data with relationships and strong consistency, like orders, invoices or users, with joins and transactions. NoSQL databases suit flexible or nested data, very high write volumes, or simple access patterns at large scale: documents for catalogues or content, key-value for caches and sessions. For most new projects a relational database is a safe default, unless the data or the scale really calls for something else.",
      "Les bases SQL conviennent aux données structurées avec des relations et une cohérence forte, comme des commandes, des factures ou des utilisateurs, avec des jointures et des transactions. Les bases NoSQL conviennent aux données souples ou imbriquées, aux volumes d'écriture très élevés, ou à des accès simples à grande échelle : documents pour des catalogues ou du contenu, clé-valeur pour des caches et des sessions. Pour la plupart des nouveaux projets, une base relationnelle est un choix sûr, sauf si les données ou l'échelle demandent vraiment autre chose.",
    ],
    [
      "document-model", "concept",
      "How is data modelled in a document database such as MongoDB? Embed or reference?",
      "Comment modélise-t-on les données dans une base orientée documents comme MongoDB ? Imbriquer ou référencer ?",
      "Data is stored as JSON-like documents, and the model follows how the application reads it. You embed what is read together and belongs to the parent, like the lines of an order inside the order. You reference, with an id, what is shared, large or grows without limit, like the customer of many orders. A document also has a size limit, 16 MB in MongoDB, another reason not to embed without bounds.",
      "Les données sont stockées sous forme de documents proches du JSON, et le modèle suit la façon dont l'application les lit. On imbrique ce qui est lu ensemble et appartient au parent, comme les lignes d'une commande dans la commande. On référence, avec un identifiant, ce qui est partagé, volumineux ou grossit sans limite, comme le client de nombreuses commandes. Un document a aussi une taille limite, 16 Mo dans MongoDB, une raison de plus de ne pas imbriquer sans limite.",
    ],
    [
      "families", "compare",
      "Document, key-value, wide-column, graph: what is each kind of NoSQL database good at?",
      "Documents, clé-valeur, colonnes, graphe : dans quoi chaque famille de base NoSQL excelle-t-elle ?",
      "Document databases, like MongoDB, store flexible JSON-like records: content, catalogues, profiles. Key-value stores, like Redis, are extremely fast for lookups by key: caches, sessions, counters. Wide-column stores, like Cassandra, absorb huge write volumes spread over many servers: logs, time series, IoT. Graph databases, like Neo4j, are made for relationships: social networks, recommendations, fraud detection.",
      "Les bases orientées documents, comme MongoDB, stockent des enregistrements souples proches du JSON : contenus, catalogues, profils. Les bases clé-valeur, comme Redis, sont extrêmement rapides pour les recherches par clé : caches, sessions, compteurs. Les bases orientées colonnes, comme Cassandra, absorbent d'énormes volumes d'écriture répartis sur beaucoup de serveurs : logs, séries temporelles, IoT. Les bases graphe, comme Neo4j, sont faites pour les relations : réseaux sociaux, recommandations, détection de fraude.",
    ],
    [
      "cap", "concept",
      "What does the CAP theorem say, in simple words?",
      "Que dit le théorème CAP, en termes simples ?",
      "In a distributed database, when the network splits the nodes into groups that cannot talk to each other, a partition, you must choose between consistency, every read sees the latest write, and availability, every request still gets an answer. You cannot have both during the partition. Some databases favour consistency, others availability with eventual consistency, and many let you tune it per operation.",
      "Dans une base distribuée, quand le réseau sépare les nœuds en groupes qui ne peuvent plus communiquer, une partition, il faut choisir entre la cohérence, chaque lecture voit la dernière écriture, et la disponibilité, chaque requête obtient quand même une réponse. On ne peut pas avoir les deux pendant la partition. Certaines bases privilégient la cohérence, d'autres la disponibilité avec une cohérence à terme, et beaucoup permettent de régler ça par opération.",
    ],
    [
      "collection-scan", "troubleshoot",
      "A MongoDB query scans the whole collection. How do you spot it, and how do you fix it?",
      "Une requête MongoDB parcourt toute la collection. Comment le repérer, et comment corriger ça ?",
      "explain() on the query shows a COLLSCAN, a full scan, instead of an IXSCAN, and the number of documents examined compared with the number returned; the profiler or the slow query log find such queries. The fix is an index on the filtered fields, or a compound index in the right order, equality first, then sort, then range, checked again with explain().",
      "explain() sur la requête montre un COLLSCAN, un parcours complet, au lieu d'un IXSCAN, et le nombre de documents examinés comparé au nombre renvoyé ; le profiler ou le journal des requêtes lentes repèrent ce genre de requêtes. La correction : un index sur les champs filtrés, ou un index composé dans le bon ordre, égalité d'abord, puis tri, puis intervalle, vérifié à nouveau avec explain().",
    ],
  ],
);

export const redis = defineTech(
  {
    id: "redis",
    label: same("Redis"),
    family: "data",
    tool: true,
    aliases: ["redis", "memcached", "valkey"],
  },
  [
    [
      "uses", "concept",
      "What is Redis usually used for, and why is it so fast?",
      "À quoi sert généralement Redis, et pourquoi est-il si rapide ?",
      "Redis is an in-memory key-value store, used as a cache in front of a database, and for sessions, rate limiting, counters, leaderboards, queues and pub/sub messaging. It is fast because everything is in RAM, its data structures are simple and efficient, and it processes commands on a single thread, which avoids locks.",
      "Redis est une base clé-valeur en mémoire, utilisée comme cache devant une base de données, et pour les sessions, la limitation de débit, les compteurs, les classements, les files d'attente et la messagerie pub/sub. Il est rapide parce que tout est en RAM, que ses structures de données sont simples et efficaces, et qu'il traite les commandes sur un seul thread, ce qui évite les verrous.",
    ],
    [
      "invalidation", "best_practice",
      "How do you keep a cache consistent with the database? What is cache invalidation?",
      "Comment garder un cache cohérent avec la base de données ? Qu'est-ce que l'invalidation de cache ?",
      "The common pattern is cache-aside: read from the cache, and on a miss read the database and store the result with a TTL. When the data changes, the cache entry is deleted or updated right after the write to the database, and the TTL limits how long stale data can survive if something is missed. Invalidation is hard because every write path must think about it, so keys stay simple and TTLs reasonable.",
      "Le schéma courant est le cache-aside : lire dans le cache, et en cas d'absence lire la base puis stocker le résultat avec un TTL. Quand la donnée change, l'entrée du cache est supprimée ou mise à jour juste après l'écriture en base, et le TTL limite la durée de vie d'une donnée périmée si quelque chose est oublié. L'invalidation est difficile parce que chaque chemin d'écriture doit y penser, donc les clés restent simples et les TTL raisonnables.",
    ],
    [
      "eviction", "concept",
      "What happens when Redis runs out of memory? What are TTLs and eviction policies?",
      "Que se passe-t-il quand Redis manque de mémoire ? Que sont les TTL et les politiques d'éviction ?",
      "A TTL is an expiry time on a key: Redis deletes the key when it expires. When memory reaches maxmemory, the eviction policy decides: noeviction refuses new writes, allkeys-lru removes the least recently used keys, volatile-lru does the same only among keys with a TTL, and there are LFU and random variants. For a pure cache, allkeys-lru is a common choice.",
      "Un TTL est une durée d'expiration sur une clé : Redis supprime la clé quand elle expire. Quand la mémoire atteint maxmemory, la politique d'éviction décide : noeviction refuse les nouvelles écritures, allkeys-lru supprime les clés les moins récemment utilisées, volatile-lru fait de même seulement parmi les clés qui ont un TTL, et il existe des variantes LFU et aléatoires. Pour un cache pur, allkeys-lru est un choix courant.",
    ],
    [
      "persistence", "concept",
      "Does Redis lose its data when it restarts? What are RDB and AOF?",
      "Redis perd-il ses données quand il redémarre ? Que sont RDB et AOF ?",
      "Not necessarily: it lives in memory, but it can persist. RDB takes snapshots of the data at intervals: compact and fast to reload, but the last minutes can be lost. AOF, the append-only file, logs every write and replays it at startup: less data lost, with a configurable fsync, but bigger files. Both can be combined, and a pure cache may use neither.",
      "Pas forcément : il vit en mémoire, mais il peut persister. RDB prend des instantanés des données à intervalles réguliers : compact et rapide à recharger, mais on peut perdre les dernières minutes. AOF, le fichier en ajout seul, enregistre chaque écriture et la rejoue au démarrage : moins de données perdues, avec un fsync configurable, mais des fichiers plus gros. On peut combiner les deux, et un cache pur peut n'utiliser ni l'un ni l'autre.",
    ],
  ],
);
