# 🆓 ADR 0013 — Modèles gratuits par défaut : la qualité dépend du modèle, la sûreté non

> 🇬🇧 Version anglaise : [ENG/adr/0013](../../ENG/adr/0013-free-models-by-default.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée

## 🎯 Contexte

L'instance doit fonctionner à coût nul, et les utilisateurs doivent pouvoir apporter des modèles
gratuits. Les modèles gratuits sont plus petits, parfois saturés, et moins bons pour respecter un
format JSON.

## ✅ Décision

- **Modèle de l'instance** : `qwen/qwen3.8-27b:free`, avec `nvidia/nemotron-3-super-120b-a12b:free`
  en *fallback* OpenRouter (champ `models`). Choisi le 2026-10-03 parmi 17 modèles gratuits en en
  testant trois : Gemma 4 31B a répondu **429** (saturé chez le fournisseur), Qwen a donné un JSON
  valide en 1,0 s, Nemotron en 0,6 s. Les deux se changent sans toucher au code
  (`INSTANCE_LLM_MODEL`, `INSTANCE_LLM_FALLBACK_MODELS`).
- **Un JSON robuste** (`lib/ai/json.ts`) : demander uniquement du JSON, l'extraire même s'il est
  entouré de texte ou de balises de code, le valider avec zod, **relancer une fois** avec l'erreur
  de validation exacte, sinon « This model could not return valid output — try another model. »
- **La sûreté vient de l'[ADR 0003](0003-l-ia-propose-le-code-verifie.md)**, pas du modèle.

## 📊 Conséquences

**Bonnes** 👍

- Mesuré de bout en bout avec le modèle gratuit : analyse d'une offre 7 s, dix questions 19 s, CV
  et lettre 27 s, toutes les réponses valides du premier coup.
- Un modèle faible dégrade la **qualité** (moins de questions, plus vagues ; plus d'éléments
  retirés), jamais la **vérité**.

**Mauvaises** 👎

- **Les modèles gratuits disparaissent et saturent.** La liste change de mois en mois ; le modèle
  par défaut est à revérifier (`GET https://openrouter.ai/api/v1/models`).
- La latence est élevée pour une fonction interactive (jusqu'à une minute, annoncée dans
  l'interface).
- La relance double le coût d'une mauvaise réponse, et compte deux fois dans le quota de
  l'instance.
