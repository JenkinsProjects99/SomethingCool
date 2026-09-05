import { getPrisma } from "./db";
import { ASHLAND_KY_SLUG } from "./tenant";

export async function getTenantBySlug(slug: string) {
  return getPrisma().tenant.findUnique({ where: { slug } });
}

/** v0 public PWA reads the first shipped pack. Look up by slug, not city branches. */
export async function getAshlandTenant() {
  return getTenantBySlug(ASHLAND_KY_SLUG);
}
