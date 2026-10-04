"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { toUiLang, UI_LANG_COOKIE } from "@/lib/i18n/ui";

/** Sets the site's interface language (not the interviews'): a cookie for one year. */
export async function setUiLanguageAction(lang: unknown): Promise<void> {
  (await cookies()).set(UI_LANG_COOKIE, toUiLang(lang), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}
