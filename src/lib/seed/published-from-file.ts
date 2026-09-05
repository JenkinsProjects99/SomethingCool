import { readFileSync } from "node:fs";
import type { CalendarEvent } from "../events";
import { SeedEventSchema } from "../fields";
import { parseInstant } from "../instants";
import { SEED_PATH } from "./import-seed";

/** Local UI fallback when Postgres is not running. Never drops a row because image is null. */
export function publishedEventsFromSeedFile(filePath = SEED_PATH): CalendarEvent[] {
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as {
    events: unknown[];
  };
  return raw.events
    .map((row) => SeedEventSchema.parse(row))
    .filter((event) => event.status === "published")
    .map((event) => {
      const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(event.startsAt);
      const startsAtDate = parseInstant(event.startsAt, event.timezone);
      const endsAtDate = event.endsAt ? parseInstant(event.endsAt, event.timezone) : null;
      return {
        ...event,
        slug: event.slug ?? event.id,
        image: event.image,
        category: event.category,
        startsAtDate,
        endsAtDate,
        dateOnly,
      };
    });
}
