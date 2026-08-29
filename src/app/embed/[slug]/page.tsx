import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";
import { getPrisma } from "@/lib/db";
import { getPublishedEventBySlug, listPublishedEvents } from "@/lib/events";
import { startOfToday } from "@/lib/filters";
import { publishedEventsFromSeedFile } from "@/lib/seed/published-from-file";
import { getAshlandTenant } from "@/lib/tenant-data";

export const dynamic = "force-dynamic";

export default async function EmbedEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fromFile = publishedEventsFromSeedFile();
  let event = fromFile.find((row) => row.slug === slug || row.id === slug);
  try {
    const tenant = await getAshlandTenant();
    if (tenant) {
      const db = getPrisma();
      const published = await listPublishedEvents(db, tenant.id, "all");
      if (published.length >= fromFile.length) {
        event = (await getPublishedEventBySlug(db, tenant.id, slug)) ?? event;
      }
    }
  } catch {
    // Keep the seed-file row, including when image is null.
  }
  if (!event || event.startsAtDate < startOfToday()) {
    notFound();
  }

  return (
    <div className="shell shell--embed">
      <header>
        <VisitAkyLogo compact />
        <h1 className="visually-hidden">{event.title}</h1>
      </header>
      <main id="main">
        <EventCard event={event} />
      </main>
      <footer className="footer-note">
        <p className="st-d-paragraph">Paste iframe on visitaky.com or a partner page.</p>
      </footer>
    </div>
  );
}
