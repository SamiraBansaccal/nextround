# 🔊 ADR 0010 — ElevenLabs ne lit que les questions de l'utilisateur ; la dictée reste dans le navigateur

> 🇬🇧 Version anglaise : [en/adr/0010](../../en/adr/0010-voice.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée — **amendée** par l'[ADR 0020](0020-voix-payante-sur-demande.md) (voix de l'instance sur demande)

## 🎯 Contexte

Le mode vocal : la question est lue à voix haute, la réponse est dite puis transcrite. Même logique
de « qui paie » que pour l'IA : la clé ElevenLabs de l'utilisateur, sinon celle de l'instance pour
le propriétaire, sinon la voix gratuite du navigateur. Stripe Projects ne propose que la
**synthèse vocale** d'ElevenLabs (`elevenlabs/tts`).

## ✅ Décision

- **`POST /api/tts` prend un identifiant de question, pas un texte.** Il vérifie que la question
  appartient à l'utilisateur connecté, puis synthétise **le texte de cette question** (voix
  « Sarah », modèle `eleven_flash_v2_5`, tous deux repris de la skill officielle d'ElevenLabs). Il
  ne peut pas servir à faire lire un texte quelconque avec notre clé.
- **204 veut dire « utilise la voix du navigateur »** : pas de clé, quota atteint ou erreur du
  provider. Le client retombe alors sur `speechSynthesis`, dans la langue de l'offre.
- **La dictée utilise la reconnaissance vocale du navigateur** (Web Speech API, Chrome et Edge),
  dans la langue de l'offre. La transcription s'ajoute à la zone de réponse et **reste modifiable**
  avant l'envoi.
- La clé de l'instance est comptée comme l'IA (10 par minute, 60 par jour).

## 📊 Conséquences

**Bonnes** 👍

- Une vraie voix de recruteuse avec la clé de l'instance, la voix gratuite sinon ; la fonction ne
  casse jamais faute de clé.
- La clé vocale ne peut pas être détournée par notre point d'accès.

**Mauvaises** 👎

- **La dictée ne marche pas dans Firefox ni dans Safari** (pas de `SpeechRecognition`) ;
  l'utilisateur tape sa réponse à la place.
- **La transcription d'ElevenLabs n'est pas branchée** : la clé fournie est un service de synthèse,
  et son droit à la transcription n'a pas été vérifié. La qualité de la reconnaissance du navigateur
  varie avec l'accent et le micro.
- Dans Chrome, la reconnaissance vocale envoie l'audio aux serveurs de Google. C'est le
  fonctionnement du navigateur, pas celui de NextRound — il faudrait le dire aux utilisateurs.
