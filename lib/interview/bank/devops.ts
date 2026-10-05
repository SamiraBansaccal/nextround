import { defineTech, same } from "./types";

// DevOps: containers, orchestration, pipelines, Git, Linux, infrastructure as code, cloud, networks.

export const docker = defineTech(
  {
    id: "docker",
    label: same("Docker"),
    family: "devops",
    tool: true,
    aliases: [
      "docker", "docker compose", "docker-compose", "dockerfile", "podman", "container", "containers", "containerization", "containerisation",
      "containerized", "containerised", "conteneur", "conteneurs", "conteneurisation", "conteneurise", "conteneurisee",
    ],
  },
  [
    [
      "image-vs-container", "compare",
      "What is the difference between an image and a container?",
      "Quelle est la différence entre une image et un conteneur ?",
      "An image is a read-only template: the application, its dependencies and its configuration, built in layers from a Dockerfile. A container is a running instance of an image, with its own writable layer, processes and network. You can start many containers from one image, and what a container writes disappears with it unless it is stored in a volume.",
      "Une image est un modèle en lecture seule : l'application, ses dépendances et sa configuration, construite en couches à partir d'un Dockerfile. Un conteneur est une instance en cours d'exécution d'une image, avec sa propre couche inscriptible, ses processus et son réseau. On peut lancer plusieurs conteneurs à partir d'une image, et ce qu'un conteneur écrit disparaît avec lui, sauf si c'est stocké dans un volume.",
    ],
    [
      "container-vs-vm", "compare",
      "How is a container different from a virtual machine?",
      "En quoi un conteneur est-il différent d'une machine virtuelle ?",
      "A virtual machine emulates a whole computer and runs its own operating system kernel on a hypervisor, so it is heavy and slow to boot. A container shares the host's kernel and only isolates processes, with namespaces and cgroups: it starts in seconds and uses far less memory. The trade-off is weaker isolation than a VM, and a Linux container needs a Linux kernel.",
      "Une machine virtuelle émule un ordinateur complet et fait tourner son propre noyau sur un hyperviseur : elle est lourde et lente à démarrer. Un conteneur partage le noyau de l'hôte et isole seulement les processus, avec les namespaces et les cgroups : il démarre en quelques secondes et consomme bien moins de mémoire. En contrepartie, l'isolation est plus faible qu'avec une VM, et un conteneur Linux a besoin d'un noyau Linux.",
    ],
    [
      "layers", "best_practice",
      "How do Dockerfile layers and the build cache work, and in which order do you write instructions to build faster?",
      "Comment fonctionnent les couches d'un Dockerfile et le cache de build, et dans quel ordre écrire les instructions pour construire plus vite ?",
      "Each instruction of a Dockerfile creates a layer, and Docker reuses a cached layer as long as the instruction and its inputs have not changed; once a layer changes, every layer after it is rebuilt. So what changes least goes first: the base image, the system packages, then only the dependency files and their installation, and the source code last. Combining commands in one RUN also avoids useless layers.",
      "Chaque instruction d'un Dockerfile crée une couche, et Docker réutilise une couche en cache tant que l'instruction et ses entrées n'ont pas changé ; dès qu'une couche change, toutes les suivantes sont reconstruites. Ce qui change le moins vient donc en premier : l'image de base, les paquets système, puis seulement les fichiers de dépendances et leur installation, et le code source en dernier. Regrouper des commandes dans un même RUN évite aussi des couches inutiles.",
    ],
    [
      "cmd-entrypoint", "compare",
      "What is the difference between CMD and ENTRYPOINT?",
      "Quelle est la différence entre CMD et ENTRYPOINT ?",
      "ENTRYPOINT defines the executable the container always runs; CMD gives default arguments, or a default command when there is no ENTRYPOINT, and whatever you pass to docker run replaces it. A common pattern is ENTRYPOINT for the program and CMD for its default options. I use the exec form, with brackets, so that the process receives signals properly.",
      "ENTRYPOINT définit l'exécutable que le conteneur lance toujours ; CMD donne des arguments par défaut, ou une commande par défaut s'il n'y a pas d'ENTRYPOINT, et ce qu'on passe à docker run le remplace. Un schéma courant : ENTRYPOINT pour le programme et CMD pour ses options par défaut. J'utilise la forme exec, avec des crochets, pour que le processus reçoive correctement les signaux.",
    ],
    [
      "volumes", "compare",
      "Volumes or bind mounts: how do you keep a database's data when its container is recreated?",
      "Volumes ou bind mounts : comment garder les données d'une base quand son conteneur est recréé ?",
      "A named volume is storage managed by Docker, independent of any container: mounted on the database's data directory, it keeps the data when the container is removed and recreated. A bind mount maps a precise folder of the host into the container: handy in development to edit code live, but it depends on the host's paths and permissions. For a database, a named volume is the usual choice.",
      "Un volume nommé est un stockage géré par Docker, indépendant de tout conteneur : monté sur le dossier de données de la base, il garde les données quand le conteneur est supprimé puis recréé. Un bind mount relie un dossier précis de l'hôte au conteneur : pratique en développement pour modifier le code en direct, mais il dépend des chemins et des permissions de l'hôte. Pour une base de données, le volume nommé est le choix habituel.",
    ],
    [
      "compose", "practice",
      "How would you run a web application, its database and a reverse proxy together with Docker Compose?",
      "Comment {feriez-vous|ferais-tu} tourner ensemble une application web, sa base de données et un reverse proxy avec Docker Compose ?",
      "One docker-compose.yml with three services: the application built from its Dockerfile, the database from an official image with a named volume for its data, and Nginx as the reverse proxy, the only one publishing a port to the outside. They share a network and reach each other by service name; the configuration comes from environment variables or an .env file kept out of Git, and restart policies and health checks bring everything back up.",
      "Un fichier docker-compose.yml avec trois services : l'application construite depuis son Dockerfile, la base depuis une image officielle avec un volume nommé pour ses données, et Nginx comme reverse proxy, le seul qui publie un port vers l'extérieur. Ils partagent un réseau et se joignent par le nom de service ; la configuration vient de variables d'environnement ou d'un fichier .env gardé hors de Git, et des politiques de redémarrage et des health checks relancent le tout.",
    ],
    [
      "exits-at-start", "troubleshoot",
      "Your container stops right after it starts. What do you check?",
      "{Votre|Ton} conteneur s'arrête juste après avoir démarré. Que {vérifiez-vous|vérifies-tu} ?",
      "First docker ps -a for the exit code, and docker logs for the error message. A container lives as long as its main process: if the command finishes, or if the process goes to the background as a daemon, the container stops. Then I check the command and the entrypoint, missing environment variables or files, and permissions; docker run -it with a shell lets me replay the start by hand.",
      "D'abord docker ps -a pour le code de sortie, et docker logs pour le message d'erreur. Un conteneur vit aussi longtemps que son processus principal : si la commande se termine, ou si le processus passe en arrière-plan comme un démon, le conteneur s'arrête. Ensuite je vérifie la commande et l'entrypoint, les variables d'environnement ou fichiers manquants, et les permissions ; docker run -it avec un shell permet de rejouer le démarrage à la main.",
    ],
    [
      "pid-1", "concept",
      "Why should the main process of a container run in the foreground, and what is special about PID 1?",
      "Pourquoi le processus principal d'un conteneur doit-il tourner au premier plan, et qu'a de particulier le PID 1 ?",
      "The container stops as soon as its main process exits: if a service puts itself in the background, the main process ends and the container dies, which is why Nginx runs with daemon off, for example. PID 1 is also special: it receives the stop signals and must reap zombie processes, and it ignores the signals it has no handler for, so a script running as PID 1 can block a clean stop. Using exec in scripts, or an init such as tini, solves it.",
      "Le conteneur s'arrête dès que son processus principal se termine : si un service se met en arrière-plan, le processus principal finit et le conteneur meurt, c'est pour ça qu'on lance Nginx avec daemon off, par exemple. Le PID 1 est aussi particulier : il reçoit les signaux d'arrêt et doit récupérer les processus zombies, et il ignore les signaux qu'il ne gère pas, donc un script en PID 1 peut empêcher un arrêt propre. Utiliser exec dans les scripts, ou un init comme tini, règle le problème.",
    ],
    [
      "image-size", "best_practice",
      "Your image weighs 1.5 GB. How do you make it smaller?",
      "{Votre|Ton} image pèse 1,5 Go. Comment la réduire ?",
      "Start from a smaller base image, like a slim or Alpine variant, and use a multi-stage build: compilers and build tools stay in the first stage, and only the result is copied into the final image. Install only the production dependencies, clean the package caches in the same RUN, and add a .dockerignore so that node_modules, .git or test files are not copied. docker history shows which layers weigh the most.",
      "Partir d'une image de base plus petite, comme une variante slim ou Alpine, et utiliser un build multi-étapes : compilateurs et outils de build restent dans la première étape, et seul le résultat est copié dans l'image finale. Installer seulement les dépendances de production, vider les caches des paquets dans le même RUN, et ajouter un .dockerignore pour ne pas copier node_modules, .git ou les fichiers de test. docker history montre les couches les plus lourdes.",
    ],
    [
      "networks", "concept",
      "How do containers on the same Docker network talk to each other?",
      "Comment des conteneurs d'un même réseau Docker communiquent-ils entre eux ?",
      "On a user-defined network, Docker provides a built-in DNS: containers reach each other by service or container name, on the port the application listens to inside the container, without publishing anything. Publishing a port with -p is only needed to reach a container from the host or from outside. Separate networks can isolate, for example, the database from the public-facing proxy.",
      "Sur un réseau défini par l'utilisateur, Docker fournit un DNS intégré : les conteneurs se joignent par le nom du service ou du conteneur, sur le port où l'application écoute dans le conteneur, sans rien publier. Publier un port avec -p ne sert qu'à joindre un conteneur depuis l'hôte ou l'extérieur. Des réseaux séparés peuvent isoler, par exemple, la base de données du proxy exposé au public.",
    ],
    [
      "secrets", "best_practice",
      "Where should passwords and API keys go when you containerise an application, and where should they never go?",
      "Où mettre les mots de passe et les clés d'API quand on conteneurise une application, et où ne jamais les mettre ?",
      "Never in the image: not in the Dockerfile, not through ENV or a build argument, not in a copied file, because anyone who gets the image can read its layers. Secrets are given at runtime: environment variables from an .env file kept out of Git, Docker or Compose secrets mounted as files, or a secret manager in production.",
      "Jamais dans l'image : ni dans le Dockerfile, ni via ENV ou un argument de build, ni dans un fichier copié, car quiconque récupère l'image peut lire ses couches. Les secrets sont fournis à l'exécution : variables d'environnement venant d'un fichier .env gardé hors de Git, secrets Docker ou Compose montés comme fichiers, ou gestionnaire de secrets en production.",
    ],
  ],
);

