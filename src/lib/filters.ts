import { InstantSchema } from "./fields";
import { parseInstant, serializeInstant } from "./instants";
import { InvalidQueryError } from "./tenant";

export type PublicRange = "month" | "week" | "all";
export type EmbedRange = "upcoming" | "all";
export type EventRange = PublicRange | EmbedRange;

export interface EventWindow {
  from?: Date;
  to?: Date;
}

export const PUBLIC_RANGES: PublicRange[] = ["month", "week", "all"];
export const EMBED_RANGES: EmbedRange[] = ["upcoming", "all"];

const TIME_ZONE = "America/New_York";

export function parsePublicRange(value: string | undefined | null): PublicRange {
  if (value === "week" || value === "all" || value === "month") {
    return value;
  }
  return "month";
}

export function parseEmbedRange(value: string | undefined | null): EmbedRange {
  if (value === "all" || value === "upcoming") {
    return value;
  }
  return "upcoming";
}

function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(read("year")),
    month: Number(read("month")),
    day: Number(read("day")),
    weekday: read("weekday"),
  };
}

function startOfZonedDay(date: Date): Date {
  const { year, month, day } = zonedParts(date);
  return wallTimeToUtc(year, month, day, 0, 0);
}

function wallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour + 4, minute));
  const shown = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(guess);
  const read = (type: string) => Number(shown.find((part) => part.type === type)?.value);
  const deltaMinutes =
    (hour - read("hour")) * 60 +
    (minute - read("minute")) +
    (day - read("day")) * 24 * 60;
  return new Date(guess.getTime() + deltaMinutes * 60_000);
}

export function startOfToday(now = new Date()): Date {
  return startOfZonedDay(now);
}

function addZonedDays(start: Date, days: number): Date {
  const parts = zonedParts(start);
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return wallTimeToUtc(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), 0, 0);
}

/** Friday 00:00 ET of the weekend that contains `now`, or the coming Friday. */
export function startOfThisWeekend(now = new Date()): Date {
  const today = startOfZonedDay(now);
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    zonedParts(now).weekday,
  );
  if (weekdayIndex === 0) return addZonedDays(today, -2);
  if (weekdayIndex >= 5) return addZonedDays(today, 5 - weekdayIndex);
  return addZonedDays(today, 5 - weekdayIndex);
}

/**
 * Friday–Sunday in ET (`to` is Monday exclusive).
 * If the current weekend has no remaining events, roll to the next weekend that does.
 */
export function thisWeekendWindow<T extends { startsAt: Date }>(
  now = new Date(),
  events: T[] = [],
): EventWindow {
  const today = startOfZonedDay(now);
  let friday = startOfThisWeekend(now);
  for (let week = 0; week < 12; week += 1) {
    const from = friday;
    const to = addZonedDays(friday, 3);
    const hits = events.filter((event) => event.startsAt >= from && event.startsAt < to);
    const remaining = week === 0 ? hits.filter((event) => event.startsAt >= today) : hits;
    if (events.length === 0 || remaining.length > 0) {
      return { from, to };
    }
    friday = addZonedDays(friday, 7);
  }
  return { from: friday, to: addZonedDays(friday, 3) };
}

export function rangeBounds(
  range: EventRange,
  now = new Date(),
  options: { rollMonthForward?: boolean } = {},
): { start?: Date; end?: Date } {
  if (range === "all") {
    return {};
  }

  const today = startOfZonedDay(now);
  const parts = zonedParts(now);

  if (range === "upcoming") {
    return { start: today };
  }

  if (range === "month") {
    let year = parts.year;
    let month = parts.month;
    if (options.rollMonthForward) {
      month += 1;
      if (month === 13) {
        month = 1;
        year += 1;
      }
    }
    const start = wallTimeToUtc(year, month, 1, 0, 0);
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const end = wallTimeToUtc(endYear, endMonth, 1, 0, 0);
    return { start, end };
  }

  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  const weekStart = new Date(today.getTime() - weekdayIndex * 86_400_000);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000);
  return { start: weekStart, end: weekEnd };
}

export function eventInRange(
  startsAt: Date,
  range: EventRange,
  now = new Date(),
  options: { rollMonthForward?: boolean } = {},
): boolean {
  const { start, end } = rangeBounds(range, now, options);
  if (start && startsAt < start) return false;
  if (end && startsAt >= end) return false;
  return true;
}

/** Frozen partner window. `from` inclusive, `to` exclusive. Date-only is midnight ET. */
export function parseWindowBound(value: string | null | undefined): Date | undefined {
  if (value == null || value === "") return undefined;
  const parsed = InstantSchema.safeParse(value);
  if (!parsed.success) {
    throw new InvalidQueryError("from/to must be YYYY-MM-DD or an offset datetime");
  }
  return parseInstant(parsed.data, TIME_ZONE);
}

export function eventInWindow(startsAt: Date, window: EventWindow): boolean {
  if (window.from && startsAt < window.from) return false;
  if (window.to && startsAt >= window.to) return false;
  return true;
}

export function filterEventsByWindow<T extends { startsAt: Date }>(
  events: T[],
  window: EventWindow,
): T[] {
  return events.filter((event) => eventInWindow(event.startsAt, window));
}

export function serializeWindowBound(date: Date | undefined): string | null {
  if (!date) return null;
  const asDateOnly = serializeInstant(date, true, TIME_ZONE);
  const midnight = parseInstant(asDateOnly, TIME_ZONE);
  if (midnight.getTime() === date.getTime()) {
    return asDateOnly;
  }
  return serializeInstant(date, false, TIME_ZONE);
}

export function resolvedWindow(
  range: EventRange | undefined,
  now = new Date(),
): EventWindow {
  if (!range) return {};
  const bounds = rangeBounds(range, now);
  return { from: bounds.start, to: bounds.end };
}

export function filterEventsByRange<T extends { startsAt: Date }>(
  events: T[],
  range: EventRange,
  now = new Date(),
): T[] {
  const firstPass = events.filter((event) => eventInRange(event.startsAt, range, now));
  if (range !== "month") {
    return firstPass;
  }
  const today = startOfZonedDay(now);
  if (firstPass.some((event) => event.startsAt >= today)) {
    return firstPass;
  }
  return events.filter((event) =>
    eventInRange(event.startsAt, range, now, { rollMonthForward: true }),
  );
}
