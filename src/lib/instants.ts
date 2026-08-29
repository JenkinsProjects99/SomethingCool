import { isDateOnly } from "./fields";

export function parseInstant(value: string, timezone: string): Date {
  if (isDateOnly(value)) {
    const offset = timezone === "America/New_York" ? guessEasternOffset(value) : "-00:00";
    return new Date(`${value}T00:00:00${offset}`);
  }
  return new Date(value);
}

function guessEasternOffset(date: string): "-04:00" | "-05:00" {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, 16));
  const shown = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).formatToParts(utc);
  const name = shown.find((part) => part.type === "timeZoneName")?.value ?? "EDT";
  return name.includes("DT") ? "-04:00" : "-05:00";
}

export function serializeInstant(date: Date, dateOnly: boolean, timezone: string): string {
  if (dateOnly) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}:${read("second")}${offsetFromName(read("timeZoneName"))}`;
}

function offsetFromName(value: string): string {
  const match = value.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) return "Z";
  return `${match[1]}${match[2].padStart(2, "0")}:${(match[3] ?? "00").padStart(2, "0")}`;
}
