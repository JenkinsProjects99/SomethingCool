import {
  isFamilyEvent,
  isMusicEvent,
  isSportsEvent,
  sortForTourist,
} from "./categories";
import type { CalendarEvent } from "./events";
import { firstScreenEvents, startOfToday } from "./filters";

export type TouristThumb = "weekend" | "music" | "sports" | "family";

export function eventsForThumb(
  events: CalendarEvent[],
  thumb: TouristThumb,
  now = new Date(),
): CalendarEvent[] {
  const today = startOfToday(now);
  const upcoming = events.filter((event) => event.startsAtDate >= today);
  if (thumb === "weekend") {
    const rows = firstScreenEvents(
      upcoming.map((event) => ({ event, startsAt: event.startsAtDate })),
      now,
    ).map((row) => row.event);
    return [...rows].sort((left, right) => left.startsAtDate.getTime() - right.startsAtDate.getTime());
  }
  return sortForTourist(
    upcoming.filter((event) => {
      if (thumb === "music") return isMusicEvent(event);
      if (thumb === "sports") return isSportsEvent(event);
      return isFamilyEvent(event);
    }),
  );
}
