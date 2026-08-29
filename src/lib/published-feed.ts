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
  return filtered.map((row) => row.event);
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
