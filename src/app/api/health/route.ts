import { NextResponse } from "next/server";
import { readRequestId } from "@/lib/logger";

export async function GET(request: Request) {
  const requestId = readRequestId(new Headers(request.headers));
  return NextResponse.json(
    { ok: true, requestId },
    { headers: { "x-request-id": requestId } },
  );
}
