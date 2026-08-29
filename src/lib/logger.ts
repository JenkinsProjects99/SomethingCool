export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function configuredLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return "info";
}

export interface LogFields {
  requestId?: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, message: string, fields: LogFields = {}) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[configuredLevel()]) {
    return;
  }
  const line = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...fields,
  };
  const serialized = JSON.stringify(line);
  if (level === "error") {
    console.error(serialized);
    return;
  }
  if (level === "warn") {
    console.warn(serialized);
    return;
  }
  console.log(serialized);
}

export const log = {
  debug: (message: string, fields?: LogFields) => emit("debug", message, fields),
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
};

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function readRequestId(headers: Headers): string {
  return headers.get("x-request-id") ?? createRequestId();
}
