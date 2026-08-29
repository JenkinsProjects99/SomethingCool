import { describe, expect, it } from "vitest";
import { defaultCreateStatus, resolveWriteStatus } from "@/lib/publish";

describe("never auto-publish", () => {
  it("defaults creates to draft", () => {
    expect(defaultCreateStatus()).toBe("draft");
    expect(resolveWriteStatus({ intent: "create" }).status).toBe("draft");
  });

  it("does not publish a create just because the payload says published", () => {
    const decision = resolveWriteStatus({
      intent: "create",
      explicitStatus: "published",
    });
    expect(decision.status).toBe("draft");
    expect(decision.reason).toBe("create-ignores-published-without-publish-intent");
  });

  it("does not infer published from a complete upcoming event", () => {
    const decision = resolveWriteStatus({
      intent: "create",
    });
    expect(decision.status).toBe("draft");
    expect(decision.reason).toBe("default-never-auto-publish");
  });

  it("preserves status on reload unless updateStatus is explicit", () => {
    const preserved = resolveWriteStatus({
      intent: "reload",
      explicitStatus: "published",
      existingStatus: "draft",
      updateStatus: false,
    });
    expect(preserved.status).toBe("draft");
    expect(preserved.reason).toBe("reload-preserves-existing-status");

    const editorial = resolveWriteStatus({
      intent: "reload",
      explicitStatus: "published",
      existingStatus: "draft",
      updateStatus: true,
    });
    expect(editorial.status).toBe("published");
    expect(editorial.reason).toBe("editorial-status-from-seed-file");
  });

  it("only publishes through an explicit publish intent or editorial seed import", () => {
    expect(resolveWriteStatus({ intent: "publish" })).toEqual({
      status: "published",
      reason: "explicit-publish-action",
    });
    expect(
      resolveWriteStatus({
        intent: "import",
        explicitStatus: "published",
      }).reason,
    ).toBe("editorial-status-from-seed-file");
  });
});