export const kubernetes = defineTech(
  {
    id: "kubernetes",
    label: same("Kubernetes"),
    family: "devops",
    tool: true,
    aliases: ["kubernetes", "k8s", "k3s", "kubectl", "helm", "openshift", "aks", "eks", "gke"],
  },
  [
    [
      "why", "concept",
      "What problem does Kubernetes solve compared with running containers by hand?",
      "Quel problème Kubernetes résout-il par rapport à des conteneurs lancés à la main ?",
      "Running containers by hand works on one machine, but you must restart them when they crash, spread them across servers, update them without downtime and route traffic to them. Kubernetes does all that declaratively: you describe the desired state, for example three replicas of this image, and it keeps reality matching it, with self-healing, scheduling, rolling updates, service discovery and scaling.",
      "Lancer des conteneurs à la main fonctionne sur une machine, mais il faut les relancer quand ils plantent, les répartir sur plusieurs serveurs, les mettre à jour sans coupure et diriger le trafic vers eux. Kubernetes fait tout ça de façon déclarative : on décrit l'état voulu, par exemple trois réplicas de cette image, et il fait en sorte que la réalité y corresponde, avec auto-réparation, placement, rolling updates, découverte de services et mise à l'échelle.",
    ],
    [
      "objects", "compare",
      "Pod, Deployment, Service: what is each one for?",
      "Pod, Deployment, Service : à quoi sert chacun ?",
      "A Pod is the smallest unit: one or a few containers that share a network address and volumes, and pods are disposable. A Deployment manages identical pods through a ReplicaSet: it keeps the right number running and handles rolling updates. A Service gives a stable name and IP address in front of a changing set of pods, selected by labels, and spreads the traffic between them.",
      "Un Pod est la plus petite unité : un ou quelques conteneurs qui partagent une adresse réseau et des volumes, et les pods sont jetables. Un Deployment gère des pods identiques via un ReplicaSet : il en maintient le bon nombre et gère les rolling updates. Un Service donne un nom et une adresse IP stables devant un ensemble de pods qui change, sélectionnés par des labels, et répartit le trafic entre eux.",
    ],
    [
      "crashloop", "troubleshoot",
      "A pod is in CrashLoopBackOff. Which kubectl commands do you run, and in what order?",
      "Un pod est en CrashLoopBackOff. Quelles commandes kubectl {lancez-vous|lances-tu}, et dans quel ordre ?",
      "kubectl describe pod for the events, the exit code and the reason, such as OOMKilled or a failed probe; then kubectl logs, and kubectl logs --previous for the container that crashed. Then I check the image and its command, the environment variables, the ConfigMaps and Secrets it needs, the resource limits, and the liveness probe, which can kill a container that is simply slow to start.",
      "kubectl describe pod pour les événements, le code de sortie et la raison, comme OOMKilled ou une sonde en échec ; puis kubectl logs, et kubectl logs --previous pour le conteneur qui a planté. Ensuite je vérifie l'image et sa commande, les variables d'environnement, les ConfigMaps et Secrets dont il a besoin, les limites de ressources, et la liveness probe, qui peut tuer un conteneur simplement lent à démarrer.",
    ],
    [
      "probes", "compare",
      "What is the difference between a liveness probe and a readiness probe?",
      "Quelle est la différence entre une liveness probe et une readiness probe ?",
      "The liveness probe checks that the container is still alive: if it fails, Kubernetes restarts the container. The readiness probe checks that it can serve traffic: if it fails, the pod is removed from the Service's endpoints but not restarted, for example while it warms up or when it loses its database. A startup probe protects slow-starting applications from being killed by the liveness probe.",
      "La liveness probe vérifie que le conteneur est toujours vivant : si elle échoue, Kubernetes le redémarre. La readiness probe vérifie qu'il peut recevoir du trafic : si elle échoue, le pod est retiré des endpoints du Service mais pas redémarré, par exemple pendant son démarrage ou quand il perd sa base de données. Une startup probe évite qu'une application lente à démarrer soit tuée par la liveness probe.",
    ],
    [
      "configuration", "practice",
      "How do you give configuration and secrets to an application running in Kubernetes?",
      "Comment fournir la configuration et les secrets à une application qui tourne dans Kubernetes ?",
      "Non-sensitive settings go in a ConfigMap, and passwords and keys in a Secret; both are injected as environment variables or mounted as files in the pod, so the image stays the same in every environment. Secrets are only base64-encoded by default, so access must be restricted with RBAC and encryption at rest enabled; in production they often come from an external manager such as Vault or the cloud's secret store.",
      "Les réglages non sensibles vont dans une ConfigMap, et les mots de passe et clés dans un Secret ; les deux sont injectés comme variables d'environnement ou montés comme fichiers dans le pod, donc l'image reste la même dans tous les environnements. Les Secrets ne sont qu'encodés en base64 par défaut : il faut restreindre l'accès avec RBAC et activer le chiffrement au repos ; en production, ils viennent souvent d'un gestionnaire externe comme Vault ou celui du cloud.",
    ],
    [
      "scaling", "concept",
      "How does Kubernetes scale an application up and down?",
      "Comment Kubernetes augmente-t-il ou réduit-il le nombre d'instances d'une application ?",
      "By hand, by changing the number of replicas of the Deployment. Automatically, the Horizontal Pod Autoscaler adds or removes pods based on metrics, such as CPU usage compared with the requested resources, or custom metrics; when the nodes are full, a cluster autoscaler adds machines. For this to work, the application must be stateless and the resource requests must be set.",
      "À la main, en changeant le nombre de réplicas du Deployment. Automatiquement, le Horizontal Pod Autoscaler ajoute ou retire des pods selon des métriques, comme l'utilisation du CPU par rapport aux ressources demandées, ou des métriques personnalisées ; quand les nœuds sont pleins, un cluster autoscaler ajoute des machines. Pour que ça marche, l'application doit être sans état et les demandes de ressources doivent être définies.",
    ],
    [
      "rolling-update", "concept",
      "How does a rolling update work, and how do you roll back a bad release?",
      "Comment fonctionne un rolling update, et comment revenir en arrière après une mauvaise mise en production ?",
      "When the Deployment's image changes, Kubernetes creates new pods little by little and removes the old ones as the new ones become ready, following maxSurge and maxUnavailable, so the service stays up; readiness probes are what make it safe. kubectl rollout status follows the update, and if the new version is bad, kubectl rollout undo goes back to the previous ReplicaSet.",
      "Quand l'image du Deployment change, Kubernetes crée de nouveaux pods petit à petit et retire les anciens au fur et à mesure que les nouveaux sont prêts, selon maxSurge et maxUnavailable, donc le service reste disponible ; ce sont les readiness probes qui rendent ça sûr. kubectl rollout status suit la mise à jour, et si la nouvelle version est mauvaise, kubectl rollout undo revient au ReplicaSet précédent.",
    ],
    [
      "ingress", "concept",
      "How does traffic from the internet reach a pod? Where do Services and Ingress fit in?",
      "Comment le trafic venu d'internet arrive-t-il jusqu'à un pod ? Quel rôle jouent les Services et l'Ingress ?",
      "A ClusterIP Service is only reachable inside the cluster; a LoadBalancer Service asks the cloud provider for an external load balancer. An Ingress, served by an ingress controller such as Nginx or Traefik, routes HTTP traffic by host name and path to the right Services, and usually terminates TLS. So the path is: internet, load balancer, ingress controller, Service, then one of the pods.",
      "Un Service ClusterIP n'est joignable qu'à l'intérieur du cluster ; un Service LoadBalancer demande un répartiteur de charge externe au fournisseur cloud. Un Ingress, servi par un ingress controller comme Nginx ou Traefik, dirige le trafic HTTP selon le nom d'hôte et le chemin vers les bons Services, et termine en général le TLS. Le chemin est donc : internet, répartiteur de charge, ingress controller, Service, puis l'un des pods.",
    ],
    [
      "pending", "troubleshoot",
      "A pod stays in Pending. What are the usual reasons?",
      "Un pod reste en Pending. Quelles sont les raisons habituelles ?",
      "Pending means the pod has not been placed on any node, and kubectl describe pod says why: usually no node has enough CPU or memory for its resource requests, a PersistentVolumeClaim cannot be bound, a node selector, an affinity or a taint matches no node, or a quota is reached in the namespace. If the image cannot be pulled, the pod is already scheduled and shows ImagePullBackOff instead.",
      "Pending signifie que le pod n'a été placé sur aucun nœud, et kubectl describe pod en donne la raison : le plus souvent, aucun nœud n'a assez de CPU ou de mémoire pour ses demandes de ressources, un PersistentVolumeClaim ne peut pas être lié, un nodeSelector, une affinité ou un taint ne correspond à aucun nœud, ou un quota est atteint dans le namespace. Si l'image ne peut pas être téléchargée, le pod est déjà placé et affiche plutôt ImagePullBackOff.",
    ],
  ],
);

export const cicd = defineTech(
  {
    id: "cicd",
    label: same("CI/CD"),
    family: "devops",
    tool: false,
    aliases: [
      "ci/cd", "ci / cd", "ci-cd", "cicd", "continuous integration", "continuous delivery", "continuous deployment", "integration continue",
      "livraison continue", "deploiement continu", "github actions", "gitlab ci", "gitlab-ci", "jenkins", "azure devops", "circleci", "argo cd", "argocd",
      "hudson",
    ],
  },
  [
    [
      "ci-vs-cd", "compare",
      "What is the difference between continuous integration, continuous delivery and continuous deployment?",
      "Quelle est la différence entre intégration continue, livraison continue et déploiement continu ?",
      "Continuous integration means merging small changes often into the main branch, with an automatic build and tests on every push, so problems show up early. Continuous delivery goes further: every change that passes the pipeline is ready to deploy, and the release to production is one manual click. Continuous deployment removes that click: every change that passes goes to production automatically.",
      "L'intégration continue consiste à fusionner souvent de petites modifications dans la branche principale, avec un build et des tests automatiques à chaque push, pour détecter les problèmes tôt. La livraison continue va plus loin : chaque modification qui passe le pipeline est prête à être déployée, et la mise en production se fait en un clic. Le déploiement continu supprime ce clic : chaque modification validée part automatiquement en production.",
    ],
    [
      "pipeline", "design",
      "Which stages would you put in the pipeline of a small web application, and why in that order?",
      "Quelles étapes {mettriez-vous|mettrais-tu} dans le pipeline d'une petite application web, et pourquoi dans cet ordre ?",
      "First the fast checks: install the dependencies with a cache, lint, type-check and run the unit tests, so the pipeline fails within a minute when something is obviously broken. Then build the artifact or the Docker image, run integration or end-to-end tests against it, and scan the dependencies for vulnerabilities. Finally deploy to staging, run a smoke test, and promote the same artifact to production, often with a manual approval.",
      "D'abord les vérifications rapides : installer les dépendances avec un cache, lint, vérification de types et tests unitaires, pour que le pipeline échoue en une minute quand quelque chose est clairement cassé. Ensuite construire l'artefact ou l'image Docker, lancer des tests d'intégration ou de bout en bout dessus, et analyser les dépendances à la recherche de vulnérabilités. Enfin déployer en préproduction, faire un test rapide, puis promouvoir le même artefact en production, souvent avec une validation manuelle.",
    ],
    [
      "works-locally", "troubleshoot",
      "Everything passes on your machine, but the pipeline fails in CI. What do you look at?",
      "Tout passe sur {votre|ta} machine, mais le pipeline échoue en CI. Que {regardez-vous|regardes-tu} ?",
      "I read the CI logs from the first error, then compare the environments: versions of the language and tools, dependencies installed from the lock file rather than from my local cache, environment variables and secrets that exist on my machine but not in CI, the time zone or locale, file name case, and tests that depend on order or timing. Running the same commands in a clean container, with the CI's image, usually reproduces it.",
      "Je lis les logs de la CI depuis la première erreur, puis je compare les environnements : versions du langage et des outils, dépendances installées depuis le fichier de verrouillage et non depuis mon cache local, variables d'environnement et secrets présents sur ma machine mais pas en CI, fuseau horaire ou locale, casse des noms de fichiers, et tests qui dépendent de l'ordre ou du timing. Lancer les mêmes commandes dans un conteneur propre, avec l'image de la CI, reproduit en général le problème.",
    ],
    [
      "secrets", "best_practice",
      "How do you handle secrets, such as deployment keys, in a CI pipeline?",
      "Comment gérer les secrets, comme les clés de déploiement, dans un pipeline de CI ?",
      "They live in the CI platform's secret store, or are fetched from a vault, never written in the repository or the pipeline file. They are masked in the logs, given only to the jobs and branches that need them, with the least privilege possible, and rotated regularly. Even better, short-lived credentials through OpenID Connect avoid storing long-lived cloud keys at all.",
      "Ils sont dans le gestionnaire de secrets de la plateforme de CI, ou récupérés dans un coffre, jamais écrits dans le dépôt ou le fichier de pipeline. Ils sont masqués dans les logs, fournis seulement aux jobs et aux branches qui en ont besoin, avec le moins de privilèges possible, et renouvelés régulièrement. Encore mieux : des identifiants de courte durée via OpenID Connect évitent de stocker des clés cloud permanentes.",
    ],
    [
      "strategies", "compare",
      "Rolling, blue-green, canary: how do these deployment strategies differ?",
      "Rolling, blue-green, canary : en quoi ces stratégies de déploiement diffèrent-elles ?",
      "A rolling deployment replaces the instances a few at a time, so the old and new versions run side by side for a while. Blue-green keeps two full environments: the new version goes to the idle one, is tested, then the traffic switches at once, and switching back is instant. Canary first sends a small share of the traffic to the new version, watches errors and metrics, then increases it step by step.",
      "Un déploiement rolling remplace les instances quelques-unes à la fois, donc l'ancienne et la nouvelle version cohabitent un moment. Le blue-green garde deux environnements complets : la nouvelle version va sur celui qui est inactif, elle est testée, puis le trafic bascule d'un coup, et le retour arrière est immédiat. Le canary envoie d'abord une petite part du trafic vers la nouvelle version, surveille les erreurs et les métriques, puis l'augmente par étapes.",
    ],
    [
      "test-job", "practice",
      "How would you write a GitHub Actions or GitLab CI job that runs the tests on every pull request?",
      "Comment {écririez-vous|écrirais-tu} un job GitHub Actions ou GitLab CI qui lance les tests à chaque pull request ?",
      "With GitHub Actions, a workflow file in .github/workflows triggered on pull_request: a job on ubuntu-latest that checks out the code, sets up the right language version with a dependency cache, installs the dependencies from the lock file, then runs the linter and the tests. With branch protection, the pull request cannot be merged until that check passes.",
      "Avec GitHub Actions, un fichier de workflow dans .github/workflows déclenché sur pull_request : un job sur ubuntu-latest qui récupère le code, installe la bonne version du langage avec un cache des dépendances, installe les dépendances depuis le fichier de verrouillage, puis lance le linter et les tests. Avec une protection de branche, la pull request ne peut pas être fusionnée tant que cette vérification ne passe pas.",
    ],
    [
      "artifacts", "concept",
      "What is a build artifact, and why build it once and deploy the same artifact everywhere?",
      "Qu'est-ce qu'un artefact de build, et pourquoi le construire une seule fois puis déployer le même partout ?",
      "An artifact is the output of the build that gets deployed: a JAR, a binary, an archive or a Docker image, versioned and stored in a registry. Building it once and promoting the same artifact from staging to production guarantees that what was tested is exactly what runs in production; rebuilding for each environment could pick up different dependencies or code.",
      "Un artefact est le produit du build qu'on déploie : un JAR, un binaire, une archive ou une image Docker, versionné et stocké dans un registre. Le construire une seule fois et promouvoir le même artefact de la préproduction à la production garantit que ce qui a été testé est exactement ce qui tourne en production ; reconstruire pour chaque environnement pourrait embarquer des dépendances ou du code différents.",
    ],
    [
      "slow-pipeline", "best_practice",
      "The pipeline takes forty minutes. How would you speed it up?",
      "Le pipeline prend quarante minutes. Comment {l'accéléreriez-vous|l'accélérerais-tu} ?",
      "First measure which steps take the time. Then cache the dependencies and the Docker layers, run independent jobs in parallel, split the tests across several runners, and only run what the change affects when the tools allow it. Fast checks go first so the pipeline fails early, and slow end-to-end tests can run on merge or at night rather than on every push.",
      "D'abord mesurer quelles étapes prennent du temps. Ensuite mettre en cache les dépendances et les couches Docker, lancer en parallèle les jobs indépendants, répartir les tests sur plusieurs runners, et n'exécuter que ce que la modification touche quand les outils le permettent. Les vérifications rapides passent en premier pour échouer tôt, et les tests de bout en bout lents peuvent tourner à la fusion ou la nuit plutôt qu'à chaque push.",
    ],
  ],
);

