import { ProfileLibrary } from "@/components/profile/profile-library";
import { getAccount } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { listKeptDocuments } from "@/lib/data/documents";
import { cvRef, listSources } from "@/lib/data/sources";
import { formatDay } from "@/lib/dates";
import { PROFILE_COPY } from "@/lib/i18n/profile";
import { getUiLang } from "@/lib/i18n/server";
import {
  addManualFactAction,
  chatFactsAction,
  editFactAction,
  importCodewarsAction,
  importCvTextAction,
  importGithubAction,
  rejectFactAction,
  removeCvAction,
  setAiAssistedAction,
  structureCvAction,
  validateAllAction,
  validateFactAction,
  validateManyAction,
} from "./actions";
import { keepDocumentAction } from "../offers/[id]/cv/actions";

export const maxDuration = 300; // a CV read by a free model: facts and layout take about a minute, more with a retry

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const account = await getAccount();
  const t = PROFILE_COPY[await getUiLang()];
  const { cv, doc } = await searchParams;
  const [facts, cvSources, kept] = await Promise.all([listFacts(account.userId), listSources(account.userId, "cv_upload"), listKeptDocuments(account.userId)]);
  const cvName = new Map(cvSources.map((s) => [cvRef(s.id), s.ref]));
  // The CV shown as a document: the one chosen in the library (?cv=), else the latest one.
  const selected = cvSources.find((s) => s.id === cv) ?? cvSources[0] ?? null;
  // Or a CV / letter written for an offer and added to the profile (?doc=).
  const shownDoc = kept.find((k) => k.document.id === doc && k.document.content)?.document ?? null;
  const contactDoc = cvSources.find((s) => s.document?.contacts.length)?.document;
  const contacts = [...new Map((contactDoc?.contacts ?? []).filter((c) => ["email", "github", "linkedin", "website"].includes(c.kind)).map((c) => [c.value, { kind: c.kind, value: c.value }])).values()];

  return (
    <ProfileLibrary
      t={t}
      candidate={{ name: account.fullName, imageUrl: account.imageUrl, githubLogin: account.githubLogin }}
      selectedDocument={
        shownDoc?.content
          ? {
              id: shownDoc.id,
              title: shownDoc.title ?? (shownDoc.kind === "cv" ? t.cvTitle : t.letterTitle),
              href: shownDoc.offerId ? `/offers/${shownDoc.offerId}/cv?${shownDoc.language ? `lang=${shownDoc.language}&` : ""}${shownDoc.kind === "cv" ? "v" : "l"}=${shownDoc.version}` : null,
              content: shownDoc.content,
              contacts,
            }
          : null
      }
      keptDocuments={kept.map(({ document: d, offerTitle, company }) => ({
        id: d.id,
        kind: d.kind,
        title: d.title ?? ([offerTitle, company].filter(Boolean).join(" · ") || (d.kind === "cv" ? t.cvTitle : t.letterTitle)),
        language: d.language ?? null,
        createdOn: formatDay(d.createdAt),
        href: d.offerId ? `/offers/${d.offerId}/cv?${d.language ? `lang=${d.language}&` : ""}${d.kind === "cv" ? "v" : "l"}=${d.version}` : null,
      }))}
      cvs={cvSources.map((s) => {
        const fromCv = facts.filter((f) => f.sourceRef === cvRef(s.id));
        return {
          id: s.id,
          fileName: s.ref,
          importedAt: formatDay(s.importedAt),
          facts: fromCv.length,
          validated: fromCv.filter((f) => f.validated).length,
        };
      })}
      selectedCv={selected && { id: selected.id, fileName: selected.ref, document: selected.document, hasText: Boolean(selected.text) }}
      facts={facts.map((f) => ({
        id: f.id,
        type: f.type,
        text: f.text,
        source: f.source,
        sourceRef: f.sourceRef,
        quote: f.quote,
        validated: f.validated,
        aiAssisted: f.aiAssisted,
        origin: f.source === "cv_upload" ? `CV · ${cvName.get(f.sourceRef ?? "") ?? t.removedCv}` : t.origin[f.source],
      }))}
      actions={{
        importGithub: importGithubAction,
        importCodewars: importCodewarsAction,
        importCvText: importCvTextAction,
        removeCv: removeCvAction,
        structureCv: structureCvAction,
        chatFacts: chatFactsAction,
        validate: validateFactAction,
        validateAll: validateAllAction,
        validateMany: validateManyAction,
        reject: rejectFactAction,
        edit: editFactAction,
        setAiAssisted: setAiAssistedAction,
        keepDocument: keepDocumentAction,
        addManual: addManualFactAction,
      }}
    />
  );
}
