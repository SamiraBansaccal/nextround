import "server-only";
import { cookies } from "next/headers";
import { toUiLang, UI_COPY, UI_LANG_COOKIE, type UiCopy, type UiLang } from "./ui";

/** The site's interface language for this request (cookie; English by default). */
export async function getUiLang(): Promise<UiLang> {
  return toUiLang((await cookies()).get(UI_LANG_COOKIE)?.value);
}

export async function getUiCopy(): Promise<{ lang: UiLang; t: UiCopy }> {
  const lang = await getUiLang();
  return { lang, t: UI_COPY[lang] };
}
