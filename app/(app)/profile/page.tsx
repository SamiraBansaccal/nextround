import { type ProfileFactView, ProfileLibrary } from "@/components/profile/profile-library";
import { getAccount } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { cvRef, listSources } from "@/lib/data/sources";
import { formatDay } from "@/lib/dates";
import {
  addManualFactAction,
  chatFactsAction,
  editFactAction,
  importCodewarsAction,
  importCvTextAction,
  importGithubAction,
  rejectFactAction,
  removeCvAction,
  validateAllAction,
  validateFactAction,
} from "./actions";

export const maxDuration = 120; // CV analysis with free models can be slow

const ORIGIN: Record<ProfileFactView["source"], string> = { github: "GitHub", codewars: "Codewars", cv_upload: "CV", chat: "Chat", manual: "Manual" };

export default async function ProfilePage() {
  const account = await getAccount();
  const [facts, cvSources] = await Promise.all([listFacts(account.userId), listSources(account.userId, "cv_upload")]);
  const cvName = new Map(cvSources.map((s) => [cvRef(s.id), s.ref]));

  return (
    <ProfileLibrary
      candidate={{ name: account.fullName, imageUrl: account.imageUrl, githubLogin: account.githubLogin }}
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
      facts={facts.map((f) => ({
        id: f.id,
        type: f.type,
        text: f.text,
        source: f.source,
        sourceRef: f.sourceRef,
        quote: f.quote,
        validated: f.validated,
        origin: f.source === "cv_upload" ? `CV · ${cvName.get(f.sourceRef ?? "") ?? "removed CV"}` : ORIGIN[f.source],
      }))}
      actions={{
        importGithub: importGithubAction,
        importCodewars: importCodewarsAction,
        importCvText: importCvTextAction,
        removeCv: removeCvAction,
        chatFacts: chatFactsAction,
        validate: validateFactAction,
        validateAll: validateAllAction,
        reject: rejectFactAction,
        edit: editFactAction,
        addManual: addManualFactAction,
      }}
    />
  );
}
