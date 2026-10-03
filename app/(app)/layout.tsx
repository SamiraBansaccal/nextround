import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/offers", label: "Offers" },
  { href: "/settings", label: "Settings" },
] as const;

// Shell of the signed-in area. Access is enforced by proxy.ts and, for data, by requireUserId().
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-card/60 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo href="/dashboard" />
          <nav aria-label="Main" className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
