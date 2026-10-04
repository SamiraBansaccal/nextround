"use client";

import { Briefcase, Menu, MessagesSquare, PanelLeftClose, PanelLeftOpen, Settings, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { UiCopy, UiLang } from "@/lib/i18n/ui";
import { cn } from "@/lib/utils";

// App shell from the Lovable prototype: collapsible sidebar with tinted icons, sticky header.
// In the order of the work: the profile (the base everything is written from) is the home page.
const NAV = [
  { href: "/profile", key: "navProfile", Icon: UserRound, tint: "bg-terracotta-soft text-terracotta" },
  { href: "/offers", key: "navOffers", Icon: Briefcase, tint: "bg-warning-soft text-warning" },
  { href: "/interview", key: "navInterviews", Icon: MessagesSquare, tint: "bg-action text-action-foreground" },
  { href: "/settings", key: "navSettings", Icon: Settings, tint: "bg-secondary text-secondary-foreground" },
] as const;

function NavLinks({ t, compact = false, onNavigate }: { t: UiCopy; compact?: boolean; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className={cn("space-y-2", compact && "flex flex-col items-center")} aria-label={t.navMenu}>
      {NAV.map(({ href, key, Icon, tint }) => {
        const label = t[key];
        const active = path.startsWith(href);
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

/** The site's language (not the interviews'): two segments, saved in a cookie by the server action. */
function LanguageSwitch({ lang, t, setLanguage }: { lang: UiLang; t: UiCopy; setLanguage: (lang: UiLang) => Promise<void> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="inline-flex rounded-full bg-muted p-1" role="group" aria-label={t.siteLanguage}>
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setLanguage(l);
              router.refresh();
            })
          }
          className={cn("rounded-full px-3 py-1 text-xs font-bold transition-colors", lang === l ? "bg-terracotta text-white dark:text-earth" : "text-muted-foreground hover:text-foreground")}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function AppShell({ children, userButton, lang, t, setLanguage }: { children: ReactNode; userButton: ReactNode; lang: UiLang; t: UiCopy; setLanguage: (lang: UiLang) => Promise<void> }) {
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
            <Logo href="/profile" />
          ) : (
            <Link href="/profile" aria-label="NextRound home" className="grid size-10 place-items-center">
              <Image src="/brand/nextround-symbol.png" width={254} height={258} alt="" className="size-9 object-contain dark:brightness-0 dark:invert" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? t.collapseMenu : t.expandMenu}
            className="text-sidebar-foreground"
          >
            {expanded ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        </div>
        <NavLinks t={t} compact={!expanded} />
        {expanded && (
          <p className="mt-auto border-t border-sidebar-border pt-5 text-xs leading-relaxed text-sidebar-foreground/80">
            {t.shellNote}
          </p>
        )}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur sm:px-5 md:px-8 lg:px-10">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t.openMenu}>
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(18rem,88vw)] bg-sidebar p-4">
              <SheetTitle className="mb-6">
                <Logo href="/profile" />
              </SheetTitle>
              <NavLinks t={t} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <LanguageSwitch lang={lang} t={t} setLanguage={setLanguage} />
          <ThemeToggle />
          {userButton}
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-9 md:px-8 md:py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
