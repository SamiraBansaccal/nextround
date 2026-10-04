import { ProfileLibrary } from "@/components/profile/profile-library";
import { getAccount } from "@/lib/server/auth";
import { listFacts, validateLegacyFacts } from "@/lib/data/facts";
import { listKeptDocuments } from "@/lib/data/documents";
import { cvRef, listSources } from "@/lib/data/sources";
import { formatDay } from "@/lib/shared/dates";
import { groupNearDuplicates } from "@/lib/profile/dedupe-facts";
import { TRACKS } from "@/lib/interview/tracks";
import { offerTrack } from "@/lib/offers/track";
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
  editCvLineAction,
  importLeetcodeAction,
} from "./actions";
import { editDocumentLineAction, keepDocumentAction } from "../offers/[id]/cv/actions";

export const maxDuration = 300; // a CV read by a free model: facts and layout take about a minute, more with a retry

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const account = await getAccount();
  const lang = await getUiLang();
  const t = PROFILE_COPY[lang];
  const { cv, doc } = await searchParams;
  // Everything the candidate imports is theirs, so validated: facts from before that rule are validated once here.
  await validateLegacyFacts(account.userId);
  const [facts, cvSources, kept] = await Promise.all([listFacts(account.userId), listSources(account.userId, "cv_upload"), listKeptDocuments(account.userId)]);
  const cvName = new Map(cvSources.map((s) => [cvRef(s.id), s.ref]));
  // The CV shown as a document: the one chosen in the library (?cv=), else the latest one.
  const selected = cvSources.find((s) => s.id === cv) ?? cvSources[0] ?? null;
  // Or a CV / letter written for an offer and added to the profile (?doc=).
  const shownDoc = kept.find((k) => k.document.id === doc && k.document.content)?.document ?? null;
  const contactDoc = cvSources.find((s) => s.document?.contacts.length)?.document;
  // Everything comes from the candidate's own CVs and accounts: one merged base, duplicates folded in.
  const validated = facts.filter((f) => f.validated).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const originOf = (f: (typeof facts)[number]) => (f.source === "cv_upload" ? `CV · ${cvName.get(f.sourceRef ?? "") ?? t.removedCv}` : t.origin[f.source]);
  const groups = groupNearDuplicates(validated);
  // Each CV in a category: the career track of the offer it was written for, or of its own skills and
  // headline (a CV written for one kind of job); "general" when it names no known technology.
  const GENERAL = "general";
  const cvCategory = cvSources.map((s) => offerTrack(s.document?.skills ?? [], s.document?.headline ?? null) ?? GENERAL);
  const keptCategory = kept.map(
    ({ document: d, offerTitle, offerStack }) =>
      offerTrack([...(offerStack ?? []).map((q) => q.value), ...(d.content?.kind === "tailored_cv" ? d.content.skills.flatMap((g) => g.items.map((i) => i.name)) : [])], offerTitle) ?? GENERAL,
  );
  const present = new Set([...cvCategory, ...keptCategory]);
  const categories = [
    ...(present.has(GENERAL) ? [{ id: GENERAL, label: t.generalCvs }] : []),
    ...TRACKS.filter((tr) => present.has(tr.id)).map((tr) => ({ id: tr.id, label: tr.label[lang] })),
  ];
  const githubFacts = facts.filter((f) => f.source === "github");
  const githubSource = (await listSources(account.userId, "github"))[0];
  const contacts = [
    ...new Map((contactDoc?.contacts ?? []).filter((c) => ["email", "github", "linkedin", "website"].includes(c.kind)).map((c) => [c.value, { kind: c.kind, value: c.value }])).values(),
  ];

  return (
    <ProfileLibrary
      t={t}
      candidate={{
        name: account.fullName,
        imageUrl: account.imageUrl,
        githubLogin: account.githubLogin,
      }}
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
      categories={categories}
      github={{
        projects: githubFacts.length,
        // Imports from before the date was recorded: the date of the newest GitHub project.
        lastImport: githubSource ? formatDay(githubSource.importedAt) : githubFacts.length ? formatDay(new Date(Math.max(...githubFacts.map((f) => f.createdAt.getTime())))) : null,
      }}
      keptDocuments={kept.map(({ document: d, offerTitle, company }, i) => ({
        id: d.id,
        category: keptCategory[i],
        kind: d.kind,
        title: d.title ?? ([offerTitle, company].filter(Boolean).join(" · ") || (d.kind === "cv" ? t.cvTitle : t.letterTitle)),
        language: d.language ?? null,
        createdOn: formatDay(d.createdAt),
        href: d.offerId ? `/offers/${d.offerId}/cv?${d.language ? `lang=${d.language}&` : ""}${d.kind === "cv" ? "v" : "l"}=${d.version}` : null,
      }))}
      cvs={cvSources.map((s, i) => {
        const fromCv = facts.filter((f) => f.sourceRef === cvRef(s.id));
        return {
          id: s.id,
          category: cvCategory[i],
          fileName: s.ref,
          importedAt: formatDay(s.importedAt),
          facts: fromCv.length,
        };
      })}
      selectedCv={
        selected && {
          id: selected.id,
          fileName: selected.ref,
          document: selected.document,
          hasText: Boolean(selected.text),
        }
      }
      facts={groups.map(({ fact, duplicates }) => ({
        id: fact.id,
        type: fact.type,
        text: fact.text,
        aiAssisted: [fact, ...duplicates].some((f) => f.aiAssisted),
        origin: [...new Set([fact, ...duplicates].map(originOf))].join(" + "),
        mergedIds: duplicates.map((d) => d.id),
      }))}
      factTexts={Object.fromEntries(validated.map((f) => [f.id, f.text]))}
      actions={{
        importGithub: importGithubAction,
        importCodewars: importCodewarsAction,
        importLeetcode: importLeetcodeAction,
        editCvLine: editCvLineAction,
        importCvText: importCvTextAction,
        removeCv: removeCvAction,
        structureCv: structureCvAction,
        chatFacts: chatFactsAction,
        reject: rejectFactAction,
        edit: editFactAction,
        setAiAssisted: setAiAssistedAction,
        keepDocument: keepDocumentAction,
        editDocumentLine: editDocumentLineAction,
        addManual: addManualFactAction,
      }}
    />
  );
}
