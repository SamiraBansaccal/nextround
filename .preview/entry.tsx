import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/app-shell";
import NewInterviewPage from "@/app/(app)/interview/new/page";
import InterviewsPage from "@/app/(app)/interview/page";
import { getUiCopy } from "@/lib/i18n/server";

const params = Object.fromEntries(new URLSearchParams(location.search));
const page = params.page ?? "new";
delete params.page;
delete params.ui;
const { lang, t } = await getUiCopy();
(window as unknown as { __path: string }).__path = "/interview";
const el = page === "list" ? await InterviewsPage() : await NewInterviewPage({ searchParams: Promise.resolve(params) } as never);
createRoot(document.getElementById("root")!).render(<AppShell userButton={<span />} lang={lang} t={t} setLanguage={async () => {}}>{el}</AppShell>);