export const git = defineTech(
  {
    id: "git",
    label: same("Git"),
    family: "devops",
    tool: true,
    aliases: ["git", "github", "gitlab", "bitbucket", "version control", "versioning", "gestion de versions", "controle de version"],
  },
  [
    [
      "merge-vs-rebase", "compare",
      "What is the difference between merge and rebase, and when is it better not to rebase?",
      "Quelle est la différence entre merge et rebase, et quand vaut-il mieux éviter de rebaser ?",
      "Merge joins two branches with a merge commit and keeps the history exactly as it happened. Rebase replays my commits on top of the other branch: the history is linear and cleaner, but the commits are rewritten. I never rebase commits that are already pushed and shared, because it breaks the others' history; rebasing my own local branch on main before opening a pull request is fine.",
      "Merge réunit deux branches avec un commit de fusion et garde l'historique exactement tel qu'il s'est passé. Rebase rejoue mes commits par-dessus l'autre branche : l'historique est linéaire et plus lisible, mais les commits sont réécrits. Je ne rebase jamais des commits déjà poussés et partagés, car ça casse l'historique des autres ; rebaser ma propre branche locale sur main avant d'ouvrir une pull request ne pose pas de problème.",
    ],
    [
      "conflicts", "practice",
      "Walk me through how you resolve a merge conflict.",
      "{Expliquez-moi|Explique-moi} comment {vous résolvez|tu résous} un conflit de merge.",
      "Git stops and lists the conflicting files. I open each one, read both versions between the markers and understand what each side meant to do, and sometimes ask the author of the other change. I write the combined result, remove the markers, run the build and the tests, then git add and continue the merge or the rebase. Merging small changes often keeps conflicts small.",
      "Git s'arrête et liste les fichiers en conflit. J'ouvre chacun d'eux, je lis les deux versions entre les marqueurs et je comprends ce que chaque côté voulait faire, et parfois je demande à l'auteur de l'autre modification. J'écris le résultat combiné, je retire les marqueurs, je lance le build et les tests, puis git add et je poursuis le merge ou le rebase. Fusionner souvent de petites modifications garde les conflits petits.",
    ],
    [
      "bad-commit", "troubleshoot",
      "You pushed a commit that breaks the build on a shared branch. How do you undo it safely?",
      "{Vous avez|Tu as} poussé sur une branche partagée un commit qui casse le build. Comment l'annuler proprement ?",
      "On a shared branch, I do not rewrite history: git revert creates a new commit that undoes the bad one, and I push it, so nobody's copy breaks. Then I tell the team, fix the problem properly on a branch, and add a test so it does not come back. A reset with a force push would only be acceptable on a branch nobody else uses.",
      "Sur une branche partagée, je ne réécris pas l'historique : git revert crée un nouveau commit qui annule le mauvais, et je le pousse, sans casser la copie de personne. Ensuite je préviens l'équipe, je corrige proprement le problème sur une branche, et j'ajoute un test pour qu'il ne revienne pas. Un reset avec push forcé ne serait acceptable que sur une branche que personne d'autre n'utilise.",
    ],
    [
      "branching", "best_practice",
      "Which branching strategy have you used, and how do you keep pull requests easy to review?",
      "Quelle stratégie de branches {avez-vous|as-tu} utilisée, et comment garder des pull requests faciles à relire ?",
      "A simple flow: main is always deployable, and each feature or fix gets a short-lived branch, merged through a pull request after review and a green CI. To keep pull requests easy to review: small and focused on one change, a clear description of what and why, refactoring and behaviour changes in separate commits, and the tests included.",
      "Un flux simple : main est toujours déployable, et chaque fonctionnalité ou correction a sa branche de courte durée, fusionnée via une pull request après relecture et une CI au vert. Pour garder les pull requests faciles à relire : petites et centrées sur une seule modification, une description claire du quoi et du pourquoi, le refactoring et les changements de comportement dans des commits séparés, et les tests inclus.",
    ],
    [
      "reset-vs-revert", "compare",
      "What is the difference between git reset and git revert?",
      "Quelle est la différence entre git reset et git revert ?",
      "git reset moves the branch pointer back to an earlier commit: with --soft the changes stay staged, with --mixed they stay in the working directory, with --hard they are thrown away. It rewrites history, so it is for local commits. git revert creates a new commit that applies the inverse of an old one: the history is kept, so it is the safe way to undo something already shared.",
      "git reset ramène le pointeur de branche sur un commit précédent : avec --soft les modifications restent indexées, avec --mixed elles restent dans le répertoire de travail, avec --hard elles sont perdues. Il réécrit l'historique, donc il sert pour des commits locaux. git revert crée un nouveau commit qui applique l'inverse d'un ancien : l'historique est conservé, c'est donc la façon sûre d'annuler quelque chose de déjà partagé.",
    ],
    [
      "leaked-password", "troubleshoot",
      "You realise a password was committed to the repository. What do you do?",
      "{Vous vous rendez|Tu te rends} compte qu'un mot de passe a été commité dans le dépôt. Que {faites-vous|fais-tu} ?",
      "I consider the password compromised and change it, or revoke the key, right away, because removing it from the code removes it neither from the history nor from the clones. Then I take it out of the code, move it to an environment variable or a secret manager, and clean the history with a tool like git filter-repo if needed. I also add secret scanning, for example a pre-commit hook, so it does not happen again.",
      "Je considère le mot de passe comme compromis et je le change, ou je révoque la clé, tout de suite, car le retirer du code ne le retire ni de l'historique ni des clones. Ensuite je le sors du code, je le place dans une variable d'environnement ou un gestionnaire de secrets, et je nettoie l'historique avec un outil comme git filter-repo si besoin. J'ajoute aussi une détection de secrets, par exemple un hook pre-commit, pour que ça ne se reproduise pas.",
    ],
    [
      "good-commits", "best_practice",
      "What makes a good commit and a good commit message?",
      "Qu'est-ce qu'un bon commit et un bon message de commit ?",
      "A good commit does one logical thing, builds and passes the tests, and is small enough to review or revert on its own. The message has a short summary line in the imperative, like \"Fix crash when the cart is empty\", then, if needed, a body that explains why the change was made, not just what changed, with a reference to the ticket.",
      "Un bon commit fait une seule chose logique, compile et passe les tests, et il est assez petit pour être relu ou annulé seul. Le message a une courte ligne de résumé à l'impératif, comme « Fix crash when the cart is empty », puis, si besoin, un corps qui explique pourquoi la modification a été faite, pas seulement ce qui a changé, avec une référence au ticket.",
    ],
    [
      "internals", "concept",
      "What is a commit in Git, really? What do HEAD and a branch point to?",
      "Qu'est-ce qu'un commit dans Git, concrètement ? Vers quoi pointent HEAD et une branche ?",
      "A commit is a snapshot of the whole project at one moment, stored as a tree of files, with metadata: author, date, message, and the hash of its parent commits; its id is the hash of all that content. A branch is just a movable pointer to a commit, and HEAD points to the branch you are on, or directly to a commit in detached HEAD state.",
      "Un commit est une photo de tout le projet à un instant, stockée comme une arborescence de fichiers, avec des métadonnées : auteur, date, message, et l'empreinte de ses commits parents ; son identifiant est l'empreinte de tout ce contenu. Une branche n'est qu'un pointeur mobile vers un commit, et HEAD pointe vers la branche sur laquelle on se trouve, ou directement vers un commit en mode detached HEAD.",
    ],
  ],
);

