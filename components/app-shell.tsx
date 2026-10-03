"use client";

import { Briefcase, LayoutDashboard, Menu, PanelLeftClose, PanelLeftOpen, Settings, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// App shell from the Lovable prototype: collapsible sidebar with tinted icons, sticky header.
const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard, tint: "bg-primary-soft text-primary" },
  { href: "/offers", label: "Offers", Icon: Briefcase, tint: "bg-warning-soft text-warning" },
  { href: "/profile", label: "Profile", Icon: UserRound, tint: "bg-success-soft text-success" },
  { href: "/settings", label: "Settings", Icon: Settings, tint: "bg-secondary text-secondary-foreground" },
] as const;

function NavLinks({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className={cn("space-y-2", compact && "flex flex-col items-center")} aria-label="Main navigation">
      {NAV.map(({ href, label, Icon, tint }) => {
        const active = path.startsWith(href) || (href === "/offers" && path.startsWith("/interview"));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={compact ? label : undefined}
            aria-label={compact ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-12 items-center gap-3 rounded-md px-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              compact && "w-12 justify-center px-0",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", tint)}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            {!compact && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, userButton }: { children: ReactNode; userButton: ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-1 bg-background">
      <aside
        className={cn(
          "no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-5 transition-[width] duration-200 md:flex",
          expanded ? "w-52 px-3" : "w-[76px] px-3",
        )}
      >
        <div className={cn("mb-10 flex items-center", expanded ? "justify-between" : "flex-col gap-4")}>
          {expanded ? (
            <Logo href="/dashboard" />
          ) : (
            <Link href="/dashboard" aria-label="NextRound home" className="grid size-10 place-items-center">
              <Image src="/brand/nextround-symbol.png" width={254} height={258} alt="" className="size-9 object-contain dark:brightness-0 dark:invert" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse menu" : "Expand menu"}
            className="text-sidebar-foreground"
          >
            {expanded ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        </div>
        <NavLinks compact={!expanded} />
        {expanded && (
          <p className="mt-auto border-t border-sidebar-border pt-5 text-xs leading-relaxed text-sidebar-foreground/80">
            Every sentence NextRound writes points to a fact you validated.
          </p>
        )}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur sm:px-5 md:px-8 lg:px-10">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(18rem,88vw)] bg-sidebar p-4">
              <SheetTitle className="mb-6">
                <Logo href="/dashboard" />
              </SheetTitle>
              <NavLinks onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <ThemeToggle />
          {userButton}
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-9 md:px-8 md:py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
