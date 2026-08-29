import { PhoneApp } from "@/components/PhoneApp";
import { loadTouristEvents } from "@/lib/tourist-events";

export const dynamic = "force-dynamic";

export default async function TouristAppPage() {
  const events = await loadTouristEvents();
  return <PhoneApp events={events} />;
}