export const linux = defineTech(
  {
    id: "linux",
    label: same("Linux"),
    family: "devops",
    tool: true,
    aliases: [
      "linux", "gnu/linux", "ubuntu", "debian", "centos", "red hat", "redhat", "rhel", "fedora", "rocky linux", "almalinux",
      "administration systeme", "system administration", "sysadmin", "systemd", "ssh",
    ],
  },
  [
    [
      "permissions", "concept",
      "How do file permissions work on Linux? What does chmod 640 mean?",
      "Comment fonctionnent les permissions de fichiers sous Linux ? Que signifie chmod 640 ?",
      "Each file has an owner, a group, and read, write and execute permissions for the owner, the group and everyone else. In octal, read is 4, write 2 and execute 1. chmod 640 means: the owner can read and write, 6; the group can read, 4; the others have no access, 0. On a directory, execute means being allowed to enter it.",
      "Chaque fichier a un propriétaire, un groupe, et des droits de lecture, d'écriture et d'exécution pour le propriétaire, le groupe et les autres. En octal, la lecture vaut 4, l'écriture 2 et l'exécution 1. chmod 640 signifie : le propriétaire peut lire et écrire, 6 ; le groupe peut lire, 4 ; les autres n'ont aucun accès, 0. Sur un dossier, l'exécution signifie le droit d'y entrer.",
    ],
    [
      "slow-server", "troubleshoot",
      "A server is slow. Which commands do you use to find what is eating the CPU or the memory?",
      "Un serveur est lent. Quelles commandes {utilisez-vous|utilises-tu} pour trouver ce qui consomme le CPU ou la mémoire ?",
      "uptime for the load average, then top or htop to see which processes use the CPU and the memory, free -h for memory and swap, vmstat to see whether the machine waits on the disk, iostat or iotop for disk activity, and df -h in case a disk is full. Then I read the logs of the suspicious service with journalctl to understand why it consumes so much.",
      "uptime pour la charge moyenne, puis top ou htop pour voir quels processus consomment le CPU et la mémoire, free -h pour la mémoire et le swap, vmstat pour voir si la machine attend le disque, iostat ou iotop pour l'activité disque, et df -h au cas où un disque serait plein. Ensuite je lis les logs du service suspect avec journalctl pour comprendre pourquoi il consomme autant.",
    ],
    [
      "disk-full", "troubleshoot",
      "The disk of a server is full. How do you find what takes the space?",
      "Le disque d'un serveur est plein. Comment trouver ce qui prend la place ?",
      "df -h shows which file system is full; then du -sh on the directories, going down level by level, or a tool like ncdu, finds what takes the space: often logs, caches, old releases or Docker images. If df says full but du finds nothing, a deleted file may still be held open by a process, and lsof shows it. Then I clean up and set up log rotation so it does not happen again.",
      "df -h montre quel système de fichiers est plein ; ensuite du -sh sur les dossiers, en descendant niveau par niveau, ou un outil comme ncdu, trouve ce qui prend la place : souvent des logs, des caches, d'anciennes versions ou des images Docker. Si df indique plein mais que du ne trouve rien, un fichier supprimé est peut-être encore ouvert par un processus, et lsof le montre. Ensuite je nettoie et je mets en place une rotation des logs pour que ça ne se reproduise pas.",
    ],
    [
      "systemd", "practice",
      "How do you start, stop and check a service with systemd, and where do you read its logs?",
      "Comment démarrer, arrêter et vérifier un service avec systemd, et où lire ses logs ?",
      "systemctl start, stop and restart the service; systemctl status shows whether it runs, its PID and its latest log lines; systemctl enable starts it at boot. The logs are in the journal: journalctl -u followed by the service name, with -f to follow them live, or in /var/log for services that write their own files.",
      "systemctl start, stop et restart le service ; systemctl status indique s'il tourne, son PID et ses dernières lignes de log ; systemctl enable le lance au démarrage. Les logs sont dans le journal : journalctl -u suivi du nom du service, avec -f pour les suivre en direct, ou dans /var/log pour les services qui écrivent leurs propres fichiers.",
    ],
    [
      "ssh", "best_practice",
      "How do you connect to a server with SSH keys, and what do you do to secure SSH access?",
      "Comment se connecter à un serveur avec des clés SSH, et que faire pour sécuriser l'accès SSH ?",
      "I generate a key pair with ssh-keygen, keep the private key on my machine with a passphrase, and copy the public key into ~/.ssh/authorized_keys on the server, for example with ssh-copy-id. To secure access: disable password login and direct root login, allow only the users who need it, keep the system updated, restrict access with a firewall or a VPN, and use a tool like fail2ban against brute force.",
      "Je génère une paire de clés avec ssh-keygen, je garde la clé privée sur ma machine avec une phrase de passe, et je copie la clé publique dans ~/.ssh/authorized_keys sur le serveur, par exemple avec ssh-copy-id. Pour sécuriser l'accès : désactiver la connexion par mot de passe et la connexion directe en root, n'autoriser que les utilisateurs qui en ont besoin, garder le système à jour, restreindre l'accès avec un pare-feu ou un VPN, et utiliser un outil comme fail2ban contre la force brute.",
    ],
    [
      "port-in-use", "troubleshoot",
      "An application says its port is already in use. How do you find out which process holds it?",
      "Une application indique que son port est déjà utilisé. Comment savoir quel processus l'occupe ?",
      "ss -ltnp, or the older netstat -ltnp, lists the listening ports with the process that holds each one, and lsof -i :8080 does the same for one port. Then I decide: if it is an old instance of the same application, I stop it; if it is another service, I change the port of one of the two. With Docker, a container may be the one publishing that port.",
      "ss -ltnp, ou l'ancien netstat -ltnp, liste les ports en écoute avec le processus qui détient chacun, et lsof -i :8080 fait de même pour un port. Ensuite je décide : si c'est une ancienne instance de la même application, je l'arrête ; si c'est un autre service, je change le port de l'un des deux. Avec Docker, c'est parfois un conteneur qui publie ce port.",
    ],
    [
      "kill", "compare",
      "What is the difference between kill -15 and kill -9?",
      "Quelle est la différence entre kill -15 et kill -9 ?",
      "kill -15 sends SIGTERM, a polite request to stop: the process can catch it, finish its work, close its files and connections, then exit. kill -9 sends SIGKILL, which the kernel applies immediately and which cannot be caught: no cleanup at all, so it can leave corrupted files or stale locks. I use 15 first, and 9 only if the process does not respond.",
      "kill -15 envoie SIGTERM, une demande polie d'arrêt : le processus peut l'intercepter, finir son travail, fermer ses fichiers et connexions, puis s'arrêter. kill -9 envoie SIGKILL, que le noyau applique immédiatement et qui ne peut pas être intercepté : aucun nettoyage, donc il peut laisser des fichiers corrompus ou des verrous orphelins. J'utilise d'abord 15, et 9 seulement si le processus ne répond pas.",
    ],
    [
      "filesystem", "concept",
      "What do you usually find in /etc, /var/log, /home and /tmp?",
      "Que trouve-t-on habituellement dans /etc, /var/log, /home et /tmp ?",
      "/etc holds the configuration files of the system and the services; /var/log the logs; /home the users' personal directories; /tmp temporary files, which anyone can write and which may be cleared at reboot. Also useful: /var for variable data like databases and caches, /usr for installed programs, and /opt for third-party software.",
      "/etc contient les fichiers de configuration du système et des services ; /var/log les logs ; /home les dossiers personnels des utilisateurs ; /tmp les fichiers temporaires, où tout le monde peut écrire et qui peuvent être vidés au redémarrage. Utile aussi : /var pour les données variables comme les bases de données et les caches, /usr pour les programmes installés, et /opt pour les logiciels tiers.",
    ],
    [
      "packages", "concept",
      "How do you install software on Debian or Red Hat, and what is a package manager for?",
      "Comment installer un logiciel sur Debian ou Red Hat, et à quoi sert un gestionnaire de paquets ?",
      "On Debian or Ubuntu, apt update then apt install; on Red Hat, dnf install, formerly yum. A package manager downloads software from trusted repositories, checks the signatures, installs the dependencies, and makes updates and removal clean and repeatable, which is much better than installing by hand.",
      "Sur Debian ou Ubuntu, apt update puis apt install ; sur Red Hat, dnf install, anciennement yum. Un gestionnaire de paquets télécharge les logiciels depuis des dépôts de confiance, vérifie les signatures, installe les dépendances, et rend les mises à jour et la désinstallation propres et reproductibles, ce qui est bien mieux qu'une installation à la main.",
    ],
  ],
);

export const bash = defineTech(
  {
    id: "bash",
    label: same("Bash"),
    family: "devops",
    tool: true,
    aliases: ["bash", "shell", "shell scripting", "shell scripts", "scripts shell", "scripting shell", "zsh", "posix shell", "ksh"],
  },
  [
    [
      "redirections", "concept",
      "What do |, >, >> and 2>&1 do in a shell?",
      "Que font |, >, >> et 2>&1 dans un shell ?",
      "| sends the output of one command to the input of the next. > writes the output into a file, replacing its content, and >> appends to it. 2>&1 sends the error output, file descriptor 2, to the same place as the standard output, descriptor 1, so command > out.log 2>&1 captures both in one file. The order matters: the redirection to the file comes first.",
      "| envoie la sortie d'une commande vers l'entrée de la suivante. > écrit la sortie dans un fichier en remplaçant son contenu, et >> l'ajoute à la fin. 2>&1 envoie la sortie d'erreur, le descripteur 2, au même endroit que la sortie standard, le descripteur 1, donc commande > out.log 2>&1 capture les deux dans un fichier. L'ordre compte : la redirection vers le fichier vient d'abord.",
    ],
    [
      "exit-codes", "best_practice",
      "How does a script know that a command failed, and what do set -e and set -u change?",
      "Comment un script sait-il qu'une commande a échoué, et que changent set -e et set -u ?",
      "Every command returns an exit code, 0 for success and anything else for failure, available in $?, and if, && and || test it. set -e stops the script at the first command that fails, instead of carrying on in a broken state; set -u makes the use of an unset variable an error, which catches typos. I usually add set -o pipefail so that a failure in the middle of a pipe is not hidden.",
      "Chaque commande renvoie un code de sortie, 0 pour un succès et autre chose pour un échec, disponible dans $?, et if, && et || le testent. set -e arrête le script à la première commande qui échoue, au lieu de continuer dans un état cassé ; set -u fait de l'utilisation d'une variable non définie une erreur, ce qui attrape les fautes de frappe. J'ajoute en général set -o pipefail pour qu'un échec au milieu d'un pipe ne soit pas masqué.",
    ],
    [
      "quoting", "troubleshoot",
      "Your script breaks on a file name that contains a space. Why, and how do you fix it?",
      "{Votre|Ton} script plante sur un nom de fichier qui contient un espace. Pourquoi, et comment corriger ?",
      "Without quotes, the shell splits the value of a variable on spaces, so \"my file.txt\" becomes two arguments, my and file.txt. The fix is to always quote variables, \"$file\", to use \"$@\" to pass arguments on, and to loop over files with a glob, or with find -print0 and read -d '', rather than by parsing the output of ls.",
      "Sans guillemets, le shell découpe la valeur d'une variable sur les espaces, donc « mon fichier.txt » devient deux arguments, mon et fichier.txt. La correction : toujours mettre les variables entre guillemets, \"$file\", utiliser \"$@\" pour transmettre les arguments, et parcourir les fichiers avec un glob, ou avec find -print0 et read -d '', plutôt qu'en analysant la sortie de ls.",
    ],
    [
      "old-logs", "practice",
      "How would you write a script that compresses every .log file older than seven days?",
      "Comment {écririez-vous|écrirais-tu} un script qui compresse tous les fichiers .log de plus de sept jours ?",
      "find /var/log/myapp -name '*.log' -type f -mtime +7 -exec gzip {} + does the job: find selects the .log files modified more than seven days ago, and gzip compresses them. In a script I would add set -euo pipefail, take the directory as an argument, log what was done, and run it every night with cron or a systemd timer; logrotate can also do exactly this.",
      "find /var/log/monapp -name '*.log' -type f -mtime +7 -exec gzip {} + fait le travail : find sélectionne les fichiers .log modifiés il y a plus de sept jours, et gzip les compresse. Dans un script, j'ajouterais set -euo pipefail, le dossier en argument, une trace de ce qui a été fait, et je le lancerais chaque nuit avec cron ou un timer systemd ; logrotate sait aussi faire exactement ça.",
    ],
    [
      "count-ips", "practice",
      "From an access log, how would you count the requests per IP address with command-line tools?",
      "À partir d'un fichier de logs d'accès, comment compter les requêtes par adresse IP avec des outils en ligne de commande ?",
      "If the IP address is the first field, as in the common log format: awk '{print $1}' access.log | sort | uniq -c | sort -rn | head. awk extracts the field, sort groups identical addresses, uniq -c counts them, and the last sort ranks them from the most frequent. cut -d' ' -f1 would work instead of awk.",
      "Si l'adresse IP est le premier champ, comme dans le format de log courant : awk '{print $1}' access.log | sort | uniq -c | sort -rn | head. awk extrait le champ, sort regroupe les adresses identiques, uniq -c les compte, et le dernier sort les classe de la plus fréquente à la moins fréquente. cut -d' ' -f1 marcherait aussi à la place d'awk.",
    ],
    [
      "cron", "concept",
      "How do you schedule a script to run every night, and how do you know if it failed?",
      "Comment planifier un script pour qu'il tourne chaque nuit, et comment savoir s'il a échoué ?",
      "With a crontab entry, for example 0 2 * * * followed by the script's path for every night at two, or with a systemd timer. To know if it failed: the script returns a real exit code, its output goes to a log file, cron can e-mail the output, and for anything important a monitoring check or a heartbeat alerts when the job did not run or failed.",
      "Avec une entrée de crontab, par exemple 0 2 * * * suivi du chemin du script pour chaque nuit à deux heures, ou avec un timer systemd. Pour savoir s'il a échoué : le script renvoie un vrai code de sortie, sa sortie va dans un fichier de log, cron peut envoyer la sortie par e-mail, et pour ce qui est important, une sonde de supervision ou un heartbeat alerte quand la tâche n'a pas tourné ou a échoué.",
    ],
    [
      "variables", "compare",
      "What is the difference between a shell variable and an environment variable?",
      "Quelle est la différence entre une variable du shell et une variable d'environnement ?",
      "A shell variable exists only in the current shell. An environment variable is exported, with export NAME=value, and the programs started from that shell inherit it, like PATH or HOME. Without export, a script or a program you launch does not see the variable.",
      "Une variable du shell n'existe que dans le shell courant. Une variable d'environnement est exportée, avec export NOM=valeur, et les programmes lancés depuis ce shell en héritent, comme PATH ou HOME. Sans export, un script ou un programme qu'on lance ne voit pas la variable.",
    ],
  ],
);

