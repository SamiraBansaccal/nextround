// Adds job offers to the owner's account, exactly like "Add an offer" with pasted text
// (app/(app)/offers/actions.ts addOfferAction): the AI scans the text, the code verifies every quote.
// Each file is the offer text; an optional first line "URL: https://…" keeps the link to the original.
// Offers whose link is already saved are skipped. Usage: npm run owner:import-offers -- offer.txt […]
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { ownerContext } from "./owner.mjs";

const { listFacts } = await import("@/lib/data/facts");
const { createOffer, listOffers } = await import("@/lib/data/offers");
const { extractOffer } = await import("@/lib/offers/extract");
const { MAX_PAGE_TEXT, sourceSiteFor } = await import("@/lib/offers/fetch-page");

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: npm run owner:import-offers -- offer.txt [more.txt …]");
  process.exit(1);
}
const ctx = await ownerContext();
const saved = new Set((await listOffers(ctx.userId)).map((o) => o.sourceUrl).filter(Boolean));
const facts = (await listFacts(ctx.userId)).filter((f) => f.validated);

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const url = content.match(/^URL:\s*(\S+)/)?.[1] ?? null;
  const text = content.replace(/^URL:.*\n/, "").trim().slice(0, MAX_PAGE_TEXT);
  if (url && saved.has(url)) {
    console.log(`${basename(file)}: already saved, skipped.`);
    continue;
  }
  if (text.length < 200) {
    console.log(`${basename(file)}: too short to be an offer, skipped.`);
    continue;
  }
  try {
    const extraction = await extractOffer(ctx, text, facts);
    if (extraction.requirements.length === 0) {
      console.log(`${basename(file)}: no requirement could be verified, skipped.`);
      continue;
    }
    const offer = await createOffer(ctx.userId, { sourceUrl: url, sourceSite: sourceSiteFor(url), rawText: text, extraction });
    if (url) saved.add(url);
    console.log(`${basename(file)}: saved (${offer.id}), ${extraction.requirements.length} requirements, ${extraction.dropped} dropped.`);
  } catch (error) {
    console.log(`${basename(file)}: failed (${String(error).slice(0, 200)}).`);
  }
}
