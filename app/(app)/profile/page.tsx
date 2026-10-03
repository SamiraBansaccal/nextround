import { ProfileView } from "@/components/profile/profile-view";
import { getAccount } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { addManualFactAction, editFactAction, importGithubAction, rejectFactAction, validateFactAction } from "./actions";

export default async function ProfilePage() {
  const account = await getAccount();
  const facts = await listFacts(account.userId);
  return (
    <ProfileView
      facts={facts.map((f) => ({ id: f.id, type: f.type, text: f.text, source: f.source, sourceRef: f.sourceRef, validated: f.validated }))}
      githubLogin={account.githubLogin}
      actions={{
        importGithub: importGithubAction,
        validate: validateFactAction,
        reject: rejectFactAction,
        edit: editFactAction,
        addManual: addManualFactAction,
      }}
    />
  );
}
