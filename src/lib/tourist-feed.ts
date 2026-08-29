import {
  isCommunityEvent,
  isMusicEvent,
  isSportsEvent,
  sortForTourist,
} from "./categories";
import type { CalendarEvent } from "./events";
import { eventInWindow, startOfLookback, startOfToday, thisWeekFromToday } from "./filters";

export type TouristTime = "upcoming" | "week";
export type TouristCategory = "all" | "music" | "sports" | "community";
export type TouristThumb = "upcoming" | "music" | "sports" | "community";

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

export function thisWeekEvents(events: CalendarEvent[], now = new Date()): CalendarEvent[] {
  const week = thisWeekFromToday(now);
  return sortForTourist(
    events.filter((event) => eventInWindow(event.startsAtDate, week)),
  );
}

export function filterTouristCategory(
  events: CalendarEvent[],
  category: TouristCategory,
): CalendarEvent[] {
  if (category === "all") return events;
  if (category === "music") return events.filter(isMusicEvent);
  if (category === "sports") return events.filter(isSportsEvent);
  return events.filter(isCommunityEvent);
}

export function eventsForTouristView(
  events: CalendarEvent[],
  time: TouristTime,
  category: TouristCategory,
  now = new Date(),
): CalendarEvent[] {
  const windowed = touristWindowEvents(events, now);
  const timed = time === "week" ? thisWeekEvents(windowed, now) : sortUpcomingFirst(windowed, now);
  return filterTouristCategory(timed, category);
}

export function eventsForThumb(
  events: CalendarEvent[],
  thumb: TouristThumb,
  now = new Date(),
): CalendarEvent[] {
  if (thumb === "upcoming") return eventsForTouristView(events, "upcoming", "all", now);
  return eventsForTouristView(events, "upcoming", thumb, now);
}
