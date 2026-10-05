# 👤 ADR 0022 — Le profil est la base : tout validé, fusionné, modifiable

> 🇬🇧 English version: [en/adr/0022](../../en/adr/0022-profile-is-the-base.md)

- **Date :** 2026-10-04
- **Statut :** ✅ acceptée, amendée par l'[ADR 0025](0025-fusion-dates-et-phrases-de-la-candidate.md) (doublons fusionnés pour de bon, dates des CV, phrases de la candidate)

## 🎯 Contexte

Le profil demandait d'approuver chaque fait trouvé dans les CV, sous chaque ligne. Or tout vient des propres CV et comptes de la candidate : l'approbation était une corvée. Avec plusieurs CV (anciens et récents, tech ou non), la même expérience apparaissait plusieurs fois, et une faute ou une date bizarre ne se corrigeait qu'en réimportant.

## ✅ Décision

- Chaque import (CV, GitHub, Codewars, LeetCode, chat, à la main) crée des faits **validés**. Les faits d'avant cette règle sont validés à l'ouverture du profil.
- Les quasi-doublons (même type, mêmes mots) sont repliés **à l'affichage** : la formulation la plus complète est montrée avec « aussi dans N autres sources ». La modifier ou la supprimer s'applique à toutes les formulations.
- Chaque ligne d'un CV, de la base, et chaque phrase d'un CV ou d'une lettre par offre a un petit crayon. Une phrase de document modifiée à la main garde les faits qu'elle cite et reste dans la même version.
- La sortie de l'IA reste non fiable : les documents par offre sont toujours vérifiés fait par fait (ADR 0003).

## ⚖️ Conséquences

- Plus de section « à valider » ; l'interrupteur « fait avec l'IA » reste sur les projets.
- Un fait mal lu dans un CV se voit dans la base, et se corrige au crayon ou se supprime à la poubelle.