export const terraform = defineTech(
  {
    id: "terraform",
    label: same("Terraform"),
    family: "devops",
    tool: true,
    aliases: ["terraform", "opentofu", "infrastructure as code", "infrastructure-as-code", "iac", "pulumi", "cloudformation", "bicep"],
  },
  [
    [
      "iac", "concept",
      "What is infrastructure as code, and what does it bring compared with clicking in a console?",
      "Qu'est-ce que l'infrastructure as code, et qu'apporte-t-elle par rapport à des clics dans une console ?",
      "Infrastructure as code means describing servers, networks, databases and permissions in versioned files instead of creating them by hand. The infrastructure becomes reproducible, for example a staging identical to production, changes are reviewed in pull requests and tracked in Git, and everything can be rebuilt after an incident. Clicking in a console is fast once, but neither documented nor reliable.",
      "L'infrastructure as code consiste à décrire serveurs, réseaux, bases de données et droits dans des fichiers versionnés au lieu de les créer à la main. L'infrastructure devient reproductible, par exemple une préproduction identique à la production, les modifications sont relues en pull request et tracées dans Git, et on peut tout reconstruire après un incident. Cliquer dans une console va vite une fois, mais ce n'est ni documenté ni fiable.",
    ],
    [
      "state", "concept",
      "What is the Terraform state file for, and why must it be stored and locked carefully?",
      "À quoi sert le fichier d'état (state) de Terraform, et pourquoi faut-il le stocker et le verrouiller avec soin ?",
      "The state maps the resources in the code to the real resources in the cloud, with their ids and attributes; Terraform compares it with the code and with reality to compute the plan. It must be stored remotely, for example in an S3 bucket or Terraform Cloud, so the whole team shares it, and locked during an apply so two people cannot change it at once. It can contain secrets, so access to it must be restricted.",
      "Le fichier d'état fait le lien entre les ressources du code et les vraies ressources dans le cloud, avec leurs identifiants et attributs ; Terraform le compare au code et à la réalité pour calculer le plan. Il doit être stocké à distance, par exemple dans un bucket S3 ou Terraform Cloud, pour que toute l'équipe le partage, et verrouillé pendant un apply pour que deux personnes ne le modifient pas en même temps. Il peut contenir des secrets, donc son accès doit être restreint.",
    ],
    [
      "plan-apply", "practice",
      "What do terraform plan and terraform apply do, and why read the plan before applying?",
      "Que font terraform plan et terraform apply, et pourquoi lire le plan avant d'appliquer ?",
      "terraform plan compares the code with the state and the real infrastructure and shows what would be created, changed or destroyed, without touching anything; terraform apply performs those changes. Reading the plan is essential because a small change in the code can replace or destroy a resource, a database for example, and the plan is the moment to notice it.",
      "terraform plan compare le code avec l'état et l'infrastructure réelle et montre ce qui serait créé, modifié ou détruit, sans rien toucher ; terraform apply exécute ces changements. Lire le plan est essentiel, car une petite modification du code peut remplacer ou détruire une ressource, une base de données par exemple, et le plan est le moment de s'en rendre compte.",
    ],
    [
      "environments", "best_practice",
      "How would you organise Terraform code for a development and a production environment?",
      "Comment {organiseriez-vous|organiserais-tu} du code Terraform pour un environnement de développement et un de production ?",
      "Shared building blocks go into modules, for example a network module and an application module, and each environment has its own small configuration that calls those modules with its own variables: sizes, number of instances, names. Each environment has a separate state, often a separate cloud account too, so a mistake in development cannot touch production, and changes go through development first.",
      "Les briques communes vont dans des modules, par exemple un module réseau et un module application, et chaque environnement a sa propre petite configuration qui appelle ces modules avec ses variables : tailles, nombre d'instances, noms. Chaque environnement a un état séparé, souvent un compte cloud séparé aussi, pour qu'une erreur en développement ne puisse pas toucher la production, et les changements passent d'abord par le développement.",
    ],
    [
      "drift", "troubleshoot",
      "Someone changed a resource by hand in the cloud console. What happens at the next terraform plan, and what do you do?",
      "Quelqu'un a modifié une ressource à la main dans la console cloud. Que se passe-t-il au prochain terraform plan, et que {faites-vous|fais-tu} ?",
      "terraform plan detects the difference between the code and reality and proposes to put the resource back as the code describes it, which would undo the manual change. I first find out why it was changed: if the change is right, I put it into the code; if not, I let Terraform restore the resource. Then the team agrees that changes go through the code, and drift checks can run regularly.",
      "terraform plan détecte l'écart entre le code et la réalité et propose de remettre la ressource comme le code la décrit, ce qui annulerait la modification manuelle. Je cherche d'abord pourquoi elle a été faite : si elle est justifiée, je la reporte dans le code ; sinon, je laisse Terraform rétablir la ressource. Ensuite on s'accorde dans l'équipe pour que les changements passent par le code, et des vérifications d'écart peuvent tourner régulièrement.",
    ],
    [
      "vs-ansible", "compare",
      "Terraform or Ansible: what is each one best at?",
      "Terraform ou Ansible : dans quoi chacun est-il le meilleur ?",
      "Terraform is declarative and made to create and manage infrastructure resources, networks, virtual machines, databases, DNS, with a state that tracks them. Ansible is better at configuring what runs on the machines: installing packages, deploying files and applications, running tasks over SSH, with no state to keep. They are often combined: Terraform creates the servers, Ansible configures them.",
      "Terraform est déclaratif et fait pour créer et gérer des ressources d'infrastructure, réseaux, machines virtuelles, bases de données, DNS, avec un état qui les suit. Ansible est meilleur pour configurer ce qui tourne sur les machines : installer des paquets, déployer des fichiers et des applications, exécuter des tâches par SSH, sans état à gérer. On les combine souvent : Terraform crée les serveurs, Ansible les configure.",
    ],
  ],
);

export const ansible = defineTech(
  {
    id: "ansible",
    label: same("Ansible"),
    family: "devops",
    tool: true,
    aliases: ["ansible", "puppet", "chef", "saltstack", "configuration management", "gestion de configuration"],
  },
  [
    [
      "agentless", "concept",
      "How does Ansible reach and configure machines, and what does agentless mean?",
      "Comment Ansible atteint-il et configure-t-il les machines, et que veut dire « sans agent » ?",
      "Ansible connects to the machines over SSH, or WinRM for Windows, from a control machine; it copies small modules, runs them and removes them, so nothing has to be installed or kept running on the targets apart from Python. Agentless means there is no daemon to deploy, update or secure on every server, unlike tools such as Puppet that run an agent.",
      "Ansible se connecte aux machines par SSH, ou WinRM pour Windows, depuis une machine de contrôle ; il copie de petits modules, les exécute puis les retire, donc rien n'est à installer ni à faire tourner sur les cibles, à part Python. Sans agent signifie qu'il n'y a pas de démon à déployer, mettre à jour ou sécuriser sur chaque serveur, contrairement à des outils comme Puppet qui utilisent un agent.",
    ],
    [
      "idempotence", "concept",
      "What does idempotent mean for an Ansible task, and why does it matter?",
      "Que signifie « idempotente » pour une tâche Ansible, et pourquoi est-ce important ?",
      "An idempotent task gives the same result whether it runs once or ten times: it describes a state, like \"this package is installed\" or \"this line is in the file\", and only acts when the machine is not in that state yet. So a playbook can safely run again after a failure or on a schedule, and the changed and ok statuses show what really changed.",
      "Une tâche idempotente donne le même résultat qu'elle s'exécute une fois ou dix fois : elle décrit un état, comme « ce paquet est installé » ou « cette ligne est dans le fichier », et n'agit que si la machine n'est pas encore dans cet état. On peut donc relancer un playbook sans risque après un échec ou de façon régulière, et les statuts changed et ok montrent ce qui a vraiment changé.",
    ],
    [
      "playbook", "practice",
      "How would you write a playbook that installs Nginx and deploys its configuration on three servers?",
      "Comment {écririez-vous|écrirais-tu} un playbook qui installe Nginx et déploie sa configuration sur trois serveurs ?",
      "An inventory lists the three servers in a group, for example web. The playbook targets that group with become for root rights, and its tasks install the nginx package with the package module, deploy the configuration with the template module from a Jinja2 file, and make sure the service is started and enabled. A handler restarts Nginx only when the configuration has changed.",
      "Un inventaire liste les trois serveurs dans un groupe, par exemple web. Le playbook cible ce groupe avec become pour les droits root, et ses tâches installent le paquet nginx avec le module package, déploient la configuration avec le module template à partir d'un fichier Jinja2, et s'assurent que le service est démarré et activé. Un handler redémarre Nginx seulement quand la configuration a changé.",
    ],
    [
      "structure", "best_practice",
      "How do you organise an Ansible project with roles, variables and inventories?",
      "Comment organiser un projet Ansible avec des rôles, des variables et des inventaires ?",
      "One role per component, like nginx or postgresql, with its tasks, handlers, templates and default variables, reusable from one project to another. One inventory per environment, with group_vars and host_vars for what differs between servers and environments. Playbooks stay short and only assemble roles, and everything is versioned in Git and checked with ansible-lint.",
      "Un rôle par composant, comme nginx ou postgresql, avec ses tâches, handlers, templates et variables par défaut, réutilisable d'un projet à l'autre. Un inventaire par environnement, avec group_vars et host_vars pour ce qui diffère entre serveurs et environnements. Les playbooks restent courts et ne font qu'assembler des rôles, et tout est versionné dans Git et vérifié avec ansible-lint.",
    ],
    [
      "vault", "best_practice",
      "How do you keep passwords out of plain text in an Ansible repository?",
      "Comment éviter les mots de passe en clair dans un dépôt Ansible ?",
      "With Ansible Vault: the sensitive variables live in files encrypted with ansible-vault, which can be committed safely and are decrypted at runtime with a password provided outside the repository. Another option is to fetch the secrets from an external manager, such as HashiCorp Vault or the cloud's secret store, through a lookup. And no_log hides sensitive values from the output.",
      "Avec Ansible Vault : les variables sensibles sont dans des fichiers chiffrés avec ansible-vault, qu'on peut commiter sans risque et qui sont déchiffrés à l'exécution avec un mot de passe fourni hors du dépôt. Autre option : récupérer les secrets dans un gestionnaire externe, comme HashiCorp Vault ou celui du cloud, via un lookup. Et no_log masque les valeurs sensibles dans la sortie.",
    ],
  ],
);

