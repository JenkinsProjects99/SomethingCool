import { CalendarView } from "@/components/CalendarView";
import { getPrisma } from "@/lib/db";
import { listPublishedEvents } from "@/lib/events";
import { parsePublicRange } from "@/lib/filters";
import { getAshlandTenant } from "@/lib/tenant-data";

export const dynamic = "force-dynamic";

export default async function PublicCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = parsePublicRange(params.range);
  const tenant = await getAshlandTenant();
  const events = tenant
    ? await listPublishedEvents(getPrisma(), tenant.id, range)
    : [];

  return <CalendarView mode="public" range={range} events={events} />;
}
