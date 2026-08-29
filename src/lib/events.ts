import type { Prisma, PrismaClient } from "@prisma/client";
import { pickFrozenNine, type FrozenEvent, type PublicEventCategory } from "./fields";
import {
  filterEventsByRange,
  filterEventsByWindow,
  startOfToday,
  type EventRange,
  type EventWindow,
} from "./filters";
import { categoryForEvent } from "./categories";
import { serializeInstant } from "./instants";
import { scopedEventWhere } from "./tenant";

export type EventListQuery =
  | EventRange
  | (EventWindow & { range?: EventRange; now?: Date });

export interface CalendarEvent extends Omit<FrozenEvent, "category"> {
  category: PublicEventCategory;
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
  category: string;
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
    category: categoryForEvent({
      category: row.category,
      source: row.source,
      title: row.title,
    }),
    slug: row.slug,
    startsAtDate: row.startsAt,
    endsAtDate: row.endsAt,
    dateOnly: row.dateOnly,
  };
}

function normalizeListQuery(
  query: EventListQuery = "month",
  fallbackNow = new Date(),
): { range?: EventRange; from?: Date; to?: Date; now: Date } {
  if (typeof query === "string") {
    return { range: query, now: fallbackNow };
  }
  return {
    range: query.range,
    from: query.from,
    to: query.to,
    now: query.now ?? fallbackNow,
  };
}

export async function listPublishedEvents(
  db: PrismaClient,
  tenantId: string,
  query: EventListQuery = "month",
  now = new Date(),
): Promise<CalendarEvent[]> {
  const parsed = normalizeListQuery(query, now);
  const where: Prisma.EventWhereInput = scopedEventWhere(tenantId);
  if (parsed.from || parsed.to) {
    where.startsAt = {
      ...(parsed.from ? { gte: parsed.from } : {}),
      ...(parsed.to ? { lt: parsed.to } : {}),
    };
  }
  const rows = await db.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
  });
  if (parsed.from || parsed.to) {
    return filterEventsByWindow(rows, { from: parsed.from, to: parsed.to }).map(
      toCalendarEvent,
    );
  }
  return filterEventsByRange(rows, parsed.range ?? "month", parsed.now).map(
    toCalendarEvent,
  );
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
