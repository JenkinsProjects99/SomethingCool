import type { Prisma, PrismaClient } from "@prisma/client";
import { pickFrozenNine, type FrozenEvent } from "./fields";
import { filterEventsByRange, startOfToday, type EventRange } from "./filters";
import { scopedEventWhere } from "./tenant";

export interface CalendarEvent extends FrozenEvent {
  startsAtDate: Date;
  endsAtDate: Date | null;
}

function toCalendarEvent(row: {
  title: string;
  slug: string;
  startsAt: Date;
  endsAt: Date | null;
  venue: string;
  source: string;
  url: string;
  summary: string;
  status: "draft" | "published";
}): CalendarEvent {
  return {
    title: row.title,
    slug: row.slug,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    venue: row.venue,
    source: row.source,
    url: row.url,
    summary: row.summary,
    status: row.status,
    startsAtDate: row.startsAt,
    endsAtDate: row.endsAt,
  };
}

export async function listPublishedEvents(
  db: PrismaClient,
  tenantId: string,
  range: EventRange,
  now = new Date(),
): Promise<CalendarEvent[]> {
  const where: Prisma.EventWhereInput = scopedEventWhere(tenantId);
  const rows = await db.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
  });
  return filterEventsByRange(rows, range, now).map(toCalendarEvent);
}

export async function getPublishedEventBySlug(
  db: PrismaClient,
  tenantId: string,
  slug: string,
): Promise<CalendarEvent | null> {
  const row = await db.event.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
  });
  if (!row || row.status !== "published") {
    return null;
  }
  return toCalendarEvent(row);
}

export function publicEventPayload(event: CalendarEvent): FrozenEvent {
  return pickFrozenNine(event);
}

export function splitFeatured(
  events: CalendarEvent[],
  featuredCount = 2,
  now = new Date(),
) {
  const today = startOfToday(now);
  const upcoming = events.filter((event) => event.startsAtDate >= today);
  const featuredSource = upcoming.length > 0 ? upcoming : events;
  const featured = featuredSource.slice(0, featuredCount);
  const featuredSlugs = new Set(featured.map((event) => event.slug));
  return {
    featured,
    rest: events.filter((event) => !featuredSlugs.has(event.slug)),
  };
}
