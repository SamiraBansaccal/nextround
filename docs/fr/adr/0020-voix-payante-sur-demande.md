# 🔊 ADR 0020 — La voix payante est sur demande, et une phrase n'est jamais payée deux fois

> 🇬🇧 English version: [en/adr/0020](../../en/adr/0020-paid-voice-is-opt-in.md)

- **Date :** 2026-10-04
- **Statut :** ✅ acceptée — **amende** l'[ADR 0010](0010-la-voix.md)

## 🎯 Contexte

La propriétaire a un plan ElevenLabs Creator et ne voulait pas que ses crédits partent dans des tests. Avec l'[ADR 0010](0010-la-voix.md), elle passait automatiquement sur la clé ElevenLabs de l'instance. Les questions sont désormais des textes fixes ([ADR 0017](0017-questions-ecrites-a-l-avance.md)) : une même phrase dans une même voix peut être réutilisée.

## ✅ Décision

- La clé ElevenLabs de l'instance n'est utilisée **que** si `INSTANCE_VOICE_ENABLED=true`. Sinon la propriétaire a la voix gratuite du navigateur, comme tout le monde sans clé.
- Les requests de *text-to-speech* sont marquées `static` (texte fixe) : leur audio est mis en cache par *provider*, voix, réglages, langue et texte (`lib/voice/audio-cache.ts`), et l'onglet garde l'audio déjà joué.
- L'app montre où des crédits sont dépensés : le libellé de la voix, les cartes des réglages, sous le bouton « Submit answer ».

## 📊 Conséquences

**Bonnes** 👍

- Aucun crédit dépensé par accident ; réécouter une question est gratuit.

**Mauvaises** 👎

- Le cache vit dans la mémoire du serveur (limité, le moins récent sort en premier) : un redémarrage ou une autre instance *serverless* l'oublie. Un stockage durable (Vercel Blob, S3) reste à faire.
