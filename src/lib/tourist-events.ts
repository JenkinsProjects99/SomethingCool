import { getPrisma } from "./db";
import { listPublishedEvents, type CalendarEvent } from "./events";
import { upcomingOnly } from "./filters";
import { preferOfficialSeedFile } from "./published-feed";
import { publishedEventsFromSeedFile } from "./seed/published-from-file";
import { getAshlandTenant } from "./tenant-data";

export async function loadTouristEvents(now = new Date()): Promise<CalendarEvent[]> {
  const fromFile = publishedEventsFromSeedFile();
  let rows: CalendarEvent[] = [];
  try {
    const tenant = await getAshlandTenant();
    if (tenant) {
      rows = await listPublishedEvents(getPrisma(), tenant.id, "all");
    }
  } catch {
    // Phone UI still renders from the seed file so `npm run dev` works without Docker.
  }
  return upcomingOnly(preferOfficialSeedFile(fromFile, rows), now);
}
