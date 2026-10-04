# 📄 ADR 0009 — Les CV PDF sont lus dans le navigateur ; seul leur texte part au serveur

> 🇬🇧 Version anglaise : [ENG/adr/0009](../../en/adr/0009-pdfs-read-in-the-browser.md)

- **Date :** 2026-10-03
- **Statut :** ✅ acceptée

## 🎯 Contexte

La spec demande l'import de CV ou d'exports LinkedIn en PDF (PDF seulement, jusqu'à 5 Mo), et
l'auteur du projet veut ajouter **autant de CV qu'il en a** — un par candidature envoyée — pour que
tous alimentent une seule base de faits. Les fonctions Vercel acceptent **au plus 4,5 Mo** par
corps de requête, en dessous de la limite de 5 Mo de la spec ; les *server actions* de Next.js
s'arrêtent à 1 Mo par défaut.

## ✅ Décision

- Le PDF est ouvert **dans le navigateur** avec `unpdf` (une version *serverless* de PDF.js), après
  trois contrôles : nom en `.pdf` / type `application/pdf`, taille ≤ 5 Mo, et les premiers octets
  valent `%PDF-`.
- Seul `{ fileName, text }` est envoyé à la *server action* `importCvTextAction`, qui le valide avec
  zod (100 à 60 000 caractères, coupé à 15 000 pour l'IA).
- Plusieurs fichiers peuvent être choisis d'un coup ; ils sont traités l'un après l'autre, avec un
  état par fichier. Un fait déjà trouvé dans un autre CV n'est pas reproposé (`factKey` : casse,
  ponctuation et espaces ignorés).
- Chaque CV est une ligne de `sources` ; ses faits y renvoient par `source_ref = "cv:<id de la
  source>"` (deux CV peuvent porter le même nom de fichier). Retirer un CV retire ses faits **non
  validés** et garde les faits validés.

## 📊 Conséquences

**Bonnes** 👍

- **Le PDF ne quitte jamais l'ordinateur de l'utilisateur** : un gain de confidentialité qui mérite
  d'être dit.
- Aucune limite de taille de requête à combattre, quel que soit le poids du PDF.
- Mesuré : un PDF de 19 Ko a donné 408 caractères de texte et 11 faits proposés, tous avec une
  citation vérifiée.

**Mauvaises** 👎

- **Les PDF scannés (des images) n'ont pas de texte** : ils sont refusés (« almost no text — is it
  a scan? »). Pas d'OCR.
- Le serveur ne peut pas prouver que le texte vient d'un PDF : un utilisateur pourrait envoyer
  n'importe quel texte comme « CV ». Acceptable — ce sont ses propres données, il pourrait aussi
  taper ses faits à la main.
- L'extraction perd la mise en page (colonnes, tableaux) ; les citations doivent quand même être
  mot pour mot *dans le texte extrait*, qui est ce que l'utilisateur voit dans la citation.
