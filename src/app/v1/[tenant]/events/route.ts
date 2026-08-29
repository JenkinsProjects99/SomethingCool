import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { parseBearer, tokensEqual } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { listPublishedEvents, publicEventPayload } from "@/lib/events";
import {
  parseEmbedRange,
  parsePublicRange,
  parseToBound,
  parseWindowBound,
  rangeBounds,
  serializeWindowBound,
  type EventRange,
} from "@/lib/filters";
import { log, readRequestId } from "@/lib/logger";
import {
  publishedEventsFromSeedQuery,
  shouldPreferOfficialSeedFile,
} from "@/lib/published-feed";
import {
  ASHLAND_KY_SLUG,
  InvalidQueryError,
  scopedEventWhere,
  TenantScopeError,
  UnauthorizedError,
} from "@/lib/tenant";

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
  const fromRaw = url.searchParams.get("from");
  const toRaw = url.searchParams.get("to");
  const rangeRaw = url.searchParams.get("range");
  const hasWindow = fromRaw !== null || toRaw !== null;

  try {
    const from = parseWindowBound(fromRaw);
    const to = parseToBound(toRaw);
    const range = hasWindow
      ? rangeRaw
        ? parseRange(rangeRaw)
        : undefined
      : parseRange(rangeRaw);

    const fileEvents = publishedEventsFromSeedQuery({ range, from, to });
    let events = fileEvents;
    let tenantOut = tenantSlug;
    try {
      const db = getPrisma();
      const auth = await authenticateRequest(
        db,
        request.headers.get("authorization"),
        tenantSlug,
      );
      tenantOut = auth.tenantSlug;
      if (tenantOut === ASHLAND_KY_SLUG) {
        const dbPublished = await db.event.count({
          where: scopedEventWhere(auth.tenantId),
        });
        if (!shouldPreferOfficialSeedFile(dbPublished)) {
          events = await listPublishedEvents(db, auth.tenantId, {
            range,
            from,
            to,
          });
        }
      } else {
        events = await listPublishedEvents(db, auth.tenantId, {
          range,
          from,
          to,
        });
      }
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof TenantScopeError ||
        error instanceof InvalidQueryError
      ) {
        throw error;
      }
      const expected = process.env.ASHLAND_KY_API_TOKEN;
      const token = parseBearer(request.headers.get("authorization"));
      if (!expected || !tokensEqual(token, expected) || tenantSlug !== ASHLAND_KY_SLUG) {
        throw new UnauthorizedError();
      }
      tenantOut = ASHLAND_KY_SLUG;
    }

    const bounds = range ? rangeBounds(range) : {};
    const fromOut = fromRaw !== null ? fromRaw : serializeWindowBound(bounds.start);
    const toOut = toRaw !== null ? toRaw : serializeWindowBound(bounds.end);

    log.info("events.list", {
      requestId,
      tenant: tenantOut,
      from: fromOut,
      to: toOut,
      range: range ?? null,
      count: events.length,
      status: 200,
      ms: Date.now() - started,
    });

    return NextResponse.json(
      {
        requestId,
        tenant: tenantOut,
        from: fromOut,
        to: toOut,
        range: range ?? null,
        count: events.length,
        events: events.map(publicEventPayload),
      },
      {
        status: 200,
        headers: { "x-request-id": requestId },
      },
    );
  } catch (error) {
    const status =
      error instanceof UnauthorizedError ||
      error instanceof TenantScopeError ||
      error instanceof InvalidQueryError
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
