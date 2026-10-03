import { AiStatusCard } from "@/components/ai/ai-status-card";
import { Welcome } from "@/components/dashboard/welcome";
import { getAiStatus } from "@/lib/ai/config";
import { getAccount } from "@/lib/auth";

export default async function DashboardPage() {
  const account = await getAccount();
  const status = await getAiStatus(account.userId, account.isOwner);
  return (
    <div className="flex flex-col gap-8">
      <Welcome account={account} />
      <AiStatusCard status={status} />
    </div>
  );
}
