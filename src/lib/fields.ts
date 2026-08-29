import { z } from "zod";

/** Public event contract. Additive `image` is allowed; do not rename these nine. */
export const FROZEN_NINE_FIELDS = [
  "id",
  "title",
  "startsAt",
  "endsAt",
  "timezone",
  "venue",
  "address",
  "url",
  "source",
] as const;

export const ADDITIVE_PUBLIC_FIELDS = ["image", "category"] as const;

export const EVENT_CATEGORIES = [
  "music",
  "sports",
  "family",
  "arts",
  "community",
  "food",
  "outdoor",
] as const;

export const EventCategorySchema = z.enum(EVENT_CATEGORIES);
export type PublicEventCategory = (typeof EVENT_CATEGORIES)[number];

export type FrozenField = (typeof FROZEN_NINE_FIELDS)[number];

export const EventStatusSchema = z.enum(["draft", "published"]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export function isDateOnly(value: string): boolean {
  return DATE_ONLY.test(value);
}

export const InstantSchema = z
  .string()
  .min(1)
  .refine((value) => DATE_ONLY.test(value) || DATE_TIME_OFFSET.test(value), {
    message: "must be YYYY-MM-DD or an offset datetime",
  });

export const FrozenEventSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be lowercase kebab-case"),
  title: z.string().min(1),
  startsAt: InstantSchema,
  endsAt: InstantSchema.nullable(),
  timezone: z.string().min(1),
  venue: z.string().min(1),
  address: z.string().min(1),
  url: z.string().url(),
  source: z.string().min(1),
  image: z.string().url().nullable(),
  category: EventCategorySchema.optional(),
});

export type FrozenEvent = z.infer<typeof FrozenEventSchema>;

export function pickFrozenNine<T extends FrozenEvent>(event: T): FrozenEvent {
  return {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    timezone: event.timezone,
    venue: event.venue,
    address: event.address,
    url: event.url,
    source: event.source,
    image: event.image,
    category: event.category ?? "community",
  };
}

export function assertFrozenShape(value: unknown): FrozenEvent {
  return FrozenEventSchema.parse(value);
}

/** Import-only. Never appear on GET /v1/:tenant/events. */
export const SEED_ONLY_FIELDS = ["slug", "summary", "status"] as const;

export const SeedEventSchema = FrozenEventSchema.extend({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  summary: z.string().min(1).optional(),
  status: EventStatusSchema,
});

export type SeedEvent = z.infer<typeof SeedEventSchema>;

const PUBLIC_KEYS = new Set<string>([...FROZEN_NINE_FIELDS, ...ADDITIVE_PUBLIC_FIELDS]);
const SEED_KEYS = new Set<string>([...PUBLIC_KEYS, ...SEED_ONLY_FIELDS]);

export function extraPublicKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record).filter((key) => !PUBLIC_KEYS.has(key));
}

export function extraSeedKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record).filter((key) => !SEED_KEYS.has(key));
}
