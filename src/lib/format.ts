const TIME_ZONE = "America/New_York";

function parts(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, ...options }).formatToParts(date);
}

function read(list: Intl.DateTimeFormatPart[], type: string) {
  return list.find((part) => part.type === type)?.value ?? "";
}

export function formatCardWhen(
  startsAt: Date,
  dateOnly = false,
  endsAt: Date | null = null,
): string {
  if (dateOnly) {
    const start = parts(startsAt, { weekday: "short", month: "short", day: "numeric" });
    const startLabel = `${read(start, "weekday").toUpperCase()} · ${read(start, "month").toUpperCase()} ${read(start, "day")}`;
    if (!endsAt) return startLabel;
    const sameDay =
      startsAt.getFullYear() === endsAt.getFullYear() &&
      startsAt.getMonth() === endsAt.getMonth() &&
      startsAt.getDate() === endsAt.getDate();
    if (sameDay) return startLabel;
    const end = parts(endsAt, { weekday: "short", month: "short", day: "numeric" });
    return `${startLabel} – ${read(end, "weekday").toUpperCase()} · ${read(end, "month").toUpperCase()} ${read(end, "day")}`;
  }
  const list = parts(startsAt, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const weekday = read(list, "weekday").toUpperCase();
  const month = read(list, "month").toUpperCase();
  const day = read(list, "day");
  const hour = read(list, "hour");
  const minute = read(list, "minute");
  const dayPeriod = read(list, "dayPeriod").toUpperCase().replace(/\./g, "");
  return `${weekday} · ${month} ${day} · ${hour}:${minute} ${dayPeriod}`;
}

export function formatListDate(startsAt: Date): { weekday: string; monthDay: string } {
  const list = parts(startsAt, { weekday: "short", month: "short", day: "numeric" });
  return {
    weekday: read(list, "weekday").toUpperCase(),
    monthDay: `${read(list, "month").toUpperCase()} ${read(list, "day")}`,
  };
}

export function formatTime(date: Date): string {
  const list = parts(date, { hour: "numeric", minute: "2-digit", hour12: true });
  const hour = read(list, "hour");
  const minute = read(list, "minute");
  const dayPeriod = read(list, "dayPeriod").toUpperCase().replace(/\./g, "");
  return `${hour}:${minute} ${dayPeriod}`;
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
