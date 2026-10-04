# 🔐 ADR 0005 — Les clés d'API des utilisateurs sont chiffrées au repos avec une clé d'application

> 🇬🇧 Version anglaise : [ENG/adr/0005](../../ENG/adr/0005-encrypted-user-keys.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée

## 🎯 Contexte

Les utilisateurs collent des clés d'API (IA et ElevenLabs) dans les Réglages. Ces clés peuvent leur
coûter de l'argent. Elles doivent être utilisables par le serveur, ne plus jamais être visibles dans
le navigateur, et inutiles à quelqu'un qui lirait la base.

## ✅ Décision

- **AES-256-GCM** (`lib/crypto.ts`) avec une clé de 32 octets, `APP_ENCRYPTION_KEY`, créée une fois
  par `scripts/setup-env.mjs` et stockée comme *project variable* Stripe Projects. Format :
  `v1:` + base64(IV de 12 octets | *tag* de 16 octets | texte chiffré). Un IV aléatoire neuf à
  chaque chiffrement ; le *tag* GCM fait échouer toute modification.
- **Le navigateur ne reçoit jamais que `PublicAiSettings`** : le fournisseur, le modèle, « a une
  clé » et les **4 derniers caractères** (`••••a3F9`). La clé déchiffrée n'existe que dans la
  fonction serveur qui fait l'appel.
- Changer de fournisseur sans donner de nouvelle clé **efface** l'ancienne : elle appartenait à un
  autre fournisseur.
- `setup-env.mjs` ne crée la clé de chiffrement **que si elle manque**.

## 📊 Conséquences

**Bonnes** 👍

- Un dump de la base ne révèle aucune clé à lui seul. Testé : le texte en clair n'apparaît jamais
  dans la valeur stockée, deux chiffrements diffèrent, un octet modifié ou une autre clé échouent
  (`tests/crypto.test.ts`).
- Les clés ne repartent jamais vers le navigateur, par construction des types.

**Mauvaises** 👎

- **Une seule clé pour tous les utilisateurs.** Qui possède à la fois la base et
  `APP_ENCRYPTION_KEY` lit toutes les clés. Des clés par utilisateur ou un KMS seraient plus
  solides ; hors périmètre.
- **La clé ne peut pas être changée en l'état** : modifier `APP_ENCRYPTION_KEY` rend toutes les clés
  stockées illisibles. Le préfixe `v1:` laisse la place à un mécanisme de rotation, qui n'existe
  pas encore.
- La clé ElevenLabs n'est pas testée à l'enregistrement (pas d'appel d'API) ; une mauvaise clé se
  découvre quand l'entretien essaie de lire une question (et retombe alors sur la voix du
  navigateur).
