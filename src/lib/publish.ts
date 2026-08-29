import type { EventStatus, FrozenEvent } from "./fields";

export type WriteIntent = "create" | "import" | "reload" | "publish";

export interface StatusDecision {
  status: EventStatus;
  reason: string;
}

/**
 * Publishing is always an explicit editorial act.
 * Completeness, future dates, source, or reload never promote a row to published.
 */
export function resolveWriteStatus(input: {
  intent: WriteIntent;
  explicitStatus?: EventStatus;
  existingStatus?: EventStatus;
  updateStatus?: boolean;
}): StatusDecision {
  const { intent, explicitStatus, existingStatus, updateStatus = false } = input;

  if (intent === "publish") {
    return { status: "published", reason: "explicit-publish-action" };
  }

  if (intent === "reload" && existingStatus && !updateStatus) {
    return {
      status: existingStatus,
      reason: "reload-preserves-existing-status",
    };
  }

  if (explicitStatus === "published") {
    if (intent === "create") {
      return {
        status: "draft",
        reason: "create-ignores-published-without-publish-intent",
      };
    }
    if (intent === "import" || (intent === "reload" && updateStatus)) {
      return {
        status: "published",
        reason: "editorial-status-from-seed-file",
      };
    }
  }

  if (explicitStatus === "draft") {
    return { status: "draft", reason: "explicit-draft" };
  }

  return { status: "draft", reason: "default-never-auto-publish" };
}

export function isAutoPublishAttempt(event: Pick<FrozenEvent, "status">, intent: WriteIntent) {
  return event.status === "published" && intent !== "publish" && intent !== "import" && intent !== "reload";
}

export function defaultCreateStatus(): EventStatus {
  return resolveWriteStatus({ intent: "create" }).status;
}
