# 🚦 ADR 0006 — Les limites des clés de l'instance sont comptées dans Postgres

> 🇬🇧 Version anglaise : [ENG/adr/0006](../../ENG/adr/0006-instance-limits-in-postgres.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée

## 🎯 Contexte

Le propriétaire de l'instance se rabat sur les clés de l'instance (OpenRouter, ElevenLabs,
Firecrawl). Les modèles gratuits d'OpenRouter autorisent **50 requêtes par jour** à un compte qui
n'a jamais acheté de crédits, 1 000 avec au moins 10 dollars de crédits (vérifié dans la doc
d'OpenRouter). La spec demande une limite de débit et un plafond quotidien **seulement sur les
appels faits avec les clés de l'instance**. Vercel fait tourner l'app en fonctions *serverless* :
plusieurs instances peuvent tourner en même temps, et aucune ne garde de mémoire entre deux
requêtes.

## ✅ Décision

- Les compteurs vivent dans la table `usage_counters` — par utilisateur, par jour UTC, par type
  (`llm`, `tts`, `scrape`) — incrémentés de façon atomique avec
  `INSERT … ON CONFLICT DO UPDATE … RETURNING count`.
- Un compteur par minute utilise la même table (`llm:minute:HH:MM`).
- Valeurs par défaut (`lib/ai/usage.ts`) : IA 8 par minute et **40 par jour** (sous les 50
  d'OpenRouter, qui comptent aussi les relances), voix 10/60, lecture de pages 5/30.
- Seuls les appels faits avec les clés **de l'instance** sont comptés — chaque essai, relances
  comprises. Les utilisateurs qui ont leur propre clé ne sont limités que par leur fournisseur.

## 📊 Conséquences

**Bonnes** 👍

- Les limites tiennent entre instances *serverless*, sans ajouter de service Redis.
- Testé sur un Postgres en mémoire : la limite par minute, le plafond quotidien et la remise à zéro
  le lendemain (`tests/ai/ai-config.test.ts`).

**Mauvaises** 👎

- **Un aller-retour de plus vers la base par appel d'IA** sur le chemin de l'instance.
- Les compteurs par minute accumulent des lignes (quelques-unes par minute active) ; rien ne les
  purge encore. Sans conséquence à cette échelle, à nettoyer un jour.
- La fenêtre quotidienne est le jour UTC, pas l'heure de Bruxelles : le compteur repart à 02:00
  l'été (01:00 l'hiver), heure belge.
- 40 par jour, c'est peu pour la démo du propriétaire : un entretien complet avec un retour sur
  chaque réponse peut consommer 15 à 25 appels.
