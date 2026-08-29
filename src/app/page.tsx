import { PhoneApp } from "@/components/PhoneApp";
import { getPrisma } from "@/lib/db";
import { listPublishedEvents } from "@/lib/events";
import { loadPublishedSeedEvents } from "@/lib/seed/published";
import { getAshlandTenant } from "@/lib/tenant-data";

export const dynamic = "force-dynamic";

export default async function TouristAppPage() {
  let events = await loadPublishedSeedEvents();
  try {
    const tenant = await getAshlandTenant();
    if (tenant) {
      events = await listPublishedEvents(getPrisma(), tenant.id, "all");
    }
  } catch {
    // Seed fallback keeps the phone preview up when Postgres is not provisioned.
  }

  return <PhoneApp events={events} />;
}
