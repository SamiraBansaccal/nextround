import { DASHBOARD_COPY } from "@/lib/i18n/dashboard";
import type { UiLang } from "@/lib/i18n/ui";
import { fill } from "@/lib/interview/copy";

// Dashboard wording that depends on the current time (kept out of the components, which must stay
// pure). Times are shown in Brussels time: the job boards NextRound targets are Belgian.

const TIME_ZONE = "Europe/Brussels";

export function dashboardGreeting(firstName: string, now: Date = new Date(), lang: UiLang = "en") {
  const t = DASHBOARD_COPY[lang];
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  const greeting = hour < 12 ? t.greetingMorning : hour < 18 ? t.greetingAfternoon : t.greetingEvening;
  const locale = lang === "fr" ? "fr-BE" : "en-GB";
  const date = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE }).format(now);
  return { eyebrow: date.toUpperCase(), title: fill(greeting, { name: firstName }) };
}
