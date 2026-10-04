# 🧭 ADR 0024 — Pas de tableau de bord : le profil est la page d'accueil

> 🇬🇧 English version: [en/adr/0024](../../en/adr/0024-no-dashboard.md)

- **Date :** 2026-10-05
- **Statut :** ✅ acceptée

## 🎯 Contexte

Le tableau de bord (`/dashboard`) était la page affichée après la connexion. À l'usage, la propriétaire a trouvé qu'il n'apportait rien : chaque bloc répétait une autre page.

| Bloc du tableau de bord | Déjà sur |
|---|---|
| Cartes d'offres par parcours, étape choisie sur la carte | Offres |
| Bandeau « Ajouter une offre » | Offres (même formulaire) |
| Nombre de faits validés, lien vers le profil | Profil |
| IA et voix utilisées | Réglages (l'encart « Ce qui est branché ») |
| « Pour commencer » (import GitHub ou CV) | Profil (les blocs d'import) |
| Salutation (« Bonjour … ») et nombre de candidatures en cours | nulle part : de la décoration |

## ✅ Décision

- Le tableau de bord est retiré. Le menu suit l'ordre du travail : **Profil → Offres → Entretiens → Réglages**.
- Le profil, la base d'où tout est écrit ([ADR 0022](0022-le-profil-est-la-base.md)), devient la page d'accueil : après la connexion, depuis l'accueil public quand on est déjà connecté, et depuis le logo.
- `/dashboard` renvoie vers `/profile` (`next.config.ts`) : les anciens liens et favoris marchent toujours.
- Le composant des cartes d'offres passe dans `components/offers/opportunities.tsx` ; ses textes rejoignent `lib/i18n/offers.ts`. La salutation (`lib/dashboard/`), le bloc « Pour commencer », la carte « IA utilisée » et le fichier de textes du tableau de bord sont supprimés.

## ⚖️ Conséquences

- 👍 Une page de moins à maintenir et à traduire ; plus rien n'est affiché deux fois.
- 👍 Un nouveau compte arrive là où il commence : l'import de ses CV et de son GitHub.
- 👎 Plus de page de synthèse : le nombre de candidatures en cours et la salutation ont disparu. Si une synthèse revient un jour, elle devra montrer ce qu'aucune autre page ne montre (échéances, relances de la semaine…).