export const cloud = defineTech(
  {
    id: "cloud",
    label: same("Cloud"),
    family: "devops",
    tool: false,
    aliases: [
      "cloud", "cloud computing", "aws", "amazon web services", "azure", "microsoft azure", "gcp", "google cloud", "google cloud platform",
      "ec2", "s3", "openstack", "ovhcloud", "scaleway",
    ],
  },
  [
    [
      "service-models", "compare",
      "IaaS, PaaS, SaaS: what is the difference? Give an example of each.",
      "IaaS, PaaS, SaaS : quelle est la différence ? {Donnez|Donne} un exemple de chaque.",
      "With IaaS you rent infrastructure, virtual machines, networks and disks, and manage the operating system and everything above it: EC2 or an Azure VM, for example. With PaaS you deploy your code and the provider runs the platform: Heroku, App Service or Cloud Run. With SaaS you simply use finished software, like Gmail or Salesforce. The higher you go, the less you manage and the less control you have.",
      "Avec l'IaaS, on loue de l'infrastructure, machines virtuelles, réseaux et disques, et on gère le système d'exploitation et tout ce qu'il y a au-dessus : EC2 ou une VM Azure, par exemple. Avec le PaaS, on déploie son code et le fournisseur gère la plateforme : Heroku, App Service ou Cloud Run. Avec le SaaS, on utilise simplement un logiciel fini, comme Gmail ou Salesforce. Plus on monte, moins on gère et moins on a de contrôle.",
    ],
    [
      "regions", "concept",
      "What are regions and availability zones, and how do they help an application stay up?",
      "Que sont les régions et les zones de disponibilité, et comment aident-elles une application à rester disponible ?",
      "A region is a geographic area, like Frankfurt or Paris, with its own data centres; an availability zone is one or more isolated data centres inside a region, with separate power and network. Spreading instances across several zones keeps the application running if one zone fails, and several regions protect against a regional outage or bring the service closer to users; where data is stored also matters for laws like the GDPR.",
      "Une région est une zone géographique, comme Francfort ou Paris, avec ses propres centres de données ; une zone de disponibilité est un ou plusieurs centres de données isolés à l'intérieur d'une région, avec une alimentation et un réseau séparés. Répartir les instances sur plusieurs zones garde l'application en service si une zone tombe, et plusieurs régions protègent d'une panne régionale ou rapprochent le service des utilisateurs ; l'emplacement des données compte aussi pour des lois comme le RGPD.",
    ],
    [
      "no-keys", "best_practice",
      "How would you give an application running in the cloud access to a storage bucket without putting keys in the code?",
      "Comment {donneriez-vous|donnerais-tu} à une application hébergée dans le cloud l'accès à un espace de stockage, sans mettre de clés dans le code ?",
      "I would give an identity to the application itself, an IAM role attached to the instance or the container on AWS, a managed identity on Azure, a service account on Google Cloud, and grant that identity only the permissions it needs on that one bucket. The SDK then gets short-lived credentials automatically: there are no keys to store, leak or rotate.",
      "Je donnerais une identité à l'application elle-même, un rôle IAM attaché à l'instance ou au conteneur sur AWS, une identité managée sur Azure, un compte de service sur Google Cloud, et j'accorderais à cette identité seulement les droits nécessaires sur cet espace de stockage. Le SDK obtient alors automatiquement des identifiants de courte durée : pas de clés à stocker, à faire fuiter ou à renouveler.",
    ],
    [
      "storage", "compare",
      "Object storage, block storage, managed database: when do you use each one?",
      "Stockage objet, stockage bloc, base de données managée : quand utiliser chacun ?",
      "Object storage, like S3, keeps files as objects accessed over HTTP: cheap and nearly unlimited, ideal for images, backups, logs or static sites, but it is not a file system. Block storage is a virtual disk attached to one machine, with low latency, for an operating system or a self-managed database. A managed database provides the engine with backups, updates and replication handled by the provider: usually the best choice for application data.",
      "Le stockage objet, comme S3, conserve des fichiers sous forme d'objets accessibles en HTTP : peu cher et presque illimité, idéal pour des images, des sauvegardes, des logs ou des sites statiques, mais ce n'est pas un système de fichiers. Le stockage bloc est un disque virtuel attaché à une machine, avec une faible latence, pour un système d'exploitation ou une base gérée soi-même. Une base de données managée fournit le moteur avec les sauvegardes, les mises à jour et la réplication gérées par le fournisseur : en général le meilleur choix pour les données applicatives.",
    ],
    [
      "autoscaling", "concept",
      "How does autoscaling work, and what does an application need to scale horizontally?",
      "Comment fonctionne l'autoscaling, et que faut-il à une application pour monter en charge horizontalement ?",
      "An autoscaling group, or its equivalent, watches metrics such as CPU or the number of requests, adds instances when a threshold is exceeded and removes them when the load drops, between a minimum and a maximum. To scale horizontally, an application must be stateless: sessions, uploads and caches go to shared services like a database, Redis or object storage, and a load balancer spreads the traffic.",
      "Un groupe d'autoscaling, ou son équivalent, surveille des métriques comme le CPU ou le nombre de requêtes, ajoute des instances quand un seuil est dépassé et en retire quand la charge baisse, entre un minimum et un maximum. Pour monter en charge horizontalement, une application doit être sans état : sessions, fichiers envoyés et caches vont dans des services partagés comme une base de données, Redis ou du stockage objet, et un répartiteur de charge distribue le trafic.",
    ],
    [
      "bill", "troubleshoot",
      "The cloud bill doubled this month. Where do you look first?",
      "La facture cloud a doublé ce mois-ci. Où {regardez-vous|regardes-tu} en premier ?",
      "In the provider's cost explorer, broken down by service, region and tag, to see which resource grew. The usual culprits: instances or databases left running after a test, oversized machines, autoscaling that went up and never came down, outbound data transfer, forgotten snapshots or unattached disks, and logs kept forever. Then I fix it, and set budgets and alerts so that the next surprise is caught early.",
      "Dans l'explorateur de coûts du fournisseur, ventilé par service, région et tag, pour voir quelle ressource a augmenté. Les coupables habituels : instances ou bases laissées allumées après un test, machines surdimensionnées, autoscaling monté et jamais redescendu, transfert de données sortant, snapshots oubliés ou disques non attachés, et logs conservés indéfiniment. Ensuite je corrige, et je mets en place des budgets et des alertes pour repérer la prochaine surprise tôt.",
    ],
    [
      "shared-responsibility", "concept",
      "What is the shared responsibility model: what does the provider secure, and what is up to you?",
      "Qu'est-ce que le modèle de responsabilité partagée : que sécurise le fournisseur, et qu'est-ce qui reste à {votre|ta} charge ?",
      "The provider is responsible for the security of the cloud: data centres, hardware, network and the virtualisation layer. The customer is responsible for security in the cloud: identities and permissions, the configuration of the services, network rules, encryption choices, the data itself, and, on virtual machines, the operating system and its updates. The more managed the service, the more the provider takes on.",
      "Le fournisseur est responsable de la sécurité du cloud : centres de données, matériel, réseau et couche de virtualisation. Le client est responsable de la sécurité dans le cloud : identités et droits, configuration des services, règles réseau, choix de chiffrement, les données elles-mêmes, et, sur des machines virtuelles, le système d'exploitation et ses mises à jour. Plus le service est managé, plus le fournisseur en prend en charge.",
    ],
  ],
);

