// Dashboard wording that depends on the current time (kept out of the components, which must stay
// pure). Times are shown in Brussels time: the job boards NextRound targets are Belgian.

const TIME_ZONE = "Europe/Brussels";

export function dashboardGreeting(firstName: string, now: Date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const date = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE }).format(now);
  return { eyebrow: date.toUpperCase(), title: `Good ${part}, ${firstName}` };
}
