import { z } from "zod";

/** Frozen nine public event fields. Changing this set requires an API version bump. */
export const FROZEN_NINE_FIELDS = [
  "title",
  "slug",
  "startsAt",
  "endsAt",
  "venue",
  "source",
  "url",
  "summary",
  "status",
] as const;

export type FrozenField = (typeof FROZEN_NINE_FIELDS)[number];

export const EventStatusSchema = z.enum(["draft", "published"]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const FrozenEventSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).nullable(),
  venue: z.string().min(1),
  source: z.string().min(1),
  url: z.string().url(),
  summary: z.string().min(1),
  status: EventStatusSchema,
});

export type FrozenEvent = z.infer<typeof FrozenEventSchema>;

export function pickFrozenNine<T extends FrozenEvent>(event: T): FrozenEvent {
  return {
    title: event.title,
    slug: event.slug,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    venue: event.venue,
    source: event.source,
    url: event.url,
    summary: event.summary,
    status: event.status,
  };
}

export function assertFrozenShape(value: unknown): FrozenEvent {
  return FrozenEventSchema.parse(value);
}

/** Seed-file only. Never appears on GET /v1/:tenant/events. */
export const SEED_ONLY_FIELDS = ["id"] as const;

export const SeedEventSchema = FrozenEventSchema.extend({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be lowercase kebab-case"),
});

export type SeedEvent = z.infer<typeof SeedEventSchema>;

export function extraPublicKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record).filter(
    (key) =>
      !(FROZEN_NINE_FIELDS as readonly string[]).includes(key) &&
      !(SEED_ONLY_FIELDS as readonly string[]).includes(key),
  );
}
