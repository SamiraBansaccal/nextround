import { notFound } from "next/navigation";
import { CvView } from "@/components/documents/cv-view";
import { getAccount } from "@/lib/server/auth";
import { type DocumentRow, listDocuments, listKeptDocuments } from "@/lib/data/documents";
import { listFacts } from "@/lib/data/facts";
import { getOfferDetail } from "@/lib/data/offers";
import { listSources } from "@/lib/data/sources";
import { formatDay } from "@/lib/shared/dates";
import { documentFactIds, isDocumentLanguage } from "@/lib/documents/render";
import { DOCUMENTS_COPY } from "@/lib/i18n/documents";
import { getUiLang } from "@/lib/i18n/server";
import { factIndex, isCovered, provingFactIds } from "@/lib/offers/coverage";
import type { DocumentLanguage, TailoredCv, TailoredLetter } from "@/lib/types";
import { generateCvAction, generateLetterAction, keepDocumentAction } from "./actions";

export const maxDuration = 120;

// Contacts shown at the top of a CV: taken from the latest CV the candidate imported (each one was found
// word for word in it). No phone, address or birth date by default.
const CONTACT_KINDS = new Set(["email", "github", "linkedin", "website"]);

export default async function OfferCvPage({ params, searchParams }: PageProps<"/offers/[id]/cv">) {
  const { id } = await params;
  const { v, l, lang, print } = await searchParams;
  const account = await getAccount();
  const ui = await getUiLang(); // the interface; the documents keep their own `language`
  const t = DOCUMENTS_COPY[ui];
  const [detail, facts, docs, kept, cvSources] = await Promise.all([
    getOfferDetail(account.userId, id),
    listFacts(account.userId),
    listDocuments(account.userId, id),
    listKeptDocuments(account.userId),
    listSources(account.userId, "cv_upload"),
  ]);
  if (!detail) notFound();

  // Early versions have no language: they were written in the offer's language.
  const offerLanguage: DocumentLanguage = detail.offer.language === "fr" ? "fr" : "en";
  const languageOf = (d: DocumentRow): DocumentLanguage => (isDocumentLanguage(d.language) ? d.language : offerLanguage);
  const cvs = docs.filter((d) => d.kind === "cv");
  const letters = docs.filter((d) => d.kind === "cover_letter");
  const wantedCv = cvs.find((d) => d.version === Number(v));
  const wantedLetter = letters.find((d) => d.version === Number(l));
  const language: DocumentLanguage = isDocumentLanguage(lang) ? lang : wantedCv ? languageOf(wantedCv) : wantedLetter ? languageOf(wantedLetter) : offerLanguage;
  const cv = wantedCv ?? cvs.find((d) => languageOf(d) === language) ?? null;
  const letter = wantedLetter ?? letters.find((d) => languageOf(d) === language) ?? null;

  const profile = factIndex(facts);
  const validated = facts.filter((f) => f.validated);
  const covered = detail.requirements.filter((r) => isCovered(r, profile));
  const gaps = detail.requirements.filter((r) => !isCovered(r, profile));
  const used = new Set(cv ? (cv.content ? documentFactIds(cv.content) : cv.sentences.flatMap((s) => s.factIds)) : []);
  const relevant = new Set(covered.flatMap((r) => provingFactIds(r, profile)));
  const contactDoc = cvSources.find((s) => s.document?.contacts.length)?.document;
  const contacts = [...new Map((contactDoc?.contacts ?? []).filter((c) => CONTACT_KINDS.has(c.kind)).map((c) => [c.value, { kind: c.kind, value: c.value }])).values()];

  return (
    <CvView
      ui={ui}
      t={t}
      offerId={detail.offer.id}
      offerLabel={[detail.offer.title, detail.offer.company].filter(Boolean).join(" · ") || t.offer}
      language={language}
      candidate={{ name: account.fullName, imageUrl: account.imageUrl, contacts }}
      cv={cv && { id: cv.id, version: cv.version, kept: cv.kept, content: cv.content?.kind === "tailored_cv" ? (cv.content as TailoredCv) : null, sentences: cv.sentences }}
      letter={letter && { id: letter.id, version: letter.version, kept: letter.kept, content: letter.content?.kind === "cover_letter" ? (letter.content as TailoredLetter) : null, sentences: letter.sentences }}
      versions={docs.map((d) => ({ kind: d.kind, version: d.version, language: languageOf(d), createdOn: formatDay(d.createdAt) }))}
      bases={{
        cv: kept.filter((k) => k.document.content?.kind === "tailored_cv").map((k) => ({ id: k.document.id, title: k.document.title ?? `CV ${k.document.version}` })),
        letter: kept.filter((k) => k.document.content?.kind === "cover_letter").map((k) => ({ id: k.document.id, title: k.document.title ?? `Letter ${k.document.version}` })),
      }}
      facts={Object.fromEntries(validated.map((f) => [f.id, f.text]))}
      feedback={{
        requirements: [...covered.map((r) => ({ text: r.text, covered: true })), ...gaps.map((r) => ({ text: r.text, covered: false }))],
        unusedFacts: validated.filter((f) => relevant.has(f.id) && !used.has(f.id)).map((f) => f.text),
      }}
      actions={{ generateCv: generateCvAction, generateLetter: generateLetterAction, keep: keepDocumentAction }}
      autoPrint={print === "1"}
    />
  );
}
