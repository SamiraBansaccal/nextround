Create a 16:9 pitch deck (9 slides) for **NextRound**, a hackathon project (Stripe Community hackathon, built in one day). The deck supports a 3–5 minute pitch whose centre is a **live demo**, so keep the text short: one idea per slide, big type, at most 3 bullets per slide.

**Important: do not invent anything.** No statistics, market numbers, user counts, quotes or testimonials, and no claims beyond what is written below. Where a screenshot belongs, put a clearly labelled placeholder box such as "[Screenshot: interview feedback]". (Not inventing anything is literally the product's promise, so the deck must respect it too.)

**Visual style:** calm, professional, encouraging, like a coach rather than a corporate tool. Plenty of whitespace, one calm accent colour (teal or indigo), a clean sans-serif font. Recurring visual motif: green "verified / covered" and red "unsupported / gap" markers, always shown with an icon and a label (never colour alone). Simple icons, no stock photos of people.

## Slides

**1. Title**
NextRound. "Your coach to reach the next interview round — without inventing anything." Subtitle: Stripe Community hackathon. Placeholder for the presenter's name.

**2. The problem**
- Junior tech job seekers apply to many offers and must prepare for each interview: the company's stack, HR questions, their own gaps.
- AI tools help, but they invent: experience you don't have, requirements the offer never mentioned.
- In an interview, an invented claim is worse than no claim.

**3. The solution: NextRound in 3 steps**
1. Build your profile once: GitHub, Codewars, CV or LinkedIn PDF, a short chat.
2. Save links to job offers you like (Indeed, Actiris, Le Forem, LinkedIn, company sites). The AI scans each one.
3. For each offer: see your match, get a tailored CV and cover letter, see how to apply, and **practise the interview on that company's stack**.

**4. Main feature: interview simulation**
- About 10 questions in the offer's language: HR, technical questions from the offer's tech stack, and questions on your gaps.
- Text or voice: the question is read aloud and your answer is transcribed.
- Feedback on every answer: STAR structure, relevance, evidence, honesty, plus an improved answer built only from your real profile.
- Placeholder: [Screenshot: interview feedback]

**5. The core promise: the AI proposes, the code verifies**
- Every generated sentence must point to a profile fact that you validated.
- Every item extracted from an offer must quote the offer word for word; the quote is checked by code.
- Anything unsupported is flagged in red: "Not in your profile – add it as a fact if true, otherwise don't say it".
- This is also what makes free or weaker AI models safe to use: what they invent gets caught.
- Visual: a sentence with a green "verified" chip next to a sentence with a red "unsupported" chip.

**6. Bring your own AI**
- Works with any OpenAI-compatible provider: OpenRouter, OpenAI, Mistral, Groq. Free models welcome.
- Your key is stored encrypted and never sent back to the browser.
- Self-hosting: run it with a local model.

**7. Built with Stripe Projects**
- One CLI provisioned the whole stack on free tiers: Vercel (hosting), Neon (Postgres), Clerk (GitHub sign-in), OpenRouter (AI), Firecrawl (reading job pages), ElevenLabs (voice).
- Credentials synced to the app's environment automatically: no API key copied by hand.
- Stack: Next.js, TypeScript, Tailwind, shadcn/ui, zod, Postgres.

**8. Live demo**
A single large "Live demo" title, with the flow as small steps: sign in with GitHub → profile filled from GitHub → add an offer by link → green/red requirements → practise the interview → feedback.

**9. What's next + links**
- Next steps: job-board APIs (Indeed, Actiris, Le Forem, LinkedIn), market-demand insights, LeetCode import, a design rework.
- Placeholders: [Repository URL] [Live app URL]
- Closing line: "Practise with what's true. Get to the next round."
