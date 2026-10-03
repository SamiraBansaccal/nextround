Create a 16:9 pitch deck of 11 slides, in English, for **NextRound**, built in one day at the **Stripe Community hackathon**. Stripe is the sponsor, and the product was built with **Stripe Projects**: make that link clear and concrete. The pitch lasts 3–5 minutes and its centre is a **live demo**, so keep the text short: one idea per slide, large type, at most 3–4 short bullets. Add 1–2 sentences of speaker notes to each slide.

**Do not invent anything.** No statistics, market sizes, user numbers, quotes, testimonials or features beyond what is written below. Where an image of the product belongs, put a clearly labelled placeholder box such as "[Screenshot: interview feedback]": real screenshots will be added later. Not inventing anything is literally the product's promise, so the deck must respect it too. Write provider names as plain text; do not redraw company logos.

## Visual identity (same as the app)

- Calm, warm, editorial, encouraging: a coach, not a corporate dashboard.
- Colours: background `#eef2e8` (pale sage), text `#12291f` (deep forest), primary `#1f4d3a` (forest green), soft accent `#c8dfc6` (light sage). Semantic: verified / covered = green `#1c5f31` on `#c6e4cb`; unsupported / gap = red `#cc3336`; "to improve" = amber `#9d671c` on `#f9eaca`. Colour is never the only signal: always add an icon and a label.
- Fonts: **Lora** (serif) for titles, **Nunito Sans** for body text.
- Recurring motif: small "source chips", with a green "✓ verified" chip next to a red "✗ Unsupported" chip, as in the app.
- Generous whitespace, simple line icons, diagrams made of rounded boxes and arrows. No stock photos of people.

## Slides

**1. Title**
"NextRound". Tagline: "Your coach to reach the next interview round — without inventing anything." Small line: "Built in one day at the Stripe Community hackathon · with Stripe Projects". Placeholder: [Presenter name].
*Notes: introduce yourself and the one-line promise.*

**2. Why I built it**
- "I'm looking for a tech job. NextRound is the coach I needed."
- Every offer means preparing again: the company's stack, the HR questions, my own gaps.
- AI tools help, but they invent: experience I don't have, requirements the offer never mentioned. In an interview, an invented claim is worse than no claim.
- The demo runs on my real profile: no fake demo data.
*Notes: personal story first; this is a real need.*

**3. NextRound in 3 steps**
1. Build your profile once: GitHub, Codewars, CV or LinkedIn PDF, a short chat. You validate every fact.
2. Save links to job offers (Indeed, Actiris, Le Forem, LinkedIn, company sites). The AI reads each offer.
3. For each offer: your match (green = covered, red = gap), a tailored CV and cover letter, how to apply, and **interview practice on that company's stack**.
Visual: three numbered cards in a row.

**4. Zoom: an interview built from the offer**
Pipeline diagram, left to right:
offer link → page read (Firecrawl) → stack, requirements and contacts extracted, **each with a word-for-word quote from the offer, checked by code** → matched against your validated profile facts (green / red) → about 10 questions in the offer's language: **4 HR**, **4 technical on the offer's own stack** (junior level, answerable orally), **2 on your gaps**.
Each question shows where it comes from. Placeholder: [Screenshot: offer with green/red requirements].
*Notes: the questions are specific to this company's stack, not generic.*

**5. Zoom: practise by text or voice, get honest feedback**
- Text or **voice**: an **ElevenLabs** voice reads the question and your spoken answer is transcribed. Without an ElevenLabs key, the browser's free voice is used.
- Feedback on every answer: STAR structure, relevance to the offer, **evidence** (each claim in your answer is matched to a profile fact, or flagged "Not in your profile – add it as a fact if true, otherwise don't say it"), honesty on gap questions with a learning plan, and an improved answer built only from your real facts.
- End summary: strengths, top 3 things to work on, questions to retry, with the previous answer shown next to the new one.
Placeholder: [Screenshot: interview feedback].

**6. Your AI, your quality, the same safety**
- Bring your own AI: any OpenAI-compatible provider, OpenRouter (free models welcome), OpenAI, Mistral or Groq; self-hosters can use a local model.
- **The quality of the questions and feedback depends on the model you connect. The safety does not:** the code verifies every quote and every fact reference, whatever the model. A weaker or free model is safe to use, because what it invents gets caught.
- Robust with weak models: JSON validated, one retry with the exact error, otherwise "try another model".
- Your key is encrypted (AES-256-GCM), never sent back to the browser, never logged.
Visual: a dial "model quality: low → high" above a fixed shield "verification by code".

**7. Built with Stripe Projects**
A terminal-style panel showing:
```
stripe projects init nextround
stripe projects add vercel/project      # hosting
stripe projects add neon/postgres       # database
stripe projects add clerk/auth          # GitHub sign-in
stripe projects add openrouter/api      # instance AI (free models)
stripe projects add firecrawl/api       # reading job pages
stripe projects add elevenlabs/tts      # voice
stripe projects env --pull              # credentials -> .env
```
- 6 providers provisioned from the terminal, on free tiers, with one Stripe account.
- Credentials synced automatically, stored in an encrypted vault: no API key copied by hand.
- One place to check costs: `stripe projects spend`. [Check the amount before presenting.]
- Coding-agent friendly: Stripe Projects installs provider guides that the AI coding agent used to build the app.
*Notes: thank the sponsor; this is what made a one-day build realistic.*

**8. One command to run your own NextRound**
```
git clone … && npm install
npm run bootstrap -- --owner <your-github-login>
```
- Anyone can run their own instance on **their own accounts**: the script uses Stripe Projects to provision the whole stack, enables GitHub sign-in on Clerk, creates the database tables and deploys to Vercel.
- Nothing in the repository is tied to my accounts: everything comes from environment variables.
- Each provider shows its terms; re-running the script skips what already exists.
*Notes: Stripe Projects turns self-hosting into one command.*

**9. The stack and how it fits together**
Architecture diagram:
- Browser: Next.js 16 + TypeScript, Tailwind, shadcn/ui. UI components only display data.
- Server: sign-in check on every request (Clerk + Next.js proxy); one AI layer (OpenAI-compatible client, zod validation, verifier); rate limits on the shared key.
- Data: Postgres on Neon (Drizzle ORM); every row belongs to one user and every query filters on the signed-in user.
- Services: OpenRouter or your own AI, Firecrawl, ElevenLabs. Hosting: Vercel.
- Quality: automated tests, including "user B cannot read or change user A's data", encryption and rate limits. Placeholder: [number of tests].
*Notes: "the AI proposes, the code verifies" is an architecture decision, not a prompt.*

**10. Live demo**
A single large "Live demo" title with the flow in small steps: sign in with GitHub → profile filled from GitHub in seconds → add an offer by link → green/red requirements → practise the interview by voice → feedback with verified evidence.

**11. What's next, and I'm looking for a job**
- Next: job-board APIs (Indeed, Actiris, Le Forem, LinkedIn), market-demand insights, LeetCode import, a design rework.
- "I built NextRound to land my next job. If your team is hiring, let's talk."
- Placeholders: [Presenter name] · github.com/SamiraBansaccal · [LinkedIn] · [email] · [Live app URL] · [Repository URL]
- Closing line: "Practise with what's true. Get to the next round."
