import ashlandKyPack from "../../../data/tenants/ashland-ky.v0.json";
import { TenantConfigSchema, type TenantConfig } from "./schema";

export * from "./schema";

/** Pack files live here. The loader is a static slug map so the client bundle stays filesystem-free. */
export const TENANT_PACK_DIR = "data/tenants";

export class UnknownTenantConfigError extends Error {
  readonly status = 404;
  constructor(slug: string) {
    super(`No tenant-config pack for slug "${slug}"`);
    this.name = "UnknownTenantConfigError";
  }
}

const PACKS: TenantConfig[] = [TenantConfigSchema.parse(ashlandKyPack)];
const BY_SLUG = new Map(PACKS.map((pack) => [pack.slug, pack]));

/** Slug-keyed loader. Callers pass the URL/seed slug — no per-city branches. */
export function listTenantConfigSlugs(): string[] {
  return [...BY_SLUG.keys()].sort();
}

export function tryGetTenantConfig(slug: string): TenantConfig | null {
  return BY_SLUG.get(slug) ?? null;
}

export function getTenantConfig(slug: string): TenantConfig {
  const pack = tryGetTenantConfig(slug);
  if (!pack) throw new UnknownTenantConfigError(slug);
  if (pack.slug !== slug) {
    throw new Error(`Tenant pack ${fileName(slug)} slug "${pack.slug}" does not match "${slug}"`);
  }
  return pack;
}

function fileName(slug: string): string {
  return `${slug}.v0.json`;
}

/** Env var name only. The secret itself never lives in the pack. */
export function embedApiToken(pack: TenantConfig): string | undefined {
  return process.env[pack.embedApiKeyRef];
}

/**
 * Handoff helper: same pack shape, same per-tenant queue.
 * Only designate + role change when Visit AKY tenant-admin takes the queue.
 */
export function withReviewer(
  pack: TenantConfig,
  reviewerDesignate: TenantConfig["reviewerDesignate"],
  reviewerRole: TenantConfig["reviewerRole"],
): TenantConfig {
  return TenantConfigSchema.parse({
    ...pack,
    reviewerDesignate,
    reviewerRole,
  });
}
