# 📐 Décisions d'architecture (ADR)

> 🇬🇧 **Version anglaise : [docs/en/adr/](../../en/adr/)** — c'est là que les ADR sont écrits
> d'abord. Ceci en est la traduction.

## 🧭 Sommaire

- [📋 La liste](#-la-liste)
- [🧭 Les questions auxquelles ces ADR répondent le plus souvent](#-les-questions-auxquelles-ces-adr-répondent-le-plus-souvent)
- [✍️ En écrire un nouveau](#️-en-écrire-un-nouveau)

Un ADR enregistre **une décision, son contexte et ses conséquences** — y compris les mauvaises.
On en écrit un quand un choix serait sinon invisible dans le code, ou quand quelqu'un risque de le
défaire sans savoir pourquoi il a été pris.

## 📋 La liste

| # | Décision | Statut |
|---|---|---|
| 🧰 [0001](0001-provisionnement-stripe-projects.md) | Tous les services sont créés avec Stripe Projects ; s'auto-héberger, c'est tout recréer sur ses propres comptes | ✅ acceptée |
| 🐘 [0002](0002-neon-et-clerk.md) | Neon (Postgres) + Clerk (connexion) plutôt que Supabase | ✅ acceptée |
| 🔎 [0003](0003-l-ia-propose-le-code-verifie.md) | L'IA propose, le code vérifie : citations mot pour mot, faits validés, alias courts | ✅ acceptée |
| 🔌 [0004](0004-un-client-compatible-openai.md) | Un seul client compatible OpenAI ; seulement des *presets* sur l'instance publique | ✅ acceptée — **amendée** par 0018 |
| 🔐 [0005](0005-cles-chiffrees.md) | Les API keys des utilisateurs sont chiffrées au repos avec une clé d'application | ✅ acceptée |
| 🚦 [0006](0006-limites-dans-postgres.md) | Les limites des clés de l'instance sont comptées dans Postgres | ✅ acceptée |
| 🚚 [0007](0007-deployer-depuis-la-machine.md) | On déploie depuis la machine avec la CLI Vercel, pas depuis GitHub | ✅ acceptée — **amendée** le 2026-10-04 (rotation du token) |
| 🎨 [0008](0008-lovable-source-du-design.md) | Lovable est la source du design, reporté à la main, dans un seul sens | ✅ acceptée — **étendue** le 2026-10-04 (tous les écrans) |
| 📄 [0009](0009-pdf-lus-dans-le-navigateur.md) | Les CV PDF sont lus dans le navigateur ; seul leur texte part au serveur | ✅ acceptée |
| 🔊 [0010](0010-la-voix.md) | ElevenLabs ne lit que les questions de l'utilisateur ; la dictée reste dans le navigateur | ✅ acceptée — **amendée** par 0020 |
| 🎯 [0011](0011-une-seule-serie-de-questions.md) | Une seule série de questions par entretien ; le *focus* la filtre | 🔁 remplacée par 0017 |
| 🧱 [0012](0012-isolation-des-donnees.md) | Un `user_id` sur chaque table, imposé dans `lib/data`, testé sur un Postgres en mémoire | ✅ acceptée |
| 🆓 [0013](0013-modeles-gratuits-par-defaut.md) | Modèles gratuits par défaut : la qualité dépend du modèle, la sûreté non | ✅ acceptée |
| 🗄️ [0014](0014-une-seule-base.md) | Une seule base pour le développement local, les tests sur l'app et la production | ⚠️ acceptée comme **dette** |
| 🧮 [0015](0015-resume-calcule-par-le-code.md) | Le résumé d'entretien est calculé par le code, pas écrit par l'IA | ✅ acceptée |
| 📏 [0016](0016-verification-visuelle-par-la-mesure.md) | Les écrans sont vérifiés par la mesure, avec un utilisateur de test jetable | ✅ acceptée |
| ✍️ [0017](0017-questions-ecrites-a-l-avance.md) | Les questions d'entretien sont écrites à l'avance ; l'IA ne fait que relire les réponses | ✅ acceptée |
| 🧠 [0018](0018-claude-via-son-propre-sdk.md) | Claude via le SDK d'Anthropic, la seule exception au client unique | ✅ acceptée |
| 🌍 [0019](0019-trois-langues.md) | Trois langues indépendantes : le site, chaque entretien, chaque document | ✅ acceptée |
| 🔊 [0020](0020-voix-payante-sur-demande.md) | La voix payante est sur demande, et une phrase n'est jamais payée deux fois | ✅ acceptée |
| 🗂️ [0021](0021-un-dossier-par-domaine.md) | Un dossier par domaine, aucun fichier en vrac | ✅ acceptée |
| 👤 [0022](0022-le-profil-est-la-base.md) | Le profil est la base : tout validé, fusionné, modifiable | ✅ acceptée |
| 🔐 [0023](0023-cles-de-l-instance-pour-la-proprietaire.md) | Les clés de l'instance ne servent qu'à la propriétaire ; inscription fermée pendant le dev | ✅ acceptée |
| 🧭 [0024](0024-pas-de-tableau-de-bord.md) | Pas de tableau de bord : le profil est la page d'accueil | ✅ acceptée |
| 🔁 [0025](0025-fusion-dates-et-phrases-de-la-candidate.md) | Doublons fusionnés pour de bon, une seule façon d'écrire les dates des CV, les phrases de la candidate rejoignent la base | ✅ acceptée |
| 📨 [0026](0026-demandes-d-acces.md) | Demandes d'accès : la liste d'attente de Clerk, un e-mail à la propriétaire, une réponse dans les Réglages | ✅ acceptée |
| 🔐 [0027](0027-clerk-par-sa-cli-pas-par-la-marketplace.md) | Clerk se crée avec sa propre CLI, pas depuis la Marketplace Vercel | ✅ acceptée |

> 📌 **Lisez les statuts.** Un ADR n'est jamais effacé : quand une décision change, l'ancien reste
> et indique où se trouve la suite. C'est ce qui permet de comprendre *pourquoi* une décision a
> changé, et pas seulement ce qu'elle est devenue.

## 🧭 Les questions auxquelles ces ADR répondent le plus souvent

**« Est-ce vraiment impossible que l'IA invente quelque chose ? »** → 0003 (comment), 0013
(pourquoi ça tient même avec un modèle faible), 0015 (le seul écran sans aucune IA).

**« Est-ce que je peux faire tourner mon propre NextRound ? »** → 0001 (une commande, vos
comptes), 0004 (modèles locaux), 0007 (déployer), 0014 (ce qu'il faut changer pour un vrai
deploy).

**« Où vont mes données et mes clés ? »** → 0005 (clés), 0009 (CV), 0010 (voix), 0012 (isolation).

## ✍️ En écrire un nouveau

Reprendre la forme des existants : date, statut, contexte, décision, conséquences — **bonnes et
mauvaises**. Un ADR qui n'a que des bonnes conséquences n'a pas été écrit honnêtement.

**Écrire l'anglais d'abord**, dans `docs/en/adr/`, puis traduire ici. Nommer le fichier anglais
`NNNN-english-title.md`, le français `NNNN-titre-francais.md`, et ajouter la ligne aux **deux**
tableaux.
