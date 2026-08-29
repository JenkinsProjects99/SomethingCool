import type { PrismaClient } from "@prisma/client";
import { hashToken, parseBearer } from "./auth";
import {
  assertTenantScope,
  UnauthorizedError,
  type AuthTenant,
} from "./tenant";

export async function authenticateRequest(
  db: PrismaClient,
  authorization: string | null,
  urlTenantSlug: string,
): Promise<AuthTenant> {
  const token = parseBearer(authorization);
  const tokenHash = hashToken(token);
  const record = await db.apiToken.findUnique({
    where: { tokenHash },
    include: { tenant: true },
  });
  if (!record || record.revokedAt) {
    throw new UnauthorizedError();
  }
  const auth = {
    tenantId: record.tenant.id,
    tenantSlug: record.tenant.slug,
  };
  assertTenantScope(auth, urlTenantSlug);
  return auth;
}