export const networking = defineTech(
  {
    id: "networking",
    label: { en: "Networking", fr: "Réseaux" },
    family: "devops",
    tool: false,
    aliases: [
      "networking", "network", "networks", "reseau", "reseaux", "tcp/ip", "tcp", "udp", "dns", "dhcp", "osi", "routing", "routage", "subnetting",
      "lan", "vlan", "vpn", "firewall", "pare-feu", "cisco", "ccna",
      "fortigate", "fortinet",
    ],
  },
  [
    [
      "url", "concept",
      "What happens, step by step, when you type a URL in your browser and press Enter?",
      "Que se passe-t-il, étape par étape, quand on tape une URL dans le navigateur et qu'on appuie sur Entrée ?",
      "The browser parses the URL, then resolves the domain name to an IP address with DNS, starting with its cache. It opens a TCP connection to the server on port 443, and a TLS handshake checks the certificate and sets up encryption. It sends an HTTP request; the server, or a load balancer in front of it, returns a response with a status code, headers and HTML; and the browser parses it, loads the CSS, JavaScript and images, and renders the page.",
      "Le navigateur analyse l'URL, puis traduit le nom de domaine en adresse IP avec le DNS, en commençant par son cache. Il ouvre une connexion TCP vers le serveur sur le port 443, et une poignée de main TLS vérifie le certificat et met en place le chiffrement. Il envoie une requête HTTP ; le serveur, ou un répartiteur de charge devant lui, renvoie une réponse avec un code de statut, des en-têtes et du HTML ; et le navigateur l'analyse, charge le CSS, le JavaScript et les images, puis affiche la page.",
    ],
    [
      "tcp-vs-udp", "compare",
      "TCP or UDP: what is the difference, and when would you use each one?",
      "TCP ou UDP : quelle est la différence, et quand utiliser l'un ou l'autre ?",
      "TCP is connection-oriented and reliable: it guarantees delivery and order, retransmits lost packets and controls congestion, which costs latency; it is used for the web, e-mail or file transfers. UDP just sends datagrams, with no guarantee of delivery or order but very little overhead: it suits real-time traffic, like video calls, games or DNS, where speed matters more than a lost packet.",
      "TCP est orienté connexion et fiable : il garantit la livraison et l'ordre, retransmet les paquets perdus et contrôle la congestion, ce qui coûte de la latence ; on l'utilise pour le web, l'e-mail ou le transfert de fichiers. UDP envoie simplement des datagrammes, sans garantie de livraison ni d'ordre mais avec très peu de surcoût : il convient au temps réel, comme les appels vidéo, les jeux ou le DNS, où la vitesse compte plus qu'un paquet perdu.",
    ],
    [
      "layers", "concept",
      "What are the layers of the TCP/IP or OSI model, and where do IP, TCP and HTTP sit?",
      "Quelles sont les couches du modèle TCP/IP ou OSI, et où se situent IP, TCP et HTTP ?",
      "The TCP/IP model has four layers: link, like Ethernet or Wi-Fi; internet, with IP, which addresses and routes packets between networks; transport, with TCP and UDP, which carry data between applications through ports; and application, with HTTP, DNS or SSH. The OSI model has seven: physical, data link, network, transport, session, presentation and application. IP is layer 3, TCP layer 4 and HTTP layer 7.",
      "Le modèle TCP/IP a quatre couches : liaison, comme Ethernet ou le Wi-Fi ; internet, avec IP, qui adresse et achemine les paquets entre réseaux ; transport, avec TCP et UDP, qui transportent les données entre applications grâce aux ports ; et application, avec HTTP, DNS ou SSH. Le modèle OSI en compte sept : physique, liaison, réseau, transport, session, présentation et application. IP est en couche 3, TCP en couche 4 et HTTP en couche 7.",
    ],
    [
      "dns", "concept",
      "How does DNS resolution work?",
      "Comment fonctionne la résolution DNS ?",
      "The client first checks its local cache, then asks a recursive resolver, often the internet provider's or a public one. If the resolver does not have the answer cached, it asks a root server, which points to the server of the top-level domain, like .be, which points to the domain's authoritative server, which gives the record: A for an IPv4 address, AAAA for IPv6, or a CNAME alias. Each answer is cached for its TTL.",
      "Le client regarde d'abord son cache local, puis interroge un résolveur récursif, souvent celui du fournisseur d'accès ou un résolveur public. Si le résolveur n'a pas la réponse en cache, il demande à un serveur racine, qui renvoie vers le serveur du domaine de premier niveau, comme .be, qui renvoie vers le serveur faisant autorité pour le domaine, qui donne l'enregistrement : A pour une adresse IPv4, AAAA pour IPv6, ou un alias CNAME. Chaque réponse est mise en cache pendant son TTL.",
    ],
    [
      "cidr", "practice",
      "What does 192.168.1.0/24 mean? How many machines fit in it?",
      "Que signifie 192.168.1.0/24 ? Combien de machines peut-on y placer ?",
      "/24 means the first 24 bits identify the network: the mask is 255.255.255.0 and the addresses go from 192.168.1.0 to 192.168.1.255. That is 256 addresses, minus the network address and the broadcast address: 254 usable hosts. A /25 would split it into two networks of 126 hosts each.",
      "/24 signifie que les 24 premiers bits désignent le réseau : le masque est 255.255.255.0 et les adresses vont de 192.168.1.0 à 192.168.1.255. Cela fait 256 adresses, moins l'adresse du réseau et celle de broadcast : 254 machines utilisables. Un /25 le couperait en deux réseaux de 126 machines chacun.",
    ],
    [
      "unreachable", "troubleshoot",
      "You cannot reach a server from your machine. Which checks do you make, and with which tools?",
      "{Vous n'arrivez|Tu n'arrives} pas à joindre un serveur depuis {votre|ta} machine. Quelles vérifications {faites-vous|fais-tu}, et avec quels outils ?",
      "Layer by layer: is my own network up, with an IP address and a gateway; does the name resolve, with nslookup or dig; does the server answer ping, knowing ICMP may be blocked; where does the route stop, with traceroute; is the port open, with nc -zv, or curl -v for HTTP. Then on the server side: is the service running and listening on the right interface, and do the firewall or security groups let the traffic through.",
      "Couche par couche : mon propre réseau fonctionne-t-il, avec une adresse IP et une passerelle ; le nom se résout-il, avec nslookup ou dig ; le serveur répond-il au ping, sachant que l'ICMP peut être bloqué ; où la route s'arrête-t-elle, avec traceroute ; le port est-il ouvert, avec nc -zv, ou curl -v pour du HTTP. Puis côté serveur : le service tourne-t-il et écoute-t-il sur la bonne interface, et le pare-feu ou les groupes de sécurité laissent-ils passer le trafic.",
    ],
    [
      "https", "concept",
      "What does HTTPS add to HTTP, and what is a TLS certificate for?",
      "Qu'ajoute HTTPS à HTTP, et à quoi sert un certificat TLS ?",
      "HTTPS is HTTP inside a TLS connection: the traffic is encrypted, so nobody on the network can read or modify it, and the server proves its identity. The certificate binds the domain name to a public key and is signed by a certificate authority the browser trusts; during the handshake the browser checks it, then both sides agree on session keys. Let's Encrypt provides free certificates.",
      "HTTPS, c'est du HTTP dans une connexion TLS : le trafic est chiffré, donc personne sur le réseau ne peut le lire ni le modifier, et le serveur prouve son identité. Le certificat associe le nom de domaine à une clé publique et il est signé par une autorité de certification en qui le navigateur a confiance ; pendant la poignée de main, le navigateur le vérifie, puis les deux côtés conviennent de clés de session. Let's Encrypt fournit des certificats gratuits.",
    ],
    [
      "nat", "concept",
      "What is NAT, and why do the machines of a home network share one public IP address?",
      "Qu'est-ce que le NAT, et pourquoi les machines d'un réseau domestique partagent-elles une seule adresse IP publique ?",
      "NAT, network address translation, lets the router replace the private addresses of the local network, like 192.168.x.x, with its own public address when traffic goes out, and keep a table, based on ports, to send the answers back to the right machine. It saves IPv4 addresses, which are scarce, which is why a whole home shares one public address, and it also hides the internal machines from the outside.",
      "Le NAT, la traduction d'adresses réseau, permet au routeur de remplacer les adresses privées du réseau local, comme 192.168.x.x, par sa propre adresse publique quand le trafic sort, et de garder une table, fondée sur les ports, pour renvoyer les réponses à la bonne machine. Il économise les adresses IPv4, qui sont rares, c'est pour ça que toute une maison partage une adresse publique, et il masque aussi les machines internes vers l'extérieur.",
    ],
    [
      "ports", "concept",
      "What is a port, and which ports do SSH, HTTP, HTTPS and PostgreSQL use by default?",
      "Qu'est-ce qu'un port, et quels ports utilisent par défaut SSH, HTTP, HTTPS et PostgreSQL ?",
      "A port is a number from 0 to 65535 that identifies an application on a machine, so several services can share one IP address; an IP address and a port together identify one end of a connection. By default: SSH 22, HTTP 80, HTTPS 443 and PostgreSQL 5432. MySQL uses 3306, and DNS 53.",
      "Un port est un numéro de 0 à 65535 qui identifie une application sur une machine, pour que plusieurs services partagent une même adresse IP ; une adresse IP et un port identifient ensemble une extrémité d'une connexion. Par défaut : SSH 22, HTTP 80, HTTPS 443 et PostgreSQL 5432. MySQL utilise 3306, et le DNS 53.",
    ],
  ],
);

export const nginx = defineTech(
  {
    id: "nginx",
    label: same("Nginx"),
    family: "devops",
    tool: true,
    aliases: ["nginx", "apache", "apache httpd", "httpd", "reverse proxy", "reverse-proxy", "load balancer", "haproxy", "traefik", "caddy", "web server", "serveur web"],
  },
  [
    [
      "reverse-proxy", "concept",
      "What is a reverse proxy, and why put Nginx in front of an application?",
      "Qu'est-ce qu'un reverse proxy, et pourquoi placer Nginx devant une application ?",
      "A reverse proxy receives the clients' requests and forwards them to one or several application servers, which are never exposed directly. Nginx in front of an application terminates HTTPS, serves static files very efficiently, compresses responses, spreads the load across instances, caches, limits request rates, and hides the internal architecture.",
      "Un reverse proxy reçoit les requêtes des clients et les transmet à un ou plusieurs serveurs d'application, qui ne sont jamais exposés directement. Nginx devant une application termine le HTTPS, sert très efficacement les fichiers statiques, compresse les réponses, répartit la charge entre les instances, met en cache, limite le débit des requêtes, et cache l'architecture interne.",
    ],
    [
      "bad-gateway", "troubleshoot",
      "Nginx returns 502 Bad Gateway. What does it mean, and what do you check?",
      "Nginx renvoie une erreur 502 Bad Gateway. Qu'est-ce que ça signifie, et que {vérifiez-vous|vérifies-tu} ?",
      "502 means Nginx got an invalid response, or no response at all, from the server it forwards to. I check that the application is running and listening on the address and port of proxy_pass, or on the PHP-FPM socket, then read Nginx's error.log, which often says connection refused or upstream closed the connection, and the application's own logs, looking for a crash or a timeout.",
      "502 signifie que Nginx a reçu une réponse invalide, ou aucune réponse, du serveur vers lequel il transmet. Je vérifie que l'application tourne et écoute sur l'adresse et le port de proxy_pass, ou sur le socket de PHP-FPM, puis je lis le error.log de Nginx, qui indique souvent une connexion refusée ou un serveur qui a fermé la connexion, et les logs de l'application, à la recherche d'un crash ou d'un délai dépassé.",
    ],
    [
      "https", "practice",
      "How would you serve a site over HTTPS with Nginx, and redirect HTTP to HTTPS?",
      "Comment {serviriez-vous|servirais-tu} un site en HTTPS avec Nginx, en redirigeant HTTP vers HTTPS ?",
      "A first server block listens on port 80 and returns a 301 redirect to https with the same host and path. A second one listens on 443 with ssl, points ssl_certificate and ssl_certificate_key to the certificate, for example from Let's Encrypt with certbot, only allows TLS 1.2 and 1.3, and adds a Strict-Transport-Security header. Certificate renewal must be automatic.",
      "Un premier bloc server écoute le port 80 et renvoie une redirection 301 vers https avec le même hôte et le même chemin. Un second écoute le 443 en ssl, indique le certificat avec ssl_certificate et ssl_certificate_key, par exemple obtenu chez Let's Encrypt avec certbot, n'autorise que TLS 1.2 et 1.3, et ajoute un en-tête Strict-Transport-Security. Le renouvellement des certificats doit être automatique.",
    ],
    [
      "static-and-app", "practice",
      "How does Nginx serve static files and pass the other requests to an application such as PHP-FPM or Node?",
      "Comment Nginx sert-il les fichiers statiques et transmet-il les autres requêtes à une application comme PHP-FPM ou Node ?",
      "In the server block, a location for the static files uses root or alias, with try_files to serve the file when it exists, and cache headers. The other requests go to the application: proxy_pass to the Node server's address and port, with headers like Host and X-Forwarded-For, or, for PHP, a location matching .php files that uses fastcgi_pass to the PHP-FPM socket with the fastcgi parameters.",
      "Dans le bloc server, une location pour les fichiers statiques utilise root ou alias, avec try_files pour servir le fichier quand il existe, et des en-têtes de cache. Les autres requêtes vont à l'application : proxy_pass vers l'adresse et le port du serveur Node, avec des en-têtes comme Host et X-Forwarded-For, ou, pour PHP, une location qui reconnaît les fichiers .php et utilise fastcgi_pass vers le socket de PHP-FPM avec les paramètres fastcgi.",
    ],
    [
      "load-balancing", "concept",
      "How can Nginx spread traffic over several instances of an application?",
      "Comment Nginx peut-il répartir le trafic entre plusieurs instances d'une application ?",
      "With an upstream block that lists the instances, and a proxy_pass that points to that upstream. By default Nginx uses round robin; least_conn sends to the least busy server, ip_hash keeps a client on the same server, and weights favour bigger machines. Failing servers are set aside after a number of errors, and the application must be stateless so any instance can handle any request.",
      "Avec un bloc upstream qui liste les instances, et un proxy_pass qui pointe vers cet upstream. Par défaut, Nginx fait du round robin ; least_conn envoie vers le serveur le moins occupé, ip_hash garde un client sur le même serveur, et des poids favorisent les machines plus puissantes. Les serveurs en panne sont écartés après un certain nombre d'erreurs, et l'application doit être sans état pour que n'importe quelle instance puisse traiter n'importe quelle requête.",
    ],
  ],
);

