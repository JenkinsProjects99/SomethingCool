import {
  isFamilyEvent,
  isMusicEvent,
  isSportsEvent,
  sortForTourist,
} from "./categories";
import type { CalendarEvent } from "./events";
import { startOfLookback, startOfToday } from "./filters";

export type TouristThumb = "upcoming" | "music" | "sports" | "family";

/** Upcoming first, then the last seven ET days. Never the full history. */
export function touristWindowEvents(
  events: CalendarEvent[],
  now = new Date(),
): CalendarEvent[] {
  const lookback = startOfLookback(now);
  return events.filter((event) => event.startsAtDate >= lookback);
}

export function sortUpcomingFirst(
  events: CalendarEvent[],
  now = new Date(),
): CalendarEvent[] {
  const today = startOfToday(now);
  const upcoming = sortForTourist(events.filter((event) => event.startsAtDate >= today));
  const recent = sortForTourist(events.filter((event) => event.startsAtDate < today));
  return [...upcoming, ...recent];
}

export function eventsForThumb(
  events: CalendarEvent[],
  thumb: TouristThumb,
  now = new Date(),
): CalendarEvent[] {
  const windowed = touristWindowEvents(events, now);
  if (thumb === "upcoming") {
    return sortUpcomingFirst(windowed, now);
  }
  return sortUpcomingFirst(
    windowed.filter((event) => {
      if (thumb === "music") return isMusicEvent(event);
      if (thumb === "sports") return isSportsEvent(event);
      return isFamilyEvent(event);
    }),
    now,
  );
}
