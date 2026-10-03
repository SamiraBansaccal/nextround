import { UserButton } from "@clerk/nextjs";
import { AppShell } from "@/components/app-shell";

// Shell of the signed-in area (design from the Lovable prototype).
// Access is enforced by proxy.ts and, for data, by requireUserId().
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell userButton={<UserButton />}>{children}</AppShell>;
}
