---
name: add-interviewer
description: Add a new interviewer character to NextRound (e.g. "add Kratos from God of War"): catalog entry with personality and traits, French/English lines said around questions, category if needed, avatar references and behaviour clip plan, tests. Use whenever someone asks to add, create or onboard an interviewer, character or persona.
---

# Add an interviewer

An interviewer is **data**, never component code. Adding one touches these places, in this order. Work from
what the character is known for (its own canon), not from another character.

## 1. Decide the kind and the category

- `kind` (lib/interviewers/types.ts): `fictional_character` (fan parody: Kratos), `original` (made for
  NextRound), `archetype` (invented workplace type), `real_person` (speaking-style parody only).
- Category: reuse one from `lib/interviewers/categories.ts` if it fits. Otherwise create it:
  1. add `{ id, label: {en, fr}, description: {en, fr}, icon }` to `CATEGORIES` (icon: a lucide-style key; unknown keys fall back);
  2. create `lib/interviewers/catalog/<category>.ts` with
     `export const games = defineCategory("games", { kind: "fictional_character", role: GUEST }, [ … ]);`
     and a one-line comment saying who owns the characters;
  3. import it in `lib/interviewers/index.ts` and add it to `INTERVIEWERS`.

## 2. Catalog entry (lib/interviewers/catalog/<category>.ts)

```ts
{
  id: "kratos",                       // kebab-case, stable: used in URLs, the database, file names
  name: "Kratos",
  // nameFr: "…",                     // only if the French name differs
  style: { en: "Stern, terse and relentless", fr: "Sévère, laconique et implacable" },
  description: { en: "Few words, heavy silences. BOY.", fr: "Peu de mots, de lourds silences. PETIT." },
  personality: "Stoic, stern, protective, restrained anger",
  interviewStyle: "Short commanding questions, long silences, expects discipline and honesty",
  vocabulary: "Terse, grave, archaic",
  followUpStyle: "challenging",       // gentle | probing | rapid | challenging | tangential | silent
  traits: { severity: 5, warmth: 2, formality: 4, humour: 1, interruption: 2, questionLength: 1, pressure: 5, energy: 2, confidence: 5, unpredictability: 2 },
  voiceStyle: "deep, gravelly, slow, controlled",
  llmInstructions: "Speaks in short, heavy sentences. Never cruel to the candidate: stern mentor energy.",
}
```

Traits are 1–5 and drive everything else: question length, interruptions, and how big the avatar's
reactions are (`scripts/avatars/behaviours.mts`). Keep `style` and `description` short and in both languages.

## 3. Lines said around questions (lib/interviewers/flavor/packs.ts)

Add an entry to `CHARACTER_PACKS` (fictional, original and archetype characters only: **never** for
`real_person`, a test enforces it). Each line in `en` and `fr`, short, said AROUND a question, never inside it:

```ts
kratos: {
  greetings: [{ en: "Sit. We begin.", fr: "{Asseyez-vous|Assieds-toi}. Nous commençons." }],
  interjections: [{ en: "Hm.", fr: "Hm." }],
  openers: [{ en: "Next.", fr: "Suivant." }],
  techOpeners: [{ en: "{tech}. Show me.", fr: "{tech}. {Montrez|Montre}-moi." }],
  closers: [{ en: "Do not waste my time.", fr: "Ne {me faites|me fais} pas perdre mon temps." }],
},
```

Placeholders: `{formal|casual}` (vous/tu, chosen from the formality trait), `{tech}`, `{n}`. Check how
existing packs are written before adding; quote catchphrases only if short and characteristic.

## 4. Avatar material (assets/characters/<id>/)

1. `assets/characters/sources.json`: `"kratos": ["godofwar", "Kratos"]` — the franchise's Fandom wiki
   subdomain and page title; a 3rd item if the English Wikipedia article title differs. Check it:
   `https://<wiki>.fandom.com/api.php?action=query&titles=<title>&format=json`.
2. `assets/characters/<id>/performance.json`: `setting` (one fixed place, same in all clips), `look`
   (canonical outfit and details), `mannerisms` (2–3 signature gestures).
3. `python3 scripts/avatars/collect-references.py <id>` → look at `assets/characters/<id>/contact-sheet.jpg`,
   write `selection.json` (master = cleanest canonical full or 3/4 body, cut-out preferred; 2–4
   references in the SAME canonical outfit; `erase` signatures/watermarks, `crop` busts; `notes`
   saying why), then `python3 scripts/avatars/prepare-references.py <id>`.
4. `npm run avatars:plan -- <id>` (33-clip behaviour plan).
5. Only with the user's go-ahead (it spends credits): `npm run avatars:el -- test <id>`; `DRY_RUN=1` first.

No avatar video of real people or of characters played by a real actor (their real face): those keep
a still picture or the placeholder. Original/archetype characters have no web references: ElevenLabs
designs them from a text prompt.

## 5. Thumbnail picture (optional)

`public/interviewers/<id>.webp` (16:9 webcam-style, ~1280×720). `node scripts/avatars/interviewer-pictures.mjs`
updates `lib/interviewers/pictures.ts` (also runs before `dev` and `build`).

## 6. Check

```bash
npx vitest run tests/interview/interviewers.test.ts tests/interview/flavor.test.ts
npm run typecheck && npx eslint lib/interviewers
```

Then update `docs/EN-COURS.md` and commit.
