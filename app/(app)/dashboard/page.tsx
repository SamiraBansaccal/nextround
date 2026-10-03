import Link from "next/link";
import { AiStatusCard } from "@/components/ai/ai-status-card";
import { Welcome } from "@/components/dashboard/welcome";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAiStatus } from "@/lib/ai/config";
import { getAccount } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";

export default async function DashboardPage() {
  const account = await getAccount();
  const [status, facts] = await Promise.all([getAiStatus(account.userId, account.isOwner), listFacts(account.userId)]);
  const validated = facts.filter((f) => f.validated).length;
  return (
    <div className="flex flex-col gap-8">
      <Welcome account={account} />
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>
            {facts.length === 0
              ? "Start here: import your GitHub projects in one click, then validate what is true."
              : `${validated} validated fact${validated === 1 ? "" : "s"}, ${facts.length - validated} to review.`}
          </CardDescription>
          <Button asChild className="mt-2 w-fit">
            <Link href="/profile">{facts.length === 0 ? "Import from GitHub" : "Open my profile"}</Link>
          </Button>
        </CardHeader>
      </Card>
      <AiStatusCard status={status} />
    </div>
  );
}
