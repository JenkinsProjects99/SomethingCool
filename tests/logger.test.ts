import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequestId, log } from "@/lib/logger";

describe("structured logs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits JSON lines with a request id", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const requestId = createRequestId();
    log.info("events.list", { requestId, tenant: "ashland-ky", status: 200 });
    expect(spy).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(spy.mock.calls[0]?.[0]));
    expect(payload.msg).toBe("events.list");
    expect(payload.requestId).toBe(requestId);
    expect(payload.level).toBe("info");
    expect(payload.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
