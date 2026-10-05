# 🔁 ADR 0025 — Doublons fusionnés pour de bon, une seule façon d'écrire les dates des CV, les phrases de la candidate rejoignent la base

> 🇬🇧 English version: [en/adr/0025](../../en/adr/0025-merge-for-good-dates-and-own-words.md)

- **Date :** 2026-10-05
- **Statut :** ✅ acceptée
- **Amende :** [ADR 0022](0022-le-profil-est-la-base.md)

## 🎯 Contexte

L'ADR 0022 laissait trois points ouverts :

- les faits en double n'étaient que **repliés à l'affichage**. Pire, corriger au crayon un fait replié supprimait ses autres formulations **sans** déplacer ce qui les citait : une exigence d'offre couverte par l'une d'elles redevenait une lacune, et une phrase de CV perdait sa marque de preuve ;
- les dates des CV avaient toutes les formes : « janvier 2025 - Juin 2025 », « 2023 à aujourd'hui », « January – June 2025 », « 03/2024 ». Une seule règle de la propriétaire : **ne jamais inventer de date** ;
- un CV ou une lettre ajouté au profil gardait hors de la base les phrases que la candidate avait corrigées à la main : le rapprochement avec les offres les ignorait.

## ✅ Décision

- **Fusionner pour de bon** (`mergeFacts`, `lib/data/facts.ts`) : chaque référence à une formulation fusionnée pointe vers la formulation gardée, dans les exigences d'offres, les phrases de CV et de lettres, les réponses types et les citations des retours (`lib/profile/merge-facts.ts`). Ensuite seulement, les autres formulations sont supprimées. C'est utilisé par :
  - un lien « Fusionner » sur chaque fait replié ;
  - un bouton « Fusionner les doublons (N) » sur la base ;
  - le crayon, quand le fait corrigé regroupe d'autres formulations.

  Les groupes sont recalculés côté serveur, comme sur la page.
- **Une seule façon d'écrire les dates des CV**, appliquée à l'affichage ; ce qui est stocké reste tel que lu (`lib/profile/cv-dates.ts`). Les mois sont écrits en toutes lettres (en minuscules en français), avec un tiret demi-cadratin entre deux dates et « aujourd'hui » / « present » pour une période en cours. **Rien n'est ajouté** :
  - une année reste une année ;
  - une année partagée par deux mois reste partagée (« January – June 2025 », car « décembre – janvier 2025 » peut commencer l'année d'avant) ;
  - « 03/2024 » devient seulement « mars 2024 » ;
  - une période qu'on ne sait pas lire avec certitude reste exactement telle quelle (« Bruxelles, 2019 », « depuis 2023 », « été 2022 ») ;
  - un CV dans une autre langue que le français ou l'anglais aussi.
- **Les mots de la candidate rejoignent la base** :
  - une phrase modifiée au crayon est marquée `edited` ;
  - quand son document est dans le profil (ajouté, ou modifié pendant qu'il y est), chacune de ces phrases devient un fait validé (`lib/documents/hand-written.ts`, source « ajouté à la main ») ;
  - son type vient de sa place : une puce garde le titre de son entrée, et les phrases du résumé et des lettres deviennent des réalisations.

  Les phrases écrites par l'IA n'y vont pas : elles ne font que reformuler des faits déjà présents. Les phrases d'une lettre sur l'entreprise non plus.

## ⚖️ Conséquences

- 👍 Une offre, un document ou une réponse ne perd jamais sa preuve quand des doublons sont fusionnés (testé sur un Postgres en mémoire, et de bout en bout).
- 👍 Un seul style de date par CV, sans précision ajoutée.
- 👍 Ce que la candidate écrit dans un document compte dans le rapprochement avec les offres.
- 👎 Une fusion ne se défait pas, et elle perd la provenance des formulations fusionnées (quel autre CV le disait). Si la règle de ressemblance replie un jour deux faits différents, « Fusionner les doublons » en supprime un : la confirmation montre ce qui sera fusionné pour une fusion seule, pas pour la fusion globale.
- 👎 Les faits venus d'un document ne sont jamais retirés automatiquement, même si le document quitte le profil ou si la phrase est corrigée à nouveau (une phrase recorrigée peut alors apparaître deux fois, repliée, fusionnable).
- 👎 Les phrases du résumé et des lettres arrivent sous « Réalisations », même quand elles parlent d'une expérience.
