import { getPrisma } from "./db";
import { listPublishedEvents, type CalendarEvent } from "./events";
import { publishedEventsFromSeedFile } from "./seed/published-from-file";
import { getAshlandTenant } from "./tenant-data";

export async function loadTouristEvents(): Promise<CalendarEvent[]> {
  try {
    const tenant = await getAshlandTenant();
    if (tenant) {
      const rows = await listPublishedEvents(getPrisma(), tenant.id, "all");
      if (rows.length > 0) return rows;
    }
  } catch {
    // Phone UI still renders from the seed file so `npm run dev` works without Docker.
  }
  return publishedEventsFromSeedFile();
}
