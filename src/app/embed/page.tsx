import { CalendarView } from "@/components/CalendarView";
import { getPrisma } from "@/lib/db";
import { listPublishedEvents } from "@/lib/events";
import { parseEmbedRange } from "@/lib/filters";
import { publishedEventsFromSeedQuery } from "@/lib/published-feed";
import { getAshlandTenant } from "@/lib/tenant-data";

export const dynamic = "force-dynamic";

export default async function EmbedCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = parseEmbedRange(params.range);
  const fromFile = publishedEventsFromSeedQuery({ range });
  let events = fromFile;
  try {
    const tenant = await getAshlandTenant();
    if (tenant) {
      const db = getPrisma();
      const published = await listPublishedEvents(db, tenant.id, "all");
      const fileAll = publishedEventsFromSeedQuery({ range: "all" });
      if (published.length >= fileAll.length) {
        events = await listPublishedEvents(db, tenant.id, range);
      }
    }
  } catch {
    events = fromFile;
  }

  return <CalendarView mode="embed" range={range} events={events} />;
}
