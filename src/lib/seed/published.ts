import { isDateOnly } from "../fields";
import type { CalendarEvent } from "../events";
import { parseInstant } from "../instants";
import { loadSeedFile } from "./import-seed";

export async function loadPublishedSeedEvents(): Promise<CalendarEvent[]> {
  const seed = await loadSeedFile();
  return seed.events
    .filter((event) => event.status === "published")
    .map((event) => {
      const dateOnly = isDateOnly(event.startsAt);
      const startsAtDate = parseInstant(event.startsAt, event.timezone);
      const endsAtDate = event.endsAt ? parseInstant(event.endsAt, event.timezone) : null;
      return {
        id: event.id,
        title: event.title,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        timezone: event.timezone,
        venue: event.venue,
        address: event.address,
        url: event.url,
        source: event.source,
        image: event.image,
        category: event.category,
        slug: event.slug ?? event.id,
        startsAtDate,
        endsAtDate,
        dateOnly,
      };
    });
}