export const monitoring = defineTech(
  {
    id: "monitoring",
    label: { en: "Monitoring", fr: "Supervision" },
    family: "devops",
    tool: false,
    aliases: [
      "monitoring", "observability", "observabilite", "supervision", "alerting", "prometheus", "grafana", "datadog", "zabbix", "nagios",
      "elk", "kibana", "logstash", "loki", "opentelemetry", "new relic",
      "opensearch", "graphite", "mimir",
    ],
  },
  [
    [
      "logs-metrics-traces", "compare",
      "Logs, metrics and traces: what does each one tell you?",
      "Logs, métriques et traces : qu'est-ce que chacun {vous |t'}apprend ?",
      "Logs are timestamped events with details, ideal to understand what happened in one precise case, for example an error and its context. Metrics are numbers measured over time, like requests per second, error rate, latency or CPU: cheap to store and perfect for dashboards and alerts. Traces follow one request across several services, with the time spent in each, to find where it slows down or fails.",
      "Les logs sont des événements horodatés avec des détails, idéaux pour comprendre ce qui s'est passé dans un cas précis, par exemple une erreur et son contexte. Les métriques sont des nombres mesurés dans le temps, comme les requêtes par seconde, le taux d'erreur, la latence ou le CPU : peu coûteuses à stocker et parfaites pour les tableaux de bord et les alertes. Les traces suivent une requête à travers plusieurs services, avec le temps passé dans chacun, pour trouver où elle ralentit ou échoue.",
    ],
    [
      "what-to-watch", "design",
      "You put a web application in production. What would you monitor, and what would trigger an alert?",
      "{Vous mettez|Tu mets} une application web en production. Que {surveilleriez-vous|surveillerais-tu}, et qu'est-ce qui déclencherait une alerte ?",
      "The users' point of view first: availability through an external check, the error rate, the latency of the main pages and APIs, and the traffic. Then the resources: CPU, memory, disk space, database connections and slow queries, and certificate expiry. Alerts fire on symptoms that hurt users, for example an error rate above a few percent for five minutes or the site being down, not on every CPU spike.",
      "Le point de vue des utilisateurs d'abord : la disponibilité, avec une vérification externe, le taux d'erreur, la latence des pages et API principales, et le trafic. Ensuite les ressources : CPU, mémoire, espace disque, connexions et requêtes lentes de la base, et l'expiration des certificats. Les alertes se déclenchent sur des symptômes qui touchent les utilisateurs, par exemple un taux d'erreur au-dessus de quelques pour cent pendant cinq minutes ou un site indisponible, pas sur chaque pic de CPU.",
    ],
    [
      "prometheus-grafana", "concept",
      "How do Prometheus and Grafana work together?",
      "Comment Prometheus et Grafana fonctionnent-ils ensemble ?",
      "Prometheus collects the metrics: at regular intervals it scrapes HTTP endpoints exposed by the applications and by exporters, like node_exporter for the machines, and stores them as time series queried with PromQL. It also evaluates alert rules and sends the alerts to Alertmanager. Grafana connects to Prometheus as a data source and shows those queries as dashboards.",
      "Prometheus collecte les métriques : à intervalles réguliers, il interroge des endpoints HTTP exposés par les applications et par des exporters, comme node_exporter pour les machines, et les stocke sous forme de séries temporelles qu'on interroge en PromQL. Il évalue aussi des règles d'alerte et envoie les alertes à Alertmanager. Grafana se connecte à Prometheus comme source de données et affiche ces requêtes sous forme de tableaux de bord.",
    ],
    [
      "good-alerts", "best_practice",
      "What makes a good alert, and how do you avoid a flood of useless ones?",
      "Qu'est-ce qu'une bonne alerte, et comment éviter une avalanche d'alertes inutiles ?",
      "A good alert means someone has to act now: it is based on a symptom users feel, has a clear threshold and duration so it does not flap, and links to a dashboard or a runbook that says what to do. Against the flood: remove or tune the alerts nobody acts on, group related ones, send what is not urgent to a ticket or a daily report, and review the alerts after each incident.",
      "Une bonne alerte signifie que quelqu'un doit agir maintenant : elle repose sur un symptôme ressenti par les utilisateurs, a un seuil et une durée clairs pour ne pas clignoter, et renvoie vers un tableau de bord ou une procédure qui dit quoi faire. Contre l'avalanche : supprimer ou ajuster les alertes que personne ne traite, regrouper celles qui sont liées, envoyer ce qui n'est pas urgent vers un ticket ou un rapport quotidien, et revoir les alertes après chaque incident.",
    ],
    [
      "all-green", "troubleshoot",
      "Users report errors, but every dashboard is green. How do you investigate?",
      "Des utilisateurs signalent des erreurs, mais tous les tableaux de bord sont au vert. Comment {enquêtez-vous|enquêtes-tu} ?",
      "The dashboards are probably not measuring what users experience. I start from a concrete case, time, account and page, and look for it in the logs and traces, and I test the path myself from outside, like a user, through DNS, CDN and load balancer. Often the error is on a path nobody monitors, in a single region or for some users only, or on the client side. Then I add the missing check.",
      "Les tableaux de bord ne mesurent probablement pas ce que vivent les utilisateurs. Je pars d'un cas concret, heure, compte et page, je le cherche dans les logs et les traces, et je teste le parcours moi-même depuis l'extérieur, comme un utilisateur, en passant par le DNS, le CDN et le répartiteur de charge. Souvent l'erreur touche un chemin que personne ne surveille, une seule région ou une partie des utilisateurs, ou le côté client. Ensuite j'ajoute la vérification qui manquait.",
    ],
  ],
);

export const windows = defineTech(
  {
    id: "windows",
    label: { en: "Windows Server & AD", fr: "Windows Server et AD" },
    family: "devops",
    tool: true,
    exact: ["windows", "ad", "nps", "windows 10/11"],
    aliases: [
      "windows server", "active directory", "powershell", "group policy", "group policies", "strategie de groupe", "gpo", "hyper-v", "hyperv",
      "windows 10", "windows 11", "intune", "sccm", "wsus", "entra id", "azure ad", "azure active directory", "veeam", "microsoft 365", "office 365",
    ],
  },
  [
    [
      "active-directory", "concept",
      "What is Active Directory, and what does a domain controller do?",
      "Qu'est-ce qu'Active Directory, et à quoi sert un contrôleur de domaine ?",
      "Active Directory is Microsoft's directory: it holds the users, groups, computers and policies of an organisation, so that people log in everywhere with one account and administrators manage rights centrally. A domain controller is a server that runs it: it checks logins, mostly with Kerberos, answers directory queries and replicates the data to the other domain controllers, which is why there are always at least two.",
      "Active Directory est l'annuaire de Microsoft : il contient les utilisateurs, les groupes, les ordinateurs et les stratégies d'une organisation, pour que chacun se connecte partout avec un seul compte et que les administrateurs gèrent les droits de façon centralisée. Un contrôleur de domaine est un serveur qui le fait tourner : il vérifie les connexions, surtout avec Kerberos, répond aux requêtes sur l'annuaire et réplique les données vers les autres contrôleurs de domaine, c'est pourquoi il y en a toujours au moins deux.",
    ],
    [
      "gpo", "practice",
      "What is a Group Policy, and what would you use one for?",
      "Qu'est-ce qu'une stratégie de groupe (GPO), et à quoi {l'utiliseriez-vous|l'utiliserais-tu} ?",
      "A Group Policy Object is a set of settings that Active Directory applies to the users or computers of an organisational unit: for example a password policy, locking the screen after ten minutes, mapping a network drive, installing a printer or a piece of software, or blocking USB drives. You link it to the right OU, test it on a few machines first, and check what was applied with gpresult.",
      "Une GPO est un ensemble de paramètres qu'Active Directory applique aux utilisateurs ou aux ordinateurs d'une unité d'organisation : par exemple une politique de mots de passe, le verrouillage de l'écran après dix minutes, un lecteur réseau, une imprimante ou un logiciel à installer, ou le blocage des clés USB. On la lie à la bonne OU, on la teste d'abord sur quelques machines, et on vérifie ce qui a été appliqué avec gpresult.",
    ],
    [
      "login-fails", "troubleshoot",
      "A user cannot open their Windows session on the domain. What do you check?",
      "Un utilisateur n'arrive pas à ouvrir sa session Windows sur le domaine. Que {vérifiez-vous|vérifies-tu} ?",
      "First the simple causes: caps lock or the keyboard layout, an expired password or a locked account, which I can see and fix in Active Directory. If other people can log in on that computer, the problem is the account; if nobody can, I look at the machine: the network, a DNS that does not point to the domain controllers, a clock out of sync, which breaks Kerberos, or a broken trust with the domain. The event logs of the computer and of the domain controller confirm it.",
      "D'abord les causes simples : la touche majuscule ou la disposition du clavier, un mot de passe expiré ou un compte verrouillé, que je vois et corrige dans Active Directory. Si d'autres personnes se connectent bien sur ce poste, le problème vient du compte ; si personne n'y arrive, je regarde la machine : le réseau, un DNS qui ne pointe pas vers les contrôleurs de domaine, une horloge décalée, qui casse Kerberos, ou une relation d'approbation rompue avec le domaine. Les journaux d'événements du poste et du contrôleur de domaine le confirment.",
    ],
    [
      "powershell", "practice",
      "Why use PowerShell rather than the graphical tools? Give an example of a task you would script.",
      "Pourquoi utiliser PowerShell plutôt que les outils graphiques ? {Donnez|Donne} un exemple de tâche que {vous scripteriez|tu scripterais}.",
      "A script does the same thing every time, on one machine or five hundred, leaves a trace of what was done, and can be reviewed and reused. PowerShell works with objects, not text, so filtering and exporting is easy. For example: creating the accounts of new employees from a CSV file with New-ADUser, putting them in the right groups and sending the list to their managers, or listing the accounts that have not logged in for ninety days.",
      "Un script fait la même chose à chaque fois, sur une machine ou sur cinq cents, garde une trace de ce qui a été fait, et peut être relu et réutilisé. PowerShell manipule des objets et non du texte, donc filtrer et exporter est simple. Par exemple : créer les comptes des nouveaux employés à partir d'un fichier CSV avec New-ADUser, les mettre dans les bons groupes et envoyer la liste à leurs responsables, ou lister les comptes qui ne se sont pas connectés depuis quatre-vingt-dix jours.",
    ],
    [
      "share-access", "troubleshoot",
      "One team can no longer open a shared folder. How do you investigate?",
      "Une équipe n'arrive plus à ouvrir un dossier partagé. Comment {enquêtez-vous|enquêtes-tu} ?",
      "I check whether it is the whole team or one person, and what changed recently. Then the path: the server answers, and the share can be reached by its name, which tests DNS. On Windows two layers of rights apply, the share permissions and the NTFS permissions of the folder, and the most restrictive wins, so I check both, and the groups of the team members; someone just added to a group must log in again to get the new rights.",
      "Je vérifie si c'est toute l'équipe ou une seule personne, et ce qui a changé récemment. Puis le chemin : le serveur répond, et le partage est joignable par son nom, ce qui teste le DNS. Sous Windows, deux niveaux de droits s'appliquent, les autorisations du partage et les autorisations NTFS du dossier, et le plus restrictif l'emporte : je vérifie donc les deux, et les groupes des membres de l'équipe ; une personne qu'on vient d'ajouter à un groupe doit se reconnecter pour obtenir ses nouveaux droits.",
    ],
    [
      "updates", "best_practice",
      "How do you roll out Windows updates on many computers without breaking anything?",
      "Comment {déployez-vous|déploies-tu} les mises à jour Windows sur beaucoup de postes sans rien casser ?",
      "With a central tool, WSUS or Intune for example, and in waves: first a small test group, with IT and a few volunteers, then everyone else after a few days without problems. Installations happen in a maintenance window, outside working hours for the servers, with a backup or a snapshot before, a check afterwards that the important applications still work, and a report of the machines that failed. Security updates are not postponed for long.",
      "Avec un outil central, WSUS ou Intune par exemple, et par vagues : d'abord un petit groupe de test, avec l'informatique et quelques volontaires, puis tous les autres après quelques jours sans problème. Les installations se font dans une fenêtre de maintenance, en dehors des heures de travail pour les serveurs, avec une sauvegarde ou un snapshot avant, une vérification après que les applications importantes fonctionnent encore, et un rapport des machines en échec. Les mises à jour de sécurité ne sont pas repoussées longtemps.",
    ],
    [
      "hyper-v-checkpoints", "concept",
      "What is Hyper-V, and what is a checkpoint, or snapshot, for and not for?",
      "Qu'est-ce que Hyper-V, et à quoi sert un point de contrôle (snapshot), et à quoi il ne sert pas ?",
      "Hyper-V is Microsoft's hypervisor: it runs several virtual machines on one physical server, each with its own operating system. A checkpoint saves the state of a virtual machine at one moment, useful just before a risky change, like an update, to go back quickly if it goes wrong. It is not a backup: it sits on the same storage, slows the disk down if kept for long, and is lost with the server; real backups, for example with Veeam, go somewhere else.",
      "Hyper-V est l'hyperviseur de Microsoft : il fait tourner plusieurs machines virtuelles sur un serveur physique, chacune avec son propre système d'exploitation. Un point de contrôle enregistre l'état d'une machine virtuelle à un instant donné, utile juste avant une modification risquée, comme une mise à jour, pour revenir en arrière rapidement si ça tourne mal. Ce n'est pas une sauvegarde : il est sur le même stockage, ralentit le disque si on le garde longtemps, et disparaît avec le serveur ; les vraies sauvegardes, par exemple avec Veeam, vont ailleurs.",
    ],
  ],
);
