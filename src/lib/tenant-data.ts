import { getPrisma } from "./db";
import { ASHLAND_KY_SLUG } from "./tenant";

export async function getAshlandTenant() {
  const db = getPrisma();
  return db.tenant.findUnique({ where: { slug: ASHLAND_KY_SLUG } });
}
