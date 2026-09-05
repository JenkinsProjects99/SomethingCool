import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { TenantConfigSchema, type TenantConfig } from "./schema";

export * from "./schema";

export const TENANT_PACK_DIR = path.join(process.cwd(), "data/tenants");

export class UnknownTenantConfigError extends Error {
  readonly status = 404;
  constructor(slug: string) {
    super(`No tenant-config pack for slug "${slug}"`);
    this.name = "UnknownTenantConfigError";
  }
}

function packPath(slug: string): string {
  return path.join(TENANT_PACK_DIR, `${slug}.v0.json`);
}

/** Slug-keyed loader. Callers pass the URL/seed slug — no per-city branches. */
export function listTenantConfigSlugs(): string[] {
  if (!existsSync(TENANT_PACK_DIR)) return [];
  return readdirSync(TENANT_PACK_DIR)
    .filter((file) => file.endsWith(".v0.json"))
    .map((file) => file.slice(0, -".v0.json".length))
    .sort();
}

export function tryGetTenantConfig(slug: string): TenantConfig | null {
  const file = packPath(slug);
  if (!existsSync(file)) return null;
  return TenantConfigSchema.parse(JSON.parse(readFileSync(file, "utf8")));
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
