import { UI_COPY, type UiLang } from "@/lib/i18n/ui";
const lang = (): UiLang => (new URLSearchParams(location.search).get("ui") === "fr" ? "fr" : "en");
export const getUiLang = async () => lang();
export const getUiCopy = async () => ({ lang: lang(), t: UI_COPY[lang()] });
