import { getPrisma } from "./db";
import { listPublishedEvents, type CalendarEvent } from "./events";
import { upcomingOnly } from "./filters";
import { publishedEventsFromSeedFile } from "./seed/published-from-file";
import { getAshlandTenant } from "./tenant-data";

export async function loadTouristEvents(now = new Date()): Promise<CalendarEvent[]> {
  let rows: CalendarEvent[] = [];
  try {
    const tenant = await getAshlandTenant();
    if (tenant) {
      rows = await listPublishedEvents(getPrisma(), tenant.id, "all");
    }
  } catch {
    // Phone UI still renders from the seed file so `npm run dev` works without Docker.
  }
  if (rows.length === 0) {
    rows = publishedEventsFromSeedFile();
  }
  return upcomingOnly(rows, now);
}
