import type { CalendarEvent } from "./events";
import {
  filterEventsByRange,
  filterEventsByWindow,
  type EventRange,
} from "./filters";
import { publishedEventsFromSeedFile } from "./seed/published-from-file";

export function queryCalendarEvents(
  events: CalendarEvent[],
  query: { range?: EventRange; from?: Date; to?: Date; now?: Date },
): CalendarEvent[] {
  const rows = events.map((event) => ({ event, startsAt: event.startsAtDate }));
  const filtered =
    query.from || query.to
      ? filterEventsByWindow(rows, { from: query.from, to: query.to })
      : query.range
        ? filterEventsByRange(rows, query.range, query.now)
        : rows;
  return filtered
    .map((row) => row.event)
    .sort((left, right) => left.startsAtDate.getTime() - right.startsAtDate.getTime());
}

/**
 * Aaron's local fail: a stale ~32-row Postgres stub can out-count Sean's file
 * inside a month window. Compare unfiltered published totals, never the
 * filtered GET slice.
 */
export function preferOfficialSeedFile<T>(
  seedPublished: T[],
  dbPublished: T[],
): T[] {
  return dbPublished.length >= seedPublished.length ? dbPublished : seedPublished;
}

export function shouldPreferOfficialSeedFile(dbPublishedCount: number): boolean {
  return dbPublishedCount < publishedEventsFromSeedFile().length;
}

/** Prefer the seed file when Postgres is empty, stale, or down. */
export function publishedEventsFromSeedQuery(query: {
  range?: EventRange;
  from?: Date;
  to?: Date;
  now?: Date;
}): CalendarEvent[] {
  return queryCalendarEvents(publishedEventsFromSeedFile(), query);
}
