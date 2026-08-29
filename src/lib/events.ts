import type { Prisma, PrismaClient } from "@prisma/client";
import { pickFrozenNine, type FrozenEvent } from "./fields";
import { filterEventsByRange, startOfToday, type EventRange } from "./filters";
import { serializeInstant } from "./instants";
import { scopedEventWhere } from "./tenant";

export interface CalendarEvent extends FrozenEvent {
  slug: string;
  startsAtDate: Date;
  endsAtDate: Date | null;
  dateOnly: boolean;
}

function toCalendarEvent(row: {
  id: string;
  title: string;
  slug: string;
  startsAt: Date;
  endsAt: Date | null;
  timezone: string;
  venue: string;
  address: string;
  url: string;
  source: string;
  image: string | null;
  dateOnly: boolean;
}): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    startsAt: serializeInstant(row.startsAt, row.dateOnly, row.timezone),
    endsAt: row.endsAt ? serializeInstant(row.endsAt, row.dateOnly, row.timezone) : null,
    timezone: row.timezone,
    venue: row.venue,
    address: row.address,
    url: row.url,
    source: row.source,
    image: row.image,
    slug: row.slug,
    startsAtDate: row.startsAt,
    endsAtDate: row.endsAt,
    dateOnly: row.dateOnly,
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
  const row = await db.event.findFirst({
    where: { tenantId, slug, status: "published" },
  });
  if (!row) {
    const byId = await db.event.findUnique({ where: { id: slug } });
    if (!byId || byId.tenantId !== tenantId || byId.status !== "published") {
      return null;
    }
    return toCalendarEvent(byId);
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
  const featuredIds = new Set(featured.map((event) => event.id));
  return {
    featured,
    rest: events.filter((event) => !featuredIds.has(event.id)),
  };
}
