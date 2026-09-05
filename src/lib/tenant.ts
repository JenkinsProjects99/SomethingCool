export const ASHLAND_KY_SLUG = "ashland-ky";

export class TenantScopeError extends Error {
  readonly status = 403;
  constructor(message = "Tenant token does not match requested tenant") {
    super(message);
    this.name = "TenantScopeError";
  }
}

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "Missing or invalid bearer token") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class InvalidQueryError extends Error {
  readonly status = 400;
  constructor(message = "Invalid query") {
    super(message);
    this.name = "InvalidQueryError";
  }
}

export interface AuthTenant {
  tenantId: string;
  tenantSlug: string;
}

export function assertTenantScope(auth: AuthTenant, urlTenantSlug: string): void {
  if (auth.tenantSlug !== urlTenantSlug) {
    throw new TenantScopeError();
  }
}

export function eventBelongsToTenant(
  event: { tenantId: string },
  tenantId: string,
): boolean {
  return event.tenantId === tenantId;
}

export function isolatePublishedEvents<
  T extends { tenantId: string; status: "draft" | "pin" | "published" },
>(events: T[], tenantId: string): T[] {
  return events.filter(
    (event) => event.tenantId === tenantId && event.status === "published",
  );
}

export function scopedEventWhere(tenantId: string) {
  return {
    tenantId,
    status: "published" as const,
  };
}
