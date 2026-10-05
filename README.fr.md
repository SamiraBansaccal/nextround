# 🎯 NextRound

> 🇬🇧 English version: [README.md](README.md)

**Ton coach pour décrocher le prochain entretien — sans rien inventer.**

NextRound aide à postuler à des emplois tech, avec un accent sur **l'entraînement aux entretiens**. Tu construis ton profil une fois (CV, GitHub, Codewars, LeetCode), tu enregistres les offres qui te plaisent, et NextRound compare chacune à ton profil, rédige un CV et une lettre de motivation sur mesure, et te fait **passer un entretien en visio** avec l'intervieweur de ton choix : sur la *stack* de l'offre, sur une technologie, ou sur des questions RH.

🌐 **App en ligne :** https://nextround-gamma.vercel.app (sur invitation, voir l'[option A](#️-option-a--utiliser-lapp-en-ligne)) · 📚 **Doc :** [docs/](docs/README.md)

## 🧭 Sommaire

- [🤝 La promesse](#-la-promesse)
- [✨ Ce que fait l'app](#-ce-que-fait-lapp)
- [🚪 Deux façons d'utiliser NextRound](#-deux-façons-dutiliser-nextround)
- [🅰️ Option A — utiliser l'app en ligne](#️-option-a--utiliser-lapp-en-ligne)
- [🅱️ Option B — avoir ta propre copie](#️-option-b--avoir-ta-propre-copie)
- [🔑 Les clés d'API, simplement](#-les-clés-dapi-simplement)
- [🤖 Les limites de l'IA, expliquées](#-les-limites-de-lia-expliquées)
- [🛠️ Pour les devs](#️-pour-les-devs)

## 🤝 La promesse

**L'IA n'invente jamais rien.**

- Chaque phrase d'un CV, d'une lettre ou d'une réponse suggérée doit s'appuyer sur un **fait de ton profil**.
- Chaque élément lu dans une offre (exigences, *stack*, contacts) doit **citer l'offre mot pour mot**.
- Tout ce qui ne s'appuie sur rien est **signalé**, jamais gardé en douce.

Ces vérifications sont faites par le code, pas par l'IA ([ADR 0003](docs/fr/adr/0003-l-ia-propose-le-code-verifie.md)). C'est ce qui permet d'utiliser des modèles d'IA gratuits sans risque : ce qu'ils inventent est rattrapé.

## ✨ Ce que fait l'app

| | Fonction |
|---|---|
| 👤 | **Profil** (la page d'accueil) : import de CV (PDF, lus dans ton navigateur), de tes dépôts GitHub, de Codewars et LeetCode ; tout est fusionné dans une seule base, sans doublons ; les projets faits avec l'IA sont signalés (ils ne comptent jamais comme maîtrise de leur *stack*) |
| 💼 | **Offres** : ajout par lien ou texte collé ; chaque exigence en vert (couverte par ton profil) ou en rouge (lacune) ; offres rangées par parcours, avec leur étape (enregistrée → candidature envoyée → entretien → offre / refus) |
| 📄 | **CV et lettre sur mesure**, en français ou en anglais, chaque ligne appuyée sur tes faits ; tu peux en garder un dans ton profil et partir de lui pour le suivant |
| 🎙️ | **Entraînement aux entretiens** : sur une offre, une technologie (45, rangées en parcours) ou des questions RH ; 110 intervieweurs ; test caméra et micro ; questions écrites à l'avance en vrai français et vrai anglais, avec réponses modèles ; retour de l'IA sur tes propres réponses |
| 🌍 | Site **en français ou en anglais**, indépendamment de la langue de chaque entretien et de chaque document |

## 🚪 Deux façons d'utiliser NextRound

NextRound est un site web. Il ne tourne pas sur ton ordinateur : il tourne **dans le cloud**, sur plusieurs services gratuits (hébergement, base de données, connexion), et l'IA vient d'un fournisseur d'IA. Il y a donc deux façons de l'utiliser :

- 🅰️ **Utiliser l'app de la propriétaire**, déjà en ligne : tu te fais inviter, tu te connectes, tu ajoutes ta propre clé d'IA. Cinq minutes.
- 🅱️ **Avoir ta propre copie** : le même code, sur **tes propres** comptes (ton hébergement, ta base de données, tes clés). Une à deux heures la première fois.

| | 🅰️ L'app de la propriétaire | 🅱️ Ta propre copie |
|---|---|---|
| ⏱️ Mise en route | 5 minutes : invitation, connexion, une clé d'IA à coller | 1 à 2 heures la première fois : des comptes, des outils, une commande |
| 💶 Coût | Gratuit (les modèles d'IA gratuits suffisent) | Gratuit avec les offres gratuites ; rien n'est facturé tant que tu ne passes pas toi-même un service en payant |
| 👤 Comptes nécessaires | GitHub (ou Google) et un fournisseur d'IA (OpenRouter) | Les mêmes, plus un **compte Stripe vérifié** ; Stripe Projects crée ou relie ensuite pour toi les comptes Vercel, Neon, Clerk et OpenRouter (ElevenLabs et Firecrawl en option) |
| 🔄 Mises à jour | **Automatiques** : les nouveautés arrivent dès que la propriétaire les met en ligne | **Aucune par défaut** : ta copie ne change que si tu récupères les changements de la propriétaire et que tu redéploies (voir [mettre à jour](#-mettre-à-jour-ta-copie-plus-tard)) |
| 🗄️ Tes données | Dans la base de données **de la propriétaire** : elle l'administre et pourrait techniquement la lire, et elle peut la **supprimer ou la réinitialiser** à tout moment (c'est un projet perso, sans garantie) | Dans **ta** base de données : tu es seul·e à l'administrer |
| 🚦 Limites | Les limites de ta propre clé d'IA ; les quotas gratuits d'hébergement et de base de données sont **partagés** par tous les utilisateurs de l'app | Tous les quotas gratuits sont pour toi |
| 🧯 Stabilité | L'app peut changer, casser ou être réinitialisée sans prévenir | Elle ne change que quand tu le décides |
| 👍 Idéal pour | Essayer, s'entraîner pour un entretien la semaine prochaine | Apprendre comment une vraie app web est construite et hébergée, tout contrôler |

## 🅰️ Option A — utiliser l'app en ligne

### 1. Te faire inviter

L'inscription se fait **sur invitation** : envoie à la propriétaire l'**adresse e-mail de ton compte GitHub** (ou Google) avec lequel tu vas te connecter. Elle l'ajoute à la liste des invités ; avant ça, Clerk refuse l'inscription avec « Access not allowed ».

### 2. Te connecter

Ouvre https://nextround-gamma.vercel.app et clique sur **Continue with GitHub** (conseillé) ou **Continue with Google**.

- 🐙 **GitHub est conseillé** : le profil peut importer automatiquement tes projets GitHub publics, à partir du compte avec lequel tu t'es connecté·e. Avec Google, ce bouton d'import reste désactivé (tu peux quand même ajouter tes CV).
- 🔐 NextRound ne voit jamais ton mot de passe : c'est GitHub ou Google qui confirme qui tu es (ça s'appelle **OAuth**), et **Clerk**, le service de connexion, garde ta session.
- 🧪 Les écrans de connexion peuvent afficher **« Development mode »** : l'app utilise la formule de développement gratuite de Clerk. Rien d'anormal.

### 3. Brancher ton IA (pour les retours, les offres et les CV)

L'IA lit les offres et les CV, rapproche les exigences de ton profil, rédige les CV et les lettres, et commente tes réponses. **Les questions d'entretien et les réponses modèles sont écrites à l'avance : elles marchent sans IA.**

La clé d'IA de la propriétaire ne sert qu'à son compte. **Tu apportes la tienne**, donc ton usage et le sien ne se mélangent jamais ([ADR 0023](docs/fr/adr/0023-cles-de-l-instance-pour-la-proprietaire.md)). L'option gratuite la plus simple, c'est **OpenRouter** :

1. Crée un compte sur https://openrouter.ai (gratuit, pas besoin de carte pour les modèles gratuits).
2. Ouvre https://openrouter.ai/keys et clique sur **Create key**. Donne-lui un nom (« NextRound ») et, pour être tranquille, une petite **limite de crédit** (les modèles gratuits ne coûtent rien). Copie la clé : elle commence par `sk-or-`.
3. Dans NextRound, ouvre **Réglages** → **Fournisseur d'IA** → **OpenRouter**, colle la clé, garde un modèle gratuit (son identifiant finit par `:free` ; un modèle Qwen gratuit est proposé), **Enregistrer**, puis **Tester la connexion**.

Les autres fournisseurs marchent pareil : Groq et Mistral ont des offres gratuites avec leurs propres limites ; OpenAI et Anthropic sont payants à l'appel. Voir [les limites de l'IA](#-les-limites-de-lia-expliquées) pour ce que « gratuit » permet.

### 4. La voix (facultatif)

- 🗣️ Par défaut, l'intervieweur lit les questions avec **la voix de ton navigateur** : gratuit, rien à régler. Répondre à l'oral utilise la reconnaissance vocale du navigateur (Chrome ou Edge).
- 🎧 Pour des voix plus naturelles, ajoute une clé **ElevenLabs** dans **Réglages** → **Voix** : crée un compte sur https://elevenlabs.io, puis une clé d'API dans la section API keys de ton compte. L'offre gratuite donne 10 000 crédits par mois (environ dix minutes de voix) pour un usage personnel et non commercial. Une phrase déjà lue n'est jamais payée deux fois.

### 5. Les pages d'offres (facultatif)

Quand tu ajoutes une offre par son lien, NextRound lit la page lui-même, gratuitement. Certains sites le bloquent : colle alors le texte de l'offre, ou ajoute une clé **Firecrawl** dans **Réglages** → **Pages d'offres** (https://www.firecrawl.dev, offre gratuite : 1 000 pages par mois).

### 6. Ce que deviennent tes données

- 🧱 Chaque compte ne voit jamais que ses propres données : chaque requête à la base de données est filtrée par l'identifiant de ton compte, et c'est testé.
- 🔐 Les clés que tu enregistres sont **chiffrées** (AES-256-GCM) et jamais réaffichées, même pas à toi (seulement leurs 4 derniers caractères). Mais elles sont sur le serveur de la propriétaire, qui détient la clé de chiffrement : **tu lui fais confiance**. Utilise une clé créée pour NextRound, avec une limite de crédit, et supprime-la chez le fournisseur quand tu veux.
- 🧹 C'est un projet perso : la base peut être réinitialisée. Garde tes fichiers de CV, et télécharge les CV et lettres que tu veux conserver (boutons **Télécharger** ou **Imprimer / PDF**).

## 🅱️ Option B — avoir ta propre copie

### 🧩 Vue d'ensemble

Une fois en ligne, ta copie est faite de quelques services qui se parlent par Internet :

```
 Ton navigateur
     │  https://<ton-app>.vercel.app
     ▼
 Vercel ─────── hébergement : fait tourner l'app Next.js, page par page, requête par requête
   ├── Clerk ........ connexion avec GitHub ou Google, sessions
   ├── Neon ......... la base de données Postgres (profils, offres, entretiens)
   ├── OpenRouter ... l'IA (ta clé, pour ton compte)
   ├── ElevenLabs ... les voix (facultatif)
   └── Firecrawl .... la lecture des pages d'offres (facultatif)
```

### 📖 Les mots à connaître

| Mot | Ce que ça veut dire ici |
|---|---|
| **Repository (repo)** | Le dossier de code du projet, sur GitHub. **Fork** = ta propre copie sur GitHub ; **clone** = le télécharger sur ton ordinateur. |
| **Hébergement** (*hosting*) | Une entreprise qui fait tourner ton site sur ses ordinateurs, pour qu'il soit en ligne en permanence. Ici : **Vercel**. |
| **Serverless** | Tu ne loues ni ne gères aucun serveur. Vercel lance ton code à chaque requête et l'arrête après ; Neon réveille la base quand il faut et l'endort après 5 minutes sans activité (le premier clic après une pause est un peu plus lent). |
| **Base de données** | Là où les données sont gardées. Ici : **Postgres**, géré par **Neon** dans le cloud. |
| **Auth** | La connexion : qui es-tu ? Ici : **Clerk**, avec GitHub ou Google. |
| **API** | Une porte qu'un service ouvre pour les programmes (pas pour les humains avec un navigateur). NextRound appelle l'API d'OpenRouter pour parler à un modèle d'IA. |
| **Clé d'API** | Le badge qui ouvre cette porte : elle dit quel compte appelle, pour que le service le compte et le facture. Voir [les clés d'API, simplement](#-les-clés-dapi-simplement). |
| **Variables d'environnement (`.env`)** | Des réglages donnés à l'app au démarrage, hors du code : clés, adresse de la base… Sur ton ordinateur, dans un fichier `.env` que git ignore ; sur Vercel, dans les réglages du projet. |
| **CLI** | Un programme qu'on utilise en tapant des commandes dans un terminal. |
| **Déployer** (*deploy*) | Mettre une nouvelle version de l'app en ligne. |
| **Migration** | Un fichier qui crée ou modifie les tables de la base. Elle doit passer avant le code qui en a besoin. |
| **Offre gratuite** (*free tier*) | Le plan gratuit d'un service, avec des limites (stockage, requêtes par jour…). |

### 🧾 Ce que fait Stripe Projects

NextRound utilise six services. D'habitude, ça veut dire six inscriptions, six tableaux de bord et six clés d'API copiées à la main. **Stripe Projects** (un *plugin* de l'outil en ligne de commande de Stripe) le fait pour toi :

1. Tu te connectes à **ton** compte Stripe dans le terminal.
2. `stripe projects add vercel/project` (et pareil pour Neon, Clerk, OpenRouter…) crée pour toi le compte chez ce fournisseur, ou relie celui que tu as déjà, et crée la ressource (un projet Vercel, une base Neon, une application Clerk) sur son **offre gratuite**.
3. Le fournisseur remet les identifiants à Stripe, qui les garde chiffrés dans son **coffre à secrets**.
4. `stripe projects env --pull` les écrit dans le fichier `.env` de ton ordinateur. **Tu ne copies jamais une clé à la main.**
5. Stripe Projects ne les envoie pas à Vercel : c'est le script de NextRound `scripts/infra/push-env-to-vercel.mjs` qui le fait, et Vercel les stocke chiffrées.

Bon à savoir avant de commencer :

- ✅ Stripe Projects demande un **compte Stripe en mode live**, donc une **vérification d'identité**, comme pour tout compte de paiement. Tu ne vends rien, et les offres gratuites ne coûtent rien ; `stripe projects spend` montre ce que tu dépenses (normalement : aucune facturation).
- ✅ Accepter les conditions de chaque fournisseur lui transmet le nom, l'e-mail, le pays et le téléphone de ton compte Stripe. Le script te le demande à chaque fois.
- ⚠️ L'installation en une commande ci-dessous a été vérifiée en **simulation** (elle liste chaque étape sans rien faire) ; une installation complète sur des comptes tout neufs n'a pas encore été faite. Si une étape échoue, corrige puis relance la commande : les étapes déjà faites sont sautées.

### 🧰 Ce qu'il te faut

- 🐙 Un compte **GitHub**.
- 💳 Un compte **Stripe** en mode live (https://dashboard.stripe.com/register).
- 🟢 **Node.js** 20 ou plus récent (https://nodejs.org, la version « LTS ») et **Git** (https://git-scm.com).
- 🧾 La **Stripe CLI** et son *plugin* Projects. Sur macOS : `brew install stripe/stripe-cli/stripe`, puis `stripe plugin install projects`. Autres systèmes : https://docs.stripe.com/stripe-cli/install.

### 🚀 Pas à pas

1. **Fork** le repo sur GitHub (le bouton **Fork**, en haut à droite de https://github.com/SamiraBansaccal/nextround) : tu obtiens ta propre copie, qui pourra recevoir plus tard les mises à jour de la propriétaire.
2. **Clone ton fork** et installe les dépendances :
   ```bash
   git clone https://github.com/<ton-pseudo-github>/nextround.git
   cd nextround
   npm install
   ```
3. **Connecte-toi à Stripe** dans le terminal : `stripe login` (une page du navigateur te demande de confirmer).
4. **Regarde** ce qui va se passer, sans rien faire :
   ```bash
   npm run bootstrap -- --owner <ton-pseudo-github> --dry-run
   ```
5. **Lance-le pour de vrai** :
   ```bash
   npm run bootstrap -- --owner <ton-pseudo-github>
   ```
   Il passe par sept étapes, et te demande d'approuver des choses dans le navigateur en chemin :
   1. crée ton projet Stripe ;
   2. ajoute les offres gratuites : Vercel, Neon, Clerk, OpenRouter, Firecrawl, ElevenLabs ;
   3. écrit les identifiants dans `.env` ;
   4. crée les valeurs propres à l'app : les clés Clerk, une clé de chiffrement, et **toi comme propriétaire** (ton identifiant GitHub numérique) ;
   5. crée les tables de la base ;
   6. active la connexion GitHub dans ton application Clerk ;
   7. envoie les variables à Vercel et déploie. À la fin, tu obtiens ton adresse : `https://<nom>.vercel.app`.
6. **Ouvre ton app** et connecte-toi avec le compte GitHub donné à `--owner` : tu es la ou le propriétaire, donc les clés de l'instance (la clé OpenRouter créée pour toi) marchent pour ton compte sans rien coller.
7. **Décide qui peut s'inscrire.** Par défaut, tout le monde peut créer un compte (il lui faudra sa propre clé d'IA). Pour passer ton app sur invitation :
   ```bash
   npm run clerk:signup -- close             # toi seulement
   npm run clerk:signup -- allow ami@example.com
   npm run clerk:signup -- status            # qui est autorisé
   ```
   (Cette liste d'invités est gratuite avec la formule de développement de Clerk, celle qu'utilise l'installation ; avec une formule de production, elle est payante.)
8. **Vérifie tes coûts** quand tu veux : `stripe projects spend`.

### 🔄 Mettre à jour ta copie plus tard

Ta copie ne change jamais toute seule. Pour récupérer les nouveautés de la propriétaire :

1. Sur GitHub, ouvre ton fork et clique sur **Sync fork** → **Update branch**.
2. Sur ton ordinateur :
   ```bash
   git pull
   npm install
   node scripts/infra/deploy.mjs   # applique d'abord les nouvelles migrations de la base, puis déploie
   ```

Si tu as modifié le code toi-même, la synchronisation peut te demander de résoudre des conflits d'abord.

### 📏 Les offres gratuites, en chiffres

| Service | Offre gratuite |
|---|---|
| ▲ Vercel (Hobby) | Usage personnel et non commercial ; 1 000 000 d'appels de fonctions, 4 heures de CPU actif et 360 Go-heures de mémoire par mois ; au-delà, la fonction est suspendue jusqu'à la fin de la période de 30 jours |
| 🐘 Neon | 1 Go de stockage par projet, 100 heures de calcul par mois, mise en veille après 5 minutes sans activité |
| 🔐 Clerk | Jusqu'à 50 000 utilisateurs retenus par application |
| 🤖 OpenRouter | Modèles gratuits : 20 requêtes par minute et 50 par jour par compte (1 000 par jour après un achat unique de 10 $ de crédits) |
| 🎧 ElevenLabs | 10 000 crédits par mois, usage non commercial |
| 🕷️ Firecrawl | 1 000 pages par mois |

Chiffres vérifiés sur les pages de tarifs des fournisseurs le 2026-10-05 : ils peuvent changer.

### 🧑‍🔧 Sans Stripe Projects (avancé)

Possible, mais à la main : crée toi-même les comptes (Vercel, Neon, Clerk, OpenRouter), copie [`.env.example`](.env.example) en `.env` et remplis chaque valeur depuis le site du fournisseur (le fichier explique chaque ligne), lance `npm run db:migrate`, puis déploie avec `npx vercel` et ajoute les mêmes variables dans **Settings → Environment Variables** du projet Vercel. Ce chemin n'a pas été testé de bout en bout.

## 🔑 Les clés d'API, simplement

- 🎫 Une **clé d'API** est un mot de passe pour programmes. Quiconque la détient **agit au nom du compte à qui elle appartient** : ses requêtes sont comptées et facturées à ce compte. Une clé ne se partage donc jamais, ne s'écrit jamais dans le code et ne part jamais vers le navigateur.
- 🗂️ **Où NextRound les garde :**
  - les clés des services de la propriétaire : dans le coffre à secrets de Stripe, sur son ordinateur dans `.env` (ignoré par git), et en ligne dans les variables d'environnement de Vercel (chiffrées) ;
  - les clés que les utilisateurs enregistrent dans les **Réglages** : chiffrées dans la base (AES-256-GCM), jamais renvoyées au navigateur ;
  - dans le code : **aucune**. Tous les fichiers et tout l'historique git ont été passés au crible le 2026-10-05 (clés OpenRouter, Anthropic, OpenAI, Stripe, Clerk, ElevenLabs, Firecrawl et GitHub, *tokens*, mots de passe de base de données) : seulement des exemples factices, et aucun fichier `.env` n'a jamais été commité.
- 🧯 **Si une clé fuite :** supprime-la sur le site du fournisseur et crées-en une nouvelle (avec Stripe Projects : `stripe projects rotate <ressource>`).

## 🤖 Les limites de l'IA, expliquées

- 🧭 **OpenRouter est un intermédiaire** : un compte et une clé donnent accès à des centaines de modèles de différentes entreprises (Qwen d'Alibaba, Llama de Meta, Mistral…). Un modèle n'appartient à personne ; **la clé, si** : chaque appel fait avec une clé compte pour le compte qui la possède.
- 🆓 **Les modèles gratuits** (leur identifiant finit par `:free`) : OpenRouter autorise chaque **compte** à 20 requêtes par minute et 50 par jour, tous modèles gratuits confondus (1 000 par jour une fois 10 $ de crédits achetés). Créer d'autres clés ou d'autres comptes n'ajoute pas de capacité.
- 🚦 **Les limites de NextRound** : sur la clé de l'instance de la propriétaire, NextRound ajoute 8 appels par minute et 40 par jour, sous les 50 d'OpenRouter, pour qu'une rafale ne vide jamais sa journée. Elles ne s'appliquent qu'à son compte, puisque aucun autre compte ne peut utiliser cette clé.
- 🙋 **Ta propre clé = tes propres limites.** L'usage de la propriétaire et le tien ne se mélangent jamais.
- 💡 **Le gratuit suffit-il ?** Oui. Les modèles gratuits sont plus lents et parfois saturés (un modèle de secours est alors essayé), mais NextRound vérifie chaque sortie de l'IA par le code : un modèle plus faible ne peut pas glisser de faits inventés. Un modèle payant est plus rapide et écrit mieux.
- 🧮 **Ce qui consomme un appel :** un par retour sur une réponse, un par offre lue, un par CV lu, un par CV ou lettre rédigé. Les questions d'entretien n'en consomment aucun.

## 🛠️ Pour les devs

### 💻 Faire tourner le code sur ton ordinateur (pour le modifier)

> Seulement si tu veux **modifier le code** de NextRound. Pour simplement utiliser ta copie, tu n'en as jamais besoin : elle tourne sur Vercel.

**Pourquoi le faire tourner chez toi ?** Pour changer le code et voir le résultat en une seconde, sans rien mettre en ligne. C'est la façon normale de développer : tu modifies un fichier, tu l'enregistres, et la page se recharge toute seule.

**Ce qui tourne où.** Seul le code passe sur ton ordinateur. La base de données et la connexion restent dans le cloud : il n'y a pas de base de données sur ton ordinateur. Ton fichier `.env`, écrit par l'installation, dit à l'app où les trouver, et il donne les mêmes adresses que celles de ta copie en ligne ([ADR 0014](docs/fr/adr/0014-une-seule-base.md)) :

```
En ligne      ton navigateur → Vercel fait tourner le code          → Neon (données) + Clerk (connexion) + OpenRouter (IA)
npm run dev   ton navigateur → ton ordinateur fait tourner le code  → les mêmes Neon + Clerk + OpenRouter
```

**Ce que ça veut dire pour toi :**

- 🗄️ Ce sont tes **vraies données** : un fait que tu ajoutes sur http://localhost:3000 est aussi dans ton app en ligne, et ce que tu y supprimes est supprimé en ligne aussi.
- 🤖 Les appels d'IA que tu fais en testant comptent sur ton vrai quota d'IA.
- 🔐 Tu te connectes avec le même compte qu'en ligne.
- 🚀 Tes modifications du code restent sur ton ordinateur tant que tu ne les déploies pas (`node scripts/infra/deploy.mjs`).

**Comment :**

```bash
npm run dev     # puis ouvre http://localhost:3000 ; Ctrl+C dans le terminal pour arrêter
```

Il faut le fichier `.env` écrit par l'installation : sans lui, les pages affichent une erreur qui nomme les variables manquantes.

### 🧱 Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 + shadcn/ui · Drizzle ORM sur Neon Postgres · Clerk (connexion GitHub et Google) · zod · Vitest + PGlite · Playwright. Services créés avec [Stripe Projects](https://docs.stripe.com/projects) ([ADR 0001](docs/fr/adr/0001-provisionnement-stripe-projects.md)).

### 🗂️ Organisation du repo

```
app/          🖥️  pages et routes ; (app)/ est la zone connectée
components/   🧩  l'interface seulement, un dossier par zone (offres, profil, entretien…)
lib/          🧠  la logique : server/, data/, ai/, offers/, profile/, documents/, interview/, i18n/…
tests/        🧪  Vitest, un dossier par domaine ; e2e/ pour Playwright
scripts/      ⚙️  infra/, owner/, offers/, avatars/, test/
drizzle/      🗄️  migrations SQL
docs/         📚  guides, décisions d'architecture (ADR), journal
```

Visite complète : [docs/fr/guides/architecture.md](docs/fr/guides/architecture.md).

### 🧪 Commandes

```bash
npm run dev          # http://localhost:3000 (demande un .env)
npm test             # tests unitaires, sans secret
npm run e2e          # chaque écran dans un vrai navigateur (demande les clés Clerk et Neon)
npm run build && E2E_PROD=1 npm run e2e   # les mêmes écrans sur le build de production (CSP plus stricte)
npm run db:migrate   # appliquer les nouvelles migrations avant de déployer
npm run clerk:signup -- status | close | open | allow <email> | disallow <email>
```

### 🔒 Sécurité

| | Mesure |
|---|---|
| 🔑 | Secrets uniquement dans les variables d'environnement (`.env` ignoré par git, variables Vercel) ; repo et historique passés au crible |
| 👑 | Les clés de l'instance (IA, voix, pages d'offres) ne servent qu'au compte de la propriétaire, reconnue par son identifiant GitHub numérique ([ADR 0023](docs/fr/adr/0023-cles-de-l-instance-pour-la-proprietaire.md)) |
| 🧱 | Chaque table a un `user_id` ; chaque requête filtre par l'utilisateur de la session ; testé sur un Postgres en mémoire ([ADR 0012](docs/fr/adr/0012-isolation-des-donnees.md)) |
| 🔐 | Clés d'API des utilisateurs chiffrées, masquées, jamais journalisées |
| 🛡️ | Content-Security-Policy stricte avec un *nonce* par requête ; aucun affichage dans une *frame* |
| 🌐 | Pages d'offres : adresses http(s) publiques seulement, revérifiées à l'ouverture de la connexion (pas de DNS rebinding) |
| 🧾 | Validation zod et limites de taille sur chaque *server action* |
| 🤖 | Offres, CV et réponses sont des données non fiables dans les *prompts* ; chaque sortie de l'IA est vérifiée par le code et affichée en texte brut |

### ⚠️ Limites connues

- Les réponses à l'oral utilisent la reconnaissance vocale du navigateur (Chrome, Edge).
- Les offres arrivent par lien ou texte collé ; Indeed bloque les robots, ses offres se collent.
- Clerk tourne en instance de développement (badge « Development mode », identifiants GitHub/Google partagés).
- Une seule base sert au développement local et à la production ([ADR 0014](docs/fr/adr/0014-une-seule-base.md)).
- Les modèles gratuits peuvent être saturés ; un modèle de secours est configuré.
