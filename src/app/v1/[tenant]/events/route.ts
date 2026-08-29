import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { getPrisma } from "@/lib/db";
import { listPublishedEvents, publicEventPayload } from "@/lib/events";
import { parseEmbedRange, parsePublicRange, type EventRange } from "@/lib/filters";
import { log, readRequestId } from "@/lib/logger";
import { TenantScopeError, UnauthorizedError } from "@/lib/tenant";

function parseRange(raw: string | null): EventRange {
  if (raw === "upcoming") return parseEmbedRange(raw);
  return parsePublicRange(raw);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ tenant: string }> },
) {
  const started = Date.now();
  const requestId = readRequestId(new Headers(request.headers));
  const { tenant: tenantSlug } = await context.params;
  const url = new URL(request.url);
  const range = parseRange(url.searchParams.get("range"));

  try {
    const db = getPrisma();
    const auth = await authenticateRequest(
      db,
      request.headers.get("authorization"),
      tenantSlug,
    );
    const events = await listPublishedEvents(db, auth.tenantId, range);

    log.info("events.list", {
      requestId,
      tenant: auth.tenantSlug,
      range,
      count: events.length,
      status: 200,
      ms: Date.now() - started,
    });

    return NextResponse.json(
      {
        requestId,
        tenant: auth.tenantSlug,
        range,
        events: events.map(publicEventPayload),
      },
      {
        status: 200,
        headers: { "x-request-id": requestId },
      },
    );
  } catch (error) {
    const status =
      error instanceof UnauthorizedError || error instanceof TenantScopeError
        ? error.status
        : 500;
    log.error("events.list.failed", {
      requestId,
      tenant: tenantSlug,
      status,
      ms: Date.now() - started,
      err: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        requestId,
        error: status === 500 ? "Internal server error" : (error as Error).message,
      },
      {
        status,
        headers: { "x-request-id": requestId },
      },
    );
  }
}
