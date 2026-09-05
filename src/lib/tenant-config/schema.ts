import { z } from "zod";

/** Editorial reviewer. Swap the person later without changing queue or pack shape. */
export const REVIEWER_ROLES = ["pilot-coordinator", "tenant-admin"] as const;
export const ReviewerRoleSchema = z.enum(REVIEWER_ROLES);
export type ReviewerRole = z.infer<typeof ReviewerRoleSchema>;

export const ReviewerDesignateSchema = z
  .object({
    displayName: z.string().min(1),
    email: z.string().email().optional(),
    userId: z.string().min(1).optional(),
  })
  .strict();
export type ReviewerDesignate = z.infer<typeof ReviewerDesignateSchema>;

export const BrandTokensSchema = z
  .object({
    primary: z.string().min(1),
    primaryLabel: z.string().min(1),
    navHover: z.string().min(1),
    themedOutline: z.string().min(1),
    paper: z.string().min(1),
    ink: z.string().min(1),
    titleFace: z.string().min(1),
    titleWeight: z.number().int().positive(),
    bodyFace: z.string().min(1),
    logoSrc: z.string().min(1),
  })
  .strict();
export type BrandTokens = z.infer<typeof BrandTokensSchema>;

export const NamedVenueExceptionSchema = z
  .object({
    name: z.string().min(1),
    reason: z.string().min(1),
  })
  .strict();

export const GeoFenceSchema = z
  .object({
    kind: z.literal("bbox"),
    west: z.number(),
    south: z.number(),
    east: z.number(),
    north: z.number(),
    namedVenueExceptions: z.array(NamedVenueExceptionSchema),
  })
  .strict()
  .refine((box) => box.west < box.east && box.south < box.north, {
    message: "geoFence bbox must have west < east and south < north",
  });
export type GeoFence = z.infer<typeof GeoFenceSchema>;

export const FeaturedRulesSchema = z
  .object({
    pinEventIds: z.array(z.string().min(1)),
    maxCards: z.number().int().positive(),
    placement: z.literal("above-time-views"),
  })
  .strict();
export type FeaturedRules = z.infer<typeof FeaturedRulesSchema>;

/** Queue is always per-tenant. Only reviewerDesignate / reviewerRole swap. */
export const PUBLISH_WORKFLOW = ["draft", "pin", "published"] as const;
export const PublishQueueSchema = z
  .object({
    scope: z.literal("tenant"),
    workflow: z.tuple([z.literal("draft"), z.literal("pin"), z.literal("published")]),
    autoPublish: z.literal(false),
  })
  .strict();
export type PublishQueue = z.infer<typeof PublishQueueSchema>;

export const TenantConfigSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
    name: z.string().min(1),
    timezone: z.string().min(1),
    lookbackDays: z.number().int().positive().default(7),
    brand: BrandTokensSchema,
    sourceAllowlist: z.array(z.string().min(1)).min(1),
    geoFence: GeoFenceSchema,
    featuredRules: FeaturedRulesSchema,
    embedApiKeyRef: z.string().regex(/^[A-Z][A-Z0-9_]+$/, "embedApiKeyRef must be an env var name"),
    reviewerDesignate: ReviewerDesignateSchema,
    reviewerRole: ReviewerRoleSchema,
    publishQueue: PublishQueueSchema,
    ingestAdapters: z.array(z.string()).max(0),
  })
  .strict();
export type TenantConfig = z.infer<typeof TenantConfigSchema>;
