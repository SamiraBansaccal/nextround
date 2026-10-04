// Imports CV PDFs into the owner's account, exactly like the "Import a CV" button
// (app/(app)/profile/actions.ts importCvTextAction): the text is read from the PDF here, the PDF itself
// is not stored. Usage: npm run owner:import-cv -- path/to/cv.pdf [more.pdf …]
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { extractText, getDocumentProxy } from "unpdf";
import { ownerContext } from "./owner.mjs";

const { proposeFactsFromText, factKey } = await import("@/lib/profile/extract-facts");
const { structureCv, isEmptyCvDocument } = await import("@/lib/profile/cv-document");
const { addSource, cvRef, listSources } = await import("@/lib/data/sources");
const { createFact, listFacts } = await import("@/lib/data/facts");

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: npm run owner:import-cv -- path/to/cv.pdf [more.pdf …]");
  process.exit(1);
}
const ctx = await ownerContext();
const imported = new Set((await listSources(ctx.userId, "cv_upload")).map((s) => s.ref));

for (const file of files) {
  const name = basename(file);
  if (imported.has(name)) {
    console.log(`${name}: already imported, skipped (remove it in the app to import it again).`);
    continue;
  }
  const pdf = await getDocumentProxy(new Uint8Array(readFileSync(file)));
  const { text: raw } = await extractText(pdf, { mergePages: true });
  const text = (Array.isArray(raw) ? raw.join("\n") : raw).trim().slice(0, 15_000);
  if (text.length < 50) {
    console.log(`${name}: no text found (scanned PDF?), skipped.`);
    continue;
  }
  const [factsResult, documentResult] = await Promise.allSettled([proposeFactsFromText(ctx, text, "cv"), structureCv(ctx, text)]);
  if (factsResult.status === "rejected") {
    console.log(`${name}: failed (${String(factsResult.reason).slice(0, 200)}).`);
    continue;
  }
  const document = documentResult.status === "fulfilled" && !isEmptyCvDocument(documentResult.value.document) ? documentResult.value.document : null;
  const source = await addSource(ctx.userId, "cv_upload", name, { text, document });
  const known = new Set((await listFacts(ctx.userId)).map((f) => factKey(f.text)));
  let added = 0;
  for (const fact of factsResult.value.facts) {
    if (known.has(factKey(fact.text))) continue;
    known.add(factKey(fact.text));
    await createFact(ctx.userId, { ...fact, source: "cv_upload", sourceRef: cvRef(source.id), validated: true });
    added++;
  }
  console.log(`${name}: ${added} new facts, ${factsResult.value.dropped} dropped (quote not found), ${document ? "laid out" : "not laid out yet (retry from its card)"}.`);
}
