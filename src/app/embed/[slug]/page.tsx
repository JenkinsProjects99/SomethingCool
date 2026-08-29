import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { VisitAkyLogo } from "@/components/VisitAkyLogo";
import { getPrisma } from "@/lib/db";
import { getPublishedEventBySlug } from "@/lib/events";
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
  let event = publishedEventsFromSeedFile().find((row) => row.slug === slug || row.id === slug);
  try {
    const tenant = await getAshlandTenant();
    if (tenant) {
      event = (await getPublishedEventBySlug(getPrisma(), tenant.id, slug)) ?? event;
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
