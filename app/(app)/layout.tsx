import { UserButton } from "@clerk/nextjs";
import { AppShell } from "@/components/app-shell";
import { getUiCopy } from "@/lib/i18n/server";
import { setUiLanguageAction } from "./ui-actions";

// Shell of the signed-in area. Access is enforced by proxy.ts and, for data, by requireUserId().
// The interface language (menus, pages) comes from a cookie, English by default.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { lang, t } = await getUiCopy();
  return (
    <AppShell userButton={<UserButton />} lang={lang} t={t} setLanguage={setUiLanguageAction}>
      {children}
    </AppShell>
  );
}
