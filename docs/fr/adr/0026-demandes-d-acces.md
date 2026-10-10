# 📨 ADR 0026 — Demandes d'accès : la liste d'attente de Clerk, un e-mail à la propriétaire, une réponse dans les Réglages

> 🇬🇧 English version: [en/adr/0026](../../en/adr/0026-access-requests.md)

- **Date :** 2026-10-05
- **Statut :** ⛔ remplacée par l'[ADR 0028](0028-neon-auth-et-une-base-a-londres.md) : le formulaire et la liste d'attente de Clerk sont partis avec Clerk ; un lien e-mail en attendant, les invitations à refaire avec Resend
- **Fait suite à :** [ADR 0023](0023-cles-de-l-instance-pour-la-proprietaire.md) (inscription fermée pendant le dev)

## 🎯 Contexte

L'inscription se fait sur invitation (ADR 0023). Les amis de la propriétaire veulent utiliser l'app : il leur faut un moyen de demander, et la propriétaire veut un **e-mail** pour chaque demande. Ni son adresse ni son identifiant ne doivent être écrits dans le code : l'e-mail part vers la personne propriétaire du déploiement, quelle qu'elle soit.

## ✅ Décision

- **Un formulaire « Request access »** sur la page d'accueil et la page d'inscription (publiques, en anglais comme ces pages) : adresse e-mail, nom et message facultatifs.
- **La demande est gardée dans la liste d'attente de Clerk** (`waitlistEntries.create`, l'adresse seulement, `notify: false` : Clerk n'envoie rien à une adresse tapée par un inconnu). Pas de nouvelle table.
- **La propriétaire est retrouvée à l'exécution** : le compte Clerk relié au compte GitHub `OWNER_GITHUB_ID`, et son adresse vérifiée (`lib/server/owner.ts`), la même règle que la vérification de propriétaire.
- **L'e-mail part avec Resend** (offre gratuite, via Stripe Projects) quand `RESEND_API_KEY` est défini ; l'expéditeur est l'adresse de test de Resend, sauf si `ACCESS_MAIL_FROM` en donne une vérifiée. Texte brut, puisque le nom et le message viennent d'un inconnu. Sans clé, aucun e-mail : les demandes attendent quand même dans les Réglages.
- **Limites** : 3 demandes par jour et par visiteur (adresse IP hachée), 20 e-mails par jour vers la propriétaire, et un champ caché que les robots remplissent.
- **La propriétaire répond dans les Réglages** (carte « Demandes d'accès », réservée à la propriétaire) : **Autoriser** ajoute l'adresse à la liste d'autorisation et invite l'entrée de la liste d'attente, donc Clerk envoie une invitation par e-mail ; **Refuser** la rejette ; la liste des invités montre qui peut s'inscrire, avec **Retirer**.

## ⚖️ Conséquences

- 👍 Les amis peuvent demander sans connaître l'adresse de la propriétaire ; elle reçoit un e-mail et répond en un clic ; c'est Clerk qui envoie l'invitation.
- 👍 Rien sur la propriétaire n'est dans le code : un autre déploiement prévient sa propre propriétaire.
- 👎 Le nom et le message ne voyagent que dans l'e-mail : la liste d'attente de Clerk ne garde que l'adresse.
- 👎 Sans domaine vérifié, Resend ne livre qu'à l'adresse du compte Resend : l'adresse Clerk de la propriétaire doit être celle que Stripe Projects a utilisée pour ce compte (c'est le cas ici), sinon il faut vérifier un domaine.
- 👎 Une personne refusée ne peut pas redemander par le formulaire : Clerk garde l'entrée rejetée.
- 👎 La limite par adresse IP est partagée par les personnes derrière un même réseau (une école, un bureau).
- 👎 Un formulaire public est une nouvelle porte pour le spam ; les limites et le champ caché la réduisent, sans la fermer.
