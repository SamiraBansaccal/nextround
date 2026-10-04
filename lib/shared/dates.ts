// Calendar days are shown in Brussels time (the job boards NextRound targets are Belgian).
// toISOString() would give the UTC day, which is wrong for a Belgian user between 00:00 and 02:00.

const TIME_ZONE = "Europe/Brussels";
const dayFormat = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TIME_ZONE });

/** "YYYY-MM-DD" of the given instant, in Brussels time. */
export function formatDay(date: Date): string {
  return dayFormat.format(date); // en-CA formats as YYYY-MM-DD
}
