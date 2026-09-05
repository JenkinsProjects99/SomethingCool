import {
  isCommunityEvent,
  isMusicEvent,
  isSportsEvent,
  sortForTourist,
} from "./categories";
import type { CalendarEvent } from "./events";
import {
  eventInWindow,
  startOfLookback,
  startOfToday,
  thisWeekendWindow,
  thisWeekFromToday,
  todayWindow,
} from "./filters";
import { getTenantConfig } from "./tenant-config";

export type TouristTime = "today" | "weekend" | "week";
export type TouristCategory = "all" | "music" | "sports" | "community";
export type TouristThumb = "upcoming" | "music" | "sports" | "community";

const DEFAULT_PACK_SLUG = "ashland-ky";

export function featuredRulesFor(slug = DEFAULT_PACK_SLUG) {
  return getTenantConfig(slug).featuredRules;
}

/** Paramount + Visit AKY headliners from the tenant pack. Featured strip only. */
export const THIS_WEEK_HEADLINERS = featuredRulesFor().pinEventIds;

/** Upcoming first, then the last N ET days from the tenant pack. Never the full history. */
export function touristWindowEvents(
  events: CalendarEvent[],
  now = new Date(),
  slug = DEFAULT_PACK_SLUG,
): CalendarEvent[] {
  const lookback = startOfLookback(now, getTenantConfig(slug).lookbackDays);
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

export function todayEvents(events: CalendarEvent[], now = new Date()): CalendarEvent[] {
  const window = todayWindow(now);
  return sortForTourist(events.filter((event) => eventInWindow(event.startsAtDate, window)));
}

export function thisWeekendEvents(events: CalendarEvent[], now = new Date()): CalendarEvent[] {
  const window = thisWeekendWindow(
    now,
    events.map((event) => ({ startsAt: event.startsAtDate })),
  );
  return sortForTourist(events.filter((event) => eventInWindow(event.startsAtDate, window)));
}

export function thisWeekEvents(events: CalendarEvent[], now = new Date()): CalendarEvent[] {
  const week = thisWeekFromToday(now);
  return sortForTourist(events.filter((event) => eventInWindow(event.startsAtDate, week)));
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

export function pinThisWeekHeadliners(
  week: CalendarEvent[],
  pool: CalendarEvent[],
): CalendarEvent[] {
  const pinned = featuredEvents(pool);
  const pinnedIds = new Set(pinned.map((event) => event.id));
  return [...pinned, ...week.filter((event) => !pinnedIds.has(event.id))];
}

export function featuredEvents(
  pool: CalendarEvent[],
  slug = DEFAULT_PACK_SLUG,
): CalendarEvent[] {
  const rules = featuredRulesFor(slug);
  const pinned = rules.pinEventIds.flatMap((id) => {
    const hit = pool.find((event) => event.id === id);
    return hit ? [hit] : [];
  });
  return pinned.slice(0, rules.maxCards);
}

export function eventsForTouristView(
  events: CalendarEvent[],
  time: TouristTime,
  category: TouristCategory,
  now = new Date(),
): CalendarEvent[] {
  const windowed = touristWindowEvents(events, now);
  if (time === "today") return filterTouristCategory(todayEvents(windowed, now), category);
  if (time === "weekend") return filterTouristCategory(thisWeekendEvents(windowed, now), category);
  return filterTouristCategory(thisWeekEvents(windowed, now), category);
}

export function featuredForTouristView(
  events: CalendarEvent[],
  category: TouristCategory,
  now = new Date(),
): CalendarEvent[] {
  const windowed = touristWindowEvents(events, now);
  return featuredEvents(filterTouristCategory(windowed, category));
}

export function eventsForThumb(
  events: CalendarEvent[],
  thumb: TouristThumb,
  now = new Date(),
): CalendarEvent[] {
  const windowed = touristWindowEvents(events, now);
  if (thumb === "upcoming") return sortUpcomingFirst(windowed, now);
  return filterTouristCategory(sortUpcomingFirst(windowed, now), thumb);
}
