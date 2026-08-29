import { PhoneApp } from "@/components/PhoneApp";
import { getPrisma } from "@/lib/db";
import { listPublishedEvents } from "@/lib/events";
import { getAshlandTenant } from "@/lib/tenant-data";

export const dynamic = "force-dynamic";

export default async function TouristAppPage() {
  const tenant = await getAshlandTenant();
  const events = tenant
    ? await listPublishedEvents(getPrisma(), tenant.id, "all")
    : [];

  return <PhoneApp events={events} />;
}
