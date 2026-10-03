import { Welcome } from "@/components/dashboard/welcome";
import { getAccount } from "@/lib/auth";

export default async function DashboardPage() {
  const account = await getAccount();
  return <Welcome account={account} />;
}
