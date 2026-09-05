const TIME_ZONE = "America/New_York";
const BULLET = "•";

function parts(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, ...options }).formatToParts(date);
}

function read(list: Intl.DateTimeFormatPart[], type: string) {
  return list.find((part) => part.type === type)?.value ?? "";
}

export type CardWhenStyle = "full" | "weekday-time" | "time";

function clock(startsAt: Date): string {
  const list = parts(startsAt, { hour: "numeric", minute: "2-digit", hour12: true });
  const hour = read(list, "hour");
  const minute = read(list, "minute");
  const dayPeriod = read(list, "dayPeriod").toUpperCase().replace(/\./g, "");
  return `${hour}:${minute} ${dayPeriod}`;
}

function weekdayMonthDay(startsAt: Date): string {
  const list = parts(startsAt, { weekday: "short", month: "short", day: "numeric" });
  return `${read(list, "weekday").toUpperCase()} ${BULLET} ${read(list, "month").toUpperCase()} ${read(list, "day")}`;
}

export function formatCardWhen(
  startsAt: Date,
  dateOnly = false,
  endsAt: Date | null = null,
  style: CardWhenStyle = "full",
): string {
  if (style === "time" && !dateOnly) return clock(startsAt);
  if (style === "weekday-time") {
    const list = parts(startsAt, { weekday: "short" });
    const weekday = read(list, "weekday").toUpperCase();
    if (dateOnly) return weekdayMonthDay(startsAt);
    return `${weekday} ${BULLET} ${clock(startsAt)}`;
  }
  if (dateOnly) {
    const startLabel = weekdayMonthDay(startsAt);
    if (!endsAt) return startLabel;
    const sameDay =
      startsAt.getFullYear() === endsAt.getFullYear() &&
      startsAt.getMonth() === endsAt.getMonth() &&
      startsAt.getDate() === endsAt.getDate();
    if (sameDay) return startLabel;
    return `${startLabel} – ${weekdayMonthDay(endsAt)}`;
  }
  return `${weekdayMonthDay(startsAt)} ${BULLET} ${clock(startsAt)}`;
}

export function formatListDate(startsAt: Date): { weekday: string; monthDay: string } {
  const list = parts(startsAt, { weekday: "short", month: "short", day: "numeric" });
  return {
    weekday: read(list, "weekday").toUpperCase(),
    monthDay: `${read(list, "month").toUpperCase()} ${read(list, "day")}`,
  };
}

export function formatTime(date: Date): string {
  return clock(date);
}

export function formatTimeRange(
  startsAt: Date,
  endsAt: Date | null,
  dateOnly = false,
): string {
  if (dateOnly) {
    const start = formatListDate(startsAt);
    if (!endsAt) return `${start.weekday} ${start.monthDay}`;
    const end = formatListDate(endsAt);
    return `${start.monthDay} - ${end.monthDay}`;
  }
  if (!endsAt) {
    return formatTime(startsAt);
  }
  return `${formatTime(startsAt)} - ${formatTime(endsAt)}`;
}

export function formatCompactVenue(venue: string): string {
  return venue.replace(/ Theater Ashland$/i, "").replace(/ Arts Center$/i, "");
}

/** SAT AUG 29 */
export function formatKickerDay(date: Date): string {
  const list = parts(date, { weekday: "short", month: "short", day: "numeric" });
  return `${read(list, "weekday").toUpperCase()} ${read(list, "month").toUpperCase()} ${read(list, "day")}`;
}

/** SAT 29–FRI 4 for an exclusive `to` bound */
export function formatWeekSpan(from: Date, toExclusive: Date): string {
  const end = new Date(toExclusive.getTime() - 1);
  const start = parts(from, { weekday: "short", day: "numeric" });
  const last = parts(end, { weekday: "short", day: "numeric" });
  return `${read(start, "weekday").toUpperCase()} ${read(start, "day")}–${read(last, "weekday").toUpperCase()} ${read(last, "day")}`;
}
